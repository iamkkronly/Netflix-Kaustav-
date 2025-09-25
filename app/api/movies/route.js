// © 2025 Kaustav Ray. All rights reserved.
// Licensed under the MIT License.

import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

// ✅ Hardcoded 3 MongoDB URIs
const uris = [
  "mongodb+srv://6oqfc2o1_db_user:iJTrD7ic9z0euOF2@cluster0.aydzhbg.mongodb.net/?retryWrites=true&w=majority",
  "mongodb+srv://6oqfc2o1_db_user:iJTrD7ic9z0euOF2@cluster1.aydzhbg.mongodb.net/?retryWrites=true&w=majority",
  "mongodb+srv://6oqfc2o1_db_user:iJTrD7ic9z0euOF2@cluster2.aydzhbg.mongodb.net/?retryWrites=true&w=majority",
];

const DB_NAME = "moviesDB";
const COLLECTION = "movies";
const MAX_MOVIES_PER_DB = 100; // adjust as needed

// 🔑 Utility to connect
async function getClient(uri) {
  const client = new MongoClient(uri);
  await client.connect();
  return client;
}

// GET → fetch movies from all DBs combined (newest first)
export async function GET() {
  try {
    let allMovies = [];

    for (const uri of uris) {
      const client = await getClient(uri);
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION);

      const docs = await collection.find().sort({ createdAt: -1 }).toArray();
      allMovies = [...allMovies, ...docs];

      await client.close();
    }

    // 🔥 Merge & sort newest first
    allMovies.sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json(allMovies);
  } catch (err) {
    console.error("GET error:", err);
    return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 });
  }
}

// POST → add new movie with rotation & overwrite logic
export async function POST(req) {
  try {
    const { title, thumbnail, link } = await req.json();

    const movieData = {
      title,
      thumbnail,
      link,
      createdAt: Date.now(),
    };

    // Try inserting into DBs in order
    for (let i = 0; i < uris.length; i++) {
      const client = await getClient(uris[i]);
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION);

      const count = await collection.countDocuments();

      if (count < MAX_MOVIES_PER_DB) {
        // ✅ Space available, insert here
        await collection.insertOne(movieData);
        await client.close();
        return NextResponse.json({ success: true, savedIn: i + 1 });
      }

      await client.close();
    }

    // 🚨 All DBs full → overwrite oldest in FIRST DB
    const firstClient = await getClient(uris[0]);
    const db = firstClient.db(DB_NAME);
    const collection = db.collection(COLLECTION);

    const oldest = await collection.find().sort({ createdAt: 1 }).limit(1).toArray();

    if (oldest.length > 0) {
      await collection.updateOne(
        { _id: oldest[0]._id },
        { $set: movieData }
      );
    } else {
      await collection.insertOne(movieData);
    }

    await firstClient.close();
    return NextResponse.json({ success: true, overwritten: true });
  } catch (err) {
    console.error("POST error:", err);
    return NextResponse.json({ error: "Failed to add movie" }, { status: 500 });
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
