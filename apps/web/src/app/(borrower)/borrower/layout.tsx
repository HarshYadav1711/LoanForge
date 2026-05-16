import { AuthGuard } from "@/components/auth/AuthGuard";
import { PortalShell } from "@/components/layout/PortalShell";

export default function BorrowerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthGuard>
      <PortalShell title="Borrower portal" description="Apply for a loan and track your application status.">
        {children}
      </PortalShell>
    </AuthGuard>
  );
}
