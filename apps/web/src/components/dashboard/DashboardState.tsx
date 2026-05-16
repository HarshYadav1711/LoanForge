"use client";

import type { ReactNode } from "react";

type DashboardStateProps = {
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  emptyTitle: string;
  emptyDescription: string;
  children: ReactNode;
};

export function DashboardState({
  isLoading,
  error,
  isEmpty,
  emptyTitle,
  emptyDescription,
  children,
}: DashboardStateProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600 shadow-sm">
        Loading records…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800 shadow-sm">
        {error}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="font-medium text-slate-900">{emptyTitle}</p>
        <p className="mt-1 text-sm text-slate-600">{emptyDescription}</p>
      </div>
    );
  }

  return <>{children}</>;
}
