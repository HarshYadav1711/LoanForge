import { describe, expect, it } from "vitest";
import { canTransitionLoanStatus } from "./loan";
import {
  isFullyRepaid,
  MONEY_EPSILON,
  outstandingBalance,
  roundMoney,
} from "./money";

/** Mirrors the payment acceptance rules used when recording collection payments. */
function evaluatePayment(
  totalRepayment: number,
  currentPaid: number,
  paymentAmount: number,
) {
  const amount = roundMoney(paymentAmount);
  const outstanding = outstandingBalance(totalRepayment, currentPaid);
  const rejectsOverpayment = amount > outstanding + MONEY_EPSILON;
  const newTotalPaid = roundMoney(currentPaid + amount);
  const shouldClose =
    isFullyRepaid(totalRepayment, newTotalPaid) &&
    canTransitionLoanStatus("disbursed", "closed");

  return { rejectsOverpayment, shouldClose, newTotalPaid, outstanding };
}

describe("payment business rules", () => {
  const totalRepayment = roundMoney(150_000 + 150_000 * 0.12 * (180 / 365));

  it("rejects payments above the outstanding balance", () => {
    const state = evaluatePayment(totalRepayment, 50_000, 120_000);

    expect(state.rejectsOverpayment).toBe(true);
  });

  it("allows partial payments that leave a remaining balance", () => {
    const state = evaluatePayment(totalRepayment, 0, 50_000);

    expect(state.rejectsOverpayment).toBe(false);
    expect(state.shouldClose).toBe(false);
    expect(state.newTotalPaid).toBe(50_000);
    expect(outstandingBalance(totalRepayment, state.newTotalPaid)).toBe(
      roundMoney(totalRepayment - 50_000),
    );
  });

  it("closes the loan when the final payment clears outstanding within tolerance", () => {
    const almostPaid = roundMoney(totalRepayment - 0.02);
    const afterPartial = evaluatePayment(totalRepayment, 0, almostPaid);
    expect(afterPartial.shouldClose).toBe(false);

    const final = evaluatePayment(totalRepayment, almostPaid, 0.02);
    expect(final.rejectsOverpayment).toBe(false);
    expect(final.shouldClose).toBe(true);
    expect(final.newTotalPaid).toBe(totalRepayment);
  });

  it("closes the loan when a single payment covers the full outstanding amount", () => {
    const state = evaluatePayment(totalRepayment, 0, totalRepayment);

    expect(state.rejectsOverpayment).toBe(false);
    expect(state.shouldClose).toBe(true);
  });
});
