// © 2025 Kaustav Ray. All rights reserved.
// Licensed under the MIT License.

"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  const [form, setForm] = useState({ title: "", thumbnail: "", link: "" });
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");

  const ADMIN_PASSWORD = "abd123ab"; // Change this to secure password

  // Fetch all movies (for admin panel)
  async function fetchMovies() {
    try {
      const res = await fetch("/api/movies?limit=1000");
      const data = await res.json();
      setMovies(data.movies || []);
    } catch (err) {
      console.error("Error fetching movies:", err);
    }
  }

  // Handle admin login
  function handleLogin(e) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      fetchMovies();
    } else {
      alert("❌ Incorrect password");
    }
  }

  // Handle adding a movie
  async function handleAddMovie(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert("✅ Movie added!");
        setForm({ title: "", thumbnail: "", link: "" });
        fetchMovies();
      } else {
        const err = await res.json();
        alert("❌ Failed to add movie: " + err.error);
      }
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
    setLoading(false);
  }

  // Handle deleting a movie
  async function handleDeleteMovie(id) {
    if (!confirm("Are you sure you want to delete this movie?")) return;

    try {
      const res = await fetch(`/api/movies?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("✅ Movie deleted!");
        fetchMovies();
      } else {
        const err = await res.json();
        alert("❌ Failed to delete movie: " + err.error);
      }
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  }

  // Admin login page
  if (!isAdmin) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">🔐 Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4 max-w-md">
          <input
            type="password"
            placeholder="Enter Admin Password"
            className="w-full p-2 rounded text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
          >
            Login
          </button>
        </form>
      </main>
    );
  }

  // Admin panel page
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">📤 Admin Panel</h1>

      {/* Add Movie Form */}
      <form
        onSubmit={handleAddMovie}
        className="space-y-4 max-w-md mb-6 bg-gray-900 p-4 rounded"
      >
        <input
          type="text"
          placeholder="Movie Title"
          className="w-full p-2 rounded text-black"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <input
          type="url"
          placeholder="Thumbnail URL"
          className="w-full p-2 rounded text-black"
          value={form.thumbnail}
          onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
          required
        />
        <input
          type="url"
          placeholder="Movie Link"
          className="w-full p-2 rounded text-black"
          value={form.link}
          onChange={(e) => setForm({ ...form, link: e.target.value })}
          required
        />
        <button
          type="submit"
          className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Movie"}
        </button>
      </form>

      {/* Movies List */}
      <h2 className="text-xl font-bold mb-2">🎬 Movies</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {movies.map((movie) => (
          <div
            key={movie._id}
            className="bg-gray-900 rounded-lg p-2 text-center relative"
          >
            <img
              src={movie.thumbnail}
              alt={movie.title}
              className="w-full h-32 object-cover rounded"
            />
            <div className="mt-1">{movie.title}</div>
            <button
              onClick={() => handleDeleteMovie(movie._id)}
              className="absolute top-1 right-1 bg-red-600 px-2 py-1 text-xs rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
