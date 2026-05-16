import "dotenv/config";
import { connectDatabase, disconnectDatabase } from "../config/database";

async function seed(): Promise<void> {
  await connectDatabase();

  // Seed scripts for demo users and sample data will live here.
  console.log("Seed complete (no data seeded yet).");

  await disconnectDatabase();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
