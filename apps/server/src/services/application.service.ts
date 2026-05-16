import {
  ANNUAL_INTEREST_RATE,
  calculateSimpleInterestRepayment,
  loanConfigSchema,
  personalDetailsSchema,
  type ApplicationStep,
  type BorrowerDashboardState,
  type LoanApplicationState,
  type PersonalDetails,
} from "@loanforge/shared";
import { LoanApplication } from "../models/LoanApplication";
import { AppError } from "../utils/AppError";
import { runBreChecks } from "./bre.service";
import {
  createLoanFromApplication,
  findActiveLoanForBorrower,
  getBorrowerActiveLoan,
  getBorrowerLoanSummaryForApplication,
  listBorrowerLoanHistory,
} from "./loan.service";

const ACTIVE_LOAN_MESSAGE =
  "You already have an active loan in progress. New applications are available once it is closed or rejected.";

function resolveCurrentStep(application: {
  status: string;
  personalDetails?: PersonalDetails;
  bre?: { passed: boolean } | null;
  salarySlip?: unknown;
  loan?: unknown;
}): ApplicationStep {
  if (application.status === "applied") {
    return "complete";
  }
  if (!application.personalDetails) {
    return "personal";
  }
  if (!application.bre?.passed) {
    return "bre";
  }
  if (!application.salarySlip) {
    return "salary-slip";
  }
  if (!application.loan) {
    return "loan";
  }
  return "complete";
}

async function toPublicState(
  application: {
    _id: { toString(): string };
    userId: { toString(): string };
    status: "draft" | "applied";
    personalDetails?: PersonalDetails;
    bre?: LoanApplicationState["bre"];
    salarySlip?: {
      originalName: string;
      mimeType: string;
      size: number;
      uploadedAt: string;
    };
    loan?: LoanApplicationState["loan"];
    createdAt: Date;
    updatedAt: Date;
  },
  borrowerId: string,
): Promise<LoanApplicationState> {
  const salarySlip = application.salarySlip
    ? {
        originalName: application.salarySlip.originalName,
        mimeType: application.salarySlip.mimeType,
        size: application.salarySlip.size,
        uploadedAt: application.salarySlip.uploadedAt,
      }
    : null;

  const linkedLoan =
    application.status === "applied"
      ? await getBorrowerLoanSummaryForApplication(application._id.toString(), borrowerId)
      : null;

  return {
    id: application._id.toString(),
    status: application.status,
    currentStep: resolveCurrentStep(application),
    personalDetails: application.personalDetails ?? null,
    bre: application.bre ?? null,
    salarySlip,
    loan: application.loan ?? null,
    linkedLoan,
    createdAt: application.createdAt.toISOString(),
    updatedAt: application.updatedAt.toISOString(),
  };
}

async function assertNoActiveLoan(userId: string): Promise<void> {
  const active = await findActiveLoanForBorrower(userId);
  if (active) {
    throw new AppError(ACTIVE_LOAN_MESSAGE, 400, "ACTIVE_LOAN_EXISTS");
  }
}

async function findDraftApplication(userId: string) {
  return LoanApplication.findOne({ userId, status: "draft" });
}

async function getDraftOrThrow(userId: string) {
  const application = await findDraftApplication(userId);
  if (!application) {
    throw new AppError(
      "No application in progress. Start a new application from your dashboard.",
      404,
      "NO_DRAFT_APPLICATION",
    );
  }
  return application;
}

export async function getBorrowerDashboard(userId: string): Promise<BorrowerDashboardState> {
  const [activeLoan, draft, loanHistory] = await Promise.all([
    getBorrowerActiveLoan(userId),
    findDraftApplication(userId),
    listBorrowerLoanHistory(userId),
  ]);

  const canStartNewApplication = !activeLoan && !draft;
  const blockReason = activeLoan ? ACTIVE_LOAN_MESSAGE : null;

  return {
    canStartNewApplication,
    blockReason,
    activeLoan,
    draftApplication: draft
      ? {
          id: draft._id.toString(),
          currentStep: resolveCurrentStep(draft),
          updatedAt: draft.updatedAt.toISOString(),
        }
      : null,
    loanHistory,
  };
}

export async function startNewApplication(userId: string): Promise<LoanApplicationState> {
  await assertNoActiveLoan(userId);

  const existingDraft = await findDraftApplication(userId);
  if (existingDraft) {
    return toPublicState(existingDraft, userId);
  }

  const application = await LoanApplication.create({ userId, status: "draft" });
  return toPublicState(application, userId);
}

export async function getApplicationState(userId: string): Promise<LoanApplicationState> {
  const active = await findActiveLoanForBorrower(userId);
  if (active) {
    throw new AppError(ACTIVE_LOAN_MESSAGE, 400, "ACTIVE_LOAN_EXISTS");
  }

  const application = await getDraftOrThrow(userId);
  return toPublicState(application, userId);
}

export async function savePersonalDetails(
  userId: string,
  input: unknown,
): Promise<LoanApplicationState> {
  const parsed = personalDetailsSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join(" ");
    throw new AppError(message, 400, "VALIDATION_ERROR");
  }

  const application = await getDraftOrThrow(userId);

  application.personalDetails = parsed.data;
  application.bre = undefined;
  application.salarySlip = undefined;
  application.loan = undefined;
  await application.save();

  return toPublicState(application, userId);
}

export async function validateBre(userId: string): Promise<LoanApplicationState> {
  const application = await getDraftOrThrow(userId);

  if (!application.personalDetails) {
    throw new AppError("Complete personal details before BRE validation.", 400, "STEP_INCOMPLETE");
  }

  const bre = runBreChecks(application.personalDetails);
  application.bre = bre;

  if (!bre.passed) {
    application.salarySlip = undefined;
    application.loan = undefined;
  }

  await application.save();
  return toPublicState(application, userId);
}

export async function saveSalarySlip(
  userId: string,
  file: {
    originalName: string;
    storedPath: string;
    mimeType: string;
    size: number;
  },
): Promise<LoanApplicationState> {
  const application = await getDraftOrThrow(userId);

  if (!application.personalDetails) {
    throw new AppError("Complete personal details first.", 400, "STEP_INCOMPLETE");
  }

  if (!application.bre?.passed) {
    throw new AppError(
      application.bre?.failures.join(" ") || "Pass BRE validation before uploading a salary slip.",
      400,
      "BRE_FAILED",
    );
  }

  application.salarySlip = {
    originalName: file.originalName,
    storedPath: file.storedPath,
    mimeType: file.mimeType,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };
  application.loan = undefined;
  await application.save();

  return toPublicState(application, userId);
}

export async function submitLoanApplication(
  userId: string,
  input: unknown,
): Promise<LoanApplicationState> {
  const parsed = loanConfigSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join(" ");
    throw new AppError(message, 400, "VALIDATION_ERROR");
  }

  await assertNoActiveLoan(userId);

  const application = await getDraftOrThrow(userId);

  if (!application.personalDetails) {
    throw new AppError("Complete personal details first.", 400, "STEP_INCOMPLETE");
  }

  if (!application.bre?.passed) {
    const message =
      application.bre?.failures.join(" ") ||
      "Pass BRE validation before submitting your loan application.";
    throw new AppError(message, 400, "BRE_FAILED");
  }

  if (!application.salarySlip) {
    throw new AppError("Upload your salary slip before submitting.", 400, "STEP_INCOMPLETE");
  }

  const breRecheck = runBreChecks(application.personalDetails);
  application.bre = breRecheck;
  if (!breRecheck.passed) {
    await application.save();
    throw new AppError(breRecheck.failures.join(" "), 400, "BRE_FAILED");
  }

  const repayment = calculateSimpleInterestRepayment(
    parsed.data.amount,
    parsed.data.tenureDays,
    ANNUAL_INTEREST_RATE,
  );

  application.loan = {
    amount: parsed.data.amount,
    tenureDays: parsed.data.tenureDays,
    interestRate: repayment.interestRate,
    interestAmount: repayment.interestAmount,
    totalRepayment: repayment.totalRepayment,
  };
  application.status = "applied";
  await application.save();
  await createLoanFromApplication(application._id.toString());

  return toPublicState(application, userId);
}
