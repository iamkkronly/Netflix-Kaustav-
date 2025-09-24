// © 2025 Kaustav Ray. All rights reserved.
// Licensed under the MIT License.

import { connectDB } from "@/lib/mongodb";
import Movie from "@/models/Movie";
import { NextResponse } from "next/server";

// GET: Fetch all movies
export async function GET() {
  await connectDB();
  const movies = await Movie.find().sort({ createdAt: -1 });
  return NextResponse.json(movies);
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
