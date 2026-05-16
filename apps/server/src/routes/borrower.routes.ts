import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { authorizeRoles } from "../middleware/authorizeRoles";
import { asyncHandler } from "../utils/asyncHandler";

export const borrowerRouter = Router();

borrowerRouter.use(authenticate, authorizeRoles("borrower"));

borrowerRouter.get(
  "/profile",
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      data: {
        message: "Borrower portal access granted",
        user: req.user,
      },
    });
  }),
);
