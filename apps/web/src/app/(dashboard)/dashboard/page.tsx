import Link from "next/link";
import { DASHBOARD_MODULES } from "@loanforge/shared";

export default function DashboardHomePage() {
  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900">Admin overview</h2>
        <p className="mt-2 text-sm text-slate-600">
          Full access to all operations modules.
        </p>
      </div>
      <nav className="grid gap-3 sm:grid-cols-2">
        {DASHBOARD_MODULES.map((module) => (
          <Link
            key={module}
            href={`/dashboard/${module}`}
            className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium capitalize text-slate-800 hover:border-brand-300 hover:bg-brand-50"
          >
            {module}
          </Link>
        ))}
      </nav>
    </section>
  );
}
