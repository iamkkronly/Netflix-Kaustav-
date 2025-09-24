"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [movies, setMovies] = useState([]);     // All movies fetched from API
  const [query, setQuery] = useState("");       // Search query input
  const [filtered, setFiltered] = useState([]); // Movies filtered based on query

  // Fetch movies from API on page load
  useEffect(() => {
    fetch("/api/movies")
      .then((res) => res.json())
      .then((data) => {
        setMovies(data);
        setFiltered(data); // Initially, filtered list is the full list
      })
      .catch((err) => console.error("Failed to fetch movies:", err));
  }, []);

  // Update filtered movies whenever query changes
  useEffect(() => {
    if (!query) return setFiltered(movies);

    const q = query.toLowerCase();
    const results = movies.filter((movie) =>
      movie.title.toLowerCase().includes(q)
    );
    setFiltered(results);
  }, [query, movies]);

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">🎬 Movie Gallery</h1>

      {/* Search input */}
      <input
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-2 mb-6 rounded text-black"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {filtered.length ? (
          filtered.map((movie) => (
            <div
              key={movie._id}
              className="bg-gray-900 rounded-lg overflow-hidden hover:scale-105 transition"
            >
              <a
                href={movie.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={movie.thumbnail}
                  alt={movie.title}
                  className="w-full h-48 object-cover"
                />
              </a>
              <div className="p-2 text-center">{movie.title}</div>
            </div>
          ))
        ) : (
          <p className="text-center col-span-full text-gray-400">
            No movies found.
          </p>
        )}
      </div>
    </main>
  );
                    }
