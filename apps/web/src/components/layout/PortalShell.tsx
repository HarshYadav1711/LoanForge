import Link from "next/link";

type PortalShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function PortalShell({ title, description, children }: PortalShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
              LoanForge
            </p>
            <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-600">{description}</p>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Home
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
