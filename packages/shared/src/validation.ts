import { z } from "zod";
import {
  APPLICABLE_EMPLOYMENT_MODES,
  EMPLOYMENT_MODES,
  MAX_AGE,
  MAX_LOAN_AMOUNT,
  MAX_TENURE_DAYS,
  MIN_AGE,
  MIN_LOAN_AMOUNT,
  MIN_MONTHLY_SALARY,
  MIN_TENURE_DAYS,
  PAN_PATTERN,
  calculateAge,
} from "./application";

function parseDateOfBirth(value: string): Date | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

export const personalDetailsSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(120, "Full name is too long"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((value) => parseDateOfBirth(value) !== null, "Enter a valid date of birth")
    .refine((value) => {
      const dob = parseDateOfBirth(value);
      if (!dob) return false;
      const age = calculateAge(dob);
      return age >= MIN_AGE && age <= MAX_AGE;
    }, `Age must be between ${MIN_AGE} and ${MAX_AGE} years`),
  pan: z
    .string()
    .trim()
    .transform((value) => value.toUpperCase())
    .refine((value) => PAN_PATTERN.test(value), "Enter a valid PAN (e.g. ABCDE1234F)"),
  employmentMode: z.enum(EMPLOYMENT_MODES, {
    message: "Select your employment mode",
  }),
  monthlySalary: z
    .number({ message: "Monthly salary is required" })
    .min(MIN_MONTHLY_SALARY, `Monthly salary must be at least ₹${MIN_MONTHLY_SALARY.toLocaleString("en-IN")}`),
});

export const loanConfigSchema = z.object({
  amount: z
    .number({ message: "Loan amount is required" })
    .min(MIN_LOAN_AMOUNT, `Minimum loan amount is ₹${MIN_LOAN_AMOUNT.toLocaleString("en-IN")}`)
    .max(MAX_LOAN_AMOUNT, `Maximum loan amount is ₹${MAX_LOAN_AMOUNT.toLocaleString("en-IN")}`),
  tenureDays: z
    .number({ message: "Tenure is required" })
    .int("Tenure must be a whole number of days")
    .min(MIN_TENURE_DAYS, `Minimum tenure is ${MIN_TENURE_DAYS} days`)
    .max(MAX_TENURE_DAYS, `Maximum tenure is ${MAX_TENURE_DAYS} days`),
});

export type PersonalDetailsInput = z.infer<typeof personalDetailsSchema>;
export type LoanConfigInput = z.infer<typeof loanConfigSchema>;

export { APPLICABLE_EMPLOYMENT_MODES };
