import type { Request, Response } from "express";
import * as applicationService from "../services/application.service";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

export const getApplication = asyncHandler(async (req: Request, res: Response) => {
  const data = await applicationService.getApplicationState(req.user!.id);
  res.json({ success: true, data });
});

export const savePersonalDetails = asyncHandler(async (req: Request, res: Response) => {
  const data = await applicationService.savePersonalDetails(req.user!.id, req.body);
  res.json({ success: true, data });
});

export const validateBre = asyncHandler(async (req: Request, res: Response) => {
  const data = await applicationService.validateBre(req.user!.id);
  res.json({ success: true, data });
});

export const uploadSalarySlip = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError("Salary slip file is required.", 400, "FILE_REQUIRED");
  }

  const data = await applicationService.saveSalarySlip(req.user!.id, {
    originalName: req.file.originalname,
    storedPath: req.file.path,
    mimeType: req.file.mimetype,
    size: req.file.size,
  });

  res.json({ success: true, data });
});

export const submitApplication = asyncHandler(async (req: Request, res: Response) => {
  const data = await applicationService.submitLoanApplication(req.user!.id, req.body);
  res.status(201).json({ success: true, data });
});
