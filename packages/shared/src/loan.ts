export type LoanStatus =
  | "applied"
  | "sanctioned"
  | "rejected"
  | "disbursed"
  | "closed";

export const LOAN_STATUS_TRANSITIONS: Record<
  LoanStatus,
  readonly LoanStatus[]
> = {
  applied: ["sanctioned", "rejected"],
  sanctioned: ["disbursed"],
  rejected: [],
  disbursed: ["closed"],
  closed: [],
};

export function canTransitionLoanStatus(
  from: LoanStatus,
  to: LoanStatus,
): boolean {
  return LOAN_STATUS_TRANSITIONS[from].includes(to);
}

export interface LoanRecord {
  id: string;
  applicationId: string;
  borrowerId: string;
  borrowerEmail: string;
  applicantName: string;
  pan: string;
  status: LoanStatus;
  amount: number;
  tenureDays: number;
  interestRate: number;
  interestAmount: number;
  totalRepayment: number;
  totalPaid: number;
  outstandingBalance: number;
  rejectionReason: string | null;
  disbursedAt: string | null;
  sanctionedAt: string | null;
  rejectedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SalesLead {
  applicationId: string;
  borrowerId: string;
  borrowerEmail: string;
  applicantName: string | null;
  pan: string | null;
  employmentMode: string | null;
  monthlySalary: number | null;
  currentStep: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  loanId: string;
  utr: string;
  amount: number;
  paymentDate: string;
  recordedByEmail: string;
  createdAt: string;
}
