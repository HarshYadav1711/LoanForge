import { AuthGuard } from "@/components/auth/AuthGuard";
import { PortalShell } from "@/components/layout/PortalShell";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthGuard>
      <PortalShell
        title="Operations dashboard"
        description="Sales, sanction, disbursement, and collection modules."
      >
        {children}
      </PortalShell>
    </AuthGuard>
  );
}
