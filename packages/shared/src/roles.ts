/** All authenticated roles in the platform. */
export type UserRole =
  | "admin"
  | "sales"
  | "sanction"
  | "disbursement"
  | "collection"
  | "borrower";

export type StaffRole = Exclude<UserRole, "borrower">;

/** Roles that may access the operations dashboard. */
export type DashboardRole = StaffRole;
