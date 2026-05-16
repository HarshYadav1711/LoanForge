import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  canAccessPath,
  getHomePathForRole,
  type UserRole,
} from "@loanforge/shared";

function decodeTokenRole(token: string): UserRole | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;
    const json = JSON.parse(
      Buffer.from(segment, "base64url").toString("utf8"),
    ) as { role?: UserRole };
    return json.role ?? null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("loanforge_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = decodeTokenRole(token);
  if (!role) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("loanforge_token");
    return response;
  }

  if (!canAccessPath(role, pathname)) {
    return NextResponse.redirect(new URL(getHomePathForRole(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/borrower/:path*", "/dashboard/:path*"],
};
