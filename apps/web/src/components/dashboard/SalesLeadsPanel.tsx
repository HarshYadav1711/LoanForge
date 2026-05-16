"use client";

import { useCallback, useEffect, useState } from "react";
import type { SalesLead } from "@loanforge/shared";
import { ApiRequestError } from "@/lib/api";
import { fetchSalesLeads } from "@/lib/dashboard-api";
import { formatDate, formatInr } from "@/lib/format";
import { DashboardState } from "./DashboardState";

export function SalesLeadsPanel() {
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setLeads(await fetchSalesLeads());
    } catch (err) {
      const message =
        err instanceof ApiRequestError ? err.message : "Failed to load sales leads.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Pre-application leads</h2>
          <p className="mt-1 text-sm text-slate-600">
            Borrowers with draft applications who have not yet submitted.
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

      <DashboardState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && leads.length === 0}
        emptyTitle="No active leads"
        emptyDescription="New borrower drafts will appear here for follow-up."
      >
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Applicant</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Email</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Step</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Salary</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <tr key={lead.applicationId} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">
                      {lead.applicantName ?? "Not started"}
                    </p>
                    <p className="text-xs text-slate-500">{lead.pan ?? "PAN pending"}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{lead.borrowerEmail}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium capitalize text-brand-700">
                      {lead.currentStep.replace(/-/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {lead.monthlySalary != null ? formatInr(lead.monthlySalary) : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(lead.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardState>
    </section>
  );
}
