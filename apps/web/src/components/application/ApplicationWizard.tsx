"use client";

import type { ApplicationStep, LoanApplicationState } from "@loanforge/shared";
import { useCallback, useEffect, useState } from "react";
import { ApiRequestError } from "@/lib/api";
import { getApplication } from "@/lib/borrower-api";
import { ApplicationComplete } from "./ApplicationComplete";
import { BreValidationStep } from "./BreValidationStep";
import { LoanConfigStep } from "./LoanConfigStep";
import { PersonalDetailsStep } from "./PersonalDetailsStep";
import { SalarySlipStep } from "./SalarySlipStep";
import { StepIndicator } from "./StepIndicator";

function stepToNumber(step: ApplicationStep): number {
  switch (step) {
    case "personal":
      return 1;
    case "bre":
      return 2;
    case "salary-slip":
      return 3;
    case "loan":
      return 4;
    case "complete":
      return 5;
    default:
      return 1;
  }
}

export function ApplicationWizard() {
  const [application, setApplication] = useState<LoanApplicationState | null>(null);
  const [activeStep, setActiveStep] = useState<ApplicationStep>("personal");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoadError(null);
    setIsLoading(true);
    try {
      const state = await getApplication();
      setApplication(state);
      setActiveStep(state.currentStep === "complete" ? "complete" : state.currentStep);
    } catch (err) {
      setLoadError(err instanceof ApiRequestError ? err.message : "Failed to load application.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  function handleUpdate(updated: LoanApplicationState, advance = true) {
    setApplication(updated);
    if (advance) {
      if (updated.status === "applied") {
        setActiveStep("complete");
      } else {
        setActiveStep(updated.currentStep);
      }
    }
  }

  if (isLoading) {
    return <p className="text-sm text-slate-600">Loading your application…</p>;
  }

  if (loadError || !application) {
    return (
      <div className="space-y-3">
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {loadError ?? "Unable to load application."}
        </p>
        <button
          type="button"
          onClick={() => void refresh()}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const indicatorStep = Math.min(stepToNumber(activeStep), 4);

  return (
    <div className="space-y-8">
      {activeStep !== "complete" && <StepIndicator activeStep={indicatorStep} />}

      {activeStep === "personal" && (
        <PersonalDetailsStep
          application={application}
          onSaved={(updated) => {
            handleUpdate(updated);
            setActiveStep("bre");
          }}
        />
      )}

      {activeStep === "bre" && (
        <BreValidationStep
          application={application}
          onValidated={(updated) => handleUpdate(updated)}
          onBack={() => setActiveStep("personal")}
        />
      )}

      {activeStep === "salary-slip" && (
        <SalarySlipStep
          application={application}
          onUploaded={(updated) => handleUpdate(updated)}
          onBack={() => setActiveStep("bre")}
        />
      )}

      {activeStep === "loan" && (
        <LoanConfigStep
          application={application}
          onSubmitted={(updated) => handleUpdate(updated)}
          onBack={() => setActiveStep("salary-slip")}
        />
      )}

      {activeStep === "complete" && <ApplicationComplete application={application} />}
    </div>
  );
}
