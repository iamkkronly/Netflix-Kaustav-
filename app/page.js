"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/movies")
      .then((res) => res.json())
      .then(setMovies)
      .catch((err) => console.error("Failed to fetch movies:", err));
  }, []);

  // Filter movies by search term
  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">🎬 Movie Gallery</h1>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search movies..."
        className="w-full p-2 mb-6 rounded text-black"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {filteredMovies.map((movie) => (
          <div
            key={movie._id}
            className="bg-gray-900 rounded-lg overflow-hidden hover:scale-105 transition"
          >
            <a href={movie.link} target="_blank" rel="noopener noreferrer">
              <img
                src={movie.thumbnail}
                alt={movie.title}
                className="w-full h-48 object-cover"
              />
            </a>
            <div className="p-2 text-center">{movie.title}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
