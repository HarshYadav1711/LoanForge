import type { ApiResponse } from "@loanforge/shared";
import { env } from "./env";
import { getToken } from "./auth-storage";

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

type FormDataRequestOptions = Omit<RequestInit, "body"> & {
  body: FormData;
  auth?: boolean;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, auth = false, headers, ...rest } = options;

  const requestHeaders = new Headers(headers);
  if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getToken();
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${env.apiUrl}${path}`, {
    ...rest,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success) {
    const message = payload.success ? "Request failed" : payload.error;
    const code = payload.success ? undefined : payload.code;
    throw new ApiRequestError(message, response.status, code);
  }

  return payload.data;
}

export async function apiFormDataRequest<T>(
  path: string,
  options: FormDataRequestOptions,
): Promise<T> {
  const { body, auth = false, headers, ...rest } = options;

  const requestHeaders = new Headers(headers);

  if (auth) {
    const token = getToken();
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${env.apiUrl}${path}`, {
    ...rest,
    method: rest.method ?? "POST",
    headers: requestHeaders,
    body,
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success) {
    const message = payload.success ? "Request failed" : payload.error;
    const code = payload.success ? undefined : payload.code;
    throw new ApiRequestError(message, response.status, code);
  }

  return payload.data;
}
