"use client";

import { useCallback, useEffect, useState } from "react";
import type { LoanRecord, PaymentRecord } from "@loanforge/shared";
import { ApiRequestError } from "@/lib/api";
import {
  fetchCollectionLoans,
  fetchLoanPayments,
  recordPayment,
} from "@/lib/dashboard-api";
import { formatDate, formatInr } from "@/lib/format";
import { DashboardState } from "./DashboardState";
import { StatusBadge } from "./StatusBadge";

type PaymentForm = {
  utr: string;
  amount: string;
  paymentDate: string;
};

const emptyForm = (): PaymentForm => ({
  utr: "",
  amount: "",
  paymentDate: new Date().toISOString().slice(0, 10),
});

export function CollectionPanel() {
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLoanId, setActiveLoanId] = useState<string | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [form, setForm] = useState<PaymentForm>(emptyForm);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setLoans(await fetchCollectionLoans());
    } catch (err) {
      const message =
        err instanceof ApiRequestError ? err.message : "Failed to load collection queue.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function openPaymentForm(loanId: string) {
    setActiveLoanId(loanId);
    setForm(emptyForm());
    setActionError(null);
    try {
      setPayments(await fetchLoanPayments(loanId));
    } catch {
      setPayments([]);
    }
  }

  async function handleRecordPayment(loanId: string) {
    const amount = Number(form.amount);
    if (!form.utr.trim() || !form.paymentDate || Number.isNaN(amount) || amount <= 0) {
      setActionError("UTR, amount, and payment date are required.");
      return;
    }

    setIsSubmitting(true);
    setActionError(null);
    try {
      await recordPayment(loanId, {
        utr: form.utr.trim(),
        amount,
        paymentDate: form.paymentDate,
      });
      setActiveLoanId(null);
      await load();
    } catch (err) {
      setActionError(
        err instanceof ApiRequestError ? err.message : "Failed to record payment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Collection</h2>
          <p className="mt-1 text-sm text-slate-600">
            Active disbursed loans. Record payments with a unique UTR; loans close when fully repaid.
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

      {actionError && activeLoanId && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-800">
          {actionError}
        </p>
      )}

      <DashboardState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && loans.length === 0}
        emptyTitle="No active collection accounts"
        emptyDescription="Disbursed loans will appear here for repayment tracking."
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
                  <dt className="text-slate-500">Total repayment</dt>
                  <dd className="font-medium text-slate-900">
                    {formatInr(loan.totalRepayment)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Paid</dt>
                  <dd className="font-medium text-emerald-700">{formatInr(loan.totalPaid)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Outstanding</dt>
                  <dd className="font-medium text-amber-700">
                    {formatInr(loan.outstandingBalance)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Disbursed</dt>
                  <dd className="font-medium text-slate-900">{formatDate(loan.disbursedAt)}</dd>
                </div>
              </dl>

              {activeLoanId === loan.id ? (
                <div className="mt-4 space-y-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="block text-sm font-medium text-slate-700">
                      UTR
                      <input
                        type="text"
                        value={form.utr}
                        onChange={(e) => setForm((f) => ({ ...f, utr: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm uppercase focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        placeholder="e.g. HDFC123456"
                      />
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                      Amount (₹)
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.amount}
                        onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                      Payment date
                      <input
                        type="date"
                        value={form.paymentDate}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, paymentDate: e.target.value }))
                        }
                        max={new Date().toISOString().slice(0, 10)}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </label>
                  </div>

                  {payments.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Payment history
                      </p>
                      <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white text-sm">
                        {payments.map((payment) => (
                          <li
                            key={payment.id}
                            className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
                          >
                            <span className="font-mono text-xs text-slate-700">
                              {payment.utr}
                            </span>
                            <span className="font-medium text-slate-900">
                              {formatInr(payment.amount)}
                            </span>
                            <span className="text-slate-500">
                              {formatDate(payment.paymentDate)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => void handleRecordPayment(loan.id)}
                      className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
                    >
                      Record payment
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => {
                        setActiveLoanId(null);
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
                  onClick={() => void openPaymentForm(loan.id)}
                  className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                >
                  Record payment
                </button>
              )}
            </article>
          ))}
        </div>
      </DashboardState>
    </section>
  );
}
