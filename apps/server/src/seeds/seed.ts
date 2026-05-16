import "dotenv/config";
import { USER_ROLES, type UserRole } from "@loanforge/shared";
import { connectDatabase, disconnectDatabase } from "../config/database";
import { LoanApplication } from "../models/LoanApplication";
import { createUserWithRole } from "../services/auth.service";
import { createLoanFromApplication } from "../services/loan.service";

const SEED_PASSWORD = "Password1!";

const SEED_ACCOUNTS: ReadonlyArray<{
  email: string;
  role: UserRole;
  name: string;
}> = [
  { email: "admin@loanforge.test", role: "admin", name: "Admin User" },
  { email: "sales@loanforge.test", role: "sales", name: "Sales User" },
  { email: "sanction@loanforge.test", role: "sanction", name: "Sanction User" },
  {
    email: "disbursement@loanforge.test",
    role: "disbursement",
    name: "Disbursement User",
  },
  {
    email: "collection@loanforge.test",
    role: "collection",
    name: "Collection User",
  },
  { email: "borrower@loanforge.test", role: "borrower", name: "Borrower User" },
];

async function seedOperationsData(): Promise<void> {
  const leadUser = await createUserWithRole(
    "lead@loanforge.test",
    SEED_PASSWORD,
    "borrower",
    "Lead Prospect",
  );

  let leadApp = await LoanApplication.findOne({ userId: leadUser._id });
  if (!leadApp) {
    leadApp = await LoanApplication.create({
      userId: leadUser._id,
      status: "draft",
      personalDetails: {
        fullName: "Priya Sharma",
        dateOfBirth: "1992-06-15",
        pan: "ABCDE1234F",
        employmentMode: "salaried",
        monthlySalary: 45000,
      },
      bre: {
        passed: true,
        failures: [],
        checkedAt: new Date().toISOString(),
      },
    });
  }

  const borrower = await createUserWithRole(
    "borrower@loanforge.test",
    SEED_PASSWORD,
    "borrower",
    "Borrower User",
  );

  let borrowerApp = await LoanApplication.findOne({ userId: borrower._id });
  if (!borrowerApp || borrowerApp.status !== "applied") {
    if (borrowerApp) {
      await LoanApplication.deleteOne({ _id: borrowerApp._id });
    }
    borrowerApp = await LoanApplication.create({
      userId: borrower._id,
      status: "applied",
      personalDetails: {
        fullName: "Rahul Verma",
        dateOfBirth: "1990-03-20",
        pan: "FGHIJ5678K",
        employmentMode: "salaried",
        monthlySalary: 75000,
      },
      bre: {
        passed: true,
        failures: [],
        checkedAt: new Date().toISOString(),
      },
      salarySlip: {
        originalName: "salary-slip.pdf",
        storedPath: "seed/salary-slip.pdf",
        mimeType: "application/pdf",
        size: 1024,
        uploadedAt: new Date().toISOString(),
      },
      loan: {
        amount: 150000,
        tenureDays: 180,
        interestRate: 0.12,
        interestAmount: 8860.27,
        totalRepayment: 158860.27,
      },
    });
    await createLoanFromApplication(borrowerApp._id.toString());
  }

  console.log("\nOperations seed:");
  console.log(`  Sales lead: ${leadUser.email} (draft application)`);
  console.log(`  Sanction queue: ${borrower.email} (applied loan)`);
}

async function seed(): Promise<void> {
  await connectDatabase();

  console.log("Seeding users (one per role)...\n");

  for (const role of USER_ROLES) {
    const account = SEED_ACCOUNTS.find((a) => a.role === role);
    if (!account) continue;

    await createUserWithRole(
      account.email,
      SEED_PASSWORD,
      account.role,
      account.name,
    );
    console.log(`  ${role.padEnd(14)} ${account.email}`);
  }

  await seedOperationsData();

  console.log(`\nPassword for all seed accounts: ${SEED_PASSWORD}`);
  console.log("Seed complete.");

  await disconnectDatabase();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
