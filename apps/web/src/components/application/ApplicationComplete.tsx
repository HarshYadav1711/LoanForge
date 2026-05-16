"use client";

import type { LoanApplicationState } from "@loanforge/shared";

type ApplicationCompleteProps = {
  application: LoanApplicationState;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ApplicationComplete({ application }: ApplicationCompleteProps) {
  const loan = application.loan;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4">
        <h2 className="text-lg font-medium text-emerald-900">Application submitted</h2>
        <p className="mt-2 text-sm text-emerald-800">
          Your loan application is in <strong>applied</strong> status. Our team will review it
          shortly.
        </p>
      </div>

      {loan && (
        <dl className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Loan amount</dt>
            <dd className="font-medium text-slate-900">{formatCurrency(loan.amount)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Tenure</dt>
            <dd className="font-medium text-slate-900">{loan.tenureDays} days</dd>
          </div>
          <div>
            <dt className="text-slate-500">Interest</dt>
            <dd className="font-medium text-slate-900">{formatCurrency(loan.interestAmount)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Total repayment</dt>
            <dd className="font-medium text-brand-700">{formatCurrency(loan.totalRepayment)}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}
