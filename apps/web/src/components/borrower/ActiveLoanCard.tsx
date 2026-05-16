"use client";

import type { BorrowerLoanSummary } from "@loanforge/shared";
import { LoanTimeline } from "@/components/loan/LoanTimeline";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatInr } from "@/lib/format";

type ActiveLoanCardProps = {
  loan: BorrowerLoanSummary;
};

export function ActiveLoanCard({ loan }: ActiveLoanCardProps) {
  return (
    <section className="rounded-xl border border-brand-200 bg-gradient-to-br from-white to-brand-50/40 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
            Active loan
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            {formatInr(loan.amount)} · {loan.tenureDays} days
          </h2>
        </div>
        <StatusBadge status={loan.status} />
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-slate-500">Total repayment</dt>
          <dd className="font-medium text-slate-900">{formatInr(loan.totalRepayment)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Paid</dt>
          <dd className="font-medium text-emerald-700">{formatInr(loan.totalPaid)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Outstanding</dt>
          <dd className="font-medium text-amber-700">{formatInr(loan.outstandingBalance)}</dd>
        </div>
      </dl>

      <div className="mt-5 border-t border-brand-100 pt-4">
        <h3 className="text-sm font-semibold text-slate-900">Progress</h3>
        <div className="mt-3">
          <LoanTimeline loan={loan} />
        </div>
      </div>
    </section>
  );
}
