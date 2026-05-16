"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { canAccessPath, getHomePathForRole } from "@loanforge/shared";
import { useAuth } from "@/contexts/AuthContext";

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    if (!canAccessPath(user.role, pathname)) {
      router.replace(getHomePathForRole(user.role));
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-600">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated || !user || !canAccessPath(user.role, pathname)) {
    return null;
  }

  return <>{children}</>;
}
