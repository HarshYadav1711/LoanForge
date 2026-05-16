"use client";

import type { ApplicationStep, LoanApplicationState } from "@loanforge/shared";
import { useCallback, useEffect, useState } from "react";
import { AsyncState } from "@/components/ui/AsyncState";
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

  if (isLoading || loadError || !application) {
    return (
      <AsyncState
        isLoading={isLoading}
        error={loadError ?? (!application && !isLoading ? "Unable to load application." : null)}
        loadingMessage="Loading your application…"
        onRetry={() => void refresh()}
      >
        <></>
      </AsyncState>
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
