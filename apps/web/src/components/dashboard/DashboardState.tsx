"use client";

import type { ReactNode } from "react";
import { AsyncState } from "@/components/ui/AsyncState";

type DashboardStateProps = {
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  emptyTitle: string;
  emptyDescription: string;
  onRetry?: () => void;
  children: ReactNode;
};

export function DashboardState({
  isLoading,
  error,
  isEmpty,
  emptyTitle,
  emptyDescription,
  onRetry,
  children,
}: DashboardStateProps) {
  return (
    <AsyncState
      isLoading={isLoading}
      error={error}
      isEmpty={isEmpty}
      loadingMessage="Loading records…"
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      onRetry={onRetry}
    >
      {children}
    </AsyncState>
  );
}
