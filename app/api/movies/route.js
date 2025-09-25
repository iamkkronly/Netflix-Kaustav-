import { connectDB, getActiveConnection, switchDB } from "@/lib/mongodb";
import MovieSchema from "@/models/Movie";
import { NextResponse } from "next/server";

// Helper: ensure model is registered per connection
function getMovieModel(conn) {
  return conn.models.Movie || conn.model("Movie", MovieSchema);
}

// GET → Fetch all movies (latest first)
export async function GET() {
  try {
    const conn = await connectDB();
    const Movie = getMovieModel(conn);

    const movies = await Movie.find().sort({ createdAt: -1 });
    return NextResponse.json(movies);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST → Add new movie (switch DB if full, overwrite if all full)
export async function POST(req) {
  try {
    let conn = await connectDB();
    let Movie = getMovieModel(conn);
    const data = await req.json();

    try {
      // Save normally
      const movie = await Movie.create(data);
      return NextResponse.json(movie, { status: 201 });
    } catch (err) {
      console.error("⚠ Error saving movie:", err.message);

      // If "full" error → try switching DB
      conn = await switchDB();
      Movie = getMovieModel(conn);

      try {
        const movie = await Movie.create(data);
        return NextResponse.json(movie, { status: 201 });
      } catch (err2) {
        console.error("⚠ All DBs full, overwriting oldest...");

        // Overwrite oldest movie in current DB
        const oldest = await Movie.findOne().sort({ createdAt: 1 });
        if (oldest) {
          oldest.title = data.title;
          oldest.thumbnail = data.thumbnail;
          oldest.description = data.description || "";
          await oldest.save();
          return NextResponse.json(oldest, { status: 201 });
        } else {
          // If no movies, just create one
          const movie = await Movie.create(data);
          return NextResponse.json(movie, { status: 201 });
        }
      }
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// DELETE → Remove a movie
export async function DELETE(req) {
  try {
    const conn = await connectDB();
    const Movie = getMovieModel(conn);

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
