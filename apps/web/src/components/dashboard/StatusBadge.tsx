import type { LoanStatus } from "@loanforge/shared";

const STATUS_STYLES: Record<LoanStatus, string> = {
  applied: "bg-amber-50 text-amber-800 ring-amber-200",
  sanctioned: "bg-sky-50 text-sky-800 ring-sky-200",
  rejected: "bg-rose-50 text-rose-800 ring-rose-200",
  disbursed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  closed: "bg-slate-100 text-slate-700 ring-slate-200",
};

const STATUS_LABELS: Record<LoanStatus, string> = {
  applied: "Applied",
  sanctioned: "Sanctioned",
  rejected: "Rejected",
  disbursed: "Disbursed",
  closed: "Closed",
};

type StatusBadgeProps = {
  status: LoanStatus | string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const style =
    status in STATUS_STYLES
      ? STATUS_STYLES[status as LoanStatus]
      : "bg-slate-100 text-slate-700 ring-slate-200";

  const label =
    status in STATUS_LABELS ? STATUS_LABELS[status as LoanStatus] : status;

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {label}
    </span>
  );
}
