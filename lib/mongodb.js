import mongoose from "mongoose";

// Keep only 3 URIs
const MONGODB_URIS = [
  "mongodb+srv://6oqfc2o1_db_user:iJTrD7ic9z0euOF2@cluster0.aydzhbg.mongodb.net/db1?retryWrites=true&w=majority",
  "mongodb+srv://6oqfc2o1_db_user:iJTrD7ic9z0euOF2@cluster0.aydzhbg.mongodb.net/db2?retryWrites=true&w=majority",
  "mongodb+srv://6oqfc2o1_db_user:iJTrD7ic9z0euOF2@cluster0.aydzhbg.mongodb.net/db3?retryWrites=true&w=majority",
];

// Cache connections
let connections = [];
let activeIndex = 0;

export async function connectDB() {
  if (connections[activeIndex] && connections[activeIndex].readyState === 1) {
    return connections[activeIndex];
  }

  // Try all 3 URIs until one connects
  for (let i = 0; i < MONGODB_URIS.length; i++) {
    try {
      const conn = await mongoose.createConnection(MONGODB_URIS[i], {
        dbName: "movies",
      }).asPromise();

      connections[i] = conn;
      activeIndex = i;

      console.log(`✅ Connected to MongoDB URI ${i + 1}`);
      return conn;
    } catch (err) {
      console.error(`❌ Failed to connect to URI ${i + 1}:`, err.message);
    }
  }

  throw new Error("All MongoDB URIs failed to connect");
}

// Get active connection
export function getActiveConnection() {
  return connections[activeIndex];
}

// Switch to next URI (used if full)
export async function switchDB() {
  activeIndex = (activeIndex + 1) % MONGODB_URIS.length;
  return connectDB();
}
