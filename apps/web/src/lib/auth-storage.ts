const TOKEN_KEY = "loanforge_token";
const LEGACY_COOKIE_NAME = "loanforge_token";

function clearLegacyCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${LEGACY_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  clearLegacyCookie();
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  clearLegacyCookie();
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  clearLegacyCookie();
}
