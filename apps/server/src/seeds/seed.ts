import "dotenv/config";
import mongoose from "mongoose";
import { STAFF_ROLES, USER_ROLES, type UserRole } from "@loanforge/shared";
import { connectDatabase, disconnectDatabase } from "../config/database";
import { Loan } from "../models/Loan";
import { LoanApplication } from "../models/LoanApplication";
import { Payment } from "../models/Payment";
import { User } from "../models/User";
import {
  login,
  upsertSeedUser,
  verifyStoredCredentials,
  type SeedUserUpsertResult,
} from "../services/auth.service";
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

const EXTRA_SEED_ACCOUNTS: ReadonlyArray<{
  email: string;
  role: UserRole;
  name: string;
}> = [
  { email: "lead@loanforge.test", role: "borrower", name: "Lead Prospect" },
];

function logUpsert(email: string, role: UserRole, result: SeedUserUpsertResult): void {
  const label = result.toUpperCase().padEnd(7);
  console.log(`  [${label}] ${role.padEnd(14)} ${email}`);
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
  console.log("\nSeeding demo loan data...\n");

  await upsertSeedUser(
    "lead@loanforge.test",
    SEED_PASSWORD,
    "borrower",
    "Lead Prospect",
  );
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

  await upsertSeedUser(
    "borrower@loanforge.test",
    SEED_PASSWORD,
    "borrower",
    "Borrower User",
  );
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

  console.log(`  Demo lead: ${leadUser.email} (draft application)`);
  console.log(`  Demo borrower loan: ${borrower.email} (applied)`);
}

async function verifySeedAccounts(
  accounts: ReadonlyArray<{ email: string; role: UserRole }>,
): Promise<void> {
  console.log("\nVerifying stored credentials (bcrypt)...\n");

  for (const account of accounts) {
    const user = await User.findOne({ email: account.email });
    if (!user) {
      throw new Error(`Missing user in database: ${account.email}`);
    }
    if (user.role !== account.role) {
      throw new Error(
        `Role mismatch for ${account.email}: expected ${account.role}, got ${user.role}`,
      );
    }

    const hashOk = await verifyStoredCredentials(account.email, SEED_PASSWORD);
    if (!hashOk) {
      throw new Error(`Password hash verification failed for ${account.email}`);
    }

    console.log(`  OK  ${account.role.padEnd(14)} ${account.email}`);
  }
}

async function verifyLoginFlow(): Promise<void> {
  console.log("\nVerifying login() for operational accounts...\n");

  for (const role of STAFF_ROLES) {
    const account = SEED_ACCOUNTS.find((a) => a.role === role);
    if (!account) continue;

    const response = await login({ email: account.email, password: SEED_PASSWORD });
    if (response.user.role !== role) {
      throw new Error(`login() returned wrong role for ${account.email}`);
    }
    console.log(`  OK  login ${account.email} → role ${response.user.role}`);
  }
}

async function printDatabaseSummary(): Promise<void> {
  const users = await User.find().sort({ role: 1, email: 1 }).select("email role");
  const operational = users.filter((u) =>
    (STAFF_ROLES as readonly string[]).includes(u.role),
  );

  console.log("\nMongoDB users summary:");
  console.log(`  Total users: ${users.length}`);
  console.log(`  Operational (staff): ${operational.length}`);
  for (const user of operational) {
    console.log(`    - ${user.role.padEnd(14)} ${user.email}`);
  }
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

    const result = await upsertSeedUser(
      account.email,
      SEED_PASSWORD,
      account.role,
      account.name,
    );
    logUpsert(account.email, account.role, result);
  }

  await seedOperationsData();

  const allAccounts = [...SEED_ACCOUNTS, ...EXTRA_SEED_ACCOUNTS];
  await verifySeedAccounts(allAccounts);
  await verifyLoginFlow();
  await printDatabaseSummary();

  console.log(`\nPassword for all seed accounts: ${SEED_PASSWORD}`);
  console.log("Seed complete.");
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
