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

export interface HttpTransport {
  sendAndRead(request: PublicRequestDescription): Promise<FetchResult>;
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

  async sendAndRead(request: PublicRequestDescription): Promise<FetchResult> {
    const fixture = this.#fixtures.get(fixtureKey(request));
    if (!fixture) {
      throw new FixtureMissingError(`no recorded response for ${request.method} ${request.url}`);
    }
    const { response } = fixture;
    return {
      status: response.status,
      headers: response.headers,
      body:
        response.encoding === "base64"
          ? new Uint8Array(Buffer.from(response.body, "base64"))
          : new TextEncoder().encode(response.body),
      url: request.url,
      transport: "fixture",
      provenance: fixture.provenance,
    };
  }
}

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

  async sendAndRead(request: PublicRequestDescription): Promise<FetchResult> {
    const { fetch: send, credentials, credentialOrigins } = this.#options;
    const headers = new Headers(request.headers);
    if (credentials && credentialOrigins.includes(new URL(request.url).origin)) {
      credentials.applyTo(headers);
    }
    try {
      const response = await send(request.url, {
        method: request.method,
        headers,
        body: request.body,
        redirect: "manual",
      });
      return {
        status: response.status,
        headers: Object.fromEntries(response.headers),
        body: new Uint8Array(await response.arrayBuffer()),
        url: request.url,
        transport: "live",
      };
    } catch (error) {
      const safe = redactOperationalError(error, credentials);
      throw Object.assign(new Error(safe.message), { name: safe.name });
    }
  }
}

function fixtureKey(request: { method: string; url: string; body?: string }): string {
  return `${request.method} ${request.url}${request.body ? ` ${request.body}` : ""}`;
}
