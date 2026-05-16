import { describe, expect, it } from "vitest";
import type { PersonalDetails } from "@loanforge/shared";
import { MAX_AGE, MIN_AGE, MIN_MONTHLY_SALARY } from "@loanforge/shared";
import { runBreChecks } from "./bre.service";

/** Picks a DOB that yields an exact age on the current calendar date. */
function dobForAge(age: number): string {
  const year = new Date().getFullYear() - age;
  return `${year}-01-01`;
}

function baseDetails(overrides: Partial<PersonalDetails> = {}): PersonalDetails {
  return {
    fullName: "Priya Sharma",
    dateOfBirth: dobForAge(30),
    pan: "ABCDE1234F",
    employmentMode: "salaried",
    monthlySalary: 50_000,
    ...overrides,
  };
}

describe("runBreChecks", () => {
  it("passes a borrower who meets all BRE rules", () => {
    const result = runBreChecks(baseDetails());

    expect(result.passed).toBe(true);
    expect(result.failures).toHaveLength(0);
    expect(result.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("rejects borrowers below minimum age", () => {
    const result = runBreChecks(baseDetails({ dateOfBirth: dobForAge(MIN_AGE - 1) }));

    expect(result.passed).toBe(false);
    expect(result.failures.some((f) => f.includes(String(MIN_AGE)))).toBe(true);
  });

  it("rejects borrowers above maximum age", () => {
    const result = runBreChecks(baseDetails({ dateOfBirth: dobForAge(MAX_AGE + 1) }));

    expect(result.passed).toBe(false);
    expect(result.failures.some((f) => f.includes(String(MAX_AGE)))).toBe(true);
  });

  it("accepts borrowers at the minimum and maximum age boundaries", () => {
    expect(runBreChecks(baseDetails({ dateOfBirth: dobForAge(MIN_AGE) })).passed).toBe(true);
    expect(runBreChecks(baseDetails({ dateOfBirth: dobForAge(MAX_AGE) })).passed).toBe(true);
  });

  it("rejects salary below the minimum threshold", () => {
    const result = runBreChecks(
      baseDetails({ monthlySalary: MIN_MONTHLY_SALARY - 1 }),
    );

    expect(result.passed).toBe(false);
    expect(result.failures.some((f) => f.includes("25,000"))).toBe(true);
  });

  it("rejects invalid PAN format", () => {
    const result = runBreChecks(baseDetails({ pan: "INVALID-PAN" }));

    expect(result.passed).toBe(false);
    expect(result.failures.some((f) => f.toLowerCase().includes("pan"))).toBe(true);
  });

  it("rejects unemployed employment mode", () => {
    const result = runBreChecks(baseDetails({ employmentMode: "unemployed" }));

    expect(result.passed).toBe(false);
    expect(result.failures.some((f) => f.toLowerCase().includes("unemployed"))).toBe(true);
  });

  it("rejects an invalid date of birth", () => {
    const result = runBreChecks(baseDetails({ dateOfBirth: "not-a-date" }));

    expect(result.passed).toBe(false);
    expect(result.failures.some((f) => f.toLowerCase().includes("invalid"))).toBe(true);
  });

  it("accumulates multiple failures when several rules fail", () => {
    const result = runBreChecks(
      baseDetails({
        dateOfBirth: dobForAge(18),
        monthlySalary: 10_000,
        pan: "BAD",
        employmentMode: "unemployed",
      }),
    );

    expect(result.passed).toBe(false);
    expect(result.failures.length).toBeGreaterThanOrEqual(3);
  });
});
