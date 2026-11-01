import { afterEach, describe, expect, test } from "bun:test";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { dataDir, inboxDir, runLockPath } from "../../../src/sourcing/app-home.ts";
import { runCollectCommand, runImportCommand } from "../../../src/sourcing/collect/command.ts";
import { collectionHealth } from "../../../src/sourcing/collect/health.ts";
import { rawStorePath } from "../../../src/sourcing/collect/mode.ts";
import { payloadBytes } from "../../../src/sourcing/contract/collector-record.ts";
import {
  importSavedPages,
  SAVED_PAGE_IMPORTER_VERSION,
  SAVED_PAGE_NAMESPACE,
  savedPageFiles,
} from "../../../src/sourcing/fda/saved-pages.ts";
import { acquireRunLock, releaseRunLock } from "../../../src/sourcing/schedule/run-lock.ts";
import { collectionSources } from "../../../src/sourcing/sources.ts";
import { RawStore } from "../../../src/sourcing/store/raw-store.ts";

const REPO_ROOT = resolve(import.meta.dir, "../../..");
const FIXTURES = join(import.meta.dir, "fixtures", "saved-pages");
const T0 = Date.parse("2026-11-01T00:00:00Z");
const RELEASE_URL =
  "https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/example-pet-foods-recalls-chicken-recipe-dry-dog-food";
const LETTER_URL =
  "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/example-pet-foods-inc-700123-10012026";
const ADVISORY_URL =
  "https://www.fda.gov/animal-veterinary/outbreaks-and-advisories/fda-advises-pet-owners-not-feed-certain-lots-example-kitchen-dog-food";
const dirs: string[] = [];

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "pfdb-saved-"));
  dirs.push(dir);
  return dir;
}

function fixture(name: string): Uint8Array {
  return new Uint8Array(readFileSync(join(FIXTURES, name)));
}

/** A file in the inbox, saved at the given time (the creation time follows the mtime back). */
function save(inbox: string, name: string, bytes: Uint8Array | string, savedAt: string): string {
  mkdirSync(inbox, { recursive: true });
  const path = join(inbox, name);
  writeFileSync(path, bytes);
  utimesSync(path, new Date(savedAt), new Date(savedAt));
  return path;
}

function copyFixture(inbox: string, name: string, savedAt: string, as = name): string {
  mkdirSync(inbox, { recursive: true });
  const path = join(inbox, as);
  copyFileSync(join(FIXTURES, name), path);
  utimesSync(path, new Date(savedAt), new Date(savedAt));
  return path;
}

/** A Safari web archive holding html as its main resource. */
function webArchive(html: Uint8Array, url: string): Uint8Array {
  const dir = tempDir();
  const xml = join(dir, "archive.xml");
  writeFileSync(
    xml,
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict><key>WebMainResource</key><dict>
<key>WebResourceData</key><data>${Buffer.from(html).toString("base64")}</data>
<key>WebResourceFrameName</key><string></string>
<key>WebResourceMIMEType</key><string>text/html</string>
<key>WebResourceTextEncodingName</key><string>UTF-8</string>
<key>WebResourceURL</key><string>${url}</string>
</dict></dict></plist>`,
  );
  const archive = join(dir, "page.webarchive");
  const converted = Bun.spawnSync(["plutil", "-convert", "binary1", "-o", archive, xml]);
  if (converted.exitCode !== 0) throw new Error(converted.stderr.toString());
  return new Uint8Array(readFileSync(archive));
}

/** Quoted-printable as Chrome writes it: every byte that isn't plain ASCII, line breaks too. */
function quotedPrintable(bytes: Uint8Array): string {
  const lines: string[] = [];
  let line = "";
  for (const byte of bytes) {
    const plain = (byte >= 33 && byte <= 126 && byte !== 61) || byte === 32;
    const token = plain
      ? String.fromCharCode(byte)
      : `=${byte.toString(16).toUpperCase().padStart(2, "0")}`;
    if (line.length + token.length > 75) {
      lines.push(`${line}=`);
      line = "";
    }
    line += token;
  }
  lines.push(line);
  return lines.join("\r\n");
}

/** A Chrome "Webpage, Single File" save of html, with a stylesheet part after the page. */
function mhtml(html: Uint8Array, url: string, date: string): string {
  const boundary = "----MultipartBoundary--k3x9Q2----";
  return [
    "From: <Saved by Blink>",
    `Snapshot-Content-Location: ${url}`,
    "Subject: =?utf-8?Q?Example_Pet_Foods?=",
    `Date: ${date}`,
    "MIME-Version: 1.0",
    "Content-Type: multipart/related;",
    '\ttype="text/html";',
    `\tboundary="${boundary}"`,
    "",
    "",
    `--${boundary}`,
    "Content-Type: text/html",
    "Content-ID: <frame-1@mhtml.blink>",
    "Content-Transfer-Encoding: quoted-printable",
    `Content-Location: ${url}`,
    "",
    quotedPrintable(html),
    `--${boundary}`,
    "Content-Type: text/css",
    "Content-Transfer-Encoding: quoted-printable",
    "Content-Location: https://www.fda.gov/themes/custom/fda/style.css",
    "",
    "body { margin: 0; }",
    `--${boundary}--`,
    "",
  ].join("\r\n");
}

function sha256(bytes: Uint8Array): string {
  return `sha256:${new Bun.CryptoHasher("sha256").update(bytes).digest("hex")}`;
}

function openStore(): { store: RawStore; inbox: string; path: string } {
  const root = tempDir();
  const path = join(root, "raw.sqlite");
  return { store: RawStore.open(path), inbox: join(root, "inbox"), path };
}

const pageIdentity = (url: string) => ({ namespace: SAVED_PAGE_NAMESPACE, key: url });

describe("saved recall press releases (T8-A1)", () => {
  test("a saved release becomes one record with the page's own HTML, address and save time", async () => {
    const { store, inbox } = openStore();
    copyFixture(inbox, "recall-release.html", "2026-10-28T15:30:00Z");
    const summary = await importSavedPages(store, savedPageFiles(inbox), { now: T0 });
    expect(summary).toEqual({
      imported: { new: 1, changed: 0, duplicate: 0 },
      rejected: 0,
      unchanged: 0,
    });

    const [revision] = store.history("us-fda", pageIdentity(RELEASE_URL));
    const record = revision?.record;
    const saved = fixture("recall-release.html");
    expect(record).toMatchObject({
      source: { key: "us-fda", name: "U.S. Food and Drug Administration" },
      source_ids: {
        page_path:
          "/safety/recalls-market-withdrawals-safety-alerts/example-pet-foods-recalls-chicken-recipe-dry-dog-food",
      },
      document_type: "recall_press_release",
      original_url: RELEASE_URL,
      retrieved_at: "2026-10-28T15:30:00.000Z",
      payload: { media_type: "text/html", encoding: "utf8" },
      content_hash: sha256(saved),
      origin: {
        collector: "fda-saved-pages",
        collector_version: SAVED_PAGE_IMPORTER_VERSION,
        acquisition: "file",
        fixture: false,
        referenced_urls: ["https://www.example-pet-foods.test/recall"],
      },
    });
    // The payload is the saved file, byte for byte, not text pulled out of it.
    expect(payloadBytes(record?.payload as never)).toEqual(saved);
    expect(store.observations("us-fda", pageIdentity(RELEASE_URL))[0]?.candidateFlag).toBe(
      "likely",
    );
    store.close();
  });

  test("the same page saved as a web archive is a duplicate, and an updated single-file save a new revision", async () => {
    const { store, inbox } = openStore();
    const html = fixture("recall-release.html");
    const updated = new TextEncoder().encode(
      new TextDecoder()
        .decode(html)
        .replace(
          "<h2>Company Announcement</h2>",
          "<p><strong>Update October 30, 2026:</strong> lot 2026A5 was added.</p>\n<h2>Company Announcement</h2>",
        ),
    );
    copyFixture(inbox, "recall-release.html", "2026-10-28T15:30:00Z", "1-release.html");
    save(inbox, "2-release.webarchive", webArchive(html, RELEASE_URL), "2026-10-29T08:00:00Z");
    save(
      inbox,
      "3-release.mhtml",
      mhtml(updated, RELEASE_URL, "Thu, 30 Oct 2026 09:15:00 -0000"),
      "2026-10-31T00:00:00Z",
    );

    const summary = await importSavedPages(store, savedPageFiles(inbox), { now: T0 });
    expect(summary).toEqual({
      imported: { new: 1, changed: 1, duplicate: 1 },
      rejected: 0,
      unchanged: 0,
    });
    const history = store.history("us-fda", pageIdentity(RELEASE_URL));
    expect(history).toHaveLength(2);
    const [first, second] = history;
    expect(payloadBytes(first?.record.payload as never)).toEqual(html);
    expect(payloadBytes(second?.record.payload as never)).toEqual(updated);
    expect(second?.contentHash).toBe(sha256(updated));
    // The single-file page carries its own save time.
    expect(second?.record.retrieved_at).toBe("2026-10-30T09:15:00.000Z");
    expect(
      store.observations("us-fda", pageIdentity(RELEASE_URL)).map((o) => o.disposition),
    ).toEqual(["new", "duplicate", "changed"]);

    const health = collectionHealth(store.database, { now: T0 });
    expect(health.savedPages.recent.map((r) => [r.fileName, r.disposition, r.savedAt])).toEqual([
      ["3-release.mhtml", "changed", "2026-10-30T09:15:00.000Z"],
      ["2-release.webarchive", "duplicate", "2026-10-29T08:00:00.000Z"],
      ["1-release.html", "new", "2026-10-28T15:30:00.000Z"],
    ]);
    store.close();
  });

  test("each file is imported once; importing again changes nothing", async () => {
    const { store, inbox } = openStore();
    copyFixture(inbox, "recall-release.html", "2026-10-28T15:30:00Z");
    copyFixture(inbox, "notes.txt", "2026-10-28T15:30:00Z");
    await importSavedPages(store, savedPageFiles(inbox), { now: T0 });
    const again = await importSavedPages(store, savedPageFiles(inbox), { now: T0 + 1 });
    expect(again).toEqual({
      imported: { new: 0, changed: 0, duplicate: 0 },
      rejected: 0,
      unchanged: 2,
    });
    expect(store.observations("us-fda", pageIdentity(RELEASE_URL))).toHaveLength(1);
    expect(collectionHealth(store.database).savedPages).toMatchObject({ imported: 1, rejected: 1 });
    store.close();
  });
});

describe("warning letters and CVM pages (T8-A2)", () => {
  test("a saved warning letter and a CVM advisory keep their own types, fields and payloads", async () => {
    const { store, inbox } = openStore();
    copyFixture(inbox, "warning-letter.html", "2026-10-02T10:00:00Z");
    copyFixture(inbox, "cvm-advisory.html", "2026-10-29T16:00:00Z");
    const summary = await importSavedPages(store, savedPageFiles(inbox), { now: T0 });
    expect(summary.imported.new).toBe(2);

    const letter = store.history("us-fda", pageIdentity(LETTER_URL))[0]?.record;
    expect(letter).toMatchObject({
      document_type: "warning_letter",
      original_url: LETTER_URL,
      retrieved_at: "2026-10-02T10:00:00.000Z",
      source_ids: {
        page_path:
          "/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/example-pet-foods-inc-700123-10012026",
        marcs_cms_number: "700123",
      },
      content_hash: sha256(fixture("warning-letter.html")),
    });
    expect(letter?.extracted).toEqual({
      firm: "Example Pet Foods, Inc.",
      fei_number: "3001234567",
      dates: { letter_issue_date: "October 01, 2026" },
    });

    const advisory = store.history("us-fda", pageIdentity(ADVISORY_URL))[0]?.record;
    expect(advisory).toMatchObject({
      document_type: "advisory",
      original_url: ADVISORY_URL,
      content_hash: sha256(fixture("cvm-advisory.html")),
    });
    expect(advisory?.extracted).toEqual({
      dates: { content_current_as_of: "2026-10-29T14:00:00Z" },
      barcodes: [{ value: "012345678905", format: "upc_a", origin: "text", valid: true }],
    });
    store.close();
  });
});

describe("files the importer can't use (T8-A3)", () => {
  test("each is rejected with its reason, never as an empty record, and the rest still import", async () => {
    const { store, inbox } = openStore();
    const at = "2026-10-28T15:30:00Z";
    // Name order puts the unusable files first.
    copyFixture(inbox, "notes.txt", at, "a-notes.txt");
    copyFixture(inbox, "other-site.html", at, "b-other-site.html");
    copyFixture(inbox, "fda-guidance.html", at, "c-fda-guidance.html");
    copyFixture(inbox, "no-address.html", at, "d-no-address.html");
    copyFixture(inbox, "recall-release.html", at, "e-recall-release.html");
    save(inbox, ".DS_Store", "finder metadata", at);
    save(inbox, "f-still-downloading.html.crdownload", "<html>", at);

    const summary = await importSavedPages(store, savedPageFiles(inbox), { now: T0 });
    expect(summary).toEqual({
      imported: { new: 1, changed: 0, duplicate: 0 },
      rejected: 4,
      unchanged: 0,
    });
    expect(store.counts().documents).toBe(1);
    const { savedPages } = collectionHealth(store.database, { now: T0 });
    expect(
      savedPages.rejections.map(({ fileName, format, reason }) => [fileName, format, reason]),
    ).toEqual([
      [
        "d-no-address.html",
        "html",
        "the page's address could not be found (no saved-from note, canonical link or og:url)",
      ],
      [
        "c-fda-guidance.html",
        "html",
        "not a page type the importer handles: /regulatory-information/search-fda-guidance-documents/example-guidance (it imports recall press releases, warning letters, and CVM outbreak, advisory and update pages)",
      ],
      ["b-other-site.html", "html", "not an fda.gov page: https://www.example-news.test"],
      ["a-notes.txt", null, "not a saved web page (save it as HTML, Web Archive or MHTML)"],
    ]);
    expect(savedPages.recent.map((r) => r.fileName)).toEqual(["e-recall-release.html"]);
    store.close();
  });
});

describe("imports need no keys and make no requests (T8-A4)", () => {
  /** Replaces global fetch for the duration of fn and counts calls. */
  async function countingFetch<T>(fn: () => Promise<T>): Promise<{ result: T; calls: number }> {
    const original = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = (async () => {
      calls++;
      throw new Error("no network in tests");
    }) as unknown as typeof fetch;
    try {
      return { result: await fn(), calls };
    } finally {
      globalThis.fetch = original;
    }
  }

  function homeWithSavedRelease(): string {
    const home = tempDir();
    copyFixture(inboxDir(home), "recall-release.html", "2026-10-28T15:30:00Z");
    return home;
  }

  test("a scheduled live run without keys imports the inbox and sends no request", async () => {
    const home = homeWithSavedRelease();
    const { result, calls } = await countingFetch(() =>
      runCollectCommand({
        home,
        requested: "live",
        trigger: "scheduled",
        repoRoot: REPO_ROOT,
        credentialsPath: join(home, "no-keys.json"),
        sources: collectionSources(),
      }),
    );
    expect(result).toMatchObject({
      status: "live_disabled",
      credentials: "missing",
      savedPages: { imported: { new: 1, changed: 0, duplicate: 0 }, rejected: 0, unchanged: 0 },
    });
    expect(calls).toBe(0);
    const store = RawStore.open(rawStorePath(dataDir(home), "live"));
    expect(store.history("us-fda", pageIdentity(RELEASE_URL))).toHaveLength(1);
    store.close();
  });

  test("the import command takes the run lock, so it waits for a running collection", async () => {
    const home = homeWithSavedRelease();
    const held = acquireRunLock(runLockPath(home));
    if (held.status !== "acquired") throw new Error("setup: lock not acquired");
    expect(await runImportCommand({ home })).toEqual({ status: "already_running" });
    expect(existsSync(dataDir(home))).toBe(false);
    releaseRunLock(held.lock);
    expect(await runImportCommand({ home })).toMatchObject({
      status: "ran",
      savedPages: { imported: { new: 1 } },
    });
  });

  test("fixture runs never read the inbox", async () => {
    const home = homeWithSavedRelease();
    const result = await runCollectCommand({
      home,
      requested: "fixture",
      trigger: "manual",
      repoRoot: REPO_ROOT,
      credentialsPath: join(home, "no-keys.json"),
      sources: collectionSources(),
    });
    expect(result.status).toBe("ran");
    expect(result).not.toHaveProperty("savedPages");
    expect(existsSync(rawStorePath(dataDir(home), "live"))).toBe(false);
  });
});

describe("fields from a saved page (T8-A5)", () => {
  test("extraction keeps the summary fields, lots, best-by dates and every UPC-A, EAN-13 and GTIN-14 string", async () => {
    const { store, inbox } = openStore();
    copyFixture(inbox, "recall-release.html", "2026-10-28T15:30:00Z");
    await importSavedPages(store, savedPageFiles(inbox), { now: T0 });
    expect(store.history("us-fda", pageIdentity(RELEASE_URL))[0]?.record.extracted).toEqual({
      product_description: "Chicken Recipe Dry Dog Food",
      firm: "Example Pet Foods, Inc.",
      dates: {
        company_announcement_date: "2026-10-27T04:00:00Z",
        fda_publish_date: "2026-10-28T04:00:00Z",
        content_current_as_of: "2026-10-28T13:00:00Z",
      },
      lot_codes: ["2026A1", "2026A2", "2026A3", "2026A4"],
      best_by_dates: ["October 27, 2027", "October 28, 2027", "October 29, 2027"],
      barcodes: [
        { value: "012345678905", format: "upc_a", origin: "declared", valid: true },
        { value: "4006381333931", format: "ean_13", origin: "declared", valid: true },
        { value: "10012345678902", format: "gtin_14", origin: "declared", valid: true },
        { value: "012345678912", format: "upc_a", origin: "text", valid: true },
      ],
    });
    store.close();
  });
});
