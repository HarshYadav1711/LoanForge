"use client";

import type { ApplicationStep, LoanApplicationState } from "@loanforge/shared";
import { useCallback, useEffect, useState } from "react";
import { AsyncState } from "@/components/ui/AsyncState";
import { ApiRequestError } from "@/lib/api";
import { ApplicationBlocked } from "@/components/borrower/ApplicationBlocked";
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
  const [blocked, setBlocked] = useState<{ title: string; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoadError(null);
    setBlocked(null);
    setIsLoading(true);
    try {
      const state = await getApplication();
      setApplication(state);
      setActiveStep(state.currentStep === "complete" ? "complete" : state.currentStep);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.code === "ACTIVE_LOAN_EXISTS") {
          setBlocked({
            title: "Active loan in progress",
            message: err.message,
          });
          return;
        }
        if (err.code === "NO_DRAFT_APPLICATION") {
          setBlocked({
            title: "No application in progress",
            message: err.message,
          });
          return;
        }
      }
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

  if (blocked) {
    return <ApplicationBlocked title={blocked.title} message={blocked.message} />;
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
