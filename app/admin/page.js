// Copyright © 2025 Kaustav Ray. All rights reserved.
// Licensed under the MIT License

"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState({ title: "", thumbnail: "", link: "" }); // Added 'link'
  const [message, setMessage] = useState("");

  // ✅ Hardcoded password for demo
  const ADMIN_PASSWORD = "abd123abd"; // change this to your secret

  // Fetch movies
  async function fetchMovies() {
    try {
      // Use the existing movie API route for listing
      const res = await fetch("/api/movies"); 
      const data = await res.json();
      // The API returns an object {movies, total, page, limit} if search is used, 
      // but the front-end fetch in page.js expects data to be an array.
      // Assuming the movie API in route.js returns the movies array directly 
      // when no query/page/limit is specified for the admin panel.
      if (Array.isArray(data.movies)) { // Adjusting for expected API response structure from route.js
        setMovies(data.movies);
      } else if (Array.isArray(data)) {
        setMovies(data);
      }
    } catch (err) {
      console.error("Failed to fetch movies", err);
    }
  }

  useEffect(() => {
    if (loggedIn) fetchMovies();
  }, [loggedIn]);

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
        fetchMovies();
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
      // Use the movie API route with the ID as a query parameter for DELETE
      const res = await fetch(`/api/movies?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Movie deleted successfully");
        fetchMovies();
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
      setMessage(""); // Clear message on successful login
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

      {/* Movies List */}
      <h2 className="text-xl font-bold mb-5 border-b border-gray-700 pb-2">All Movies ({movies.length})</h2>
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
      {movies.length === 0 && (
        <p className="text-center text-gray-500 mt-10">No movies found in the database.</p>
      )}
    </div>
  );
}

// 2025 Kaustav Ray. All rights reserved.
