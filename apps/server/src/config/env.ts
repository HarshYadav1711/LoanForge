import path from "path";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  mongodbUri: required("MONGODB_URI"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:3000",
  uploadDir: path.resolve(
    process.cwd(),
    process.env.UPLOAD_DIR ?? "uploads",
  ),
  isProduction: process.env.NODE_ENV === "production",
} as const;
