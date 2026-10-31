import { describe, expect, test } from "bun:test";
import {
  extractBarcodes,
  extractBarcodesFromText,
  hasValidCheckDigit,
} from "../../../src/sourcing/contract/barcodes.ts";

describe("GS1 check digits", () => {
  test.each(["036000291452", "4006381333931", "10012345000017"])("%s is valid", (code) => {
    expect(hasValidCheckDigit(code)).toBe(true);
  });

  test.each(["036000291453", "4006381333932", "10012345000018", "041913122651"])(
    "%s is invalid",
    (code) => {
      expect(hasValidCheckDigit(code)).toBe(false);
    },
  );
});

// Separator and best-by cases ported from openFDA's extract tests (openfda/res/tests, CC0).
describe("UPC-A in recall text (ported from openFDA)", () => {
  test("spaces between groups", () => {
    expect(extractBarcodesFromText("UPC 0 76847 61701 5")).toEqual(["076847617015"]);
  });

  test("dashes between groups", () => {
    expect(extractBarcodesFromText("UPC 6-98997-80615-8")).toEqual(["698997806158"]);
  });

  test("spaces and dashes together", () => {
    expect(extractBarcodesFromText("UPC 3 0603-7039-39 7")).toEqual(["306037039397"]);
  });

  test("a best-by date that looks like a UPC is not included", () => {
    expect(extractBarcodesFromText("UPC 6-98997-80615-8, Best By 041913 12265 1")).toEqual([
      "698997806158",
    ]);
  });

  test("several labelers' UPCs are all found, an invalid length is not", () => {
    const text = "UPCs 032251004292, 400910131502 and 681131739276; UPC 300436122";
    expect(extractBarcodesFromText(text)).toEqual(["032251004292", "400910131502", "681131739276"]);
  });

  test("two UPCs separated by one space are both found", () => {
    expect(extractBarcodesFromText("032251004292 400910131502")).toEqual([
      "032251004292",
      "400910131502",
    ]);
  });
});

describe("EAN-13 and GTIN-14 (local extension)", () => {
  test("both are found in raw text", () => {
    expect(extractBarcodesFromText("EAN 4006381333931, case GTIN 10012345000017")).toEqual([
      "4006381333931",
      "10012345000017",
    ]);
  });

  test("a 13-digit code is never cut down to a 12-digit UPC", () => {
    const found = extractBarcodesFromText("EAN 4006381333931");
    expect(found).not.toContain("400638133393");
    expect(found).toEqual(["4006381333931"]);
  });

  test("a longer digit string yields nothing rather than a substring", () => {
    expect(extractBarcodesFromText("ID 0123456789012345678")).toEqual([]);
  });
});

describe("declared barcodes", () => {
  test("declared values are kept with their format, even when invalid", () => {
    expect(extractBarcodes("", ["032251004292", "12345"])).toEqual([
      { value: "032251004292", format: "upc_a", origin: "declared", valid: true },
      { value: "12345", format: "unknown", origin: "declared", valid: false },
    ]);
  });

  test("separators in a declared value are removed and leading zeros kept", () => {
    expect(extractBarcodes("", ["0 32251 00429 2"])[0]?.value).toBe("032251004292");
  });

  test("a declared value wins over the same code found in text", () => {
    expect(extractBarcodes("UPC 032251004292", ["032251004292"])).toEqual([
      { value: "032251004292", format: "upc_a", origin: "declared", valid: true },
    ]);
  });
});
