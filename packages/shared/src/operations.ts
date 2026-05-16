import { z } from "zod";

export const rejectLoanSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, "Rejection reason must be at least 10 characters")
    .max(500, "Rejection reason is too long"),
});

export const recordPaymentSchema = z.object({
  utr: z
    .string()
    .trim()
    .min(6, "UTR must be at least 6 characters")
    .max(40, "UTR is too long")
    .regex(/^[A-Za-z0-9]+$/, "UTR may only contain letters and numbers"),
  amount: z
    .number({ message: "Payment amount is required" })
    .positive("Payment amount must be greater than zero"),
  paymentDate: z
    .string()
    .min(1, "Payment date is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid payment date"),
});

export type RejectLoanInput = z.infer<typeof rejectLoanSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
