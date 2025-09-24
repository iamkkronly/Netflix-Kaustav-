"use client";
import { useState, useEffect } from "react";

export default function AdminPage() {
  const [form, setForm] = useState({ title: "", thumbnail: "", link: "" });
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  // Simple admin protection
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const password = prompt("Enter admin password:");
    if (password === "admin123") setAuthorized(true);
    else alert("❌ Unauthorized! Reload page to try again.");
  }, []);

  useEffect(() => {
    if (!authorized) return;
    fetch("/api/movies")
      .then((res) => res.json())
      .then(setMovies)
      .catch((err) => console.error(err));
  }, [authorized]);

  async function handleAdd(e) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/movies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const newMovie = await res.json();
      setMovies([newMovie, ...movies]);
      setForm({ title: "", thumbnail: "", link: "" });
      alert("✅ Movie added!");
    } else alert("❌ Failed to add movie.");

    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this movie?")) return;

    const res = await fetch(`/api/movies/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMovies(movies.filter((m) => m._id !== id));
      alert("✅ Movie deleted!");
    } else alert("❌ Failed to delete movie.");
  }

  if (!authorized)
    return <main className="p-6 text-red-500">Unauthorized access!</main>;

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

      {/* Movie List with Delete */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {movies.map((movie) => (
          <div
            key={movie._id}
            className="bg-gray-900 rounded p-4 flex justify-between items-center"
          >
            <span>{movie.title}</span>
            <button
              onClick={() => handleDelete(movie._id)}
              className="bg-red-600 px-2 py-1 rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </main>
  );
              }
