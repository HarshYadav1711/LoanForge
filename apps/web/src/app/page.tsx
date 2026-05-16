import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-8 px-4 py-16 sm:px-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-brand-600">
          LoanForge
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Digital lending operations platform
        </h1>
        <p className="text-slate-600">
          Borrowers apply online; sales, sanction, disbursement, and collection teams work
          from a unified dashboard with full loan lifecycle tracking.
        </p>
      </header>
      <nav className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/login"
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-brand-700"
        >
          Sign in
        </Link>
        <Link
          href="/borrower"
          className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-center text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Borrower portal
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-center text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Operations dashboard
        </Link>
      </nav>
    </main>
  );
}
