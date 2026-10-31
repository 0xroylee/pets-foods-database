import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { type CollectorAdapter, runCollection } from "../../../src/sourcing/collect/runner.ts";
import { createCollectorRecordV1 } from "../../../src/sourcing/contract/collector-record.ts";
import {
  type CandidateFlag,
  SCREENING_RULE_VERSION,
  screenPetFood,
} from "../../../src/sourcing/screening.ts";
import { RawStore } from "../../../src/sourcing/store/raw-store.ts";
import { drive, FakeClock, okResult, scriptedTransport } from "../collect/helpers.ts";

const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const flag = (description: string | null, firm: string | null = null): CandidateFlag =>
  screenPetFood(description, firm).flag;

describe("flags (T6-A1)", () => {
  test.each([
    "Example Brand Chicken Recipe Dry Dog Food, 30 lb bag",
    "Grain Free Salmon Pate Wet Cat Food, 3 oz cans",
    "Prescription Diet Kidney Care Dry Cat Food",
    "Kitten Formula Freeze-Dried Raw",
    "Rabbit Recipe Canned Cat Food",
  ])("%s is likely", (description) => {
    expect(flag(description)).toBe("likely");
  });

  test.each([
    "Carprofen Chewable Tablets 75 mg for dogs",
    "Compounded Methimazole Transdermal Gel for Cats",
    "Horse Feed Pellets, 50 lb",
    "Medicated Cattle Feed",
    "Beef Jerky Dog Treats",
  ])("%s is unlikely", (description) => {
    expect(flag(description)).toBe("unlikely");
  });

  test.each([
    "Chicken Recipe Dry Dog Food and Horse Feed",
    "Dry Dog Food with Joint Supplement Chews",
    "Chicken Recipe 30 lb bag",
  ])("%s is unknown", (description) => {
    expect(flag(description)).toBe("unknown");
  });

  test("a record with no description or firm is unknown", () => {
    expect(flag(null, null)).toBe("unknown");
    expect(flag("   ", "Example Pet Foods LLC")).toBe("unknown");
  });

  test("a pet food firm alone is a hint, not dog or cat evidence", () => {
    const result = screenPetFood("Chicken Recipe 30 lb bag", "Example Pet Foods LLC");
    expect(result.flag).toBe("unknown");
    expect(result.reasons).toContainEqual({
      rule: "firm:pet_food",
      source: "firm",
      match: "Pet Foods",
    });
  });

  test("a firm never overrides a drug or other-animal description", () => {
    expect(flag("Horse Feed Pellets", "Example Pet Foods LLC")).toBe("unlikely");
    expect(flag("Methimazole Tablets 5 mg", "Example Pet Foods LLC")).toBe("unlikely");
  });

  test("a pharmacy firm makes a silent description unlikely", () => {
    expect(flag("Item 4471, 100 count", "Example Compounding Pharmacy")).toBe("unlikely");
  });
});

describe("deterministic rules (T6-A2)", () => {
  test.each([
    ["Example Brand Chicken Recipe Dry Dog Food", "Example Pet Foods LLC"],
    ["Carprofen Chewable Tablets 75 mg for dogs", null],
    ["Chicken Recipe 30 lb bag", "Example Compounding Pharmacy"],
  ])("repeated assessment of %s gives the same result", (description, firm) => {
    const first = screenPetFood(description, firm);
    expect(screenPetFood(description, firm)).toEqual(first);
    expect(screenPetFood(description, firm)).toEqual(first);
  });

  test("results carry the rule version and the matched source text", () => {
    const result = screenPetFood("Example Brand Chicken Recipe Dry Dog Food", null);
    expect(result.ruleVersion).toBe(SCREENING_RULE_VERSION);
    expect(result.reasons).toContainEqual({
      rule: "species:dog",
      source: "description",
      match: "Dog",
    });
    expect(result.reasons).toContainEqual({
      rule: "diet:form",
      source: "description",
      match: "Dry",
    });
  });
});

// Every kind of record goes through the runner: all are stored, none trigger AI or a subprocess.
const CASES: [string, string | null, CandidateFlag][] = [
  ["dog-food", "Example Brand Chicken Recipe Dry Dog Food", "likely"],
  ["dog-drug", "Carprofen Chewable Tablets 75 mg for dogs", "unlikely"],
  ["compounded", "Compounded Methimazole Transdermal Gel for Cats", "unlikely"],
  ["horse-feed", "Horse Feed Pellets, 50 lb", "unlikely"],
  ["livestock", "Medicated Cattle Feed", "unlikely"],
  ["ambiguous", null, "unknown"],
];

function screeningAdapter(): CollectorAdapter {
  return {
    key: "screening",
    seed: () => [
      {
        workKey: "page",
        origin: "https://fda.test",
        request: { method: "GET", url: "https://fda.test/page" },
      },
    ],
    handle: (result) => ({
      records: CASES.map(([id, description]) => ({
        identity: { namespace: "case", key: id },
        record: createCollectorRecordV1({
          source: { key: "us-fda", name: "U.S. Food and Drug Administration" },
          source_ids: { case: id },
          document_type: "enforcement_report_recall",
          original_url: result.url,
          retrieved_at: "2026-11-01T00:00:00Z",
          payload: {
            media_type: "application/json",
            encoding: "utf8",
            body: JSON.stringify({ id }),
          },
          origin: {
            collector: "test",
            collector_version: "0.1.0",
            acquisition: "api",
            fixture: true,
            referenced_urls: [],
          },
          extracted: description ? { product_description: description } : {},
        }),
      })),
    }),
  };
}

describe("every record stays stored, without AI (T6-A3, T6-A4)", () => {
  test("all records are stored with their flags and no AI or subprocess is called", async () => {
    const dir = mkdtempSync(join(tmpdir(), "pfdb-screen-"));
    dirs.push(dir);
    const store = RawStore.open(join(dir, "raw.sqlite"));
    const clock = new FakeClock();
    const { transport } = scriptedTransport(clock, () => okResult(""));

    const calls = { fetch: 0, spawn: 0 };
    const original = { fetch: globalThis.fetch, spawn: Bun.spawn, spawnSync: Bun.spawnSync };
    globalThis.fetch = (async () => {
      calls.fetch++;
      throw new Error("no AI or network during screening");
    }) as unknown as typeof fetch;
    Bun.spawn = ((...args: unknown[]) => {
      calls.spawn++;
      return (original.spawn as (...a: unknown[]) => unknown)(...args);
    }) as typeof Bun.spawn;
    Bun.spawnSync = ((...args: unknown[]) => {
      calls.spawn++;
      return (original.spawnSync as (...a: unknown[]) => unknown)(...args);
    }) as typeof Bun.spawnSync;
    try {
      await drive(
        clock,
        runCollection({ store, adapters: [screeningAdapter()], transport, clock }),
      );
      await new Promise((resolve) => setTimeout(resolve, 10));
    } finally {
      globalThis.fetch = original.fetch;
      Bun.spawn = original.spawn;
      Bun.spawnSync = original.spawnSync;
    }

    expect(calls).toEqual({ fetch: 0, spawn: 0 });
    const stored = store.database
      .query<{ k: string }, []>("SELECT source_document_key AS k FROM raw_document ORDER BY k")
      .all()
      .map((row) => row.k);
    expect(stored).toEqual(CASES.map(([id]) => id).sort());
    for (const [id, , expected] of CASES) {
      const [observation] = store.observations("us-fda", { namespace: "case", key: id });
      expect([id, observation?.candidateFlag]).toEqual([id, expected]);
      expect(observation?.screeningRuleVersion).toBe(SCREENING_RULE_VERSION);
    }
    store.close();
  });
});
