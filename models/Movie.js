// © 2025 Kaustav Ray. All rights reserved.
// Licensed under the MIT License.

import mongoose from "mongoose";

const MovieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    thumbnail: { type: String, required: true },
    link: { type: String, required: true }, // Added movie link
  },
  { timestamps: true }
);

export default mongoose.models.Movie || mongoose.model("Movie", MovieSchema);
