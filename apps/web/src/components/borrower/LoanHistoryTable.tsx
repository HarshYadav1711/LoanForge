"use client";

import type { BorrowerLoanHistoryItem } from "@loanforge/shared";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatDate, formatInr } from "@/lib/format";

type LoanHistoryTableProps = {
  loans: BorrowerLoanHistoryItem[];
};

export function LoanHistoryTable({ loans }: LoanHistoryTableProps) {
  if (loans.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">Loan history</h2>
        <p className="mt-0.5 text-xs text-slate-500">Closed and rejected applications</p>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Tenure</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Repayment</th>
              <th className="px-5 py-3">Ended</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loans.map((loan) => (
              <tr key={loan.id} className="text-slate-700">
                <td className="px-5 py-3 font-medium text-slate-900">{formatInr(loan.amount)}</td>
                <td className="px-5 py-3">{loan.tenureDays} days</td>
                <td className="px-5 py-3">
                  <StatusBadge status={loan.status} />
                </td>
                <td className="px-5 py-3">{formatInr(loan.totalRepayment)}</td>
                <td className="px-5 py-3 text-slate-600">
                  {formatDate(loan.closedAt ?? loan.rejectedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
