import "dotenv/config";
import { USER_ROLES, type UserRole } from "@loanforge/shared";
import { connectDatabase, disconnectDatabase } from "../config/database";
import { createUserWithRole } from "../services/auth.service";

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

  console.log(`\nPassword for all seed accounts: ${SEED_PASSWORD}`);
  console.log("Seed complete.");

  await disconnectDatabase();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
