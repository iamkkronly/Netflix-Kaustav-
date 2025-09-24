import { connectDB } from "@/lib/mongodb";
import Movie from "@/models/Movie";
import { NextResponse } from "next/server";

/**
 * DELETE /api/movies/:id
 * Deletes a movie by ID.
 */
export async function DELETE(req, { params }) {
  await connectDB();
  try {
    const { id } = params;
    await Movie.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
