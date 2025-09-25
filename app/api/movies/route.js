// © 2025 Kaustav Ray. All rights reserved.
// Licensed under the MIT License.

import { connectDB, moveToNextUri, getCurrentUriIndex } from "@/lib/mongodb";
import Movie from "@/models/Movie";
import { NextResponse } from "next/server";

const MAX_MOVIES_PER_URI = 1000; // Example: max movies per DB before switching

async function checkAndSwitchUri() {
  const count = await Movie.countDocuments();
  if (count >= MAX_MOVIES_PER_URI) {
    moveToNextUri();
    await connectDB();
  }
}

// GET: Fetch movies (with optional search)
export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  let filter = {};
  if (query) {
    filter = { title: { $regex: query, $options: "i" } };
  }

  const movies = await Movie.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Movie.countDocuments(filter);

  return NextResponse.json({ movies, total, page, limit });
}

// POST: Add new movie
export async function POST(req) {
  try {
    await connectDB();
    await checkAndSwitchUri();
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
    if (!id) return NextResponse.json({ error: "Missing movie id" }, { status: 400 });

    const deleted = await Movie.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Movie not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
