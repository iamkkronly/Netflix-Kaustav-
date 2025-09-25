"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState({ title: "", thumbnail: "" });
  const [message, setMessage] = useState("");

  // ✅ Hardcoded password for demo
  const ADMIN_PASSWORD = "abd123abd"; // change this to your secret

  // Fetch movies
  async function fetchMovies() {
    try {
      const res = await fetch("/api/movies");
      const data = await res.json();
      if (Array.isArray(data)) {
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

    try {
      const res = await fetch("/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Movie added successfully!");
        setForm({ title: "", thumbnail: "" });
        fetchMovies();
      } else {
        setMessage("❌ Failed to add: " + data.error);
      }
    } catch (err) {
      setMessage("❌ Error: " + err.message);
    }
  }

  // Delete movie
  async function handleDeleteMovie(id) {
    setMessage("");

    try {
      const res = await fetch(`/api/movies?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Movie deleted");
        fetchMovies();
      } else {
        setMessage("❌ Failed to delete: " + data.error);
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
          className="bg-gray-800 p-6 rounded-xl shadow-lg"
        >
          <h2 className="text-xl font-bold mb-4">Admin Login</h2>
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded text-black mb-4"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
          >
            Login
          </button>
          {message && <p className="mt-3 text-red-400">{message}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">🎬 Admin Panel</h1>

      {/* Add Movie Form */}
      <form
        onSubmit={handleAddMovie}
        className="bg-gray-800 p-4 rounded-xl mb-6 shadow-lg"
      >
        <h2 className="text-lg font-bold mb-4">Add New Movie</h2>
        <input
          type="text"
          placeholder="Movie Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full p-2 rounded text-black mb-3"
          required
        />
        <input
          type="text"
          placeholder="Thumbnail URL"
          value={form.thumbnail}
          onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
          className="w-full p-2 rounded text-black mb-3"
          required
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
        >
          Add Movie
        </button>
      </form>

      {message && <p className="mb-4 text-yellow-400">{message}</p>}

      {/* Movies List */}
      <h2 className="text-lg font-bold mb-4">All Movies</h2>
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
            <button
              onClick={() => handleDeleteMovie(movie._id)}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-lg"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
