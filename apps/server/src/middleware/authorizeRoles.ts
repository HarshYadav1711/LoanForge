import type { NextFunction, Request, Response } from "express";
import type { DashboardModule, UserRole } from "@loanforge/shared";
import { AppError } from "../utils/AppError";

/** Allows admin or any of the listed roles. */
export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
      return;
    }

    if (req.user.role === "admin" || allowedRoles.includes(req.user.role)) {
      next();
      return;
    }

    next(new AppError("Forbidden", 403, "FORBIDDEN"));
  };
}

/** Allows admin or the role that owns the dashboard module. */
export function authorizeModule(...modules: DashboardModule[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
      return;
    }

    if (req.user.role === "admin") {
      next();
      return;
    }

    if (modules.includes(req.user.role as DashboardModule)) {
      next();
      return;
    }

    next(new AppError("Forbidden", 403, "FORBIDDEN"));
  };
}
