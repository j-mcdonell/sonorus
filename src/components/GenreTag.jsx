import React from 'react';
import { cn } from "@/lib/utils";

const genreColors = {
  "Rock": "bg-red-500/20 text-red-300 border-red-500/30",
  "Pop": "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "Hip-Hop": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "R&B": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "Electronic": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  "Jazz": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Classical": "bg-slate-500/20 text-slate-300 border-slate-500/30",
  "Country": "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "Metal": "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  "Indie": "bg-teal-500/20 text-teal-300 border-teal-500/30",
  "Alternative": "bg-violet-500/20 text-violet-300 border-violet-500/30",
  "Folk": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "Soul": "bg-rose-500/20 text-rose-300 border-rose-500/30",
  "Punk": "bg-lime-500/20 text-lime-300 border-lime-500/30",
  "Blues": "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  "Reggae": "bg-green-500/20 text-green-300 border-green-500/30",
  "Latin": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  "World": "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
  "Other": "bg-gray-500/20 text-gray-300 border-gray-500/30"
};

export default function GenreTag({ genre, size = "sm" }) {
  const colorClass = genreColors[genre] || genreColors["Other"];
  
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border font-medium",
      colorClass,
      size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
    )}>
      {genre}
    </span>
  );
}