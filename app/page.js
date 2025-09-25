// Copyright © 2025 Kaustav Ray. All rights reserved.
// Licensed under the MIT License

"use client";

import { useState, useEffect, useCallback } from "react";

// Define constants
const MOVIES_PER_PAGE = 11;
// Updated link based on your previous input
const SUPPORT_GROUP_LINK = "https://t.me/netflix1prime"; 

export default function Homepage() {
  // State variables from your code
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Added error state

  // Function to fetch movies (with search and pagination)
  // useCallback is used to memoize the function and prevent unnecessary re-creation
  const fetchMovies = useCallback(async (reset = false) => {
    setLoading(true);
    setError(null);
    const currentPage = reset ? 1 : page;
    
    // Construct the API URL
    const url = `/api/movies?page=${currentPage}&limit=${MOVIES_PER_PAGE}${
      searchQuery.trim() ? `&q=${encodeURIComponent(searchQuery.trim())}` : ""
    }`;
    
    try {
      const res = await fetch(url);
      const data = await res.json(); // Expected response: { movies: Array, total: Number, page: Number, limit: Number }

      if (Array.isArray(data.movies)) {
        const newMovies = data.movies;
        
        setMovies((prev) => {
          // If reset is true (new search or initial load), replace existing movies
          if (reset) {
            return newMovies;
          }
          // Otherwise, append the new movies
          const newIds = new Set(prev.map(m => m._id));
          const uniqueNewMovies = newMovies.filter(m => !newIds.has(m._id));
          return [...prev, ...uniqueNewMovies];
        });

        // Check if there are more movies to load
        const totalFetched = (currentPage * MOVIES_PER_PAGE) + (reset ? 0 : movies.length);
        setHasMore(data.total > totalFetched);
        
      } else {
        // Handle unexpected data format or an API error message
        console.error("API response error:", data);
        setError("Failed to parse movie data.");
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to fetch movies:", err);
      setError("Failed to connect to the server.");
      setHasMore(false); // No more to load on error
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, movies.length]); // Dependencies for useCallback

  // Effect to load movies when the component mounts or page/searchQuery changes
  useEffect(() => {
    // Reset page and fetch when searchQuery changes
    if (page === 1) {
        fetchMovies(true); // Fetch with reset=true if it's page 1
    } else if (page > 1) {
        fetchMovies(false); // Fetch normally if page > 1 (i.e., from Load More click)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery]); // Only fetch when page or searchQuery changes

  // Handles search form submission
  function handleSearch(e) {
    e.preventDefault();
    // Reset the page to 1 and let the useEffect hook handle the fetch
    setPage(1);
  }
  
  // Handles 'Load More' button click
  function handleLoadMore() {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }

  // ================= UI / RETURN =================
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 border-b border-gray-700 pb-4">
        
        <div className="flex items-center justify-between w-full md:w-auto mb-4 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-extrabold text-red-500 mr-8">Movie Library</h1>
            
            {/* Support Group Link */}
            <a 
              href={SUPPORT_GROUP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition duration-200 whitespace-nowrap"
            >
              Support Group
            </a>
        </div>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:max-w-sm">
          <input
            type="text"
            placeholder="Search movies"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow p-2 rounded text-black focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition duration-200"
          >
            Search
          </button>
        </form>
      </div>

      {/* Message and Error Area */}
      {error && (
        <p className="mb-4 p-3 bg-red-900/50 text-red-400 rounded-lg text-center font-medium">
          ❌ {error}
        </p>
      )}
      
      {loading && page === 1 && !movies.length && (
        <p className="text-gray-400 text-center text-xl mt-12">Loading movies...</p>
      )}

      {/* Movies Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <div
            key={movie._id}
            className="bg-gray-800 p-3 rounded-lg shadow-xl flex flex-col items-center transform hover:scale-[1.02] transition duration-300 relative group overflow-hidden"
          >
            {/* Movie Thumbnail - use movie.link if available, otherwise just display image */}
            <a 
                href={movie.link || "#"} 
                target={movie.link ? "_blank" : "_self"} 
                rel="noopener noreferrer"
                className="w-full"
            >
                <img
                    src={movie.thumbnail}
                    alt={movie.title}
                    className="w-full h-48 object-cover rounded-md mb-3 transition duration-300 group-hover:opacity-80"
                />
            </a>

            {/* 🔥 MODIFIED BLOCK: Movie Title - Two-line wrap logic */}
            <div className="w-full h-10 overflow-hidden mb-2">
                <p 
                    className="font-semibold text-center text-md px-1" 
                    // This inline style forces text to wrap into exactly 2 lines (Webkit browsers)
                    style={{ 
                        display: '-webkit-box', 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical', 
                        overflow: 'hidden' 
                    }}
                >
                    {movie.title}
                </p>
            </div>
            {/* END MODIFIED BLOCK */}

            <a 
                href={movie.link || "#"} 
                target={movie.link ? "_blank" : "_self"} 
                rel="noopener noreferrer"
                className="mt-1 w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium text-sm transition duration-200"
            >
                Watch Now
            </a>
          </div>
        ))}
      </div>

      {/* Load More Button & Status */}
      {(hasMore || loading) && (
        <div className="flex justify-center mt-10">
          {loading ? (
            <p className="text-gray-400 font-medium p-3">Loading more movies...</p>
          ) : hasMore ? (
            <button
              onClick={handleLoadMore}
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-lg text-lg font-semibold transition duration-200 shadow-lg"
              disabled={loading}
            >
              Load More
            </button>
          ) : (
             <p className="text-gray-500 font-medium p-3">No more movies to load.</p>
          )}
        </div>
      )}
      
      {/* If no movies found after initial load */}
      {!loading && movies.length === 0 && (
         <p className="text-center text-gray-500 text-xl mt-12">
            {searchQuery ? `No results found for "${searchQuery}".` : "No movies available yet."}
         </p>
      )}
    </div>
  );
}

// 2025 Kaustav Ray. All rights reserved.
