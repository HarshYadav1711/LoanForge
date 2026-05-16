import { Router } from "express";
import { DASHBOARD_MODULES } from "@loanforge/shared";
import { authenticate } from "../middleware/authenticate";
import { authorizeModule, authorizeRoles } from "../middleware/authorizeRoles";
import { asyncHandler } from "../utils/asyncHandler";

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);

dashboardRouter.get(
  "/",
  authorizeRoles("admin"),
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      data: {
        message: "Admin dashboard overview",
        modules: DASHBOARD_MODULES,
        user: req.user,
      },
    });
  }),
);

for (const module of DASHBOARD_MODULES) {
  dashboardRouter.get(
    `/${module}`,
    authorizeModule(module),
    asyncHandler(async (req, res) => {
      res.json({
        success: true,
        data: {
          message: `${module} module access granted`,
          module,
          user: req.user,
        },
      });
    }),
  );
}
