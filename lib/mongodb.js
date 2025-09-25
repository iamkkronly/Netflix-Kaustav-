// lib/mongodb.js
// Multiple MongoDB URIs with fallback + reuse

import { MongoClient } from "mongodb";

// ✅ Hardcoded 3 MongoDB URIs
const uris = [
  "mongodb+srv://6oqfc2o1_db_user:iJTrD7ic9z0euOF2@cluster0.aydzhbg.mongodb.net/?retryWrites=true&w=majority",
  "mongodb+srv://6oqfc2o1_db_user:iJTrD7ic9z0euOF2@cluster1.aydzhbg.mongodb.net/?retryWrites=true&w=majority",
  "mongodb+srv://6oqfc2o1_db_user:iJTrD7ic9z0euOF2@cluster2.aydzhbg.mongodb.net/?retryWrites=true&w=majority",
];

const DB_NAME = "moviesDB";
const COLLECTION = "movies";

// Cache connections (so Vercel doesn’t reconnect each time)
let clients = [null, null, null];

/**
 * Connect to specific DB by index
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
 * Try connecting sequentially (DB1 → DB2 → DB3)
 */
export async function connectWithFallback() {
  for (let i = 0; i < uris.length; i++) {
    try {
      const conn = await connectDB(i);
      return { ...conn, index: i };
    } catch (err) {
      console.error(`❌ Failed to connect DB${i + 1}:`, err.message);
    }
  }
  throw new Error("All MongoDB URIs failed");
}

/**
 * Connect to all DBs at once
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
