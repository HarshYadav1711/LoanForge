import "dotenv/config";
import fs from "fs";
import { createApp } from "./app";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";

function printPortInUseMessage(port: number): void {
  const lines = [
    "",
    "LoanForge API could not start — port already in use",
    "────────────────────────────────────────────────────",
    `  Port:     ${port} (from PORT in apps/server/.env)`,
    "",
    "  Free the port:",
    "    Windows (PowerShell):",
    `      netstat -ano | findstr ":${port}"`,
    "      taskkill /PID <pid> /F",
    "",
    "    macOS / Linux:",
    `      lsof -i :${port}`,
    "      kill <pid>",
    "",
    "  Use a different port:",
    "    1. Set PORT in apps/server/.env",
    "    2. Set NEXT_PUBLIC_API_URL in apps/web/.env.local to the same host/port (include /api)",
    "",
  ];
  console.error(lines.join("\n"));
}

async function bootstrap(): Promise<void> {
  fs.mkdirSync(env.uploadDir, { recursive: true });

  await connectDatabase();

  const app = createApp();
  const server = app.listen(env.port);

  server.on("listening", () => {
    console.log(`LoanForge API listening on http://localhost:${env.port}`);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      printPortInUseMessage(env.port);
      process.exit(1);
    }

    console.error("LoanForge API could not start:", err.message);
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err instanceof Error ? err.message : err);
  process.exit(1);
});
