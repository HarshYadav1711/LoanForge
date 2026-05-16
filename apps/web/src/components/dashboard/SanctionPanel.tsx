"use client";

import { useCallback, useEffect, useState } from "react";
import type { LoanRecord } from "@loanforge/shared";
import { ApiRequestError } from "@/lib/api";
import { approveLoan, fetchSanctionLoans, rejectLoan } from "@/lib/dashboard-api";
import { formatDate, formatInr } from "@/lib/format";
import { DashboardState } from "./DashboardState";
import { StatusBadge } from "./StatusBadge";

export function SanctionPanel() {
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLoanId, setActiveLoanId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setLoans(await fetchSanctionLoans());
    } catch (err) {
      const message =
        err instanceof ApiRequestError ? err.message : "Failed to load sanction queue.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleApprove(loanId: string) {
    setIsSubmitting(true);
    setActionError(null);
    try {
      await approveLoan(loanId);
      setActiveLoanId(null);
      await load();
    } catch (err) {
      setActionError(
        err instanceof ApiRequestError ? err.message : "Failed to approve loan.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReject(loanId: string) {
    setIsSubmitting(true);
    setActionError(null);
    try {
      await rejectLoan(loanId, rejectReason);
      setActiveLoanId(null);
      setRejectReason("");
      await load();
    } catch (err) {
      setActionError(
        err instanceof ApiRequestError ? err.message : "Failed to reject loan.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Sanction queue</h2>
          <p className="mt-1 text-sm text-slate-600">
            Review submitted applications and approve or reject with a documented reason.
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
        emptyTitle="No loans awaiting sanction"
        emptyDescription="Submitted applications will appear here for credit decision."
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
                  <dt className="text-slate-500">Principal</dt>
                  <dd className="font-medium text-slate-900">{formatInr(loan.amount)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Tenure</dt>
                  <dd className="font-medium text-slate-900">{loan.tenureDays} days</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Total repayment</dt>
                  <dd className="font-medium text-slate-900">
                    {formatInr(loan.totalRepayment)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Applied</dt>
                  <dd className="font-medium text-slate-900">{formatDate(loan.createdAt)}</dd>
                </div>
              </dl>

              {activeLoanId === loan.id ? (
                <div className="mt-4 space-y-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <label className="block text-sm font-medium text-slate-700">
                    Rejection reason
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={3}
                      placeholder="Provide a clear reason (min. 10 characters)"
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => void handleApprove(loan.id)}
                      className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting || rejectReason.trim().length < 10}
                      onClick={() => void handleReject(loan.id)}
                      className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => {
                        setActiveLoanId(null);
                        setRejectReason("");
                        setActionError(null);
                      }}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setActiveLoanId(loan.id);
                    setRejectReason("");
                    setActionError(null);
                  }}
                  className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                >
                  Review decision
                </button>
              )}
            </article>
          ))}
        </div>
      </DashboardState>
    </section>
  );
}
