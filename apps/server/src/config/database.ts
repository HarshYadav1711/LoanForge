import mongoose from "mongoose";
import { env } from "./env";

async function collectionExists(collectionName: string): Promise<boolean> {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("MongoDB connection is not established.");
  }

  const collections = await db.listCollections({ name: collectionName }).toArray();
  return collections.length > 0;
}

async function dropStaleIndexes(
  collectionName: string,
  indexNames: readonly string[],
): Promise<void> {
  if (!(await collectionExists(collectionName))) {
    return;
  }

  const collection = mongoose.connection.collection(collectionName);
  const indexes = await collection.indexes();

  for (const name of indexNames) {
    if (indexes.some((index) => index.name === name)) {
      await collection.dropIndex(name);
    }
  }
}

/** Indexes left from an older schema can break inserts (e.g. unique on a removed field). */
async function migrateStaleIndexes(): Promise<void> {
  await dropStaleIndexes("users", ["phone_1"]);
  await dropStaleIndexes("loans", ["applicationNumber_1"]);
  await dropStaleIndexes("loanapplications", ["userId_1"]);
}

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(env.mongodbUri, {
    // Prefer IPv4 — avoids querySrv ECONNREFUSED on some Windows/VPN DNS setups.
    family: 4,
    serverSelectionTimeoutMS: 15_000,
  });
  await migrateStaleIndexes();
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
