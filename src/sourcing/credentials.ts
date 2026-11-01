// FDA API keys: read from a private local file outside the repository, never printed.

import { readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { DEFAULT_APP_HOME } from "./app-home.ts";

export const DEFAULT_CREDENTIALS_FILE = join(DEFAULT_APP_HOME, "fda-credentials.json");

const REDACTED = "[redacted]";

/** Holds the keys privately. Logging or serializing it shows "[redacted]", never the values. */
export class FdaCredentials {
  readonly #user: string;
  readonly #key: string;

  constructor(user: string, key: string) {
    this.#user = user;
    this.#key = key;
  }

  /** The only way the values leave this object: as iRES request headers. */
  applyTo(headers: Headers): void {
    headers.set("Authorization-User", this.#user);
    headers.set("Authorization-Key", this.#key);
  }

  /** Replaces every occurrence of either value in text. */
  redact(text: string): string {
    return text.split(this.#key).join(REDACTED).split(this.#user).join(REDACTED);
  }

  toJSON(): string {
    return REDACTED;
  }

  toString(): string {
    return `FdaCredentials ${REDACTED}`;
  }

  [Symbol.for("nodejs.util.inspect.custom")](): string {
    return this.toString();
  }

  [Bun.inspect.custom](): string {
    return this.toString();
  }
}

export type CredentialAvailability =
  | { status: "available"; credentials: FdaCredentials }
  | { status: "missing"; path: string }
  | { status: "invalid"; path: string; reason: string };

export interface CredentialFileConfiguration {
  path?: string;
  /** The repository root; a credentials file inside it is refused so it can't be committed. */
  repoRoot: string;
}

export function loadFdaCredentials(config: CredentialFileConfiguration): CredentialAvailability {
  const path = resolve(config.path ?? process.env.PFDB_FDA_CREDENTIALS ?? DEFAULT_CREDENTIALS_FILE);
  const inside = relative(resolve(config.repoRoot), path);
  if (!inside.startsWith("..") && !inside.startsWith("/")) {
    return {
      status: "invalid",
      path,
      reason: "the credentials file must be outside the repository",
    };
  }
  let mode: number;
  try {
    mode = statSync(path).mode;
  } catch {
    return { status: "missing", path };
  }
  if (mode & 0o077) {
    return {
      status: "invalid",
      path,
      reason: "the credentials file must be readable only by you (chmod 600)",
    };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    // Never echo the file's contents: they are the secret.
    return { status: "invalid", path, reason: "the credentials file is not valid JSON" };
  }
  const { authorization_user: user, authorization_key: key } = (parsed ?? {}) as Record<
    string,
    unknown
  >;
  if (typeof user !== "string" || !user || typeof key !== "string" || !key) {
    return {
      status: "invalid",
      path,
      reason: "the credentials file needs authorization_user and authorization_key",
    };
  }
  return { status: "available", credentials: new FdaCredentials(user, key) };
}

export interface SafeOperationalError {
  name: string;
  message: string;
}

/** An error safe to log or persist: any credential value in its message is replaced. */
export function redactOperationalError(
  error: unknown,
  credentials?: FdaCredentials,
): SafeOperationalError {
  const name = error instanceof Error ? error.name : "Error";
  const message = error instanceof Error ? error.message : String(error);
  return { name, message: credentials ? credentials.redact(message) : message };
}
