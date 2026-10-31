import { expect, test } from "bun:test";
import { extractAvailableFields } from "../../../src/sourcing/contract/extract.ts";

test("missing optional values stay absent", () => {
  expect(extractAvailableFields({ text: [] })).toEqual({});
});

test("declared values are trimmed, empty ones dropped and lists deduplicated", () => {
  const fields = extractAvailableFields({
    text: ["no barcodes here"],
    declared: {
      firm: "  Example Pet Foods LLC ",
      status: "   ",
      markets: ["US", " US", "TW", ""],
      dates: { report_date: "2026-10-01", termination_date: " " },
    },
  });
  expect(fields).toEqual({
    firm: "Example Pet Foods LLC",
    markets: ["US", "TW"],
    dates: { report_date: "2026-10-01" },
  });
});

test("barcodes come from both declared values and free text", () => {
  const fields = extractAvailableFields({
    text: ["Dry Dog Food UPC 0 76847 61701 5"],
    declared: { barcodes: ["4006381333931"] },
  });
  expect(fields.barcodes?.map((b) => [b.value, b.origin])).toEqual([
    ["4006381333931", "declared"],
    ["076847617015", "text"],
  ]);
});
