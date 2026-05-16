import type { UserRole } from "./roles";

/** Executive dashboard modules (excludes admin). */
export const DASHBOARD_MODULES = [
  "sales",
  "sanction",
  "disbursement",
  "collection",
] as const;

export type DashboardModule = (typeof DASHBOARD_MODULES)[number];

export function isDashboardModule(role: UserRole): role is DashboardModule {
  return (DASHBOARD_MODULES as readonly string[]).includes(role);
}

export function canAccessBorrowerPortal(role: UserRole): boolean {
  return role === "borrower" || role === "admin";
}

export function canAccessDashboard(role: UserRole): boolean {
  return role !== "borrower";
}

export function canAccessDashboardModule(
  role: UserRole,
  module: DashboardModule,
): boolean {
  if (role === "admin") return true;
  return role === module;
}

/** Default post-login route for a role. */
export function getHomePathForRole(role: UserRole): string {
  if (role === "borrower") return "/borrower";
  if (role === "admin") return "/dashboard";
  if (isDashboardModule(role)) return `/dashboard/${role}`;
  return "/login";
}

/** Whether a frontend pathname is allowed for the given role. */
export function canAccessPath(role: UserRole, pathname: string): boolean {
  if (role === "admin") return true;

  if (pathname.startsWith("/borrower")) {
    return role === "borrower";
  }

  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return false;
  }

  if (pathname.startsWith("/dashboard/")) {
    const segment = pathname.split("/")[2];
    if (!segment) return false;
    return isDashboardModule(role as UserRole) && role === segment;
  }

  if (pathname.startsWith("/dashboard")) {
    return canAccessDashboard(role);
  }

  return true;
}
