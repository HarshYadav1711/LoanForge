import mongoose from "mongoose";
import { env } from "./env";

async function dropStaleIndexes(
  collectionName: string,
  indexNames: readonly string[],
): Promise<void> {
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
  await dropStaleIndexes("loans", ["applicationNumber_1"]);
  await dropStaleIndexes("loanapplications", ["userId_1"]);
}

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(env.mongodbUri);
  await migrateStaleIndexes();
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
