// © 2025 Kaustav Ray. All rights reserved.
// Licensed under the MIT License.

import mongoose from "mongoose";

let isConnected = false;

/**
 * Connect to MongoDB with caching.
 * Prevents multiple connections during hot reloads.
 */
export async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
}
