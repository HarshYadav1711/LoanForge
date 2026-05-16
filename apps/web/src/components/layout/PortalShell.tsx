import { PortalHeader } from "./PortalHeader";

type PortalShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function PortalShell({ title, description, children }: PortalShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <PortalHeader title={title} description={description} />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
