import type { NextFunction, Request, Response } from "express";
import type { DashboardModule, UserRole } from "@loanforge/shared";
import { AppError } from "../utils/AppError";

function createRoleAuthorizer(allowAdmin: boolean) {
  return (...allowedRoles: UserRole[]) =>
    (req: Request, _res: Response, next: NextFunction): void => {
      if (!req.user) {
        next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
        return;
      }

      if (allowAdmin && req.user.role === "admin") {
        next();
        return;
      }

      if (allowedRoles.includes(req.user.role)) {
        next();
        return;
      }

      next(new AppError("Forbidden", 403, "FORBIDDEN"));
    };
}

/** Allows only the listed roles (no admin bypass). */
export const authorizeRoles = createRoleAuthorizer(false);

/** Allows admin or any of the listed roles. */
export const authorizeRolesAllowAdmin = createRoleAuthorizer(true);

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
