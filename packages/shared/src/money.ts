/** Tolerance for comparing currency amounts after rounding (INR, 2 dp). */
export const MONEY_EPSILON = 0.01;

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function outstandingBalance(totalRepayment: number, totalPaid: number): number {
  return roundMoney(Math.max(0, totalRepayment - totalPaid));
}

export function isFullyRepaid(totalRepayment: number, totalPaid: number): boolean {
  return totalPaid >= totalRepayment - MONEY_EPSILON;
}
