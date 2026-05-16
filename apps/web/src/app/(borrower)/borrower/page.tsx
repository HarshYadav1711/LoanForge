"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { LoanApplicationState } from "@loanforge/shared";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ApiRequestError } from "@/lib/api";
import { getApplication } from "@/lib/borrower-api";

export default function BorrowerHomePage() {
  const [application, setApplication] = useState<LoanApplicationState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setApplication(await getApplication());
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to load application.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const isSubmitted = application?.status === "applied";
  const loanStatus = application?.linkedLoan?.status;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-medium text-slate-900">Loan application</h2>
      <p className="mt-2 text-sm text-slate-600">
        Complete personal details, pass eligibility checks, upload your salary slip, and
        configure your loan.
      </p>

      {isLoading && (
        <p className="mt-4 text-sm text-slate-500" aria-live="polite">
          Loading application status…
        </p>
      )}

      {error && (
        <div
          className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800"
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

      {!isLoading && !error && application && isSubmitted && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
          <span className="text-slate-600">Current loan status:</span>
          <StatusBadge status={loanStatus ?? "applied"} />
        </div>
      )}

      <Link
        href="/borrower/application"
        className="mt-5 inline-flex rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
      >
        {isSubmitted ? "View application" : "Start or continue application"}
      </Link>
    </section>
  );
}
