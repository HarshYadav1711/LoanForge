import Link from "next/link";

export default function BorrowerHomePage() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-medium text-slate-900">Loan application</h2>
      <p className="mt-2 text-sm text-slate-600">
        Complete your personal details, pass eligibility checks, upload your salary slip, and
        configure your loan.
      </p>
      <Link
        href="/borrower/application"
        className="mt-5 inline-flex rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
      >
        Start or continue application
      </Link>
    </section>
  );
}
