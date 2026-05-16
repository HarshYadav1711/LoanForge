import fs from "fs";
import path from "path";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { SALARY_SLIP_ALLOWED_MIME_TYPES, SALARY_SLIP_MAX_BYTES } from "@loanforge/shared";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";

const allowedExtensions = new Set([".pdf", ".jpg", ".jpeg", ".png"]);

const storage = multer.diskStorage({
  destination(req, _file, cb) {
    const userId = req.user?.id;
    if (!userId) {
      cb(new AppError("Unauthorized", 401, "UNAUTHORIZED"), "");
      return;
    }

    const destination = path.join(env.uploadDir, userId);
    fs.mkdirSync(destination, { recursive: true });
    cb(null, destination);
  },
  filename(_req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase() || ".bin";
    const safeExtension = allowedExtensions.has(extension) ? extension : ".bin";
    cb(null, `salary-slip-${Date.now()}${safeExtension}`);
  },
});

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void {
  const extension = path.extname(file.originalname).toLowerCase();
  const mimeAllowed = (SALARY_SLIP_ALLOWED_MIME_TYPES as readonly string[]).includes(
    file.mimetype,
  );
  const extensionAllowed = allowedExtensions.has(extension);

  if (!mimeAllowed || !extensionAllowed) {
    cb(new AppError("Only PDF, JPG, and PNG files are allowed.", 400, "INVALID_FILE_TYPE"));
    return;
  }

  cb(null, true);
}

export const uploadSalarySlip = multer({
  storage,
  fileFilter,
  limits: { fileSize: SALARY_SLIP_MAX_BYTES },
});

export function handleMulterError(
  err: unknown,
  _req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (err instanceof AppError) {
    next(err);
    return;
  }

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      next(new AppError("Salary slip must be 5 MB or smaller.", 400, "FILE_TOO_LARGE"));
      return;
    }
    next(new AppError(err.message, 400, "UPLOAD_ERROR"));
    return;
  }
  next(err);
}
