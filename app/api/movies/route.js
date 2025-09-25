// app/api/movies/route.js
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectWithFallback, getAllConnections } from "@/lib/mongodb";

const MOVIE_LIMIT = 100; // max movies per DB

// 📌 GET: Fetch all movies
export async function GET() {
  try {
    const conns = await getAllConnections();

    let allMovies = [];
    for (const { collection } of conns) {
      const movies = await collection.find({}).sort({ createdAt: -1 }).toArray();
      allMovies = allMovies.concat(movies);
    }

    // Sort all movies across DBs
    allMovies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json(allMovies);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 📌 POST: Add movie (fallback + overwrite oldest if full)
export async function POST(req) {
  try {
    const data = await req.json();
    data.createdAt = new Date();

    // Try inserting into one of the DBs
    for (let i = 0; i < 3; i++) {
      const { collection } = await connectWithFallback();
      const count = await collection.countDocuments();

      if (count < MOVIE_LIMIT) {
        await collection.insertOne(data);
        return NextResponse.json(data, { status: 201 });
      }
    }

    // All DBs full → overwrite oldest in DB1
    const { collection } = await connectWithFallback();
    const oldest = await collection.find().sort({ createdAt: 1 }).limit(1).toArray();

    if (oldest.length > 0) {
      await collection.replaceOne({ _id: oldest[0]._id }, data);
      return NextResponse.json({ ...data, overwritten: true }, { status: 201 });
    }

    return NextResponse.json({ error: "Unable to save movie" }, { status: 500 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// 📌 DELETE: Remove movie by ID
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing movie id" }, { status: 400 });

    const conns = await getAllConnections();

    for (const { collection } of conns) {
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount > 0) {
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ error: "Movie not found" }, { status: 404 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
// DELETE → delete movie from all DBs
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing movie id" }, { status: 400 });

    for (const uri of uris) {
      const client = await getClient(uri);
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION);

      const deleted = await collection.findOneAndDelete({ _id: new ObjectId(id) });

      await client.close();

      if (deleted.value) {
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ error: "Movie not found" }, { status: 404 });
  } catch (err) {
    console.error("DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete movie" }, { status: 500 });
  }
}
