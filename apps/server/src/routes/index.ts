import { Router } from "express";
import { authRouter } from "./auth.routes";
import { borrowerRouter } from "./borrower.routes";
import { dashboardRouter } from "./dashboard.routes";
import { healthRouter } from "./health.routes";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/borrower", borrowerRouter);
apiRouter.use("/dashboard", dashboardRouter);
