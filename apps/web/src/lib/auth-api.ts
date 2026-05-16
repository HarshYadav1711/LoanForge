import type { AuthResponse, LoginInput, PublicUser, RegisterInput } from "@loanforge/shared";
import { apiRequest } from "./api";

export function login(input: LoginInput): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: input,
  });
}

export function register(input: RegisterInput): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: input,
  });
}

export function fetchMe(): Promise<{ user: PublicUser }> {
  return apiRequest<{ user: PublicUser }>("/auth/me", { auth: true });
}
