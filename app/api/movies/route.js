// © 2025 Kaustav Ray. All rights reserved.
// Licensed under the MIT License.

import { connectDB } from "@/lib/mongodb";
import Movie from "@/models/Movie";
import { NextResponse } from "next/server";

/**
 * GET /api/movies
 * Returns all movies sorted by newest first
 */
export async function GET() {
  try {
    await connectDB();
    const movies = await Movie.find().sort({ createdAt: -1 });
    return NextResponse.json(movies, { status: 200 });
  } catch (err) {
    console.error("❌ GET /api/movies failed:", err.message);
    return NextResponse.json(
      { error: "Failed to fetch movies" },
      { status: 503 }
    );
  }
}

/**
 * POST /api/movies
 * Adds a new movie to the database
 * Body: { title, thumbnail, link }
 */
export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();
    const movie = await Movie.create(data);
    return NextResponse.json(movie, { status: 201 });
  } catch (err) {
    console.error("❌ POST /api/movies failed:", err.message);
    return NextResponse.json(
      { error: "Failed to add movie" },
      { status: 503 }
    );
  }
}
