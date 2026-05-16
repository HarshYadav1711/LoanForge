import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@loanforge/shared";
import { AppError } from "../utils/AppError";

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError("Forbidden", 403, "FORBIDDEN"));
      return;
    }

    next();
  };
}
