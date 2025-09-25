// © 2025 Kaustav Ray. All rights reserved.
// Licensed under the MIT License.

import { MongoClient } from "mongodb";

// ✅ Hardcoded 3 MongoDB URIs (no env)
const uris = [
  "mongodb+srv://6oqfc2o1_db_user:iJTrD7ic9z0euOF2@cluster0.aydzhbg.mongodb.net/?retryWrites=true&w=majority",
  "mongodb+srv://6oqfc2o1_db_user:iJTrD7ic9z0euOF2@cluster1.aydzhbg.mongodb.net/?retryWrites=true&w=majority",
  "mongodb+srv://6oqfc2o1_db_user:iJTrD7ic9z0euOF2@cluster2.aydzhbg.mongodb.net/?retryWrites=true&w=majority",
];

const DB_NAME = "moviesDB";
const COLLECTION = "movies";

// Cache clients so we don’t reconnect every request
let clients = [null, null, null];

/**
 * Connect to one of the MongoDB URIs.
 * @param {number} index - DB index (0,1,2)
 * @returns {Promise<{ client: MongoClient, db: any, collection: any }>}
 */
export async function connectDB(index = 0) {
  if (!uris[index]) throw new Error("Invalid DB index");

  if (!clients[index]) {
    clients[index] = new MongoClient(uris[index]);
    await clients[index].connect();
    console.log(`✅ Connected to MongoDB URI ${index + 1}`);
  }

  const db = clients[index].db(DB_NAME);
  const collection = db.collection(COLLECTION);

  return { client: clients[index], db, collection };
}

/**
 * Try connecting sequentially until one works (fallback).
 * @returns {Promise<{ client: MongoClient, db: any, collection: any, index: number }>}
 */
export async function connectWithFallback() {
  for (let i = 0; i < uris.length; i++) {
    try {
      const conn = await connectDB(i);
      return { ...conn, index: i };
    } catch (err) {
      console.error(`❌ Failed to connect URI ${i + 1}:`, err.message);
    }
  }
  throw new Error("All MongoDB URIs failed");
}

/**
 * Get all DB connections (used when merging data across DBs)
 */
export async function getAllConnections() {
  const conns = [];
  for (let i = 0; i < uris.length; i++) {
    try {
      const conn = await connectDB(i);
      conns.push({ ...conn, index: i });
    } catch (err) {
      console.error(`❌ Skipping DB${i + 1}:`, err.message);
    }
  }
  return conns;
}
