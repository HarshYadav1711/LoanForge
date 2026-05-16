"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { BorrowerDashboardState } from "@loanforge/shared";
import { ActiveLoanCard } from "@/components/borrower/ActiveLoanCard";
import { LoanHistoryTable } from "@/components/borrower/LoanHistoryTable";
import { ApiRequestError } from "@/lib/api";
import { getBorrowerDashboard, startNewApplication } from "@/lib/borrower-api";

export default function BorrowerHomePage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<BorrowerDashboardState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setDashboard(await getBorrowerDashboard());
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to load dashboard.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleStartNew() {
    setIsStarting(true);
    setError(null);
    try {
      await startNewApplication();
      router.push("/borrower/application");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Unable to start application.");
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">Your loans</h1>
        <p className="mt-1 text-sm text-slate-600">
          Track your active loan, review past applications, and apply when you are eligible.
        </p>
      </header>

      {isLoading && (
        <p className="text-sm text-slate-500" aria-live="polite">
          Loading dashboard…
        </p>
      )}

      {error && (
        <div
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
          role="alert"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-2 text-xs font-medium text-rose-900 underline"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && dashboard && (
        <>
          {dashboard.activeLoan && <ActiveLoanCard loan={dashboard.activeLoan} />}

          {dashboard.activeLoan && (
            <div
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
              role="status"
            >
              {dashboard.blockReason ??
                "You have an active loan. A new application can be started after it is closed or rejected."}
            </div>
          )}

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Apply for a loan</h2>

            {dashboard.draftApplication ? (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <p className="text-sm text-slate-600">
                  You have an application in progress (
                  {dashboard.draftApplication.currentStep.replace("-", " ")}).
                </p>
                <Link
                  href="/borrower/application"
                  className="inline-flex rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
                >
                  Continue application
                </Link>
              </div>
            ) : dashboard.canStartNewApplication ? (
              <div className="mt-3">
                <p className="text-sm text-slate-600">
                  Start a new application when you are ready. Only one active loan is allowed at a
                  time.
                </p>
                <button
                  type="button"
                  onClick={() => void handleStartNew()}
                  disabled={isStarting}
                  className="mt-4 inline-flex rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
                >
                  {isStarting ? "Starting…" : "Start new application"}
                </button>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                New applications are unavailable while you have an active loan.
              </p>
            )}
          </section>

          <LoanHistoryTable loans={dashboard.loanHistory} />
        </>
      )}
    </div>
  );
}

