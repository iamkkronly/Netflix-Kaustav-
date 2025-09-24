"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadMovies();
  }, [page]);

  async function loadMovies() {
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/movies?limit=10&page=${page}&search=${query}`);
      const data = await res.json();
      if (page === 1) setMovies(data.movies);
      else setMovies((prev) => [...prev, ...data.movies]);
      setHasMore(data.movies.length === 10);
    } catch (err) {
      console.error("Failed to load movies:", err);
    }
    setLoadingMore(false);
  }

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    loadMovies();
  }

  function loadMore() {
    if (hasMore) setPage((prev) => prev + 1);
  }

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">🎬 Movie Gallery</h1>
        <a
          href="https://t.me/Netflix1prime" // Replace with your actual Telegram group link
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          Support Group
        </a>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <input
          type="text"
          placeholder="Search movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="p-2 rounded w-full text-black"
        />
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {movies.map((movie) => (
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
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </main>
  );
}
