// The one collection entry point, shared by manual and scheduled runs. It takes the run lock
// first, so a run that loses it reports already_running before loading keys, opening a store
// or making any request. The lock is held for the whole run and released however it ends.
// Every run that isn't a fixture run also imports the fda.gov pages saved in the inbox: they
// are real data and need no keys.

import { dataDir, inboxDir, runLockPath } from "../app-home.ts";
import { type CredentialAvailability, loadFdaCredentials } from "../credentials.ts";
import { importSavedPages, type SavedPagesSummary, savedPageFiles } from "../fda/saved-pages.ts";
import { FixtureTransport, LiveTransport } from "../http/transport.ts";
import { acquireRunLock, type RunLockHooks, releaseRunLock } from "../schedule/run-lock.ts";
import type { CollectionSources } from "../sources.ts";
import { RawStore } from "../store/raw-store.ts";
import type { Clock } from "./clock.ts";
import { type RequestedMode, rawStorePath, resolveCollectionMode } from "./mode.ts";
import { type CollectionLimits, type RunSummary, runCollection } from "./runner.ts";

export type Trigger = "manual" | "scheduled";

export interface CollectCommandOptions {
  /** The private app folder holding the run lock and the raw stores. */
  home: string;
  requested: RequestedMode;
  trigger: Trigger;
  repoRoot: string;
  sources: CollectionSources;
  credentialsPath?: string;
  fetch?: typeof fetch;
  clock?: Clock;
  limits?: Partial<CollectionLimits>;
  lockHooks?: RunLockHooks;
}

interface KeyStatus {
  credentials: CredentialAvailability["status"];
  /** Why a keys file was refused; never its contents. */
  credentialProblem?: string;
}

interface SavedPagesStatus {
  /** What the inbox import did; absent in fixture runs, which never read the inbox. */
  savedPages?: SavedPagesSummary;
}

export type CollectCommandResult =
  | { status: "already_running"; trigger: Trigger }
  | ({ status: "live_disabled"; trigger: Trigger; message: string } & KeyStatus & SavedPagesStatus)
  | ({
      status: "ran";
      trigger: Trigger;
      mode: "fixture" | "live";
      summary: RunSummary;
    } & KeyStatus &
      SavedPagesStatus);

export async function runCollectCommand(
  options: CollectCommandOptions,
): Promise<CollectCommandResult> {
  const { trigger } = options;
  const acquired = acquireRunLock(runLockPath(options.home), options.lockHooks);
  if (acquired.status === "already_running") return { status: "already_running", trigger };
  try {
    const availability = loadFdaCredentials({
      path: options.credentialsPath,
      repoRoot: options.repoRoot,
    });
    const keys: KeyStatus = {
      credentials: availability.status,
      ...(availability.status === "invalid" && { credentialProblem: availability.reason }),
    };
    const decision = resolveCollectionMode(options.requested, availability);
    const pages: SavedPagesStatus =
      decision.mode === "fixture" ? {} : { savedPages: await importInbox(options.home) };
    if (decision.mode === "live_disabled") {
      return { status: "live_disabled", trigger, message: decision.message, ...keys, ...pages };
    }
    const store = RawStore.open(rawStorePath(dataDir(options.home), decision.mode));
    try {
      const transport =
        decision.mode === "live"
          ? new LiveTransport({
              fetch: options.fetch ?? fetch,
              credentials: decision.credentials,
              credentialOrigins: options.sources.credentialOrigins,
            })
          : new FixtureTransport(options.sources.fixtures);
      const summary = await runCollection({
        store,
        adapters: options.sources.adapters,
        transport,
        clock: options.clock,
        limits: options.limits,
        mode: decision.mode,
        trigger,
      });
      return { status: "ran", trigger, mode: decision.mode, summary, ...keys, ...pages };
    } finally {
      store.close();
    }
  } finally {
    releaseRunLock(acquired.lock);
  }
}

export type ImportCommandResult =
  | { status: "already_running" }
  | { status: "ran"; savedPages: SavedPagesSummary };

/** Imports the inbox now, under the same run lock as collection. */
export async function runImportCommand(options: { home: string }): Promise<ImportCommandResult> {
  const acquired = acquireRunLock(runLockPath(options.home));
  if (acquired.status === "already_running") return { status: "already_running" };
  try {
    return { status: "ran", savedPages: await importInbox(options.home) };
  } finally {
    releaseRunLock(acquired.lock);
  }
}

// Saved pages go to the live store; an empty inbox doesn't even open it.
async function importInbox(home: string): Promise<SavedPagesSummary> {
  const files = savedPageFiles(inboxDir(home));
  if (files.length === 0) {
    return { imported: { new: 0, changed: 0, duplicate: 0 }, rejected: 0, unchanged: 0 };
  }
  const store = RawStore.open(rawStorePath(dataDir(home), "live"));
  try {
    return await importSavedPages(store, files);
  } finally {
    store.close();
  }
}
