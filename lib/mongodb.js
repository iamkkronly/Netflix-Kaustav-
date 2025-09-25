// © 2025 Kaustav Ray. All rights reserved.
// Licensed under the MIT License.

import mongoose from "mongoose";

// Keep only 3 MongoDB URIs
const MONGODB_URIS = [
  "mongodb+srv://6oqfc2o1_db_user:iJTrD7ic9z0euOF2@cluster0.aydzhbg.mongodb.net/?retryWrites=true&w=majority",
  "mongodb+srv://6oqfc2o1_db_user:iJTrD7ic9z0euOF2@cluster1.aydzhbg.mongodb.net/?retryWrites=true&w=majority",
  "mongodb+srv://6oqfc2o1_db_user:iJTrD7ic9z0euOF2@cluster2.aydzhbg.mongodb.net/?retryWrites=true&w=majority",
];

let isConnected = false;
let currentUriIndex = 0;

// Connect to MongoDB with automatic fallback
export async function connectDB() {
  if (isConnected) return;

  while (currentUriIndex < MONGODB_URIS.length) {
    try {
      await mongoose.connect(MONGODB_URIS[currentUriIndex], {
        dbName: "movies",
      });
      isConnected = true;
      console.log("✅ MongoDB connected to URI:", currentUriIndex + 1);
      break;
    } catch (err) {
      console.error(
        "❌ MongoDB connection failed for URI",
        currentUriIndex + 1,
        err
      );
      currentUriIndex++;
    }
  }

  if (!isConnected) {
    // If all URIs fail, start overwriting from first
    currentUriIndex = 0;
    await mongoose.connect(MONGODB_URIS[currentUriIndex], { dbName: "movies" });
    isConnected = true;
    console.log("⚠ All URIs full/fail. Connected to first URI for overwrite.");
  }
}

// Helper to get current URI index for saving logic
export function getCurrentUriIndex() {
  return currentUriIndex;
}

// Function to switch to next URI (overwrite logic)
export function moveToNextUri() {
  currentUriIndex = (currentUriIndex + 1) % MONGODB_URIS.length;
  isConnected = false;
}
