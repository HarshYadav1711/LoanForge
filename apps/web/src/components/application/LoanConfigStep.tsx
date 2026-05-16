"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ANNUAL_INTEREST_RATE,
  MAX_LOAN_AMOUNT,
  MAX_TENURE_DAYS,
  MIN_LOAN_AMOUNT,
  MIN_TENURE_DAYS,
  calculateSimpleInterestRepayment,
  loanConfigSchema,
  type LoanApplicationState,
  type LoanConfigInput,
} from "@loanforge/shared";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { ApiRequestError } from "@/lib/api";
import { submitLoanApplication } from "@/lib/borrower-api";
import { FormField, inputClassName } from "./form-field";

type LoanConfigStepProps = {
  application: LoanApplicationState;
  onSubmitted: (application: LoanApplicationState) => void;
  onBack: () => void;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function LoanConfigStep({ application, onSubmitted, onBack }: LoanConfigStepProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoanConfigInput>({
    resolver: zodResolver(loanConfigSchema),
    defaultValues: {
      amount: application.loan?.amount ?? 100_000,
      tenureDays: application.loan?.tenureDays ?? 90,
    },
  });

  const amount = watch("amount");
  const tenureDays = watch("tenureDays");

  const repayment = useMemo(() => {
    const principal = Number(amount);
    const days = Number(tenureDays);
    if (
      !Number.isFinite(principal) ||
      !Number.isFinite(days) ||
      principal < MIN_LOAN_AMOUNT ||
      principal > MAX_LOAN_AMOUNT ||
      days < MIN_TENURE_DAYS ||
      days > MAX_TENURE_DAYS
    ) {
      return null;
    }
    return calculateSimpleInterestRepayment(principal, days, ANNUAL_INTEREST_RATE);
  }, [amount, tenureDays]);

  async function onSubmit(values: LoanConfigInput) {
    try {
      const updated = await submitLoanApplication(values);
      onSubmitted(updated);
    } catch (err) {
      const message =
        err instanceof ApiRequestError ? err.message : "Unable to submit application.";
      setError("root", { message });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <h2 className="text-lg font-medium text-slate-900">Loan configuration</h2>
        <p className="mt-1 text-sm text-slate-600">
          Choose amount (₹50K–₹5L) and tenure (30–365 days). Interest is fixed at 12% p.a. using
          simple interest.
        </p>
      </div>

      <FormField label="Loan amount (₹)" htmlFor="amount" error={errors.amount?.message}>
        <input
          id="amount"
          type="number"
          min={MIN_LOAN_AMOUNT}
          max={MAX_LOAN_AMOUNT}
          step={1000}
          className={inputClassName}
          {...register("amount", { valueAsNumber: true })}
        />
      </FormField>

      <FormField label="Tenure (days)" htmlFor="tenureDays" error={errors.tenureDays?.message}>
        <input
          id="tenureDays"
          type="number"
          min={MIN_TENURE_DAYS}
          max={MAX_TENURE_DAYS}
          step={1}
          className={inputClassName}
          {...register("tenureDays", { valueAsNumber: true })}
        />
      </FormField>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-medium text-slate-900">Repayment calculator</h3>
        {repayment ? (
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Principal</dt>
              <dd className="font-medium text-slate-900">{formatCurrency(repayment.principal)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Tenure</dt>
              <dd className="font-medium text-slate-900">{repayment.tenureDays} days</dd>
            </div>
            <div>
              <dt className="text-slate-500">Interest rate</dt>
              <dd className="font-medium text-slate-900">
                {(repayment.interestRate * 100).toFixed(0)}% p.a. (simple)
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Interest amount</dt>
              <dd className="font-medium text-slate-900">
                {formatCurrency(repayment.interestAmount)}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-500">Total repayment</dt>
              <dd className="text-lg font-semibold text-brand-700">
                {formatCurrency(repayment.totalRepayment)}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-2 text-sm text-slate-500">Enter valid amount and tenure to see repayment.</p>
        )}
      </div>

      {errors.root && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {errors.root.message}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to salary slip
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !repayment}
          className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {isSubmitting ? "Submitting…" : "Submit loan application"}
        </button>
      </div>
    </form>
  );
}
