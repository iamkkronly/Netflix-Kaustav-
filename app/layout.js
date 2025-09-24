// © 2025 Kaustav Ray. All rights reserved.
// Licensed under the MIT License.

import "./../styles/globals.css";

export const metadata = {
  title: "Movie Gallery",
  description: "Netflix-like movie site",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen">{children}</body>
    </html>
  );
}
