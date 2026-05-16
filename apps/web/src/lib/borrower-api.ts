import type { BorrowerDashboardState, LoanApplicationState } from "@loanforge/shared";
import { apiFormDataRequest, apiRequest } from "./api";

export function getBorrowerDashboard(): Promise<BorrowerDashboardState> {
  return apiRequest<BorrowerDashboardState>("/borrower/dashboard", { auth: true });
}

export function startNewApplication(): Promise<LoanApplicationState> {
  return apiRequest<LoanApplicationState>("/borrower/application/start", {
    method: "POST",
    auth: true,
  });
}

export function getApplication(): Promise<LoanApplicationState> {
  return apiRequest<LoanApplicationState>("/borrower/application", { auth: true });
}

export function savePersonalDetails(
  body: Record<string, unknown>,
): Promise<LoanApplicationState> {
  return apiRequest<LoanApplicationState>("/borrower/application/personal", {
    method: "PUT",
    body,
    auth: true,
  });
}

export function validateBre(): Promise<LoanApplicationState> {
  return apiRequest<LoanApplicationState>("/borrower/application/bre", {
    method: "POST",
    auth: true,
  });
}

export function uploadSalarySlip(file: File): Promise<LoanApplicationState> {
  const formData = new FormData();
  formData.append("salarySlip", file);
  return apiFormDataRequest<LoanApplicationState>("/borrower/application/salary-slip", {
    method: "POST",
    body: formData,
    auth: true,
  });
}

export function submitLoanApplication(
  body: Record<string, unknown>,
): Promise<LoanApplicationState> {
  return apiRequest<LoanApplicationState>("/borrower/application/submit", {
    method: "POST",
    body,
    auth: true,
  });
}
