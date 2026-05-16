import { PortalShell } from "@/components/layout/PortalShell";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <PortalShell
      title="Operations dashboard"
      description="Sales, sanction, disbursement, collection, and admin."
    >
      {children}
    </PortalShell>
  );
}
