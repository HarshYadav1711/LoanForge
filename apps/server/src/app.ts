import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { apiRouter } from "./routes";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api", apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
