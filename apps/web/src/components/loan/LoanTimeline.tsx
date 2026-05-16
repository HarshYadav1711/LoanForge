import type { BorrowerLoanSummary, LoanStatus } from "@loanforge/shared";
import { formatDate } from "@/lib/format";

type TimelineStep = {
  key: string;
  label: string;
  date: string | null;
  state: "complete" | "current" | "upcoming" | "rejected";
};

function buildSteps(loan: BorrowerLoanSummary): TimelineStep[] {
  const steps: TimelineStep[] = [
    { key: "applied", label: "Applied", date: null, state: "complete" },
    {
      key: "sanctioned",
      label: "Sanctioned",
      date: loan.sanctionedAt,
      state: "upcoming",
    },
    {
      key: "disbursed",
      label: "Disbursed",
      date: loan.disbursedAt,
      state: "upcoming",
    },
    {
      key: "closed",
      label: "Closed",
      date: loan.closedAt,
      state: "upcoming",
    },
  ];

  if (loan.status === "rejected") {
    return [
      { key: "applied", label: "Applied", date: null, state: "complete" },
      {
        key: "rejected",
        label: "Rejected",
        date: loan.rejectedAt,
        state: "rejected",
      },
    ];
  }

  const order: LoanStatus[] = ["applied", "sanctioned", "disbursed", "closed"];
  const currentIndex = order.indexOf(loan.status);

  return steps.map((step, index) => {
    if (index < currentIndex) {
      return { ...step, state: "complete" as const };
    }
    if (index === currentIndex) {
      return { ...step, state: "current" as const };
    }
    return step;
  });
}

type LoanTimelineProps = {
  loan: BorrowerLoanSummary;
};

export function LoanTimeline({ loan }: LoanTimelineProps) {
  const steps = buildSteps(loan);

  return (
    <ol className="space-y-0 border-l border-slate-200 pl-4">
      {steps.map((step) => (
        <li key={step.key} className="relative pb-5 last:pb-0">
          <span
            className={`absolute -left-[1.3rem] top-1 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
              step.state === "complete"
                ? "bg-emerald-500"
                : step.state === "current"
                  ? "bg-brand-600"
                  : step.state === "rejected"
                    ? "bg-rose-500"
                    : "bg-slate-300"
            }`}
            aria-hidden
          />
          <p
            className={`text-sm font-medium ${
              step.state === "rejected"
                ? "text-rose-800"
                : step.state === "current"
                  ? "text-brand-800"
                  : step.state === "complete"
                    ? "text-slate-900"
                    : "text-slate-500"
            }`}
          >
            {step.label}
          </p>
          {step.date && (
            <p className="text-xs text-slate-500">{formatDate(step.date)}</p>
          )}
        </li>
      ))}
    </ol>
  );
}
