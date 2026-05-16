import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

/** Ensures authenticate has populated req.user (401 if missing). */
export function requireUser(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    return;
  }
  next();
}
