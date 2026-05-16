"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  EMPLOYMENT_MODES,
  personalDetailsSchema,
  type LoanApplicationState,
  type PersonalDetailsInput,
} from "@loanforge/shared";
import { useForm } from "react-hook-form";
import { ApiRequestError } from "@/lib/api";
import { savePersonalDetails } from "@/lib/borrower-api";
import { FormField, inputClassName } from "./form-field";

type PersonalDetailsStepProps = {
  application: LoanApplicationState;
  onSaved: (application: LoanApplicationState) => void;
};

export function PersonalDetailsStep({ application, onSaved }: PersonalDetailsStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<PersonalDetailsInput>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: application.personalDetails ?? {
      fullName: "",
      dateOfBirth: "",
      pan: "",
      employmentMode: "salaried",
      monthlySalary: 25000,
    },
  });

  async function onSubmit(values: PersonalDetailsInput) {
    try {
      const updated = await savePersonalDetails(values);
      onSaved(updated);
    } catch (err) {
      const message =
        err instanceof ApiRequestError ? err.message : "Unable to save personal details.";
      setError("root", { message });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <h2 className="text-lg font-medium text-slate-900">Personal details</h2>
        <p className="mt-1 text-sm text-slate-600">
          Tell us about yourself. These details are used for eligibility checks.
        </p>
      </div>

      <FormField label="Full name" htmlFor="fullName" error={errors.fullName?.message}>
        <input id="fullName" className={inputClassName} {...register("fullName")} />
      </FormField>

      <FormField label="Date of birth" htmlFor="dateOfBirth" error={errors.dateOfBirth?.message}>
        <input
          id="dateOfBirth"
          type="date"
          className={inputClassName}
          {...register("dateOfBirth")}
        />
      </FormField>

      <FormField label="PAN" htmlFor="pan" error={errors.pan?.message}>
        <input
          id="pan"
          className={inputClassName}
          placeholder="ABCDE1234F"
          autoCapitalize="characters"
          {...register("pan")}
        />
      </FormField>

      <FormField
        label="Employment mode"
        htmlFor="employmentMode"
        error={errors.employmentMode?.message}
      >
        <select id="employmentMode" className={inputClassName} {...register("employmentMode")}>
          {EMPLOYMENT_MODES.map((mode) => (
            <option key={mode} value={mode}>
              {mode === "salaried"
                ? "Salaried"
                : mode === "self-employed"
                  ? "Self-employed"
                  : "Unemployed"}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        label="Monthly salary (₹)"
        htmlFor="monthlySalary"
        error={errors.monthlySalary?.message}
      >
        <input
          id="monthlySalary"
          type="number"
          min={0}
          step={1000}
          className={inputClassName}
          {...register("monthlySalary", { valueAsNumber: true })}
        />
      </FormField>

      {errors.root && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {errors.root.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {isSubmitting ? "Saving…" : "Continue to eligibility check"}
      </button>
    </form>
  );
}
