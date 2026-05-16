import type { UserRole } from "@loanforge/shared";

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      email: string;
      role: UserRole;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
