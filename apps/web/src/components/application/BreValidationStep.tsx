"use client";

import { useState } from "react";
import type { LoanApplicationState } from "@loanforge/shared";
import { ApiRequestError } from "@/lib/api";
import { validateBre } from "@/lib/borrower-api";

type BreValidationStepProps = {
  application: LoanApplicationState;
  onValidated: (application: LoanApplicationState) => void;
  onBack: () => void;
};

export function BreValidationStep({
  application,
  onValidated,
  onBack,
}: BreValidationStepProps) {
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const bre = application.bre;

  async function runCheck() {
    setError(null);
    setIsChecking(true);
    try {
      const updated = await validateBre();
      onValidated(updated);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "BRE validation failed.");
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-medium text-slate-900">Eligibility check (BRE)</h2>
        <p className="mt-1 text-sm text-slate-600">
          We validate age (23–50), minimum salary (₹25,000), PAN format, and employment status on
          the server.
        </p>
      </div>

      {bre && (
        <div
          className={
            bre.passed
              ? "rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
              : "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          }
          role="status"
        >
          {bre.passed ? (
            <p>All business rules passed. You can upload your salary slip next.</p>
          ) : (
            <div>
              <p className="font-medium">Application blocked — eligibility failed</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {bre.failures.map((failure) => (
                  <li key={failure}>{failure}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Edit personal details
        </button>
        <button
          type="button"
          onClick={runCheck}
          disabled={isChecking}
          className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {isChecking ? "Checking…" : bre ? "Re-run eligibility check" : "Run eligibility check"}
        </button>
        {bre?.passed && (
          <button
            type="button"
            onClick={() => onValidated(application)}
            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Continue to salary slip
          </button>
        )}
      </div>
    </div>
  );
}
