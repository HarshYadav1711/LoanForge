"use client";

import { SALARY_SLIP_MAX_BYTES } from "@loanforge/shared";
import { useRef, useState, type ChangeEvent } from "react";
import type { LoanApplicationState } from "@loanforge/shared";
import { ApiRequestError } from "@/lib/api";
import { uploadSalarySlip } from "@/lib/borrower-api";

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

type SalarySlipStepProps = {
  application: LoanApplicationState;
  onUploaded: (application: LoanApplicationState) => void;
  onBack: () => void;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SalarySlipStep({ application, onUploaded, onBack }: SalarySlipStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  function validateFile(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Only PDF, JPG, and PNG files are allowed.";
    }
    if (file.size > SALARY_SLIP_MAX_BYTES) {
      return "File must be 5 MB or smaller.";
    }
    return null;
  }

  async function handleUpload(file: File) {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);
    try {
      const updated = await uploadSalarySlip(file);
      onUploaded(updated);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    await handleUpload(file);
    event.target.value = "";
  }

  const existing = application.salarySlip;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-medium text-slate-900">Salary slip</h2>
        <p className="mt-1 text-sm text-slate-600">
          Upload your latest salary slip (PDF, JPG, or PNG, max 5 MB).
        </p>
      </div>

      {existing && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <p className="font-medium">Uploaded: {existing.originalName}</p>
          <p className="mt-1 text-emerald-700">
            {formatBytes(existing.size)} · {existing.mimeType}
          </p>
        </div>
      )}

      <label htmlFor="salary-slip-upload" className="sr-only">
        Upload salary slip (PDF, JPG, or PNG, max 5 MB)
      </label>
      <input
        id="salary-slip-upload"
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        className="hidden"
        onChange={onFileChange}
      />

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to eligibility
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {isUploading ? "Uploading…" : existing ? "Replace file" : "Choose file"}
        </button>
        {existing && (
          <button
            type="button"
            onClick={() => onUploaded(application)}
            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Continue to loan setup
          </button>
        )}
      </div>
    </div>
  );
}
