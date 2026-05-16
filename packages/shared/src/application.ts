export const EMPLOYMENT_MODES = ["salaried", "self-employed", "unemployed"] as const;
export type EmploymentMode = (typeof EMPLOYMENT_MODES)[number];

export const APPLICABLE_EMPLOYMENT_MODES = ["salaried", "self-employed"] as const;

export type ApplicationStep =
  | "personal"
  | "bre"
  | "salary-slip"
  | "loan"
  | "complete";

export type ApplicationStatus = "draft" | "applied";

export const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export const MIN_AGE = 23;
export const MAX_AGE = 50;
export const MIN_MONTHLY_SALARY = 25_000;
export const MIN_LOAN_AMOUNT = 50_000;
export const MAX_LOAN_AMOUNT = 500_000;
export const MIN_TENURE_DAYS = 30;
export const MAX_TENURE_DAYS = 365;
export const ANNUAL_INTEREST_RATE = 0.12;

export const SALARY_SLIP_MAX_BYTES = 5 * 1024 * 1024;
export const SALARY_SLIP_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export interface PersonalDetails {
  fullName: string;
  dateOfBirth: string;
  pan: string;
  employmentMode: EmploymentMode;
  monthlySalary: number;
}

export interface BreCheckResult {
  passed: boolean;
  failures: string[];
  checkedAt: string;
}

export interface SalarySlipInfo {
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface LoanTerms {
  amount: number;
  tenureDays: number;
  interestRate: number;
  interestAmount: number;
  totalRepayment: number;
}

export interface LoanApplicationState {
  id: string;
  status: ApplicationStatus;
  currentStep: ApplicationStep;
  personalDetails: PersonalDetails | null;
  bre: BreCheckResult | null;
  salarySlip: SalarySlipInfo | null;
  loan: LoanTerms | null;
  createdAt: string;
  updatedAt: string;
}

export interface RepaymentPreview {
  principal: number;
  tenureDays: number;
  interestRate: number;
  interestAmount: number;
  totalRepayment: number;
}

export function calculateAge(dateOfBirth: Date, asOf: Date = new Date()): number {
  let age = asOf.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = asOf.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && asOf.getDate() < dateOfBirth.getDate())) {
    age -= 1;
  }
  return age;
}

export function calculateSimpleInterestRepayment(
  principal: number,
  tenureDays: number,
  annualRate: number = ANNUAL_INTEREST_RATE,
): RepaymentPreview {
  const interestAmount =
    Math.round(principal * annualRate * (tenureDays / 365) * 100) / 100;
  const totalRepayment = Math.round((principal + interestAmount) * 100) / 100;

  return {
    principal,
    tenureDays,
    interestRate: annualRate,
    interestAmount,
    totalRepayment,
  };
}
