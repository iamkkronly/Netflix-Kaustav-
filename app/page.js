"use client";

import { useState, useEffect } from "react";

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const MOVIES_PER_PAGE = 10;

  // Fetch movies (with search + pagination)
  async function fetchMovies(reset = false) {
    setLoading(true);
    try {
      const res = await fetch("/api/movies");
      const data = await res.json();

      if (Array.isArray(data)) {
        // ✅ Search filtering (case-insensitive, fuzzy match)
        let filtered = data;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          filtered = data.filter((m) =>
            m.title.toLowerCase().includes(q)
          );
        }

        // ✅ Pagination
        const start = (page - 1) * MOVIES_PER_PAGE;
        const end = start + MOVIES_PER_PAGE;
        const paginated = filtered.slice(start, end);

        setMovies((prev) =>
          reset ? paginated : [...prev, ...paginated]
        );
        setHasMore(end < filtered.length);
      }
    } catch (err) {
      console.error("Failed to fetch movies", err);
    } finally {
      setLoading(false);
    }
  }

  // Load movies on mount & when page/search changes
  useEffect(() => {
    fetchMovies(page === 1); // reset if page 1
  }, [page, searchQuery]);

  // Handle search submit
  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    fetchMovies(true);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🎬 Movie Library</h1>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Search movies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow p-2 rounded text-black"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg"
        >
          Search
        </button>
      </form>

      {/* Movies Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {movies.map((movie) => (
          <div
            key={movie._id}
            className="bg-gray-800 p-3 rounded-lg shadow-lg flex flex-col items-center"
          >
            <img
              src={movie.thumbnail}
              alt={movie.title}
              className="w-full h-40 object-cover rounded mb-2"
            />
            <p className="font-semibold text-center">{movie.title}</p>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      <div className="flex justify-center mt-6">
        {hasMore && !loading && (
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg"
          >
            Load More
          </button>
        )}
        {loading && <p className="text-gray-400">Loading...</p>}
        {!hasMore && !loading && movies.length > 0 && (
          <p className="text-gray-400">🎉 No more movies</p>
        )}
      </div>
    </div>
  );
}
