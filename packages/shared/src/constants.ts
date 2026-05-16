import type { DashboardRole, StaffRole, UserRole } from "./roles";
import type { LoanStatus } from "./loan";

export const USER_ROLES: readonly UserRole[] = [
  "admin",
  "sales",
  "sanction",
  "disbursement",
  "collection",
  "borrower",
] as const;

export const STAFF_ROLES: readonly StaffRole[] = [
  "admin",
  "sales",
  "sanction",
  "disbursement",
  "collection",
] as const;

export const DASHBOARD_ROLES: readonly DashboardRole[] = STAFF_ROLES;

export const LOAN_STATUSES: readonly LoanStatus[] = [
  "applied",
  "sanctioned",
  "rejected",
  "disbursed",
  "closed",
] as const;
