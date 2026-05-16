import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { AuthResponse, LoginInput, PublicUser, RegisterInput } from "@loanforge/shared";
import { env } from "../config/env";
import { User, type IUser } from "../models/User";
import { AppError } from "../utils/AppError";

const BCRYPT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;

export interface TokenPayload {
  sub: string;
  email: string;
  role: IUser["role"];
}

function toPublicUser(user: Pick<IUser, "_id" | "email" | "role" | "name">): PublicUser {
  return {
    id: String(user._id),
    email: user.email,
    role: user.role,
    ...(user.name ? { name: user.name } : {}),
  };
}

function validatePassword(password: string): void {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new AppError(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      400,
      "VALIDATION_ERROR",
    );
  }
}

function validateEmail(email: string): void {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError("Invalid email address", 400, "VALIDATION_ERROR");
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function comparePassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function signAccessToken(user: Pick<IUser, "_id" | "email" | "role">): string {
  const payload: TokenPayload = {
    sub: String(user._id),
    email: user.email,
    role: user.role,
  };
  const signOptions: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.jwtSecret, signOptions);
}

export function verifyAccessToken(token: string): PublicUser {
  try {
    const payload = jwt.verify(token, env.jwtSecret) as TokenPayload;
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    throw new AppError("Invalid or expired token", 401, "UNAUTHORIZED");
  }
}

function buildAuthResponse(
  user: Pick<IUser, "_id" | "email" | "role" | "name">,
): AuthResponse {
  const publicUser = toPublicUser(user);
  return {
    user: publicUser,
    accessToken: signAccessToken(user),
  };
}

export async function registerBorrower(input: RegisterInput): Promise<AuthResponse> {
  validateEmail(input.email);
  validatePassword(input.password);

  const email = input.email.trim().toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("Email already registered", 409, "EMAIL_EXISTS");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({
    email,
    passwordHash,
    role: "borrower",
    ...(input.name?.trim() ? { name: input.name.trim() } : {}),
  });

  return buildAuthResponse(user);
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  validateEmail(input.email);

  const email = input.email.trim().toLowerCase();
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  return buildAuthResponse(user);
}

export async function getUserById(id: string): Promise<PublicUser | null> {
  const user = await User.findById(id);
  if (!user) return null;
  return toPublicUser(user);
}

export async function createUserWithRole(
  email: string,
  password: string,
  role: IUser["role"],
  name?: string,
): Promise<IUser> {
  validateEmail(email);
  validatePassword(password);

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return existing;
  }

  const passwordHash = await hashPassword(password);
  return User.create({
    email: normalizedEmail,
    passwordHash,
    role,
    ...(name ? { name } : {}),
  });
}
