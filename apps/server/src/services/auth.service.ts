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

export type SeedUserUpsertResult = "created" | "updated" | "skipped";

/**
 * Idempotent seed upsert using the same persistence path as registration (create/save).
 * findOneAndUpdate is not used because passwordHash has select:false and may not persist.
 */
export async function upsertSeedUser(
  email: string,
  password: string,
  role: IUser["role"],
  name: string,
): Promise<SeedUserUpsertResult> {
  validateEmail(email);
  validatePassword(password);

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail }).select("+passwordHash");

  if (existing) {
    const passwordMatches = await comparePassword(password, existing.passwordHash);
    const unchanged =
      passwordMatches && existing.role === role && existing.name === name;

    if (unchanged) {
      return "skipped";
    }

    existing.passwordHash = await hashPassword(password);
    existing.role = role;
    existing.name = name;
    await existing.save();
    return "updated";
  }

  const passwordHash = await hashPassword(password);
  await User.create({
    email: normalizedEmail,
    passwordHash,
    role,
    name,
  });
  return "created";
}

/** Confirms a stored hash matches the plaintext (used by seed verification). */
export async function verifyStoredCredentials(
  email: string,
  password: string,
): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash");
  if (!user) {
    return false;
  }
  return comparePassword(password, user.passwordHash);
}

export async function createUserWithRole(
  email: string,
  password: string,
  role: IUser["role"],
  name?: string,
): Promise<IUser> {
  const result = await upsertSeedUser(email, password, role, name ?? email);
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new Error(`Failed to upsert user ${normalizedEmail} (${result})`);
  }
  return user;
}
