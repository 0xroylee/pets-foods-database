// Barcode extraction for collector records.
// Pattern from openFDA's UPC extractor (openfda/res/extract.py, CC0): accept digits with
// optional space or dash separators and let the check digit reject look-alikes such as
// best-by dates. Extended locally to EAN-13 and GTIN-14 (sourcing plan T1, D11).

export type BarcodeFormat = "upc_a" | "ean_13" | "gtin_14" | "unknown";
export type BarcodeOrigin = "declared" | "text";

export interface Barcode {
  /** Digits only when the value is a separated barcode; otherwise the declared string as given. */
  value: string;
  format: BarcodeFormat;
  origin: BarcodeOrigin;
  valid: boolean;
}

const FORMAT_BY_LENGTH: Record<number, BarcodeFormat> = {
  12: "upc_a",
  13: "ean_13",
  14: "gtin_14",
};

// Longest first, so a 13- or 14-digit code is never cut down to a 12-digit UPC.
const LENGTHS = [14, 13, 12] as const;

// A run of digits where single spaces or dashes may separate groups.
const DIGIT_RUN = /\d(?:[ -]?\d)*/g;
const SEPARATED_DIGITS = /^\d(?:[ -]?\d)*$/;

/** GS1 mod-10 check digit, shared by UPC-A, EAN-13 and GTIN-14. */
export function hasValidCheckDigit(digits: string): boolean {
  if (!/^\d{2,}$/.test(digits)) return false;
  let sum = 0;
  for (let i = digits.length - 2, weight = 3; i >= 0; i--, weight = 4 - weight) {
    sum += Number(digits[i]) * weight;
  }
  return (10 - (sum % 10)) % 10 === Number(digits[digits.length - 1]);
}

export function barcodeFormat(digits: string): BarcodeFormat {
  return FORMAT_BY_LENGTH[digits.length] ?? "unknown";
}

/** Valid barcodes found in free text, in order of appearance, without duplicates. */
export function extractBarcodesFromText(text: string): string[] {
  const found: string[] = [];
  for (const match of text.matchAll(DIGIT_RUN)) {
    for (const code of segmentRun(match[0])) {
      if (!found.includes(code)) found.push(code);
    }
  }
  return found;
}

/**
 * Declared barcodes are kept even when their check digit fails, so nothing a source states
 * is lost; barcodes found in text are kept only when valid. Declared values win on duplicates.
 */
export function extractBarcodes(text: string, declaredValues: readonly string[] = []): Barcode[] {
  const barcodes: Barcode[] = [];
  for (const declared of declaredValues) {
    const trimmed = declared.trim();
    if (!trimmed) continue;
    const digits = SEPARATED_DIGITS.test(trimmed) ? trimmed.replace(/[ -]/g, "") : undefined;
    const value = digits ?? trimmed;
    if (barcodes.some((b) => b.value === value)) continue;
    const format = digits ? barcodeFormat(digits) : "unknown";
    barcodes.push({
      value,
      format,
      origin: "declared",
      valid: format !== "unknown" && hasValidCheckDigit(value),
    });
  }
  for (const code of extractBarcodesFromText(text)) {
    if (barcodes.some((b) => b.value === code)) continue;
    barcodes.push({ value: code, format: barcodeFormat(code), origin: "text", valid: true });
  }
  return barcodes;
}

// Splits one digit run into valid codes. A code must start at the start of a group and end at
// the end of a group, so codes never begin or end in the middle of a printed number.
function segmentRun(run: string): string[] {
  const digits = run.replace(/[ -]/g, "");
  const groupEnds = new Set<number>();
  let count = 0;
  for (const ch of run) {
    if (ch === " " || ch === "-") groupEnds.add(count);
    else count++;
  }
  groupEnds.add(digits.length);

  const codes: string[] = [];
  let start = 0;
  while (start < digits.length) {
    const length = LENGTHS.find((n) => {
      const end = start + n;
      return (
        end <= digits.length && groupEnds.has(end) && hasValidCheckDigit(digits.slice(start, end))
      );
    });
    if (length) {
      codes.push(digits.slice(start, start + length));
      start += length;
      continue;
    }
    const next = [...groupEnds].filter((end) => end > start).sort((a, b) => a - b)[0];
    if (next === undefined || next >= digits.length) break;
    start = next;
  }
  return codes;
}
