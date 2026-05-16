import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

/** Verifies JWT and attaches `req.user`. Implementation pending. */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    return;
  }
  next();
}
