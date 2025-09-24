import mongoose from "mongoose";

// Hardcoded MongoDB URI
const MONGODB_URI =
  "mongodb+srv://6oqfc2o1_db_user:iJTrD7ic9z0euOF2@cluster0.aydzhbg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

let isConnected = false;

/**
 * Connect to MongoDB with caching.
 * Prevents multiple connections during hot reloads.
 */
export async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
}
