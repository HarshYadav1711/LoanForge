import { AuthGuard } from "@/components/auth/AuthGuard";
import { PortalShell } from "@/components/layout/PortalShell";

export default function BorrowerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthGuard>
      <PortalShell title="Borrower portal" description="Profile, BRE, and loan application flows.">
        {children}
      </PortalShell>
    </AuthGuard>
  );
}
