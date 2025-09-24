// © 2025 Kaustav Ray. All rights reserved.
// Licensed under the MIT License.

import mongoose from "mongoose";

const MONGODB_URIS = [
  "mongodb+srv://6oqfc2o1_db_user:iJTrD7ic9z0euOF2@cluster0.aydzhbg.mongodb.net/movies?retryWrites=true&w=majority&appName=Cluster0",
  // You can add more URIs here for failover in future
];

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

/**
 * Connect to MongoDB using the first available URI.
 * If the first URI fails, it automatically tries the next.
 */
export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = (async () => {
      for (const uri of MONGODB_URIS) {
        try {
          const conn = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });
          console.log("✅ MongoDB connected:", uri);
          return conn;
        } catch (err) {
          console.warn("❌ Failed to connect with URI:", uri, err.message);
        }
      }
      throw new Error("All MongoDB URIs failed!");
    })();
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
