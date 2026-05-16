"use client";

import { useCallback, useEffect, useState } from "react";
import type { LoanRecord } from "@loanforge/shared";
import { ApiRequestError } from "@/lib/api";
import { disburseLoan, fetchDisbursementLoans } from "@/lib/dashboard-api";
import { formatDate, formatInr } from "@/lib/format";
import { DashboardState } from "./DashboardState";
import { StatusBadge } from "./StatusBadge";

export function DisbursementPanel() {
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setLoans(await fetchDisbursementLoans());
    } catch (err) {
      const message =
        err instanceof ApiRequestError ? err.message : "Failed to load disbursement queue.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDisburse(loanId: string) {
    setIsSubmitting(true);
    setActionError(null);
    try {
      await disburseLoan(loanId);
      setConfirmId(null);
      await load();
    } catch (err) {
      setActionError(
        err instanceof ApiRequestError ? err.message : "Failed to disburse loan.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Disbursement queue</h2>
          <p className="mt-1 text-sm text-slate-600">
            Sanctioned loans ready for fund release. Mark disbursed to activate collection.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </header>

      {actionError && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-800">
          {actionError}
        </p>
      )}

      <DashboardState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && loans.length === 0}
        emptyTitle="No loans awaiting disbursement"
        emptyDescription="Sanctioned loans will appear here for payout confirmation."
      >
        <div className="space-y-3">
          {loans.map((loan) => (
            <article
              key={loan.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{loan.applicantName}</p>
                  <p className="text-sm text-slate-600">
                    {loan.borrowerEmail} · {loan.pan}
                  </p>
                </div>
                <StatusBadge status={loan.status} />
              </div>

              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-slate-500">Disburse amount</dt>
                  <dd className="font-medium text-slate-900">{formatInr(loan.amount)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Total repayment</dt>
                  <dd className="font-medium text-slate-900">
                    {formatInr(loan.totalRepayment)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Sanctioned</dt>
                  <dd className="font-medium text-slate-900">
                    {formatDate(loan.sanctionedAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Tenure</dt>
                  <dd className="font-medium text-slate-900">{loan.tenureDays} days</dd>
                </div>
              </dl>

              {confirmId === loan.id ? (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-sm text-emerald-900">
                    Confirm disbursement of {formatInr(loan.amount)} to {loan.applicantName}?
                  </p>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => void handleDisburse(loan.id)}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    Confirm disbursed
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setConfirmId(null);
                      setActionError(null);
                    }}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setConfirmId(loan.id);
                    setActionError(null);
                  }}
                  className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
                >
                  Mark as disbursed
                </button>
              )}
            </article>
          ))}
        </div>
      </DashboardState>
    </section>
  );
}
