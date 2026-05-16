import type { LoanStatus } from "@loanforge/shared";

const STATUS_STYLES: Record<LoanStatus, string> = {
  applied: "bg-amber-50 text-amber-800 ring-amber-200",
  sanctioned: "bg-sky-50 text-sky-800 ring-sky-200",
  rejected: "bg-rose-50 text-rose-800 ring-rose-200",
  disbursed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  closed: "bg-slate-100 text-slate-700 ring-slate-200",
};

type StatusBadgeProps = {
  status: LoanStatus | string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const style =
    status in STATUS_STYLES
      ? STATUS_STYLES[status as LoanStatus]
      : "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${style}`}
    >
      {status}
    </span>
  );
}
