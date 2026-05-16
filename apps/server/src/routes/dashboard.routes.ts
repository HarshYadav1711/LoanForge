import { Router } from "express";
import { DASHBOARD_MODULES } from "@loanforge/shared";
import * as dashboardController from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/authenticate";
import { authorizeModule, authorizeRoles } from "../middleware/authorizeRoles";
import { asyncHandler } from "../utils/asyncHandler";

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);

dashboardRouter.get(
  "/",
  authorizeRoles("admin"),
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      data: {
        message: "Admin dashboard overview",
        modules: DASHBOARD_MODULES,
        user: req.user,
      },
    });
  }),
);

dashboardRouter.get(
  "/sales/leads",
  authorizeModule("sales"),
  dashboardController.listSalesLeads,
);

dashboardRouter.get(
  "/sanction/loans",
  authorizeModule("sanction"),
  dashboardController.listSanctionLoans,
);

dashboardRouter.post(
  "/sanction/loans/:loanId/approve",
  authorizeModule("sanction"),
  dashboardController.approveLoan,
);

dashboardRouter.post(
  "/sanction/loans/:loanId/reject",
  authorizeModule("sanction"),
  dashboardController.rejectLoan,
);

dashboardRouter.get(
  "/disbursement/loans",
  authorizeModule("disbursement"),
  dashboardController.listDisbursementLoans,
);

dashboardRouter.post(
  "/disbursement/loans/:loanId/disburse",
  authorizeModule("disbursement"),
  dashboardController.disburseLoan,
);

dashboardRouter.get(
  "/collection/loans",
  authorizeModule("collection"),
  dashboardController.listCollectionLoans,
);

dashboardRouter.get(
  "/collection/loans/:loanId/payments",
  authorizeModule("collection"),
  dashboardController.listLoanPayments,
);

dashboardRouter.post(
  "/collection/loans/:loanId/payments",
  authorizeModule("collection"),
  dashboardController.recordPayment,
);
