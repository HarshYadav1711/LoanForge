"use client";

import type { ReactNode } from "react";

type AsyncStateProps = {
  isLoading: boolean;
  error: string | null;
  isEmpty?: boolean;
  loadingMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry?: () => void;
  children: ReactNode;
};

export function AsyncState({
  isLoading,
  error,
  isEmpty = false,
  loadingMessage = "Loading…",
  emptyTitle = "Nothing here yet",
  emptyDescription = "Check back later.",
  onRetry,
  children,
}: AsyncStateProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-slate-600" aria-live="polite">
          {loadingMessage}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800 shadow-sm"
        role="alert"
      >
        <p>{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-800"
          >
            Try again
          </button>
        )}
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
