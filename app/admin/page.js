"use client";
import { useState } from "react";

export default function AdminPage() {
  const [form, setForm] = useState({ title: "", thumbnail: "", link: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/movies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert("✅ Movie added!");
      setForm({ title: "", thumbnail: "", link: "" });
    } else {
      alert("❌ Failed to add movie.");
    }

    setLoading(false);
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">📤 Admin Panel</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
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
    </main>
  );
}
