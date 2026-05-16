import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";

export const healthRouter = Router();

healthRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json({
      success: true,
      data: { status: "ok", service: "loanforge-api" },
    });
  }),
);
