import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import * as applicationController from "../controllers/application.controller";
import { authenticate } from "../middleware/authenticate";
import { authorizeRoles } from "../middleware/authorizeRoles";
import { requireUser } from "../middleware/requireUser";
import { handleMulterError, uploadSalarySlip } from "../middleware/uploadSalarySlip";

export const borrowerRouter = Router();

borrowerRouter.use(authenticate, requireUser, authorizeRoles("borrower"));

function salarySlipUpload(req: Request, res: Response, next: NextFunction): void {
  uploadSalarySlip.single("salarySlip")(req, res, (err) => {
    if (err) {
      handleMulterError(err, req, res, next);
      return;
    }
    next();
  });
}

borrowerRouter.get("/dashboard", applicationController.getDashboard);
borrowerRouter.post("/application/start", applicationController.startApplication);
borrowerRouter.get("/application", applicationController.getApplication);
borrowerRouter.put("/application/personal", applicationController.savePersonalDetails);
borrowerRouter.post("/application/bre", applicationController.validateBre);
borrowerRouter.post(
  "/application/salary-slip",
  salarySlipUpload,
  applicationController.uploadSalarySlip,
);
borrowerRouter.post("/application/submit", applicationController.submitApplication);
