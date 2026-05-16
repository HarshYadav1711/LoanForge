import type { Request, Response } from "express";
import { DASHBOARD_MODULES } from "@loanforge/shared";
import * as loanService from "../services/loan.service";
import { asyncHandler } from "../utils/asyncHandler";

function paramId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export const getAdminOverview = asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      message: "Admin dashboard overview",
      modules: DASHBOARD_MODULES,
      user: req.user,
    },
  });
});

export const listSalesLeads = asyncHandler(async (_req: Request, res: Response) => {
  const data = await loanService.listSalesLeads();
  res.json({ success: true, data });
});

export const listSanctionLoans = asyncHandler(async (_req: Request, res: Response) => {
  const data = await loanService.listLoansByStatus("applied");
  res.json({ success: true, data });
});

export const approveLoan = asyncHandler(async (req: Request, res: Response) => {
  const data = await loanService.approveLoan(paramId(req.params.loanId));
  res.json({ success: true, data });
});

export const rejectLoan = asyncHandler(async (req: Request, res: Response) => {
  const data = await loanService.rejectLoan(paramId(req.params.loanId), req.body);
  res.json({ success: true, data });
});

export const listDisbursementLoans = asyncHandler(async (_req: Request, res: Response) => {
  const data = await loanService.listLoansByStatus("sanctioned");
  res.json({ success: true, data });
});

export const disburseLoan = asyncHandler(async (req: Request, res: Response) => {
  const data = await loanService.disburseLoan(paramId(req.params.loanId));
  res.json({ success: true, data });
});

export const listCollectionLoans = asyncHandler(async (_req: Request, res: Response) => {
  const data = await loanService.listLoansByStatus("disbursed");
  res.json({ success: true, data });
});

export const recordPayment = asyncHandler(async (req: Request, res: Response) => {
  const data = await loanService.recordPayment(
    paramId(req.params.loanId),
    req.user!.id,
    req.body,
  );
  res.status(201).json({ success: true, data });
});

export const listLoanPayments = asyncHandler(async (req: Request, res: Response) => {
  const data = await loanService.listLoanPayments(paramId(req.params.loanId));
  res.json({ success: true, data });
});
