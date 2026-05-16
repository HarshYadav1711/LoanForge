import { Schema, model, type Document, Types } from "mongoose";

export interface IPayment extends Document {
  loanId: Types.ObjectId;
  utr: string;
  amount: number;
  paymentDate: Date;
  recordedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    loanId: { type: Schema.Types.ObjectId, ref: "Loan", required: true },
    utr: { type: String, required: true, unique: true, trim: true, uppercase: true },
    amount: { type: Number, required: true, min: 0.01 },
    paymentDate: { type: Date, required: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

paymentSchema.index({ loanId: 1, paymentDate: -1 });

export const Payment = model<IPayment>("Payment", paymentSchema);
