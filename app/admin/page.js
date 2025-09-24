"use client";
import { useState, useEffect } from "react";

export default function AdminPage() {
  const [form, setForm] = useState({ title: "", thumbnail: "", link: "" });
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const adminPassword = "your_admin_password"; // Admin login protection
  const [authorized, setAuthorized] = useState(false);
  const [inputPassword, setInputPassword] = useState("");

  // Fetch movies
  async function fetchMovies() {
    try {
      const res = await fetch("/api/movies");
      const data = await res.json();
      setMovies(data);
    } catch (err) {
      console.error("Failed to fetch movies:", err);
    }
  }

  useEffect(() => {
    if (authorized) fetchMovies();
  }, [authorized]);

  // Add movie
  async function handleAdd(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setForm({ title: "", thumbnail: "", link: "" });
        fetchMovies();
        alert("✅ Movie added!");
      } else {
        const data = await res.json();
        alert("❌ Failed to add movie: " + data.error);
      }
    } catch (err) {
      alert("❌ Failed to add movie: " + err.message);
    }
    setLoading(false);
  }

  // Delete movie
  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this movie?")) return;

    try {
      const res = await fetch(`/api/movies?id=${id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok && data.success) {
        alert("✅ Movie deleted!");
        fetchMovies();
      } else {
        alert("❌ Failed to delete movie: " + data.error);
      }
    } catch (err) {
      alert("❌ Failed to delete movie: " + err.message);
    }
  }

  // Admin login screen
  if (!authorized) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">🔒 Admin Login</h1>
        <input
          type="password"
          placeholder="Enter password"
          value={inputPassword}
          onChange={(e) => setInputPassword(e.target.value)}
          className="w-full p-2 rounded text-black"
        />
        <button
          className="bg-red-600 px-4 py-2 rounded mt-2 hover:bg-red-700"
          onClick={() => {
            if (inputPassword === adminPassword) setAuthorized(true);
            else alert("❌ Wrong password");
          }}
        >
          Login
        </button>
      </main>
    );
  }

  // Admin panel
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">📤 Admin Panel</h1>

      {/* Add Movie Form */}
      <form onSubmit={handleAdd} className="space-y-4 max-w-md mb-6">
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

      {/* Movies List with Delete */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <div key={movie._id} className="bg-gray-900 rounded-lg overflow-hidden p-2">
            <div className="text-center mb-2">{movie.title}</div>
            <button
              className="bg-gray-700 px-2 py-1 rounded hover:bg-gray-600 w-full"
              onClick={() => handleDelete(movie._id)}
            >
              Delete Movie
            </button>
          </div>
        ))}
      </div>
    </main>
  );
            }
