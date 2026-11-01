import { afterEach, describe, expect, test } from "bun:test";
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  collectWithMode,
  LIVE_DISABLED_MESSAGE,
  rawStorePath,
} from "../../../src/sourcing/collect/mode.ts";
import {
  type CollectorRecordV1,
  createCollectorRecordV1,
  FDA_DOCUMENT_TYPES,
} from "../../../src/sourcing/contract/collector-record.ts";
import {
  type CredentialAvailability,
  type FdaCredentials,
  loadFdaCredentials,
} from "../../../src/sourcing/credentials.ts";
import {
  COLLECTOR_USER_AGENT,
  type FetchResult,
  FixtureTransport,
  LiveTransport,
  type RecordedFixture,
} from "../../../src/sourcing/http/transport.ts";

const REPO_ROOT = resolve(import.meta.dir, "../../..");
const IRES_ORIGIN = "https://www.accessdata.fda.gov";
const IRES_URL = `${IRES_ORIGIN}/rest/iresapi/recalls/`;
// Random per run, so the canary can only reach a tracked file if code writes it there.
const CANARY_USER = `canary-user-${crypto.randomUUID()}`;
const CANARY_KEY = `canary-key-${crypto.randomUUID()}`;
const dirs: string[] = [];

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "pfdb-creds-"));
  dirs.push(dir);
  return dir;
}

function credentialsFile(mode = 0o600, dir = tempDir()): string {
  const path = join(dir, "fda-credentials.json");
  writeFileSync(
    path,
    JSON.stringify({ authorization_user: CANARY_USER, authorization_key: CANARY_KEY }),
  );
  chmodSync(path, mode);
  return path;
}

function availableCredentials(): FdaCredentials {
  const availability = loadFdaCredentials({ path: credentialsFile(), repoRoot: REPO_ROOT });
  if (availability.status !== "available") throw new Error(`setup failed: ${availability.status}`);
  return availability.credentials;
}

/** Everything written to the console or standard streams while fn runs. */
async function captureOutput(fn: () => unknown): Promise<string> {
  const chunks: string[] = [];
  const methods = ["log", "info", "warn", "error", "debug"] as const;
  const saved = methods.map((m) => console[m]);
  const writes = [process.stdout.write, process.stderr.write];
  for (const m of methods) console[m] = (...args: unknown[]) => chunks.push(Bun.inspect(args));
  const capture = ((chunk: unknown) => {
    chunks.push(String(chunk));
    return true;
  }) as typeof process.stdout.write;
  process.stdout.write = capture;
  process.stderr.write = capture;
  try {
    await fn();
  } finally {
    methods.forEach((m, i) => {
      console[m] = saved[i] as (typeof console)[typeof m];
    });
    [process.stdout.write, process.stderr.write] = writes as [typeof capture, typeof capture];
  }
  return chunks.join("\n");
}

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

const SYNTHETIC_FIXTURE: RecordedFixture = {
  request: { method: "POST", url: IRES_URL, body: '{"producttype":"Veterinary","page":1}' },
  response: {
    status: 200,
    headers: { "content-type": "application/json" },
    body: '{"result":[{"recalleventid":"90001","productdescriptiontxt":"Example Dry Dog Food"}]}',
    encoding: "utf8",
  },
  provenance: {
    recorded_at: "2026-10-31T00:00:00Z",
    synthetic: true,
    note: "development stand-in, not a captured FDA response",
  },
};

function toRecord(result: FetchResult): CollectorRecordV1 {
  return createCollectorRecordV1({
    source: { key: "us-fda", name: "U.S. Food and Drug Administration" },
    source_ids: { recall_event_id: "90001" },
    document_type: FDA_DOCUMENT_TYPES.enforcementReportRecall,
    original_url: result.url,
    retrieved_at: "2026-10-31T08:00:00Z",
    payload: {
      media_type: "application/json",
      encoding: "utf8",
      body: new TextDecoder().decode(result.body),
    },
    origin: {
      collector: "test",
      collector_version: "0.1.0",
      acquisition: "api",
      fixture: result.transport === "fixture",
      referenced_urls: [],
    },
    extracted: {},
  });
}

const MISSING: CredentialAvailability = { status: "missing", path: "/nonexistent" };

describe("loading keys (T4-A1)", () => {
  test("keys load from a private file outside the repository", () => {
    const availability = loadFdaCredentials({ path: credentialsFile(), repoRoot: REPO_ROOT });
    expect(availability.status).toBe("available");
    expect(JSON.stringify(availability)).not.toContain(CANARY_KEY);
  });

  test("a credentials file inside the repository is refused", () => {
    const repo = tempDir();
    const result = loadFdaCredentials({ path: credentialsFile(0o600, repo), repoRoot: repo });
    expect(result).toMatchObject({ status: "invalid" });
    expect(JSON.stringify(result)).toContain("outside the repository");
  });

  test("a credentials file other users can read is refused", () => {
    const result = loadFdaCredentials({ path: credentialsFile(0o644), repoRoot: REPO_ROOT });
    expect(result).toMatchObject({ status: "invalid" });
    expect(JSON.stringify(result)).toContain("chmod 600");
  });

  test("a missing file is reported as missing", () => {
    const path = join(tempDir(), "absent.json");
    expect(loadFdaCredentials({ path, repoRoot: REPO_ROOT })).toEqual({ status: "missing", path });
  });

  test("logging or serializing credentials never shows the values", async () => {
    const credentials = availableCredentials();
    const output = await captureOutput(() => {
      console.log(credentials);
      console.log({ credentials });
      console.error(String(credentials));
      console.info(JSON.stringify({ credentials }));
    });
    expect(output).toContain("[redacted]");
    expect(output).not.toContain(CANARY_KEY);
    expect(output).not.toContain(CANARY_USER);
  });
});

describe("honest identification (ADR 0003)", () => {
  test("live requests always name the collector, even if a request asks otherwise", async () => {
    const agents: (string | null)[] = [];
    const fakeFetch = (async (_url: string, init: RequestInit) => {
      agents.push(new Headers(init.headers).get("User-Agent"));
      return new Response("{}", { status: 200 });
    }) as unknown as typeof fetch;
    const transport = new LiveTransport({ fetch: fakeFetch, credentialOrigins: [] });
    await transport.sendAndRead({ method: "GET", url: "https://example.test/a" });
    await transport.sendAndRead({
      method: "GET",
      url: "https://example.test/b",
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh) Safari/605.1.15" },
    });
    expect(agents).toEqual([COLLECTOR_USER_AGENT, COLLECTOR_USER_AGENT]);
    expect(COLLECTOR_USER_AGENT).toContain("pets-foods-database");
  });
});

describe("live requests (T4-A1)", () => {
  test("keys go only to the verified iRES origin and never into output", async () => {
    const seen: { url: string; key: string | null }[] = [];
    const fakeFetch = (async (url: string, init: RequestInit) => {
      seen.push({ url, key: new Headers(init.headers).get("Authorization-Key") });
      return new Response("{}", { status: 200 });
    }) as unknown as typeof fetch;
    const transport = new LiveTransport({
      fetch: fakeFetch,
      credentials: availableCredentials(),
      credentialOrigins: [IRES_ORIGIN],
    });
    const output = await captureOutput(async () => {
      await transport.sendAndRead({ method: "POST", url: IRES_URL, body: "{}" });
      await transport.sendAndRead({ method: "GET", url: "https://www.fda.gov/safety/recalls" });
    });
    expect(seen).toEqual([
      { url: IRES_URL, key: CANARY_KEY },
      { url: "https://www.fda.gov/safety/recalls", key: null },
    ]);
    expect(output).not.toContain(CANARY_KEY);
  });

  test("a failing live request never exposes the key", async () => {
    const failingFetch = (async () => {
      throw new Error(`connection refused for key ${CANARY_KEY}`);
    }) as unknown as typeof fetch;
    const transport = new LiveTransport({
      fetch: failingFetch,
      credentials: availableCredentials(),
      credentialOrigins: [IRES_ORIGIN],
    });
    let message = "";
    const output = await captureOutput(async () => {
      try {
        await transport.sendAndRead({ method: "POST", url: IRES_URL });
      } catch (error) {
        message = (error as Error).message;
      }
    });
    expect(message).toContain("[redacted]");
    expect(message).not.toContain(CANARY_KEY);
    expect(output).not.toContain(CANARY_KEY);
  });

  test("no tracked or staged file contains the canary", () => {
    const listed = Bun.spawnSync(["git", "ls-files", "--cached", "-z"], { cwd: REPO_ROOT });
    const files = new TextDecoder().decode(listed.stdout).split("\0").filter(Boolean);
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const text = readFileSync(join(REPO_ROOT, file), "latin1");
      expect(text.includes(CANARY_KEY) || text.includes(CANARY_USER)).toBe(false);
    }
  });
});

describe("recorded fixtures without keys (T4-A2)", () => {
  test("without keys, collection reads recorded fixtures and makes no requests", async () => {
    const { result, calls } = await countingFetch(() =>
      collectWithMode({
        requested: "auto",
        credentials: MISSING,
        fixtureTransport: () => new FixtureTransport([SYNTHETIC_FIXTURE]),
        liveTransport: () => {
          throw new Error("the live transport must not be created");
        },
        requests: [SYNTHETIC_FIXTURE.request],
        toRecord,
      }),
    );
    expect(calls).toBe(0);
    expect(result.status).toBe("fixture_success");
    const records = result.status === "fixture_success" ? result.records : [];
    expect(records).toHaveLength(1);
    expect(records[0]?.payload.body).toBe(SYNTHETIC_FIXTURE.response.body);
    expect(records[0]?.origin.fixture).toBe(true);
  });

  test("fixture and live records go to separate stores", () => {
    expect(rawStorePath("data", "fixture")).not.toBe(rawStorePath("data", "live"));
  });
});

describe("live without keys (T4-A3)", () => {
  test("an explicit live run without keys is disabled before any request", async () => {
    let liveCreated = false;
    const { result, calls } = await countingFetch(() =>
      collectWithMode({
        requested: "live",
        credentials: MISSING,
        fixtureTransport: () => new FixtureTransport([SYNTHETIC_FIXTURE]),
        liveTransport: () => {
          liveCreated = true;
          throw new Error("the live transport must not be created");
        },
        requests: [SYNTHETIC_FIXTURE.request],
        toRecord,
      }),
    );
    expect(result).toEqual({ status: "live_disabled", message: LIVE_DISABLED_MESSAGE });
    expect(LIVE_DISABLED_MESSAGE).toBe("Live collection disabled: FDA keys are not configured.");
    expect(calls).toBe(0);
    expect(liveCreated).toBe(false);
  });
});
