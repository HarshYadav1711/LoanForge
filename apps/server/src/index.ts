import "dotenv/config";
import fs from "fs";
import { createApp } from "./app";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";

async function bootstrap(): Promise<void> {
  fs.mkdirSync(env.uploadDir, { recursive: true });

  await connectDatabase();

  const app = createApp();

  app.listen(env.port, () => {
    console.log(`LoanForge API listening on http://localhost:${env.port}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
