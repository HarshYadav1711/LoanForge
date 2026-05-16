import { describe, expect, it } from "vitest";
import {
  ACTIVE_LOAN_STATUSES,
  canTransitionLoanStatus,
  isActiveLoanStatus,
  type LoanStatus,
} from "./loan";

describe("active loan restriction", () => {
  it("blocks new applications only while a loan is in-flight", () => {
    expect(ACTIVE_LOAN_STATUSES).toEqual(["applied", "sanctioned", "disbursed"]);
  });

  it.each<LoanStatus>(["applied", "sanctioned", "disbursed"])(
    "treats %s as an active loan status",
    (status) => {
      expect(isActiveLoanStatus(status)).toBe(true);
    },
  );

  it.each<LoanStatus>(["rejected", "closed"])(
    "does not treat %s as an active loan status",
    (status) => {
      expect(isActiveLoanStatus(status)).toBe(false);
    },
  );
});

describe("loan status transitions", () => {
  it("allows closing a disbursed loan after full repayment", () => {
    expect(canTransitionLoanStatus("disbursed", "closed")).toBe(true);
  });

  it("does not allow skipping straight from applied to closed", () => {
    expect(canTransitionLoanStatus("applied", "closed")).toBe(false);
  });
});
