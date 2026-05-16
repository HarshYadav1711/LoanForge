import clsx from "clsx";

const STEPS = [
  { id: 1, label: "Personal details" },
  { id: 2, label: "BRE check" },
  { id: 3, label: "Salary slip" },
  { id: 4, label: "Loan & apply" },
] as const;

type StepIndicatorProps = {
  activeStep: number;
};

export function StepIndicator({ activeStep }: StepIndicatorProps) {
  return (
    <ol className="flex flex-wrap gap-2 sm:gap-4">
      {STEPS.map((step) => {
        const isActive = step.id === activeStep;
        const isComplete = step.id < activeStep;

        return (
          <li
            key={step.id}
            className={clsx(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
              isActive && "border-brand-500 bg-brand-50 text-brand-700",
              isComplete && "border-emerald-200 bg-emerald-50 text-emerald-800",
              !isActive && !isComplete && "border-slate-200 bg-white text-slate-500",
            )}
          >
            <span
              className={clsx(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                isActive && "bg-brand-600 text-white",
                isComplete && "bg-emerald-600 text-white",
                !isActive && !isComplete && "bg-slate-200 text-slate-600",
              )}
            >
              {isComplete ? "✓" : step.id}
            </span>
            <span className="font-medium">{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
