import {
  ACTIVE_LOAN_STATUSES,
  canTransitionLoanStatus,
  isFullyRepaid,
  MONEY_EPSILON,
  outstandingBalance,
  recordPaymentSchema,
  rejectLoanSchema,
  roundMoney,
  type BorrowerLoanHistoryItem,
  type BorrowerLoanSummary,
  type LoanRecord,
  type LoanStatus,
  type PaymentRecord,
  type SalesLead,
} from "@loanforge/shared";
import { Loan, type ILoan } from "../models/Loan";
import { LoanApplication } from "../models/LoanApplication";
import { Payment } from "../models/Payment";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";

function toLoanRecord(
  loan: ILoan,
  borrowerEmail: string,
  applicantName: string,
  pan: string,
): LoanRecord {
  const totalPaid = roundMoney(loan.totalPaid);
  const totalRepayment = roundMoney(loan.totalRepayment);

  return {
    id: loan._id.toString(),
    applicationId: loan.applicationId.toString(),
    borrowerId: loan.borrowerId.toString(),
    borrowerEmail,
    applicantName,
    pan,
    status: loan.status,
    amount: loan.amount,
    tenureDays: loan.tenureDays,
    interestRate: loan.interestRate,
    interestAmount: loan.interestAmount,
    totalRepayment,
    totalPaid,
    outstandingBalance: outstandingBalance(totalRepayment, totalPaid),
    rejectionReason: loan.rejectionReason ?? null,
    disbursedAt: loan.disbursedAt?.toISOString() ?? null,
    sanctionedAt: loan.sanctionedAt?.toISOString() ?? null,
    rejectedAt: loan.rejectedAt?.toISOString() ?? null,
    closedAt: loan.closedAt?.toISOString() ?? null,
    createdAt: loan.createdAt.toISOString(),
    updatedAt: loan.updatedAt.toISOString(),
  };
}

async function loadLoanContext(loanId: string) {
  const loan = await Loan.findById(loanId);
  if (!loan) {
    throw new AppError("Loan not found.", 404, "LOAN_NOT_FOUND");
  }

  const [application, borrower] = await Promise.all([
    LoanApplication.findById(loan.applicationId),
    User.findById(loan.borrowerId).select("email"),
  ]);

  if (!application?.personalDetails) {
    throw new AppError("Application data is incomplete.", 500, "DATA_INTEGRITY");
  }

  if (!borrower) {
    throw new AppError("Borrower not found.", 404, "BORROWER_NOT_FOUND");
  }

  return {
    loan,
    applicantName: application.personalDetails.fullName,
    pan: application.personalDetails.pan,
    borrowerEmail: borrower.email,
  };
}

function assertTransition(loan: ILoan, to: LoanStatus): void {
  if (!canTransitionLoanStatus(loan.status, to)) {
    throw new AppError(
      `Cannot move loan from "${loan.status}" to "${to}".`,
      400,
      "INVALID_TRANSITION",
    );
  }
}

function assertLoanStatus(loan: ILoan, expected: LoanStatus, message: string): void {
  if (loan.status !== expected) {
    throw new AppError(message, 400, "INVALID_LOAN_STATE");
  }
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export async function createLoanFromApplication(applicationId: string): Promise<ILoan> {
  const application = await LoanApplication.findById(applicationId);
  if (!application || application.status !== "applied" || !application.loan) {
    throw new AppError("Submitted application is required to create a loan.", 400, "INVALID_APPLICATION");
  }

  const existing = await Loan.findOne({ applicationId: application._id });
  if (existing) {
    return existing;
  }

  return Loan.create({
    applicationId: application._id,
    borrowerId: application.userId,
    status: "applied",
    amount: application.loan.amount,
    tenureDays: application.loan.tenureDays,
    interestRate: application.loan.interestRate,
    interestAmount: application.loan.interestAmount,
    totalRepayment: application.loan.totalRepayment,
    totalPaid: 0,
  });
}

export async function listSalesLeads(): Promise<SalesLead[]> {
  const applications = await LoanApplication.find({ status: "draft" })
    .sort({ updatedAt: -1 })
    .populate<{ userId: { email: string } }>("userId", "email");

  return applications.map((application) => {
    const borrower = application.userId as unknown as { email: string };
    return {
      applicationId: application._id.toString(),
      borrowerId: application.userId.toString(),
      borrowerEmail: borrower?.email ?? "—",
      applicantName: application.personalDetails?.fullName ?? null,
      pan: application.personalDetails?.pan ?? null,
      employmentMode: application.personalDetails?.employmentMode ?? null,
      monthlySalary: application.personalDetails?.monthlySalary ?? null,
      currentStep: resolveLeadStep(application),
      createdAt: application.createdAt.toISOString(),
      updatedAt: application.updatedAt.toISOString(),
    };
  });
}

function resolveLeadStep(application: {
  personalDetails?: unknown;
  bre?: { passed: boolean } | null;
  salarySlip?: unknown;
  loan?: unknown;
}): string {
  if (!application.personalDetails) return "personal";
  if (!application.bre?.passed) return "bre";
  if (!application.salarySlip) return "salary-slip";
  if (!application.loan) return "loan";
  return "ready-to-submit";
}

async function syncLoansFromAppliedApplications(): Promise<void> {
  const applications = await LoanApplication.find({ status: "applied" }).select("_id");
  for (const application of applications) {
    const exists = await Loan.exists({ applicationId: application._id });
    if (!exists) {
      await createLoanFromApplication(application._id.toString());
    }
  }
}

export async function listLoansByStatus(status: LoanStatus): Promise<LoanRecord[]> {
  if (status === "applied") {
    await syncLoansFromAppliedApplications();
  }

  const loans = await Loan.find({ status }).sort({ createdAt: -1 });
  const records: LoanRecord[] = [];

  for (const loan of loans) {
    const context = await loadLoanContext(loan._id.toString());
    records.push(
      toLoanRecord(
        context.loan,
        context.borrowerEmail,
        context.applicantName,
        context.pan,
      ),
    );
  }

  return records;
}

export async function approveLoan(loanId: string): Promise<LoanRecord> {
  const { loan, borrowerEmail, applicantName, pan } = await loadLoanContext(loanId);
  assertLoanStatus(loan, "applied", "Only applied loans can be sanctioned.");
  assertTransition(loan, "sanctioned");

  loan.status = "sanctioned";
  loan.sanctionedAt = new Date();
  loan.rejectionReason = undefined;
  loan.rejectedAt = undefined;
  await loan.save();

  return toLoanRecord(loan, borrowerEmail, applicantName, pan);
}

export async function rejectLoan(loanId: string, input: unknown): Promise<LoanRecord> {
  const parsed = rejectLoanSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join(" ");
    throw new AppError(message, 400, "VALIDATION_ERROR");
  }

  const { loan, borrowerEmail, applicantName, pan } = await loadLoanContext(loanId);
  assertLoanStatus(loan, "applied", "Only applied loans can be rejected.");
  assertTransition(loan, "rejected");

  loan.status = "rejected";
  loan.rejectionReason = parsed.data.reason;
  loan.rejectedAt = new Date();
  loan.sanctionedAt = undefined;
  await loan.save();

  return toLoanRecord(loan, borrowerEmail, applicantName, pan);
}

export async function disburseLoan(loanId: string): Promise<LoanRecord> {
  const { loan, borrowerEmail, applicantName, pan } = await loadLoanContext(loanId);
  assertLoanStatus(loan, "sanctioned", "Only sanctioned loans can be disbursed.");
  assertTransition(loan, "disbursed");

  loan.status = "disbursed";
  loan.disbursedAt = new Date();
  await loan.save();

  return toLoanRecord(loan, borrowerEmail, applicantName, pan);
}

export async function recordPayment(
  loanId: string,
  staffUserId: string,
  input: unknown,
): Promise<{ loan: LoanRecord; payment: PaymentRecord }> {
  const parsed = recordPaymentSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join(" ");
    throw new AppError(message, 400, "VALIDATION_ERROR");
  }

  const staff = await User.findById(staffUserId).select("email");
  if (!staff) {
    throw new AppError("Staff user not found.", 404, "USER_NOT_FOUND");
  }

  const amount = roundMoney(parsed.data.amount);
  const utr = parsed.data.utr.toUpperCase();
  const paymentDate = new Date(parsed.data.paymentDate);

  if (paymentDate.getTime() > Date.now()) {
    throw new AppError("Payment date cannot be in the future.", 400, "INVALID_PAYMENT_DATE");
  }

  const loan = await Loan.findById(loanId);
  if (!loan) {
    throw new AppError("Loan not found.", 404, "LOAN_NOT_FOUND");
  }

  if (loan.status !== "disbursed") {
    throw new AppError(
      "Payments can only be recorded for disbursed loans.",
      400,
      "INVALID_LOAN_STATE",
    );
  }

  if (!loan.disbursedAt) {
    throw new AppError("Loan disbursement date is missing.", 500, "DATA_INTEGRITY");
  }

  if (startOfUtcDay(paymentDate) < startOfUtcDay(loan.disbursedAt)) {
    throw new AppError(
      "Payment date cannot be before the loan disbursement date.",
      400,
      "INVALID_PAYMENT_DATE",
    );
  }

  const existingUtr = await Payment.findOne({ utr });
  if (existingUtr) {
    throw new AppError("A payment with this UTR already exists.", 409, "DUPLICATE_UTR");
  }

  const totalRepayment = roundMoney(loan.totalRepayment);
  const currentPaid = roundMoney(loan.totalPaid);
  const outstanding = outstandingBalance(totalRepayment, currentPaid);

  if (amount > outstanding + MONEY_EPSILON) {
    throw new AppError(
      `Payment exceeds outstanding balance of ₹${outstanding.toLocaleString("en-IN")}.`,
      400,
      "OVERPAYMENT",
    );
  }

  const newTotalPaid = roundMoney(currentPaid + amount);
  const shouldClose = isFullyRepaid(totalRepayment, newTotalPaid);

  if (shouldClose && !canTransitionLoanStatus("disbursed", "closed")) {
    throw new AppError("Loan cannot be closed.", 400, "INVALID_TRANSITION");
  }

  const payment = await Payment.create({
    loanId: loan._id,
    utr,
    amount,
    paymentDate,
    recordedBy: staffUserId,
  });

  const updatedLoan = await Loan.findOneAndUpdate(
    {
      _id: loanId,
      status: "disbursed",
      totalPaid: loan.totalPaid,
    },
    {
      $set: shouldClose
        ? {
            totalPaid: totalRepayment,
            status: "closed",
            closedAt: new Date(),
          }
        : {
            totalPaid: newTotalPaid,
          },
    },
    { new: true },
  );

  if (!updatedLoan) {
    await Payment.deleteOne({ _id: payment._id });
    throw new AppError(
      "Payment could not be applied. Refresh and try again.",
      409,
      "CONCURRENT_UPDATE",
    );
  }

  const context = await loadLoanContext(loanId);

  return {
    loan: toLoanRecord(
      context.loan,
      context.borrowerEmail,
      context.applicantName,
      context.pan,
    ),
    payment: {
      id: payment._id.toString(),
      loanId: loan._id.toString(),
      utr: payment.utr,
      amount: payment.amount,
      paymentDate: payment.paymentDate.toISOString(),
      recordedByEmail: staff.email,
      createdAt: payment.createdAt.toISOString(),
    },
  };
}

export async function listLoanPayments(loanId: string): Promise<PaymentRecord[]> {
  const loan = await Loan.findById(loanId);
  if (!loan) {
    throw new AppError("Loan not found.", 404, "LOAN_NOT_FOUND");
  }

  if (loan.status !== "disbursed" && loan.status !== "closed") {
    throw new AppError(
      "Payment history is only available for disbursed or closed loans.",
      400,
      "INVALID_LOAN_STATE",
    );
  }

  const payments = await Payment.find({ loanId }).sort({ paymentDate: -1 });
  const staffIds = [...new Set(payments.map((p) => p.recordedBy.toString()))];
  const staffUsers = await User.find({ _id: { $in: staffIds } }).select("email");
  const emailById = new Map(staffUsers.map((u) => [u._id.toString(), u.email]));

  return payments.map((payment) => ({
    id: payment._id.toString(),
    loanId: payment.loanId.toString(),
    utr: payment.utr,
    amount: payment.amount,
    paymentDate: payment.paymentDate.toISOString(),
    recordedByEmail: emailById.get(payment.recordedBy.toString()) ?? "—",
    createdAt: payment.createdAt.toISOString(),
  }));
}

function toBorrowerLoanSummary(loan: ILoan): BorrowerLoanSummary {
  const totalRepayment = roundMoney(loan.totalRepayment);
  const totalPaid = roundMoney(loan.totalPaid);

  return {
    id: loan._id.toString(),
    applicationId: loan.applicationId.toString(),
    amount: loan.amount,
    tenureDays: loan.tenureDays,
    status: loan.status,
    rejectionReason: loan.rejectionReason ?? null,
    totalRepayment,
    totalPaid,
    outstandingBalance: outstandingBalance(totalRepayment, totalPaid),
    sanctionedAt: loan.sanctionedAt?.toISOString() ?? null,
    rejectedAt: loan.rejectedAt?.toISOString() ?? null,
    disbursedAt: loan.disbursedAt?.toISOString() ?? null,
    closedAt: loan.closedAt?.toISOString() ?? null,
    createdAt: loan.createdAt.toISOString(),
  };
}

export async function findActiveLoanForBorrower(borrowerId: string): Promise<ILoan | null> {
  return Loan.findOne({
    borrowerId,
    status: { $in: ACTIVE_LOAN_STATUSES },
  }).sort({ createdAt: -1 });
}

export async function getBorrowerActiveLoan(
  borrowerId: string,
): Promise<BorrowerLoanSummary | null> {
  const loan = await findActiveLoanForBorrower(borrowerId);
  return loan ? toBorrowerLoanSummary(loan) : null;
}

export async function listBorrowerLoanHistory(
  borrowerId: string,
): Promise<BorrowerLoanHistoryItem[]> {
  const loans = await Loan.find({
    borrowerId,
    status: { $in: ["rejected", "closed"] },
  }).sort({ updatedAt: -1 });

  return loans.map((loan) => {
    const summary = toBorrowerLoanSummary(loan);
    return {
      id: summary.id,
      applicationId: summary.applicationId,
      amount: summary.amount,
      tenureDays: summary.tenureDays,
      status: summary.status,
      totalRepayment: summary.totalRepayment,
      totalPaid: summary.totalPaid,
      outstandingBalance: summary.outstandingBalance,
      rejectionReason: summary.rejectionReason,
      submittedAt: summary.createdAt,
      rejectedAt: summary.rejectedAt,
      closedAt: summary.closedAt,
    };
  });
}

export async function getBorrowerLoanSummaryForApplication(
  applicationId: string,
  borrowerId: string,
): Promise<BorrowerLoanSummary | null> {
  const loan = await Loan.findOne({ applicationId, borrowerId });
  return loan ? toBorrowerLoanSummary(loan) : null;
}
