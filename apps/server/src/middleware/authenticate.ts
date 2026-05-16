import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../services/auth.service";
import { AppError } from "../utils/AppError";

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    return;
  }

  const token = header.slice(7).trim();
  if (!token) {
    next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    return;
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (err) {
    next(err);
  }
}
