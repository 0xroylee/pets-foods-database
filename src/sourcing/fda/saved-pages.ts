// fda.gov pages the owner saved from a browser, imported from the inbox folder (ADR 0003):
// recall press releases, warning letters, and CVM outbreak, advisory and update pages. The
// saved HTML is the record's payload, byte for byte. Fields come only from the page's own
// labels, tables and text; anything the page doesn't state stays absent.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import {
  type CollectorRecordV1,
  createCollectorRecordV1,
  FDA_DOCUMENT_TYPES,
} from "../contract/collector-record.ts";
import { extractAvailableFields, type SourceDocument } from "../contract/extract.ts";
import { screenRecord } from "../screening.ts";
import type { DocumentIdentity, RawStore } from "../store/raw-store.ts";
import {
  readSavedFile,
  type SavedFile,
  type SavedFileFormat,
  SavedPageRejection,
} from "./saved-files.ts";

export const SAVED_PAGE_IMPORTER_VERSION = "fda-saved-pages.v1";
export const SAVED_PAGE_NAMESPACE = "fda_page";
const FDA_SOURCE = { key: "us-fda", name: "U.S. Food and Drug Administration" };

/** The page types imported, by where fda.gov publishes them. */
const PAGE_TYPES: readonly { prefix: string; type: string }[] = [
  {
    prefix: "/safety/recalls-market-withdrawals-safety-alerts/",
    type: FDA_DOCUMENT_TYPES.recallPressRelease,
  },
  {
    prefix: "/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/",
    type: FDA_DOCUMENT_TYPES.warningLetter,
  },
  { prefix: "/animal-veterinary/outbreaks-and-advisories/", type: FDA_DOCUMENT_TYPES.advisory },
  { prefix: "/animal-veterinary/cvm-updates/", type: FDA_DOCUMENT_TYPES.advisory },
];

export interface SavedPage {
  identity: DocumentIdentity;
  record: CollectorRecordV1;
}

export interface SavedPagesSummary {
  imported: { new: number; changed: number; duplicate: number };
  rejected: number;
  /** Files imported before, or rejected before by this importer version, left alone. */
  unchanged: number;
}

// Browsers write partial downloads under these names before renaming them.
const IGNORED_FILES = /^\.|\.(crdownload|download|part|tmp)$/i;

/** The inbox's files in name order, leaving out hidden files and unfinished downloads. */
export function savedPageFiles(inbox: string): string[] {
  let names: string[];
  try {
    names = readdirSync(inbox);
  } catch {
    return [];
  }
  return names
    .filter((name) => !IGNORED_FILES.test(name))
    .sort()
    .map((name) => join(inbox, name))
    .filter((path) => statSync(path).isFile());
}

/**
 * Imports each file once, each in its own transaction with its log entry. A file that can't
 * be used is logged as rejected with the reason, and the other files still import.
 */
export async function importSavedPages(
  store: RawStore,
  files: readonly string[],
  options: { now?: number } = {},
): Promise<SavedPagesSummary> {
  const log = new SavedPageLog(store);
  const summary: SavedPagesSummary = {
    imported: { new: 0, changed: 0, duplicate: 0 },
    rejected: 0,
    unchanged: 0,
  };
  for (const path of files) {
    const bytes = readFileSync(path);
    const fileSha256 = new Bun.CryptoHasher("sha256").update(bytes).digest("hex");
    if (log.handled(fileSha256)) {
      summary.unchanged++;
      continue;
    }
    const entry = { fileSha256, fileName: basename(path), importedAt: options.now ?? Date.now() };
    let saved: SavedFile | undefined;
    try {
      saved = readSavedFile(path, bytes);
      const page = await savedPageRecord(saved);
      const disposition = store.transaction((tx) => {
        const outcome = tx.putRecord({
          ...page,
          observationKey: `saved-page:${fileSha256}`,
          screening: screenRecord(page.record),
        });
        if (outcome.disposition === "replayed") return outcome.disposition;
        log.imported(
          entry,
          saved as SavedFile,
          page.record,
          outcome.documentId,
          outcome.disposition,
        );
        return outcome.disposition;
      });
      if (disposition === "replayed") summary.unchanged++;
      else summary.imported[disposition]++;
    } catch (error) {
      const reason =
        error instanceof SavedPageRejection
          ? error.message
          : `could not be imported: ${error instanceof Error ? error.message : String(error)}`;
      log.rejected(entry, saved?.format, reason);
      summary.rejected++;
    }
  }
  return summary;
}

/** Turns a saved page into its record, or rejects it with the reason. */
export async function savedPageRecord(saved: SavedFile): Promise<SavedPage> {
  const model = await readPage(decodeHtml(saved.html, saved.charset));
  const url = fdaPageUrl(saved.url ?? model.savedFrom ?? model.canonical ?? model.ogUrl);
  const path = new URL(url).pathname;
  const type = pageType(path);
  const { declared, sourceIds } = declaredFields(type, model);
  const record = createCollectorRecordV1({
    source: FDA_SOURCE,
    source_ids: { page_path: path, ...sourceIds },
    document_type: type,
    original_url: url,
    retrieved_at: saved.savedAt,
    payload: htmlPayload(saved.html),
    origin: {
      collector: "fda-saved-pages",
      collector_version: SAVED_PAGE_IMPORTER_VERSION,
      acquisition: "file",
      fixture: false,
      referenced_urls: references(model.links, url),
    },
    extracted: extractAvailableFields({ text: [model.text], declared }),
  });
  return { identity: { namespace: SAVED_PAGE_NAMESPACE, key: url }, record };
}

function fdaPageUrl(raw: string | undefined): string {
  if (!raw) {
    throw new SavedPageRejection(
      "the page's address could not be found (no saved-from note, canonical link or og:url)",
    );
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new SavedPageRejection(`the page's address is not a URL: ${raw}`);
  }
  const host = url.hostname.toLowerCase();
  if (host !== "www.fda.gov" && host !== "fda.gov") {
    throw new SavedPageRejection(`not an fda.gov page: ${url.origin}`);
  }
  return `https://www.fda.gov${url.pathname.replace(/\/+$/, "")}`;
}

function pageType(path: string): string {
  const match = PAGE_TYPES.find(
    ({ prefix }) => path.startsWith(prefix) && path.length > prefix.length,
  );
  if (!match) {
    throw new SavedPageRejection(
      `not a page type the importer handles: ${path} (it imports recall press releases, ` +
        "warning letters, and CVM outbreak, advisory and update pages)",
    );
  }
  return match.type;
}

function declaredFields(
  type: string,
  page: PageModel,
): { declared: NonNullable<SourceDocument["declared"]>; sourceIds: Record<string, string> } {
  const text = (label: string) => page.labels.get(label)?.text || undefined;
  const date = (label: string) => {
    const value = page.labels.get(label);
    return value?.datetime || value?.text || undefined;
  };
  const dates: Record<string, string> = {};
  const sourceIds: Record<string, string> = {};
  const declared: NonNullable<SourceDocument["declared"]> = {};
  const setDate = (name: string, value: string | undefined) => {
    if (value) dates[name] = value;
  };

  if (type === FDA_DOCUMENT_TYPES.recallPressRelease) {
    // The release's summary box: "Company Name:", "Product Description:" and its dates.
    declared.firm = text("company name");
    declared.product_description = text("product description");
    setDate("company_announcement_date", date("company announcement date"));
    setDate("fda_publish_date", date("fda publish date"));
  } else if (type === FDA_DOCUMENT_TYPES.warningLetter) {
    // A warning letter page is headed with the firm it was sent to, and dated by the
    // "MARCS-CMS <number> — <date>" line above the letter.
    declared.firm = page.heading;
    const marcs = /MARCS-CMS\s+(\d+)\s*[—–-]\s*([A-Z][a-z]+\.? \d{1,2},? \d{4})/.exec(page.text);
    if (marcs?.[1] && marcs[2]) {
      sourceIds.marcs_cms_number = marcs[1];
      setDate("letter_issue_date", marcs[2]);
    }
  }
  setDate("content_current_as_of", date("content current as of"));
  // Only a single FEI stated with its label counts; a letter naming several firms has none.
  const fei = new Set(
    [...page.text.matchAll(/\bFEI\s*(?:#|No\.?|Number)?\s*:?\s*(\d{7,10})\b/g)].map((m) => m[1]),
  );
  if (fei.size === 1) declared.fei_number = [...fei][0];

  const columns = tableColumns(page.tables);
  return {
    declared: {
      ...declared,
      dates,
      lot_codes: columns.lots,
      best_by_dates: columns.bestBy,
      barcodes: columns.barcodes,
    },
    sourceIds,
  };
}

const COLUMN_KINDS = [
  { kind: "barcodes", header: /\b(upc|gtin|ean|barcode)s?\b/i, split: /[\n;,]/ },
  { kind: "lots", header: /\blot\b/i, split: /[\n;,]/ },
  {
    kind: "bestBy",
    header: /\b(best\s*(by|before|if used by)|use\s*by|sell\s*by|expir(ation|y)|exp\.?\s*date)\b/i,
    // Dates such as "October 27, 2027" hold commas, so only lines and semicolons split them.
    split: /[\n;]/,
  },
] as const;

/** Values from table columns whose headers name UPCs, lots or best-by dates. */
function tableColumns(tables: readonly string[][][]) {
  const values = { barcodes: [] as string[], lots: [] as string[], bestBy: [] as string[] };
  for (const [header, ...rows] of tables) {
    if (!header) continue;
    header.forEach((title, column) => {
      const kinds = COLUMN_KINDS.filter((kind) => kind.header.test(title));
      // A column such as "Lot / Best By" mixes two kinds; its values stay in the text.
      const [kind] = kinds;
      if (kinds.length !== 1 || !kind) return;
      for (const row of rows) {
        const cell = row[column];
        if (cell) values[kind.kind].push(...cell.split(kind.split).map((v) => v.trim()));
      }
    });
  }
  return values;
}

function references(links: readonly string[], pageUrl: string): string[] {
  const urls = new Set<string>();
  for (const href of links) {
    try {
      const url = new URL(href, pageUrl);
      url.hash = "";
      if ((url.protocol === "https:" || url.protocol === "http:") && url.href !== pageUrl) {
        urls.add(url.href);
      }
    } catch {
      // Not a URL; nothing to reference.
    }
  }
  return [...urls];
}

function decodeHtml(html: Uint8Array, charset?: string): string {
  const declared = charset ?? metaCharset(html) ?? "utf-8";
  try {
    // An unknown label throws, and the page is then read as UTF-8.
    return new TextDecoder(declared as ConstructorParameters<typeof TextDecoder>[0]).decode(html);
  } catch {
    return new TextDecoder().decode(html);
  }
}

function metaCharset(html: Uint8Array): string | undefined {
  const head = Buffer.from(html.subarray(0, 4096)).toString("latin1");
  return /<meta[^>]+charset\s*=\s*["']?([\w-]+)/i.exec(head)?.[1];
}

/** The saved bytes as the payload: UTF-8 text when they are UTF-8, base64 otherwise. */
function htmlPayload(html: Uint8Array): CollectorRecordV1["payload"] {
  try {
    const body = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(html);
    return { media_type: "text/html", encoding: "utf8", body };
  } catch {
    return {
      media_type: "text/html",
      encoding: "base64",
      body: Buffer.from(html).toString("base64"),
    };
  }
}

interface PageModel {
  savedFrom?: string;
  canonical?: string;
  ogUrl?: string;
  heading?: string;
  /** Description-list pairs by lowercased label without its colon; the first one wins. */
  labels: Map<string, { text: string; datetime?: string }>;
  tables: string[][][];
  /** The main content as text, with a line break between blocks. */
  text: string;
  links: string[];
}

// Elements whose start and end only break the text into lines. Elements with their own
// handlers below break lines there instead: HTMLRewriter keeps one end-tag handler per
// element, so a second registration would replace the first.
const LINE_ELEMENTS = "p, div, li, ul, ol, dl, section, article, h2, h3, h4, h5, h6";

async function readPage(html: string): Promise<PageModel> {
  const page: PageModel = { labels: new Map(), tables: [], text: "", links: [] };
  const all: string[] = [];
  const main: string[] = [];
  const mainLinks: string[] = [];
  const otherLinks: string[] = [];
  let hidden = 0;
  let inMain = 0;
  let hasMain = false;
  let heading: string[] | undefined;
  let term: string[] | undefined;
  let label: string | undefined;
  let definition: { parts: string[]; datetime?: string } | undefined;
  let row: string[] | undefined;
  let cell: string[] | undefined;

  const write = (text: string) => {
    all.push(text);
    if (inMain > 0) main.push(text);
    heading?.push(text);
    term?.push(text);
    definition?.parts.push(text);
    cell?.push(text);
  };
  /** Breaks the line at both ends of el, then runs end once its end tag is reached. */
  const block = (el: HTMLRewriterTypes.Element, end?: () => void) => {
    write("\n");
    el.onEndTag(() => {
      end?.();
      write("\n");
    });
  };

  await new HTMLRewriter()
    .onDocument({
      comments(comment) {
        // Browsers mark a saved page with <!-- saved from url=(0047)https://... -->.
        const savedFrom = /saved from url=\(\d+\)(\S+)/i.exec(comment.text)?.[1];
        if (savedFrom && !page.savedFrom) page.savedFrom = savedFrom;
      },
      text(chunk) {
        if (hidden === 0) write(chunk.text);
      },
    })
    .on("script, style, noscript, template", {
      element(el) {
        hidden++;
        el.onEndTag(() => {
          hidden--;
        });
      },
    })
    .on("main", {
      element(el) {
        inMain++;
        hasMain = true;
        el.onEndTag(() => {
          inMain--;
        });
      },
    })
    .on("link[rel=canonical]", {
      element(el) {
        page.canonical ??= el.getAttribute("href") ?? undefined;
      },
    })
    .on('meta[property="og:url"]', {
      element(el) {
        page.ogUrl ??= el.getAttribute("content") ?? undefined;
      },
    })
    .on(LINE_ELEMENTS, {
      element(el) {
        block(el);
      },
    })
    .on("br", {
      element() {
        write("\n");
      },
    })
    .on("h1", {
      element(el) {
        const first = page.heading === undefined && !heading;
        const parts: string[] = [];
        block(el, () => {
          if (first) page.heading = clean(parts.join(""));
          heading = undefined;
        });
        if (first) heading = parts;
      },
    })
    .on("dt", {
      element(el) {
        const parts: string[] = [];
        block(el, () => {
          label = clean(parts.join("")).toLowerCase().replace(/\s*:$/, "");
          term = undefined;
        });
        term = parts;
      },
    })
    .on("dd", {
      element(el) {
        const value: { parts: string[]; datetime?: string } = { parts: [] };
        block(el, () => {
          if (label && !page.labels.has(label)) {
            page.labels.set(label, {
              text: clean(value.parts.join(" ")),
              datetime: value.datetime,
            });
          }
          label = undefined;
          definition = undefined;
        });
        definition = value;
      },
    })
    .on("dd time[datetime]", {
      element(el) {
        if (definition && !definition.datetime) {
          definition.datetime = el.getAttribute("datetime") ?? undefined;
        }
      },
    })
    .on("table", {
      element(el) {
        page.tables.push([]);
        block(el);
      },
    })
    .on("tr", {
      element(el) {
        const cells: string[] = [];
        block(el, () => {
          if (cells.length > 0) page.tables.at(-1)?.push(cells);
          row = undefined;
        });
        row = cells;
      },
    })
    .on("td, th", {
      element(el) {
        const parts: string[] = [];
        block(el, () => {
          row?.push(clean(parts.join(""), { keepLines: true }));
          cell = undefined;
        });
        cell = parts;
      },
    })
    .on("a[href]", {
      element(el) {
        const href = el.getAttribute("href");
        if (href) (inMain > 0 ? mainLinks : otherLinks).push(href);
      },
    })
    .transform(new Response(html))
    .arrayBuffer();

  page.text = clean((hasMain ? main : all).join(""), { keepLines: true });
  page.links = hasMain ? mainLinks : otherLinks;
  return page;
}

/** Decodes entities and tidies whitespace; keepLines keeps one value per line. */
function clean(raw: string, options: { keepLines?: boolean } = {}): string {
  const text = decodeEntities(raw).replace(/ /g, " ");
  if (!options.keepLines) return text.replace(/\s+/g, " ").trim();
  return text
    .split("\n")
    .map((line) => line.replace(/[ \t\r\f\v]+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  hellip: "…",
  reg: "®",
  trade: "™",
  copy: "©",
  deg: "°",
};

// HTMLRewriter hands text over as written in the source, entities included.
function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, name: string) => {
    if (name[0] === "#") {
      const code =
        name[1] === "x" || name[1] === "X"
          ? Number.parseInt(name.slice(2), 16)
          : Number.parseInt(name.slice(1), 10);
      return Number.isFinite(code) && code <= 0x10ffff ? String.fromCodePoint(code) : entity;
    }
    return NAMED_ENTITIES[name.toLowerCase()] ?? entity;
  });
}

/** The import log: one row per file import or rejection, never changed afterwards. */
class SavedPageLog {
  readonly #store: RawStore;

  constructor(store: RawStore) {
    this.#store = store;
  }

  /** Imported before, or rejected before by this same importer version. */
  handled(fileSha256: string): boolean {
    return (
      this.#store.database
        .query<{ n: number }, [string, string]>(
          `SELECT count(*) AS n FROM saved_page_import
            WHERE file_sha256 = ? AND (outcome = 'imported' OR importer_version = ?)`,
        )
        .get(fileSha256, SAVED_PAGE_IMPORTER_VERSION)?.n !== 0
    );
  }

  imported(
    entry: { fileSha256: string; fileName: string; importedAt: number },
    saved: SavedFile,
    record: CollectorRecordV1,
    documentId: number,
    disposition: "new" | "changed" | "duplicate",
  ): void {
    this.#store.database
      .query<
        never,
        [string, string, string, string, number, string, string, string, number, string]
      >(
        `INSERT INTO saved_page_import (file_sha256, file_name, format, importer_version,
                                        imported_at, outcome, original_url, saved_at,
                                        document_type, document_id, disposition)
         VALUES (?, ?, ?, ?, ?, 'imported', ?, ?, ?, ?, ?)`,
      )
      .run(
        entry.fileSha256,
        entry.fileName,
        saved.format,
        SAVED_PAGE_IMPORTER_VERSION,
        entry.importedAt,
        record.original_url,
        record.retrieved_at,
        record.document_type,
        documentId,
        disposition,
      );
  }

  rejected(
    entry: { fileSha256: string; fileName: string; importedAt: number },
    format: SavedFileFormat | undefined,
    reason: string,
  ): void {
    this.#store.database
      .query<never, [string, string, string | null, string, number, string]>(
        `INSERT INTO saved_page_import (file_sha256, file_name, format, importer_version,
                                        imported_at, outcome, reason)
         VALUES (?, ?, ?, ?, ?, 'rejected', ?)`,
      )
      .run(
        entry.fileSha256,
        entry.fileName,
        format ?? null,
        SAVED_PAGE_IMPORTER_VERSION,
        entry.importedAt,
        reason,
      );
  }
}
