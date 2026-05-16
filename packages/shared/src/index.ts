export type { UserRole, StaffRole, DashboardRole } from "./roles";
export type { ApiSuccess, ApiError, ApiResponse } from "./api";
export type {
  LoanStatus,
  LoanRecord,
  SalesLead,
  PaymentRecord,
} from "./loan";
export {
  ACTIVE_LOAN_STATUSES,
  LOAN_STATUS_TRANSITIONS,
  canTransitionLoanStatus,
  isActiveLoanStatus,
} from "./loan";
export type { ActiveLoanStatus } from "./loan";
export {
  rejectLoanSchema,
  recordPaymentSchema,
  type RejectLoanInput,
  type RecordPaymentInput,
} from "./operations";
export type {
  EmploymentMode,
  ApplicationStep,
  ApplicationStatus,
  PersonalDetails,
  BreCheckResult,
  SalarySlipInfo,
  LoanTerms,
  BorrowerLoanSummary,
  BorrowerLoanHistoryItem,
  BorrowerDraftSummary,
  BorrowerDashboardState,
  LoanApplicationState,
  RepaymentPreview,
} from "./application";
export {
  MONEY_EPSILON,
  roundMoney,
  outstandingBalance,
  isFullyRepaid,
} from "./money";
export {
  EMPLOYMENT_MODES,
  APPLICABLE_EMPLOYMENT_MODES,
  PAN_PATTERN,
  MIN_AGE,
  MAX_AGE,
  MIN_MONTHLY_SALARY,
  MIN_LOAN_AMOUNT,
  MAX_LOAN_AMOUNT,
  MIN_TENURE_DAYS,
  MAX_TENURE_DAYS,
  ANNUAL_INTEREST_RATE,
  SALARY_SLIP_MAX_BYTES,
  SALARY_SLIP_ALLOWED_MIME_TYPES,
  calculateAge,
  calculateSimpleInterestRepayment,
} from "./application";
export {
  personalDetailsSchema,
  loanConfigSchema,
  type PersonalDetailsInput,
  type LoanConfigInput,
} from "./validation";
export type {
  PublicUser,
  AuthResponse,
  LoginInput,
  RegisterInput,
} from "./auth";
export type { DashboardModule } from "./access";
export { USER_ROLES, STAFF_ROLES, DASHBOARD_ROLES, LOAN_STATUSES } from "./constants";
export { DASHBOARD_MODULES, isDashboardModule, canAccessBorrowerPortal, canAccessDashboard, canAccessDashboardModule, getHomePathForRole, canAccessPath } from "./access";
