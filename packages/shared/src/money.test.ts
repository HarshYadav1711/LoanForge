import { describe, expect, it } from "vitest";
import {
  calculateSimpleInterestRepayment,
  ANNUAL_INTEREST_RATE,
} from "./application";
import {
  isFullyRepaid,
  MONEY_EPSILON,
  outstandingBalance,
  roundMoney,
} from "./money";

describe("roundMoney", () => {
  it("rounds to two decimal places", () => {
    expect(roundMoney(1.006)).toBe(1.01);
    expect(roundMoney(99.999)).toBe(100);
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
  });
});

describe("outstandingBalance", () => {
  it("never returns negative outstanding", () => {
    expect(outstandingBalance(1000, 1200)).toBe(0);
  });

  it("matches repayment minus paid after rounding", () => {
    expect(outstandingBalance(100_000.5, 40_000.25)).toBe(60_000.25);
  });
});

describe("isFullyRepaid", () => {
  it("treats amounts within epsilon as fully repaid", () => {
    expect(isFullyRepaid(10_000, 9_999.99)).toBe(true);
    expect(isFullyRepaid(10_000, 9_999.98)).toBe(false);
  });

  it("respects MONEY_EPSILON boundary", () => {
    expect(MONEY_EPSILON).toBe(0.01);
    expect(isFullyRepaid(100, 99.99)).toBe(true);
  });
});

describe("calculateSimpleInterestRepayment", () => {
  it("produces stable totals for typical loan amounts", () => {
    const preview = calculateSimpleInterestRepayment(250_000, 180, ANNUAL_INTEREST_RATE);
    expect(preview.interestAmount).toBe(roundMoney(250_000 * 0.12 * (180 / 365)));
    expect(preview.totalRepayment).toBe(roundMoney(250_000 + preview.interestAmount));
  });
});
