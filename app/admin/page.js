// Copyright © 2025 Kaustav Ray. All rights reserved.
// Licensed under the MIT License

"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [movies, setMovies] = useState([]); // This stores the currently displayed and filtered list
  const [allMovies, setAllMovies] = useState([]); // This stores the full list fetched from API
  const [form, setForm] = useState({ title: "", thumbnail: "", link: "" });
  const [searchQuery, setSearchQuery] = useState(""); // New State for search input
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Hardcoded password for demo
  const ADMIN_PASSWORD = "abd123abd"; // change this to your secret

  // Function to fetch ALL movies for the admin panel
  async function fetchMovies() {
    setLoading(true);
    try {
      // Fetch all movies by setting a large limit (e.g., 999)
      const res = await fetch("/api/movies?limit=999"); 
      const data = await res.json();
      
      const movieList = Array.isArray(data.movies) ? data.movies : Array.isArray(data) ? data : [];
      
      setAllMovies(movieList); // Store the full list
      setMovies(movieList);    // Display the full list initially
      
    } catch (err) {
      console.error("Failed to fetch movies", err);
      setMessage("❌ Failed to fetch movies from the server.");
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    if (loggedIn) fetchMovies();
  }, [loggedIn]);
  
  // New useEffect to handle client-side search filtering
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setMovies(allMovies); // If search is empty, show all movies
    } else {
      const lowerCaseQuery = searchQuery.trim().toLowerCase();
      const filtered = allMovies.filter(movie => 
        movie.title.toLowerCase().includes(lowerCaseQuery)
      );
      setMovies(filtered);
    }
  }, [searchQuery, allMovies]); // Re-run when search query or the master list changes


  // Add movie
  async function handleAddMovie(e) {
    e.preventDefault();
    setMessage("");

    if (!form.title || !form.thumbnail || !form.link) {
      setMessage("❌ All fields are required.");
      return;
    }

    try {
      const res = await fetch("/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Movie added successfully!");
        setForm({ title: "", thumbnail: "", link: "" }); // Reset form
        fetchMovies(); // Refresh the full list
      } else {
        setMessage("❌ Failed to add: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      setMessage("❌ Error: " + err.message);
    }
  }

  // Delete movie
  async function handleDeleteMovie(id) {
    setMessage("");

    if (!window.confirm("Are you sure you want to delete this movie?")) return;

    try {
      const res = await fetch(`/api/movies?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Movie deleted successfully");
        fetchMovies(); // Refresh the full list
      } else {
        setMessage("❌ Failed to delete: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      setMessage("❌ Error: " + err.message);
    }
  }

  // Login
  function handleLogin(e) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setLoggedIn(true);
      setPassword("");
      setMessage("");
    } else {
      setMessage("❌ Wrong password");
    }
  }

  // ================= UI =================
  if (!loggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <form
          onSubmit={handleLogin}
          className="bg-gray-800 p-6 rounded-xl shadow-lg w-80"
        >
          <h2 className="text-2xl font-bold mb-5 text-center">Admin Login</h2>
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded text-black mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition duration-200"
          >
            Login
          </button>
          {message && <p className="mt-4 text-center text-red-400">{message}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 md:p-10">
      <h1 className="text-3xl font-bold mb-8 border-b border-gray-700 pb-3">🎬 Admin Panel</h1>

      {/* Add Movie Form */}
      <form
        onSubmit={handleAddMovie}
        className="bg-gray-800 p-6 rounded-xl mb-8 shadow-2xl"
      >
        <h2 className="text-xl font-bold mb-5">Add New Movie</h2>
        <div className="space-y-4">
            <input
              type="text"
              placeholder="Movie Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-3 rounded text-black focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <input
              type="text"
              placeholder="Thumbnail URL"
              value={form.thumbnail}
              onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
              className="w-full p-3 rounded text-black focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <input
              type="text"
              placeholder="Movie Link (URL)"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              className="w-full p-3 rounded text-black focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
        </div>
        <button
          type="submit"
          className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition duration-200"
        >
          Add Movie
        </button>
      </form>

      {message && <p className="mb-6 p-3 bg-yellow-900/50 text-yellow-400 rounded-lg">{message}</p>}
      
      {/* Search Input and Movie Count */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-5 border-b border-gray-700 pb-2">
        <h2 className="text-xl font-bold mb-3 md:mb-0">All Movies ({allMovies.length})</h2>
        <input
            type="text"
            placeholder="Search movie title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 rounded text-black w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
      
      {loading && <p className="text-center text-gray-400 mt-5">Loading movies...</p>}
      
      {/* Movies List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {movies.map((movie) => (
          <div
            key={movie._id}
            className="bg-gray-800 p-4 rounded-xl shadow-xl flex flex-col items-center group relative overflow-hidden transform hover:scale-[1.03] transition duration-300"
          >
            <img
              src={movie.thumbnail}
              alt={movie.title}
              className="w-full h-48 object-cover rounded-lg mb-3"
            />
            <p className="font-semibold text-center text-sm mb-2 truncate w-full">{movie.title}</p>
            <button
              onClick={() => handleDeleteMovie(movie._id)}
              className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white py-2 text-sm rounded-lg font-medium transition duration-200 opacity-90 hover:opacity-100"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      
      {/* No Results Message */}
      {!loading && movies.length === 0 && searchQuery.trim() && (
        <p className="text-center text-gray-500 mt-10">No movies found matching "{searchQuery}".</p>
      )}
      {!loading && allMovies.length === 0 && !searchQuery.trim() && (
        <p className="text-center text-gray-500 mt-10">No movies found in the database.</p>
      )}
    </div>
  );
}

// 2025 Kaustav Ray. All rights reserved.
