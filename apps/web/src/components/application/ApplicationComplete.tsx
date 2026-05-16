"use client";

import Link from "next/link";
import type { LoanApplicationState } from "@loanforge/shared";
import { LoanTimeline } from "@/components/loan/LoanTimeline";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatInr } from "@/lib/format";

type ApplicationCompleteProps = {
  application: LoanApplicationState;
};

export function ApplicationComplete({ application }: ApplicationCompleteProps) {
  const loan = application.loan;
  const linkedLoan = application.linkedLoan;
  const displayStatus = linkedLoan?.status ?? "applied";

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-medium text-emerald-900">Application submitted</h2>
          <StatusBadge status={displayStatus} />
        </div>
        <p className="mt-2 text-sm text-emerald-800">
          Your application is with our operations team. Track progress below.
        </p>
        {linkedLoan?.status === "rejected" && linkedLoan.rejectionReason && (
          <p className="mt-2 text-sm text-rose-800" role="alert">
            Reason: {linkedLoan.rejectionReason}
          </p>
        )}
      </div>

      {loan && (
        <dl className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Loan amount</dt>
            <dd className="font-medium text-slate-900">{formatInr(loan.amount)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Tenure</dt>
            <dd className="font-medium text-slate-900">{loan.tenureDays} days</dd>
          </div>
          <div>
            <dt className="text-slate-500">Interest</dt>
            <dd className="font-medium text-slate-900">{formatInr(loan.interestAmount)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Total repayment</dt>
            <dd className="font-medium text-brand-700">{formatInr(loan.totalRepayment)}</dd>
          </div>
          {linkedLoan && linkedLoan.status !== "applied" && linkedLoan.status !== "rejected" && (
            <>
              <div>
                <dt className="text-slate-500">Paid</dt>
                <dd className="font-medium text-emerald-700">{formatInr(linkedLoan.totalPaid)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Outstanding</dt>
                <dd className="font-medium text-amber-700">
                  {formatInr(linkedLoan.outstandingBalance)}
                </dd>
              </div>
            </>
          )}
        </dl>
      )}

      {linkedLoan && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Loan progress</h3>
          <div className="mt-4">
            <LoanTimeline loan={linkedLoan} />
          </div>
        </section>
      )}

      <Link
        href="/borrower"
        className="inline-flex rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Back to dashboard
      </Link>
    </div>
  );
}

