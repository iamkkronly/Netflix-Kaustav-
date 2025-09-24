"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [movies, setMovies] = useState([]);        // All movies from API
  const [displayed, setDisplayed] = useState([]);  // Movies currently shown
  const [query, setQuery] = useState("");          // Search input
  const [filtered, setFiltered] = useState([]);    // Movies filtered by search
  const [page, setPage] = useState(1);             // Current page for pagination
  const perPage = 10;                               // Movies per page

  // Fetch all movies on page load
  useEffect(() => {
    fetch("/api/movies")
      .then((res) => res.json())
      .then((data) => {
        setMovies(data);
        setFiltered(data);
        setDisplayed(data.slice(0, perPage));
      })
      .catch((err) => console.error("Failed to fetch movies:", err));
  }, []);

  // Update filtered movies whenever query changes
  useEffect(() => {
    const q = query.toLowerCase();
    const results = query
      ? movies.filter((movie) => movie.title.toLowerCase().includes(q))
      : movies;

    setFiltered(results);
    setDisplayed(results.slice(0, perPage));
    setPage(1);
  }, [query, movies]);

  // Load next page of movies
  function loadMore() {
    const nextPage = page + 1;
    const start = page * perPage;
    const end = start + perPage;
    setDisplayed((prev) => [...prev, ...filtered.slice(start, end)]);
    setPage(nextPage);
  }

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
        {displayed.length ? (
          displayed.map((movie) => (
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

      {/* Load More button */}
      {displayed.length < filtered.length && (
        <div className="text-center mt-6">
          <button
            onClick={loadMore}
            className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
          >
            Load More
          </button>
        </div>
      )}
    </main>
  );
}
