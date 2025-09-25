// Copyright © 2025 Kaustav Ray. All rights reserved.
// Licensed under the MIT License

"use client";

import { useState, useEffect, useCallback } from "react";

// Define constants
const MOVIES_PER_PAGE = 10;
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
          if (reset) {
            return newMovies;
          }
          const newIds = new Set(prev.map(m => m._id));
          const uniqueNewMovies = newMovies.filter(m => !newIds.has(m._id));
          return [...prev, ...uniqueNewMovies];
        });

        const totalFetched = (currentPage * MOVIES_PER_PAGE) + (reset ? 0 : movies.length);
        setHasMore(data.total > totalFetched);
        
      } else {
        console.error("API response error:", data);
        setError("Failed to parse movie data.");
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to fetch movies:", err);
      setError("Failed to connect to the server.");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, movies.length]);

  // Effect to load movies when the component mounts or page/searchQuery changes
  useEffect(() => {
    if (page === 1) {
        fetchMovies(true); 
    } else if (page > 1) {
        fetchMovies(false); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery]); 

  // Handles search form submission
  function handleSearch(e) {
    e.preventDefault();
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
    // 🔥 ADJUSTED Background: Changed from custom dark hex to standard, slightly brighter bg-gray-800
    <div className="min-h-screen text-white p-4 md:p-12 relative bg-gray-800"> 
         {/* Removed inline style for background color */}

      {/* Header: Sticky, Blurred, and Stylish - Adjusted colors to match new theme */}
      <header className="sticky top-0 z-40 bg-gray-800/95 backdrop-blur-sm shadow-xl mb-8 border-b border-gray-700 pt-4 pb-6 px-4 md:px-0 -mx-4 md:-mx-12">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full max-w-7xl mx-auto">
          
          <div className="flex items-center justify-between w-full md:w-auto mb-4 md:mb-0">
              {/* Cinematic Title - Vibrant green accent maintained */}
              <h1 className="text-4xl md:text-5xl font-extrabold text-green-400 mr-8 drop-shadow-[0_4px_6px_rgba(52,211,163,0.5)] tracking-wider">
                  Movie Library
              </h1>
              
              {/* Support Group Link - Adjusted button color to match theme */}
              <a 
                href={SUPPORT_GROUP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-700 hover:bg-green-600 text-white px-5 py-2 rounded-full font-bold text-sm transition duration-300 shadow-md shadow-green-800/50 hover:shadow-green-500/80 whitespace-nowrap"
              >
                🚀 Support Group
              </a>
          </div>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-3 w-full md:max-w-md">
            <input
              type="text"
              placeholder="Search epic sagas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              // Enhanced input styling
              className="flex-grow p-3 rounded-2xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-300 border border-gray-600"
            />
            <button
              type="submit"
              // Enhanced button styling
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl font-bold transition duration-300 shadow-lg shadow-green-500/50 hover:shadow-green-400/80"
            >
              Search
            </button>
          </form>
        </div>
      </header>

      {/* Content Container */}
      <main className="max-w-7xl mx-auto">
        {/* Message and Error Area */}
        {error && (
          <p className="mb-6 p-4 bg-red-900/70 text-red-300 rounded-xl text-center font-medium shadow-inner">
            ❌ {error}
          </p>
        )}
        
        {loading && page === 1 && !movies.length && (
          <p className="text-gray-400 text-center text-2xl mt-20 animate-pulse">Loading the Cinematic Universe...</p>
        )}

        {/* Movies Grid - Reduced gap for higher density, matching reference */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
          {movies.map((movie, index) => (
            <div
              key={movie._id}
              // 🔥 ADJUSTED Card: Changed from custom dark hex to standard, brighter bg-gray-700
              className={`bg-gray-700 p-3 rounded-2xl shadow-xl shadow-black/50
                         flex flex-col items-center relative group overflow-hidden border border-gray-600
                         transform transition-all duration-500 ease-out 
                         hover:scale-[1.05] hover:shadow-green-900/80 hover:bg-gray-600 hover:z-10`}
              
              // Subtle entrance animation wave
              style={{ animation: `fadeIn 0.6s ease-out forwards`, animationDelay: `${index * 0.08}s` }}
            >
              {/* Movie Thumbnail */}
              <a 
                  href={movie.link || "#"} 
                  target={movie.link ? "_blank" : "_self"} 
                  rel="noopener noreferrer"
                  className="w-full relative block"
              >
                  <img
                      src={movie.thumbnail}
                      alt={movie.title}
                      // Increased rounding (rounded-xl)
                      className={`w-full h-60 object-cover rounded-xl mb-3 
                                transition duration-500 group-hover:opacity-85 group-hover:scale-[1.02] group-hover:shadow-xl`}
                  />
                  {/* Subtle Accent Overlay on Hover */}
                  <div className="absolute inset-0 bg-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>

              {/* Movie Title - Two-line wrap logic (Fix carried over) */}
              <div className="w-full h-10 overflow-hidden mb-2">
                  <p 
                      className="font-bold text-center text-base px-1 text-gray-100" 
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

              {/* Watch Now Button - Adjusted to match vibrant accent color */}
              <a 
                  href={movie.link || "#"} 
                  target={movie.link ? "_blank" : "_self"} 
                  rel="noopener noreferrer"
                  // Stylish Watch Button
                  className="mt-2 w-full text-center bg-green-600 hover:bg-green-500 text-white py-2 rounded-full font-bold text-sm transition duration-300 shadow-md shadow-green-500/40 hover:shadow-green-400/80"
              >
                  ▶️ Watch Now
              </a>
            </div>
          ))}
        </div>

        {/* Load More Button & Status - Adjusted colors */}
        {(hasMore || loading) && (
          <div className="flex justify-center mt-12">
            {loading && movies.length > 0 ? (
              <p className="text-green-400 font-bold p-3 animate-pulse">Loading the next batch...</p>
            ) : hasMore ? (
              <button
                onClick={handleLoadMore}
                // Cinematic Load More Button
                className="bg-teal-600 hover:bg-teal-700 text-white py-3 px-10 rounded-full text-lg font-extrabold transition duration-300 shadow-xl shadow-teal-500/50 hover:shadow-teal-400/80 uppercase tracking-wider"
                disabled={loading}
              >
                Load More
              </button>
            ) : (
               <p className="text-gray-400 font-medium p-3 mt-10">You've reached the end of the galaxy!</p>
            )}
          </div>
        )}
        
        {/* If no movies found after initial load */}
        {!loading && movies.length === 0 && (
           <p className="text-center text-gray-400 text-2xl mt-20">
              {searchQuery ? `No epic sagas found for "${searchQuery}".` : "No movies available yet. Time to add some!"}
           </p>
        )}
      </main>
      
      {/* Required style for the subtle entrance animation */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(25px) rotateX(10deg); }
          to { opacity: 1; transform: translateY(0) rotateX(0deg); }
        }
      `}</style>
    </div>
  );
}

// 2025 Kaustav Ray. All rights reserved.
