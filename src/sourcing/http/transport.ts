// HTTP acquisition behind one interface, so collectors run the same way against recorded
// fixtures or the live sites. Pattern from Crawlee's pluggable HTTP client: tests inject a
// controlled client instead of making external requests.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { type FdaCredentials, redactOperationalError } from "../credentials.ts";

/** A request with no secrets in it; credentials are added only inside the live transport. */
export interface PublicRequestDescription {
  method: "GET" | "POST";
  url: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface FixtureProvenance {
  recorded_at: string;
  /** true for a development stand-in written by hand; false for a captured real response. */
  synthetic: boolean;
  note: string;
}

export interface FetchResult {
  status: number;
  headers: Record<string, string>;
  body: Uint8Array;
  url: string;
  transport: "fixture" | "live";
  provenance?: FixtureProvenance;
}

/** How the runner follows one request: it aborts through signal and watches progress. */
export interface TransportContext {
  signal?: AbortSignal;
  /** Called once the status line and headers have arrived. */
  onHeaders?: (status: number) => void;
  /** Called for every body chunk as it arrives. */
  onChunk?: (chunk: Uint8Array) => void;
}

export interface HttpTransport {
  sendAndRead(request: PublicRequestDescription, context?: TransportContext): Promise<FetchResult>;
}

export interface RecordedFixture {
  request: { method: "GET" | "POST"; url: string; body?: string };
  response: {
    status: number;
    headers: Record<string, string>;
    body: string;
    encoding: "utf8" | "base64";
  };
  provenance: FixtureProvenance;
}

export class FixtureMissingError extends Error {
  override name = "FixtureMissingError";
}

/** Serves recorded responses. Never touches the network and needs no credentials. */
export class FixtureTransport implements HttpTransport {
  readonly #fixtures = new Map<string, RecordedFixture>();

  constructor(fixtures: readonly RecordedFixture[]) {
    for (const fixture of fixtures) this.#fixtures.set(fixtureKey(fixture.request), fixture);
  }

  static fromDirectory(dir: string): FixtureTransport {
    const files = readdirSync(dir).filter((name) => name.endsWith(".json"));
    return new FixtureTransport(
      files.map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RecordedFixture),
    );
  }

  async sendAndRead(
    request: PublicRequestDescription,
    context: TransportContext = {},
  ): Promise<FetchResult> {
    const fixture = this.#fixtures.get(fixtureKey(request));
    if (!fixture) {
      throw new FixtureMissingError(`no recorded response for ${request.method} ${request.url}`);
    }
    const { response } = fixture;
    const body =
      response.encoding === "base64"
        ? new Uint8Array(Buffer.from(response.body, "base64"))
        : new TextEncoder().encode(response.body);
    context.onHeaders?.(response.status);
    context.onChunk?.(body);
    return {
      status: response.status,
      headers: response.headers,
      body,
      url: request.url,
      transport: "fixture",
      provenance: fixture.provenance,
    };
  }
}

/** How every live request identifies itself. Never replaced by a browser-like string (ADR 0003). */
export const COLLECTOR_USER_AGENT =
  "pets-foods-database-collector/0.1 (+https://github.com/0xroylee/pets-foods-database)";

export interface LiveTransportOptions {
  fetch: typeof fetch;
  credentials?: FdaCredentials;
  /** Origins verified to receive the FDA keys. Every other origin gets no credentials. */
  credentialOrigins: readonly string[];
}

/** Sends real requests. Credentials are attached only for a verified origin. */
export class LiveTransport implements HttpTransport {
  readonly #options: LiveTransportOptions;

  constructor(options: LiveTransportOptions) {
    this.#options = options;
  }

  async sendAndRead(
    request: PublicRequestDescription,
    context: TransportContext = {},
  ): Promise<FetchResult> {
    const { fetch: send, credentials, credentialOrigins } = this.#options;
    const headers = new Headers(request.headers);
    headers.set("User-Agent", COLLECTOR_USER_AGENT);
    if (credentials && credentialOrigins.includes(new URL(request.url).origin)) {
      credentials.applyTo(headers);
    }
    try {
      const response = await send(request.url, {
        method: request.method,
        headers,
        body: request.body,
        redirect: "manual",
        signal: context.signal,
      });
      context.onHeaders?.(response.status);
      return {
        status: response.status,
        headers: Object.fromEntries(response.headers),
        body: await readBody(response, context),
        url: request.url,
        transport: "live",
      };
    } catch (error) {
      const safe = redactOperationalError(error, credentials);
      throw Object.assign(new Error(safe.message), { name: safe.name });
    }
  }
}

// Reads the body chunk by chunk so an abort cancels the reader instead of leaving it running.
async function readBody(response: Response, context: TransportContext): Promise<Uint8Array> {
  if (!response.body) return new Uint8Array();
  const reader = response.body.getReader();
  const cancel = () => void reader.cancel().catch(() => {});
  context.signal?.addEventListener("abort", cancel, { once: true });
  const chunks: Uint8Array[] = [];
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      context.onChunk?.(value);
    }
  } finally {
    context.signal?.removeEventListener("abort", cancel);
  }
  return Buffer.concat(chunks);
}

function fixtureKey(request: { method: string; url: string; body?: string }): string {
  return `${request.method} ${request.url}${request.body ? ` ${request.body}` : ""}`;
}
