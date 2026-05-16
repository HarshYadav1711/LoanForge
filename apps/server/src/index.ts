import "dotenv/config";
import fs from "fs";
import { createApp } from "./app";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";

async function bootstrap(): Promise<void> {
  fs.mkdirSync(env.uploadDir, { recursive: true });

  await connectDatabase();

  const app = createApp();

  const server = app.listen(env.port, () => {
    console.log(`LoanForge API listening on http://localhost:${env.port}`);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `Port ${env.port} is already in use. Stop the other process (e.g. an old API server) or set PORT to a different value in apps/server/.env`,
      );
      process.exit(1);
    }
    throw err;
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
