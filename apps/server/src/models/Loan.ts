import { Schema, model, type Document, Types } from "mongoose";
import { LOAN_STATUSES, type LoanStatus } from "@loanforge/shared";

export interface ILoan extends Document {
  applicationId: Types.ObjectId;
  borrowerId: Types.ObjectId;
  status: LoanStatus;
  amount: number;
  tenureDays: number;
  interestRate: number;
  interestAmount: number;
  totalRepayment: number;
  totalPaid: number;
  rejectionReason?: string;
  sanctionedAt?: Date;
  rejectedAt?: Date;
  disbursedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const loanSchema = new Schema<ILoan>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "LoanApplication",
      required: true,
      unique: true,
    },
    borrowerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: LOAN_STATUSES,
      default: "applied",
      required: true,
    },
    amount: { type: Number, required: true },
    tenureDays: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    interestAmount: { type: Number, required: true },
    totalRepayment: { type: Number, required: true },
    totalPaid: { type: Number, default: 0, required: true },
    rejectionReason: { type: String },
    sanctionedAt: { type: Date },
    rejectedAt: { type: Date },
    disbursedAt: { type: Date },
    closedAt: { type: Date },
  },
  { timestamps: true },
);

loanSchema.index({ status: 1, createdAt: -1 });
loanSchema.index({ borrowerId: 1 });

export const Loan = model<ILoan>("Loan", loanSchema);
