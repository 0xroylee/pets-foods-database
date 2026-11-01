// Reads a web page the owner saved from a browser: a Safari web archive, a Chrome single-file
// page (MHTML) or plain HTML. Each yields the page's own HTML bytes, plus the page URL and the
// save time when the container records them. Subresources (images, styles) are not kept.

import { readFileSync, statSync } from "node:fs";
import { extname } from "node:path";

export type SavedFileFormat = "html" | "webarchive" | "mhtml";

export interface SavedFile {
  format: SavedFileFormat;
  /** The main document exactly as saved. */
  html: Uint8Array;
  /** The character set the container declares for the HTML, if any. */
  charset?: string;
  /** The page URL recorded by the container (web archive or MHTML). */
  url?: string;
  /** ISO time the page was saved: the MHTML Date header, otherwise the file's creation time. */
  savedAt: string;
}

/** A file the importer cannot use; the reason is shown to the owner. */
export class SavedPageRejection extends Error {
  override name = "SavedPageRejection";
}

const HTML_EXTENSIONS = new Set([".html", ".htm"]);
const MHTML_EXTENSIONS = new Set([".mhtml", ".mht"]);

export function readSavedFile(path: string, bytes = readFileSync(path)): SavedFile {
  const savedAt = fileCreatedAt(path);
  const extension = extname(path).toLowerCase();
  const head = Buffer.from(bytes.subarray(0, 4096)).toString("latin1");
  if (head.startsWith("bplist00") || extension === ".webarchive") {
    return { ...readWebArchive(path), savedAt };
  }
  if (MHTML_EXTENSIONS.has(extension) || /^MIME-Version:/im.test(head)) {
    const mhtml = readMhtml(bytes);
    return { ...mhtml, savedAt: mhtml.savedAt ?? savedAt };
  }
  // A UTF-8 byte order mark reads as \xEF\xBB\xBF in latin1.
  if (HTML_EXTENSIONS.has(extension) || /^(\xEF\xBB\xBF)?\s*</.test(head)) {
    return { format: "html", html: new Uint8Array(bytes), savedAt };
  }
  throw new SavedPageRejection("not a saved web page (save it as HTML, Web Archive or MHTML)");
}

function fileCreatedAt(path: string): string {
  const stat = statSync(path);
  const created = stat.birthtimeMs > 0 ? stat.birthtimeMs : stat.mtimeMs;
  return new Date(created).toISOString();
}

// A web archive is a binary property list; macOS's plutil reads it without a parser of our own.
function readWebArchive(path: string): Omit<SavedFile, "savedAt"> {
  const extract = (key: string): string | undefined => {
    const result = Bun.spawnSync(["plutil", "-extract", key, "raw", "-o", "-", path], {
      stdout: "pipe",
      stderr: "pipe",
    });
    return result.exitCode === 0 ? result.stdout.toString().trim() : undefined;
  };
  const data = extract("WebMainResource.WebResourceData");
  if (!data) throw new SavedPageRejection("the web archive could not be read");
  return {
    format: "webarchive",
    html: new Uint8Array(Buffer.from(data, "base64")),
    charset: extract("WebMainResource.WebResourceTextEncodingName"),
    url: extract("WebMainResource.WebResourceURL"),
  };
}

interface MimePart {
  headers: Map<string, string>;
  body: string;
}

// MHTML is a MIME multipart/related message whose first text/html part is the page.
function readMhtml(bytes: Uint8Array): Omit<SavedFile, "savedAt"> & { savedAt?: string } {
  // latin1 keeps every byte as one character, so encoded bodies survive until decoded.
  const message = parseMimePart(Buffer.from(bytes).toString("latin1"));
  const boundary = parameter(message.headers.get("content-type"), "boundary");
  if (!boundary) throw new SavedPageRejection("the MHTML file has no parts");
  const parts = message.body
    .split(`--${boundary}`)
    .slice(1)
    .filter((part) => !part.startsWith("--"))
    .map((part) => parseMimePart(part.replace(/^\r?\n/, "")));
  const location = message.headers.get("snapshot-content-location");
  const pages = parts.filter((part) =>
    (part.headers.get("content-type") ?? "").toLowerCase().startsWith("text/html"),
  );
  const page =
    pages.find((part) => location && part.headers.get("content-location") === location) ?? pages[0];
  if (!page) throw new SavedPageRejection("the MHTML file holds no HTML page");
  const date = Date.parse(message.headers.get("date") ?? "");
  return {
    format: "mhtml",
    html: decodeTransfer(page.body, page.headers.get("content-transfer-encoding")),
    charset: parameter(page.headers.get("content-type"), "charset"),
    url: location ?? page.headers.get("content-location"),
    savedAt: Number.isNaN(date) ? undefined : new Date(date).toISOString(),
  };
}

function parseMimePart(text: string): MimePart {
  const split = /\r?\n\r?\n/.exec(text);
  const headerText = split ? text.slice(0, split.index) : text;
  const body = split ? text.slice(split.index + split[0].length) : "";
  const headers = new Map<string, string>();
  // Folded header lines continue with leading whitespace.
  for (const line of headerText.replace(/\r?\n[ \t]+/g, " ").split(/\r?\n/)) {
    const colon = line.indexOf(":");
    if (colon > 0) {
      headers.set(line.slice(0, colon).trim().toLowerCase(), line.slice(colon + 1).trim());
    }
  }
  return { headers, body };
}

function parameter(header: string | undefined, name: string): string | undefined {
  const match = new RegExp(`(?:^|;)\\s*${name}\\s*=\\s*("([^"]*)"|[^;\\s]+)`, "i").exec(
    header ?? "",
  );
  return match ? (match[2] ?? match[1]) : undefined;
}

function decodeTransfer(body: string, encoding: string | undefined): Uint8Array {
  // Drop the line break that separates the body from the next boundary.
  const content = body.replace(/\r?\n$/, "");
  switch ((encoding ?? "").toLowerCase()) {
    case "quoted-printable": {
      const unfolded = content.replace(/=\r?\n/g, "");
      const bytes: number[] = [];
      for (let i = 0; i < unfolded.length; i++) {
        const hex = unfolded.slice(i + 1, i + 3);
        if (unfolded[i] === "=" && /^[0-9A-Fa-f]{2}$/.test(hex)) {
          bytes.push(Number.parseInt(hex, 16));
          i += 2;
        } else {
          bytes.push(unfolded.charCodeAt(i) & 0xff);
        }
      }
      return new Uint8Array(bytes);
    }
    case "base64":
      return new Uint8Array(Buffer.from(content.replace(/\s+/g, ""), "base64"));
    default:
      return new Uint8Array(Buffer.from(content, "latin1"));
  }
}
