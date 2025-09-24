/**
 * MongoDB Connection Library with Failover Support
 *
 * This module allows you to define multiple MongoDB URIs.
 * If one URI fails (e.g., connection pool full, network issue),
 * it will automatically try the next URI in the list.
 *
 * Usage:
 *   import { connectDB } from "@/lib/mongodb";
 *   await connectDB();
 */

import mongoose from "mongoose";

/**
 * Add your MongoDB URIs here.
 * You can add as many as needed for failover.
 */
const MONGODB_URIS = [
  "mongodb+srv://6oqfc2o1_db_user:iJTrD7ic9z0euOF2@cluster0.aydzhbg.mongodb.net/movies?retryWrites=true&w=majority&appName=Cluster0",
  // Example of another URI for future failover:
  // "mongodb+srv://another_user:password@cluster1.mongodb.net/movies?retryWrites=true&w=majority",
];

/** Cached connection state */
let isConnected = false;

/**
 * Connect to MongoDB using the first available URI.
 * Tries each URI in sequence until a connection is successful.
 * Throws an error if all URIs fail.
 */
export async function connectDB() {
  if (isConnected) return;

  for (const uri of MONGODB_URIS) {
    try {
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      isConnected = true;
      console.log("✅ MongoDB connected successfully:", uri);
      return;
    } catch (err) {
      console.warn(
        "❌ Failed to connect to MongoDB with URI:",
        uri,
        "\nError:",
        err.message
      );
      // Try the next URI automatically
    }
  }

  // If none of the URIs worked
  console.error("❌ All MongoDB URIs failed to connect!");
  throw new Error("All MongoDB connections failed");
}
