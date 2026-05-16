import { Schema, model, type Document, Types } from "mongoose";
import type {
  ApplicationStatus,
  BreCheckResult,
  EmploymentMode,
  LoanTerms,
  PersonalDetails,
  SalarySlipInfo,
} from "@loanforge/shared";

export interface ILoanApplication extends Document {
  userId: Types.ObjectId;
  status: ApplicationStatus;
  personalDetails?: PersonalDetails;
  bre?: BreCheckResult;
  salarySlip?: SalarySlipInfo & { storedPath: string };
  loan?: LoanTerms;
  createdAt: Date;
  updatedAt: Date;
}

const personalDetailsSchema = new Schema<PersonalDetails>(
  {
    fullName: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    pan: { type: String, required: true, uppercase: true },
    employmentMode: {
      type: String,
      required: true,
      enum: ["salaried", "self-employed", "unemployed"] satisfies EmploymentMode[],
    },
    monthlySalary: { type: Number, required: true },
  },
  { _id: false },
);

const breSchema = new Schema<BreCheckResult>(
  {
    passed: { type: Boolean, required: true },
    failures: { type: [String], default: [] },
    checkedAt: { type: String, required: true },
  },
  { _id: false },
);

const salarySlipSchema = new Schema(
  {
    originalName: { type: String, required: true },
    storedPath: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: String, required: true },
  },
  { _id: false },
);

const loanSchema = new Schema<LoanTerms>(
  {
    amount: { type: Number, required: true },
    tenureDays: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    interestAmount: { type: Number, required: true },
    totalRepayment: { type: Number, required: true },
  },
  { _id: false },
);

const loanApplicationSchema = new Schema<ILoanApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ["draft", "applied"], default: "draft" },
    personalDetails: personalDetailsSchema,
    bre: breSchema,
    salarySlip: salarySlipSchema,
    loan: loanSchema,
  },
  { timestamps: true },
);

loanApplicationSchema.index(
  { userId: 1 },
  { unique: true, partialFilterExpression: { status: "draft" } },
);
loanApplicationSchema.index({ userId: 1, status: 1, updatedAt: -1 });

export const LoanApplication = model<ILoanApplication>(
  "LoanApplication",
  loanApplicationSchema,
);
