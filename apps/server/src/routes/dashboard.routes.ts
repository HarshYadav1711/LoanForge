import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/authenticate";
import { authorizeModule, authorizeRoles } from "../middleware/authorizeRoles";
import { requireUser } from "../middleware/requireUser";

export const dashboardRouter = Router();

dashboardRouter.use(authenticate, requireUser);

dashboardRouter.get("/", authorizeRoles("admin"), dashboardController.getAdminOverview);

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
