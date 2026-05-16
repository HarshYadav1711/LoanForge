import {
  ANNUAL_INTEREST_RATE,
  calculateSimpleInterestRepayment,
  loanConfigSchema,
  personalDetailsSchema,
  type ApplicationStep,
  type LoanApplicationState,
  type PersonalDetails,
} from "@loanforge/shared";
import { LoanApplication } from "../models/LoanApplication";
import { AppError } from "../utils/AppError";
import { runBreChecks } from "./bre.service";

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

function toPublicState(application: {
  _id: { toString(): string };
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
}): LoanApplicationState {
  const salarySlip = application.salarySlip
    ? {
        originalName: application.salarySlip.originalName,
        mimeType: application.salarySlip.mimeType,
        size: application.salarySlip.size,
        uploadedAt: application.salarySlip.uploadedAt,
      }
    : null;

  return {
    id: application._id.toString(),
    status: application.status,
    currentStep: resolveCurrentStep(application),
    personalDetails: application.personalDetails ?? null,
    bre: application.bre ?? null,
    salarySlip,
    loan: application.loan ?? null,
    createdAt: application.createdAt.toISOString(),
    updatedAt: application.updatedAt.toISOString(),
  };
}

async function getOrCreateDraft(userId: string) {
  let application = await LoanApplication.findOne({ userId });
  if (!application) {
    application = await LoanApplication.create({ userId, status: "draft" });
  }
  return application;
}

export async function getApplicationState(userId: string): Promise<LoanApplicationState> {
  const application = await getOrCreateDraft(userId);
  return toPublicState(application);
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

  const application = await getOrCreateDraft(userId);
  if (application.status === "applied") {
    throw new AppError("Application has already been submitted.", 400, "APPLICATION_LOCKED");
  }

  application.personalDetails = parsed.data;
  application.bre = undefined;
  application.salarySlip = undefined;
  application.loan = undefined;
  await application.save();

  return toPublicState(application);
}

export async function validateBre(userId: string): Promise<LoanApplicationState> {
  const application = await getOrCreateDraft(userId);

  if (application.status === "applied") {
    throw new AppError("Application has already been submitted.", 400, "APPLICATION_LOCKED");
  }

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
  return toPublicState(application);
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
  const application = await getOrCreateDraft(userId);

  if (application.status === "applied") {
    throw new AppError("Application has already been submitted.", 400, "APPLICATION_LOCKED");
  }

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

  return toPublicState(application);
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

  const application = await getOrCreateDraft(userId);

  if (application.status === "applied") {
    throw new AppError("Application has already been submitted.", 400, "APPLICATION_LOCKED");
  }

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

  return toPublicState(application);
}
