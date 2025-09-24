// © 2025 Kaustav Ray. All rights reserved.
// Licensed under the MIT License.

"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetch("/api/movies")
      .then((res) => res.json())
      .then(setMovies)
      .catch(err => console.error("Failed to fetch movies:", err));
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">🎬 Movie Gallery</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {movies.map((movie) => (
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
        ))}
      </div>
    </main>
  );
}          </div>
        ))}
      </div>
    </main>
  );
}
