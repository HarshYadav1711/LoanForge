"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { LoginInput, PublicUser, RegisterInput } from "@loanforge/shared";
import { getHomePathForRole } from "@loanforge/shared";
import * as authApi from "@/lib/auth-api";
import { clearToken, getToken, setToken } from "@/lib/auth-storage";
import { ApiRequestError, setUnauthorizedHandler } from "@/lib/api";

type AuthContextValue = {
  user: PublicUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrate = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const { user: currentUser } = await authApi.fetchMe();
      setUser(currentUser);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearToken();
      setUser(null);
    });
  }, []);

  const handleAuthSuccess = useCallback(
    (authUser: PublicUser, accessToken: string) => {
      setToken(accessToken);
      setUser(authUser);
      router.replace(getHomePathForRole(authUser.role));
    },
    [router],
  );

  const login = useCallback(
    async (input: LoginInput) => {
      const result = await authApi.login(input);
      handleAuthSuccess(result.user, result.accessToken);
    },
    [handleAuthSuccess],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const result = await authApi.register(input);
      handleAuthSuccess(result.user, result.accessToken);
    },
    [handleAuthSuccess],
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
