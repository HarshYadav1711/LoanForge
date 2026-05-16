import { describe, expect, it } from "vitest";
import {
  ANNUAL_INTEREST_RATE,
  calculateSimpleInterestRepayment,
  MAX_LOAN_AMOUNT,
  MAX_TENURE_DAYS,
  MIN_LOAN_AMOUNT,
  MIN_TENURE_DAYS,
} from "./application";
import { roundMoney } from "./money";

describe("calculateSimpleInterestRepayment", () => {
  it("uses simple interest: principal × rate × (tenure / 365)", () => {
    const preview = calculateSimpleInterestRepayment(250_000, 180, ANNUAL_INTEREST_RATE);

    expect(preview.interestAmount).toBe(roundMoney(250_000 * 0.12 * (180 / 365)));
    expect(preview.totalRepayment).toBe(roundMoney(250_000 + preview.interestAmount));
    expect(preview.interestRate).toBe(0.12);
  });

  it("matches the standard demo loan amount and tenure", () => {
    const preview = calculateSimpleInterestRepayment(150_000, 180, ANNUAL_INTEREST_RATE);

    expect(preview.interestAmount).toBe(roundMoney(150_000 * 0.12 * (180 / 365)));
    expect(preview.totalRepayment).toBe(roundMoney(150_000 + preview.interestAmount));
  });

  it("scales proportionally with principal for a fixed tenure", () => {
    const shorter = calculateSimpleInterestRepayment(100_000, 90, ANNUAL_INTEREST_RATE);
    const longer = calculateSimpleInterestRepayment(200_000, 90, ANNUAL_INTEREST_RATE);

    expect(longer.interestAmount / shorter.interestAmount).toBeCloseTo(2, 5);
    expect(longer.totalRepayment / shorter.totalRepayment).toBeCloseTo(2, 5);
  });

  it("covers the product loan amount and tenure bounds", () => {
    const minLoan = calculateSimpleInterestRepayment(
      MIN_LOAN_AMOUNT,
      MIN_TENURE_DAYS,
      ANNUAL_INTEREST_RATE,
    );
    const maxLoan = calculateSimpleInterestRepayment(
      MAX_LOAN_AMOUNT,
      MAX_TENURE_DAYS,
      ANNUAL_INTEREST_RATE,
    );

    expect(minLoan.totalRepayment).toBeGreaterThan(MIN_LOAN_AMOUNT);
    expect(maxLoan.totalRepayment).toBeGreaterThan(maxLoan.principal);
    expect(maxLoan.interestAmount).toBeGreaterThan(minLoan.interestAmount);
  });
});
