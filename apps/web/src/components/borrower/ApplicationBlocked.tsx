"use client";

import Link from "next/link";

type ApplicationBlockedProps = {
  title: string;
  message: string;
};

export function ApplicationBlocked({ title, message }: ApplicationBlockedProps) {
  return (
    <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-5">
      <h2 className="text-base font-semibold text-amber-950">{title}</h2>
      <p className="text-sm text-amber-900">{message}</p>
      <Link
        href="/borrower"
        className="inline-flex rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
      >
        Back to dashboard
      </Link>
    </div>
  );
}

