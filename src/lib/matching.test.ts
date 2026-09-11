import { describe, expect, it } from "vitest";
import { matchLenders, validateApplication, type ApplicationInput } from "./matching";

function makeInput(overrides: Partial<ApplicationInput> = {}): ApplicationInput {
  return {
    fullName: "Jane Doe",
    email: "jane@example.com",
    phone: "(555) 123-4567",
    zipCode: "90210",
    propertyIntent: "purchase",
    homeType: "modular",
    landStatus: "own_land",
    manufacturerKnown: false,
    creditRange: "good",
    incomeRange: "100k_150k",
    budget: "250k_400k",
    timeline: "3_6_months",
    ...overrides,
  };
}

describe("validateApplication", () => {
  it("accepts a complete valid application", () => {
    expect(validateApplication(makeInput())).toEqual([]);
  });

  it("rejects names shorter than 2 characters", () => {
    const errors = validateApplication(makeInput({ fullName: " J " }));
    expect(errors).toContain("Please enter your name.");
  });

  it("rejects malformed emails", () => {
    expect(validateApplication(makeInput({ email: "not-an-email" }))).toContain(
      "Please enter a valid email address.",
    );
  });

  it("requires at least 10 phone digits", () => {
    expect(validateApplication(makeInput({ phone: "555-1234" }))).toContain(
      "Please enter a valid phone number.",
    );
  });

  it("requires a 5-digit ZIP", () => {
    expect(validateApplication(makeInput({ zipCode: "9021" }))).toContain(
      "Please enter a valid 5-digit ZIP code.",
    );
    expect(validateApplication(makeInput({ zipCode: "90210-1234" }))).toContain(
      "Please enter a valid 5-digit ZIP code.",
    );
  });

  it("reports a missing select for every unselected field", () => {
    const errors = validateApplication(
      makeInput({ propertyIntent: "", homeType: "", landStatus: "", creditRange: "", incomeRange: "", budget: "", timeline: "" }),
    );
    expect(errors).toHaveLength(7);
  });
});

describe("matchLenders", () => {
  it("returns at most 4 deterministic matches", () => {
    const first = matchLenders(makeInput());
    const second = matchLenders(makeInput());
    expect(first.length).toBeGreaterThan(0);
    expect(first.length).toBeLessThanOrEqual(4);
    expect(first.map((m) => m.lender.slug)).toEqual(second.map((m) => m.lender.slug));
  });

  it("sorts matches by descending score", () => {
    const matches = matchLenders(makeInput());
    const scores = matches.map((m) => m.matchScore);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  });

  it("caps scores at 99 and floors them at 0", () => {
    for (const credit of ["excellent", "needs_work"] as const) {
      for (const match of matchLenders(makeInput({ creditRange: credit }))) {
        expect(match.matchScore).toBeLessThanOrEqual(99);
        expect(match.matchScore).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("never quotes a rate below the 5.4% floor even for top credit", () => {
    for (const match of matchLenders(makeInput({ creditRange: "excellent" }))) {
      expect(match.estimatedRate).toBeGreaterThanOrEqual(5.4);
    }
  });

  it("rewards in-specialty home types with a higher score", () => {
    const modular = matchLenders(makeInput({ homeType: "modular" }));
    const adu = matchLenders(makeInput({ homeType: "adu" }));
    // Greenline specializes in modular + green; an ADU request should not outscore it for modular buyers.
    expect(modular[0]?.matchScore).toBeGreaterThanOrEqual(adu[0]?.matchScore ?? 0);
  });

  it("gives lower-credit buyers a higher rate", () => {
    const excellent = matchLenders(makeInput({ creditRange: "excellent" }))[0];
    const needsWork = matchLenders(makeInput({ creditRange: "needs_work" }))[0];
    expect(needsWork?.estimatedRate).toBeGreaterThan(excellent?.estimatedRate ?? 0);
  });

  it("always includes a rationale string", () => {
    for (const match of matchLenders(makeInput())) {
      expect(match.rationale.length).toBeGreaterThan(0);
      expect(match.rationale.endsWith(".")).toBe(true);
    }
  });
});
