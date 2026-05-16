"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

type PortalHeaderProps = {
  title: string;
  description: string;
};

export function PortalHeader({ title, description }: PortalHeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
            LoanForge
          </p>
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <p className="hidden text-right text-sm sm:block">
              <span className="font-medium text-slate-900">{user.email}</span>
              <span className="mt-0.5 block text-xs capitalize text-slate-500">
                {user.role}
              </span>
            </p>
          )}
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Home
          </Link>
          <button
            type="button"
            onClick={logout}
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
