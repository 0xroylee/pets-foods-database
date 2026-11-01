// The collectors a run uses. Each source brings its adapter, its recorded responses for
// fixture runs and the origins verified to receive the FDA keys. Until a source is added here,
// a run has nothing to fetch and live requests carry no keys.

import type { CollectorAdapter } from "./collect/runner.ts";
import type { RecordedFixture } from "./http/transport.ts";

export interface CollectionSources {
  adapters: CollectorAdapter[];
  /** Recorded responses served in fixture mode. */
  fixtures: RecordedFixture[];
  /** Origins verified to receive the FDA keys; live requests to any other origin carry none. */
  credentialOrigins: string[];
}

export function collectionSources(): CollectionSources {
  return { adapters: [], fixtures: [], credentialOrigins: [] };
}
