const STEP_STYLES: Record<string, string> = {
  personal: "bg-slate-100 text-slate-700 ring-slate-200",
  bre: "bg-amber-50 text-amber-800 ring-amber-200",
  "salary-slip": "bg-sky-50 text-sky-800 ring-sky-200",
  loan: "bg-violet-50 text-violet-800 ring-violet-200",
  "ready-to-submit": "bg-emerald-50 text-emerald-800 ring-emerald-200",
};

type StepBadgeProps = {
  step: string;
};

export function StepBadge({ step }: StepBadgeProps) {
  const style = STEP_STYLES[step] ?? "bg-brand-50 text-brand-700 ring-brand-200";
  const label = step.replace(/-/g, " ");

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${style}`}
    >
      {label}
    </span>
  );
}
