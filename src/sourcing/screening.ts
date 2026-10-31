// A first, deterministic guess at whether a record is about Pet Food: a complete diet for dogs
// or cats. It never removes a record and never decides; the core's triage makes the final call.

import type { CollectorRecordV1 } from "./contract/collector-record.ts";

export const SCREENING_RULE_VERSION = "pet-food-screen.v1";

export type CandidateFlag = "likely" | "unlikely" | "unknown";

export interface ScreeningReason {
  rule: string;
  source: "description" | "firm";
  /** The exact text that matched, as the source wrote it. */
  match: string;
}

export interface CandidateAssessment {
  flag: CandidateFlag;
  ruleVersion: typeof SCREENING_RULE_VERSION;
  reasons: ScreeningReason[];
}

interface Rule {
  id: string;
  // No g flag: a global pattern keeps lastIndex between calls and would make results drift.
  pattern: RegExp;
}

const SPECIES: readonly Rule[] = [
  { id: "species:dog", pattern: /\b(dogs?|pupp(?:y|ies)|canine)\b/i },
  { id: "species:cat", pattern: /\b(cats?|kittens?|feline)\b/i },
];

const DIET: readonly Rule[] = [
  {
    id: "diet:food",
    pattern: /\b(food|diet|kibble|formula|recipe|entr[eé]e|dinner|chow|p[aâ]t[eé]|stew)\b/i,
  },
  { id: "diet:form", pattern: /\b(dry|wet|canned|raw|freeze[- ]dried|frozen|dehydrated)\b/i },
];

// Proteins such as chicken, beef, fish or rabbit are common in dog and cat food, so other
// animals count only in phrases that clearly mean their own food.
const EXCLUSIONS: readonly Rule[] = [
  {
    id: "exclude:drug",
    pattern:
      /\b(tablets?|capsules?|injectable|injection|oral (?:suspension|solution|paste)|ointment|ophthalmic|transdermal|\d+(?:\.\d+)?\s?mg|A?NADA|Rx only)\b/i,
  },
  { id: "exclude:compounded", pattern: /\bcompound(?:ed|ing)\b/i },
  {
    id: "exclude:other_animal",
    pattern:
      /\b(horses?|equine|cattle|bovine|swine|hog feed|poultry|broilers?|layer feed|chicken feed|sheep|goats?|livestock|deer feed|fish food|aquarium|koi|bird ?seed|bird food|wild birds?|parrots?|parakeets?|avian|rabbit (?:food|pellets)|hamsters?|guinea pigs?|ferrets?|reptiles?)\b/i,
  },
  { id: "exclude:feed", pattern: /\b(medicated feed|premix|mineral (?:block|tub)|lick tubs?)\b/i },
  {
    id: "exclude:treat_or_supplement",
    pattern:
      /\b(treats?|chews?|jerky|rawhide|bully sticks?|dental sticks?|biscuits?|supplements?)\b/i,
  },
];

const FIRM_EXCLUSIONS: readonly Rule[] = [
  {
    id: "firm:pharmacy_or_feed_mill",
    pattern: /\b(pharmacy|pharmaceuticals?|compounding|feed mills?)\b/i,
  },
];
const FIRM_PET_HINTS: readonly Rule[] = [
  { id: "firm:pet_food", pattern: /\bpet ?(?:foods?|care|nutrition|products)\b/i },
];

/**
 * likely: dog or cat complete-diet evidence and nothing against it. unlikely: only evidence
 * against. unknown: missing or conflicting evidence. A firm name can push towards unlikely but
 * never overrides what the description says.
 */
export function screenPetFood(
  description: string | null,
  firm: string | null,
): CandidateAssessment {
  const text = description?.trim() ?? "";
  const firmText = firm?.trim() ?? "";
  const found = (rules: readonly Rule[], source: ScreeningReason["source"], input: string) =>
    rules.flatMap((rule): ScreeningReason[] => {
      const match = rule.pattern.exec(input);
      return match ? [{ rule: rule.id, source, match: match[0] }] : [];
    });

  const species = found(SPECIES, "description", text);
  const diet = found(DIET, "description", text);
  const exclusions = found(EXCLUSIONS, "description", text);
  const firmExclusions = found(FIRM_EXCLUSIONS, "firm", firmText);
  const firmHints = found(FIRM_PET_HINTS, "firm", firmText);
  const reasons = [...species, ...diet, ...exclusions, ...firmExclusions, ...firmHints];
  const assess = (flag: CandidateFlag): CandidateAssessment => ({
    flag,
    ruleVersion: SCREENING_RULE_VERSION,
    reasons,
  });

  if (!text) return assess("unknown");
  const positive = species.length > 0 && diet.length > 0;
  if (exclusions.length > 0) return assess(positive ? "unknown" : "unlikely");
  if (positive) return assess(firmExclusions.length > 0 ? "unknown" : "likely");
  return assess(firmExclusions.length > 0 ? "unlikely" : "unknown");
}

export function screenRecord(record: CollectorRecordV1): CandidateAssessment {
  return screenPetFood(record.extracted.product_description ?? null, record.extracted.firm ?? null);
}
