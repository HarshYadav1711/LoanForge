import type { LoanRecord, PaymentRecord, SalesLead } from "@loanforge/shared";
import { apiRequest } from "./api";

export function fetchSalesLeads(): Promise<SalesLead[]> {
  return apiRequest<SalesLead[]>("/dashboard/sales/leads", { auth: true });
}

export function fetchSanctionLoans(): Promise<LoanRecord[]> {
  return apiRequest<LoanRecord[]>("/dashboard/sanction/loans", { auth: true });
}

export function approveLoan(loanId: string): Promise<LoanRecord> {
  return apiRequest<LoanRecord>(`/dashboard/sanction/loans/${loanId}/approve`, {
    method: "POST",
    auth: true,
  });
}

export function rejectLoan(loanId: string, reason: string): Promise<LoanRecord> {
  return apiRequest<LoanRecord>(`/dashboard/sanction/loans/${loanId}/reject`, {
    method: "POST",
    body: { reason },
    auth: true,
  });
}

export function fetchDisbursementLoans(): Promise<LoanRecord[]> {
  return apiRequest<LoanRecord[]>("/dashboard/disbursement/loans", { auth: true });
}

export function disburseLoan(loanId: string): Promise<LoanRecord> {
  return apiRequest<LoanRecord>(`/dashboard/disbursement/loans/${loanId}/disburse`, {
    method: "POST",
    auth: true,
  });
}

export function fetchCollectionLoans(): Promise<LoanRecord[]> {
  return apiRequest<LoanRecord[]>("/dashboard/collection/loans", { auth: true });
}

export function fetchLoanPayments(loanId: string): Promise<PaymentRecord[]> {
  return apiRequest<PaymentRecord[]>(`/dashboard/collection/loans/${loanId}/payments`, {
    auth: true,
  });
}

export function recordPayment(
  loanId: string,
  body: { utr: string; amount: number; paymentDate: string },
): Promise<{ loan: LoanRecord; payment: PaymentRecord }> {
  return apiRequest<{ loan: LoanRecord; payment: PaymentRecord }>(
    `/dashboard/collection/loans/${loanId}/payments`,
    {
      method: "POST",
      body,
      auth: true,
    },
  );
}
