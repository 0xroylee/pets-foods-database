// Chooses between recorded fixtures and live collection before any request is made.

import { join } from "node:path";
import type { CollectorRecordV1 } from "../contract/collector-record.ts";
import type { CredentialAvailability, FdaCredentials } from "../credentials.ts";
import type { FetchResult, HttpTransport, PublicRequestDescription } from "../http/transport.ts";

export const LIVE_DISABLED_MESSAGE = "Live collection disabled: FDA keys are not configured.";

/** "auto" collects live when keys exist and from recorded fixtures when they don't. */
export type RequestedMode = "auto" | "fixture" | "live";

export type ModeDecision =
  | { mode: "fixture"; reason: "requested" | "no_credentials" }
  | { mode: "live"; credentials: FdaCredentials }
  | { mode: "live_disabled"; message: typeof LIVE_DISABLED_MESSAGE };

export function resolveCollectionMode(
  requested: RequestedMode,
  availability: CredentialAvailability,
): ModeDecision {
  if (requested === "fixture") return { mode: "fixture", reason: "requested" };
  if (availability.status === "available") {
    return { mode: "live", credentials: availability.credentials };
  }
  if (requested === "live") return { mode: "live_disabled", message: LIVE_DISABLED_MESSAGE };
  return { mode: "fixture", reason: "no_credentials" };
}

/** Fixture and live records go to separate stores, so recorded samples never mix with real data. */
export function rawStorePath(dataDir: string, mode: "fixture" | "live"): string {
  return join(dataDir, mode, "raw.sqlite");
}

export interface CollectOptions {
  requested: RequestedMode;
  credentials: CredentialAvailability;
  fixtureTransport: () => HttpTransport;
  liveTransport: (credentials: FdaCredentials) => HttpTransport;
  requests: readonly PublicRequestDescription[];
  toRecord: (result: FetchResult) => CollectorRecordV1;
}

export type CollectResult =
  | { status: "live_disabled"; message: typeof LIVE_DISABLED_MESSAGE }
  | { status: "fixture_success" | "live_success"; records: CollectorRecordV1[] };

/** Fetches each request with the transport the mode allows and turns responses into records. */
export async function collectWithMode(options: CollectOptions): Promise<CollectResult> {
  const decision = resolveCollectionMode(options.requested, options.credentials);
  if (decision.mode === "live_disabled") {
    return { status: "live_disabled", message: decision.message };
  }
  const transport =
    decision.mode === "live"
      ? options.liveTransport(decision.credentials)
      : options.fixtureTransport();
  const records: CollectorRecordV1[] = [];
  for (const request of options.requests) {
    records.push(options.toRecord(await transport.sendAndRead(request)));
  }
  return { status: decision.mode === "live" ? "live_success" : "fixture_success", records };
}
