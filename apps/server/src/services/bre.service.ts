import {
  MAX_AGE,
  MIN_AGE,
  MIN_MONTHLY_SALARY,
  PAN_PATTERN,
  calculateAge,
  type BreCheckResult,
  type PersonalDetails,
} from "@loanforge/shared";

export function runBreChecks(details: PersonalDetails): BreCheckResult {
  const failures: string[] = [];
  const dob = new Date(details.dateOfBirth);

  if (Number.isNaN(dob.getTime())) {
    failures.push("Date of birth is invalid.");
  } else {
    const age = calculateAge(dob);
    if (age < MIN_AGE || age > MAX_AGE) {
      failures.push(`Age must be between ${MIN_AGE} and ${MAX_AGE} years (current: ${age}).`);
    }
  }

  if (details.monthlySalary < MIN_MONTHLY_SALARY) {
    failures.push(
      `Monthly salary must be at least ₹${MIN_MONTHLY_SALARY.toLocaleString("en-IN")}.`,
    );
  }

  const pan = details.pan.trim().toUpperCase();
  if (!PAN_PATTERN.test(pan)) {
    failures.push("PAN must match a valid format (e.g. ABCDE1234F).");
  }

  if (details.employmentMode === "unemployed") {
    failures.push("Employment mode cannot be unemployed.");
  }

  return {
    passed: failures.length === 0,
    failures,
    checkedAt: new Date().toISOString(),
  };
}
