import mongoose from "mongoose";
import Movie from "@/models/Movie";
import { NextResponse } from "next/server";

// Multiple MongoDB URIs for fallback
const MONGODB_URIS = [
  "mongodb+srv://6oqfc2o1_db_user:iJTrD7ic9z0euOF2@cluster0.aydzhbg.mongodb.net/?retryWrites=true&w=majority",
  // Add more URIs here if needed
];

let isConnected = false;
let currentUriIndex = 0;

// Connect to MongoDB with fallback
async function connectDB() {
  if (isConnected) return;

  while (currentUriIndex < MONGODB_URIS.length) {
    try {
      await mongoose.connect(MONGODB_URIS[currentUriIndex]);
      isConnected = true;
      console.log("✅ MongoDB connected to URI:", currentUriIndex + 1);
      break;
    } catch (err) {
      console.error("❌ MongoDB connection failed for URI", currentUriIndex + 1, err);
      currentUriIndex++;
    }
  }

  if (!isConnected) throw new Error("All MongoDB connection attempts failed");
}

// GET: Fetch movies with pagination & search
export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);

  const searchQuery = searchParams.get("search") || "";
  const limit = parseInt(searchParams.get("limit") || "10");
  const page = parseInt(searchParams.get("page") || "1");
  const skip = (page - 1) * limit;

  const query = searchQuery
    ? { title: { $regex: searchQuery, $options: "i" } } // case-insensitive fuzzy search
    : {};

  try {
    const movies = await Movie.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({ movies });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Add new movie
export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();
    const movie = await Movie.create(data);
    return NextResponse.json(movie, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// DELETE: Delete a movie by id
export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing movie id" }, { status: 400 });
    }

    const deleted = await Movie.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
