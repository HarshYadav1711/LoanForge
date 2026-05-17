import path from "node:path";
import type { NextConfig } from "next";

const monorepoRoot = path.join(__dirname, "../..");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@loanforge/shared"],
  // Monorepo tracing for production deploys only; in dev this breaks Turbopack route discovery.
  ...(process.env.NODE_ENV === "production"
    ? { outputFileTracingRoot: monorepoRoot }
    : {}),
};

export default nextConfig;
