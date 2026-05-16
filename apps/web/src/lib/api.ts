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

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

async function parseApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new ApiRequestError(
      response.ok ? "Unexpected response from server" : "Request failed",
      response.status,
    );
  }

  try {
    return (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiRequestError("Invalid response from server", response.status);
  }
}

function handleFailure<T>(response: Response, payload: ApiResponse<T>): never {
  const message = payload.success ? "Request failed" : payload.error;
  const code = payload.success ? undefined : payload.code;

  if (response.status === 401 && onUnauthorized) {
    onUnauthorized();
  }

  throw new ApiRequestError(message, response.status, code);
}

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
    if (!token) {
      throw new ApiRequestError("Sign in required", 401, "UNAUTHORIZED");
    }
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${env.apiUrl}${path}`, {
      ...rest,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiRequestError("Network error — check your connection", 0);
  }

  const payload = await parseApiResponse<T>(response);

  if (!response.ok || !payload.success) {
    handleFailure(response, payload);
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
    if (!token) {
      throw new ApiRequestError("Sign in required", 401, "UNAUTHORIZED");
    }
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${env.apiUrl}${path}`, {
      ...rest,
      method: rest.method ?? "POST",
      headers: requestHeaders,
      body,
    });
  } catch {
    throw new ApiRequestError("Network error — check your connection", 0);
  }

  const payload = await parseApiResponse<T>(response);

  if (!response.ok || !payload.success) {
    handleFailure(response, payload);
  }

  return payload.data;
}
