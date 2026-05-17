import "dotenv/config";
import mongoose from "mongoose";
import { USER_ROLES, type UserRole } from "@loanforge/shared";
import { connectDatabase, disconnectDatabase } from "../config/database";
import { Loan } from "../models/Loan";
import { LoanApplication } from "../models/LoanApplication";
import { Payment } from "../models/Payment";
import { User } from "../models/User";
import { hashPassword } from "../services/auth.service";
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

/** Upsert seed user and always reset password (safe to re-run). */
async function ensureSeedUser(account: {
  email: string;
  role: UserRole;
  name: string;
}): Promise<void> {
  const email = account.email.trim().toLowerCase();
  const passwordHash = await hashPassword(SEED_PASSWORD);

  await User.findOneAndUpdate(
    { email },
    { email, passwordHash, role: account.role, name: account.name },
    { upsert: true },
  );
}

async function resetBorrowerDemo(userId: { toString(): string }): Promise<void> {
  const applications = await LoanApplication.find({ userId });
  const applicationIds = applications.map((a) => a._id);
  const loans = await Loan.find({
    $or: [{ borrowerId: userId }, { applicationId: { $in: applicationIds } }],
  });
  const loanIds = loans.map((l) => l._id);
  if (loanIds.length > 0) {
    await Payment.deleteMany({ loanId: { $in: loanIds } });
    await Loan.deleteMany({ _id: { $in: loanIds } });
  }
  if (applicationIds.length > 0) {
    await LoanApplication.deleteMany({ _id: { $in: applicationIds } });
  }
}

async function seedOperationsData(): Promise<void> {
  await ensureSeedUser({
    email: "lead@loanforge.test",
    role: "borrower",
    name: "Lead Prospect",
  });
  const leadUser = await User.findOne({ email: "lead@loanforge.test" });
  if (!leadUser) {
    throw new Error("Failed to create lead@loanforge.test");
  }

  await resetBorrowerDemo(leadUser._id);

  const leadApp = await LoanApplication.create({
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

  await ensureSeedUser({
    email: "borrower@loanforge.test",
    role: "borrower",
    name: "Borrower User",
  });
  const borrower = await User.findOne({ email: "borrower@loanforge.test" });
  if (!borrower) {
    throw new Error("Failed to create borrower@loanforge.test");
  }

  await resetBorrowerDemo(borrower._id);

  const borrowerApp = await LoanApplication.create({
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

  console.log("\nOperations seed:");
  console.log(`  Sales lead: ${leadUser.email} (draft application)`);
  console.log(`  Sanction queue: ${borrower.email} (applied loan)`);
}

async function seed(): Promise<void> {
  await connectDatabase();

  const dbName = mongoose.connection.db?.databaseName ?? "(unknown)";
  console.log(`Connected to MongoDB database: ${dbName}`);
  if (dbName !== "loanforge") {
    console.warn(
      "  Warning: expected database name 'loanforge'. Check MONGODB_URI includes /loanforge before the query string.",
    );
  }

  console.log("\nSeeding users (one per role)...\n");

  for (const role of USER_ROLES) {
    const account = SEED_ACCOUNTS.find((a) => a.role === role);
    if (!account) continue;

    await ensureSeedUser(account);
    console.log(`  ${role.padEnd(14)} ${account.email}`);
  }

  await seedOperationsData();

  console.log(`\nPassword for all seed accounts: ${SEED_PASSWORD}`);
  console.log("Seed complete.");

  await disconnectDatabase();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  if (err && typeof err === "object" && "code" in err && err.code === "ECONNREFUSED") {
    console.error(
      "\nCould not reach MongoDB. Check Atlas cluster is running, Network Access allows your IP (or 0.0.0.0/0), and try a standard (non-SRV) connection string from Atlas if this persists.",
    );
  }
  process.exit(1);
});
