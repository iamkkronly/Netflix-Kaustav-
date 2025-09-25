// © 2025 Kaustav Ray. All rights reserved.
// Licensed under the MIT License.

"use client";

import { useState, useEffect } from "react";

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Fetch movies from API
  async function fetchMovies(reset = false, query = search, pageNum = page) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/movies?search=${encodeURIComponent(query)}&page=${pageNum}&limit=10`
      );
      const data = await res.json();

      if (reset) {
        setMovies(data.movies || []);
      } else {
        setMovies((prev) => [...prev, ...(data.movies || [])]);
      }

      // If fewer than 10 results, stop "load more"
      if (!data.movies || data.movies.length < 10) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err) {
      console.error("Error fetching movies:", err);
    }
    setLoading(false);
  }

  // Initial load
  useEffect(() => {
    fetchMovies(true, "", 1);
  }, []);

  // Search handler
  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    fetchMovies(true, search, 1);
  }

  // Load more handler
  function handleLoadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMovies(false, search, nextPage);
  }

  return (
    <main className="p-6">
      {/* Header with Support Link */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">🎬 Movie Gallery</h1>
        <a
          href="https://t.me/Netflix1prime" // 🔗 Replace with your Telegram group link
          target="_blank"
          className="text-blue-400 underline"
        >
          Support Group
        </a>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-4">
        <input
          type="text"
          placeholder="Search movies..."
          className="w-full p-2 rounded text-black"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      {/* Movies Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {movies.map((movie) => (
          <div
            key={movie._id} // ✅ fixes duplicate thumbnail issue
            className="bg-gray-900 rounded-lg p-2 text-center"
          >
            <a href={movie.link} target="_blank" rel="noopener noreferrer">
              <img
                src={movie.thumbnail}
                alt={movie.title}
                className="w-full h-40 object-cover rounded"
              />
              <div className="mt-2 text-sm">{movie.title}</div>
            </a>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Next"}
          </button>
        </div>
      )}
    </main>
  );
                  }
