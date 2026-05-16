import type { UserRole } from "./roles";

/** Safe user fields returned from auth endpoints. */
export interface PublicUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}
