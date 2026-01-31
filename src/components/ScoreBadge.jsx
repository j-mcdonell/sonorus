import React from 'react';
import { cn } from "@/lib/utils";

export default function ScoreBadge({ score, size = "md", showLabel = false }) {
  const getScoreColor = (score) => {
    if (score >= 75) return "from-emerald-500 to-green-400";
    if (score >= 50) return "from-yellow-500 to-amber-400";
    if (score >= 25) return "from-orange-500 to-orange-400";
    return "from-red-500 to-rose-400";
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return "Universal Acclaim";
    if (score >= 75) return "Generally Favorable";
    if (score >= 50) return "Mixed Reviews";
    if (score >= 25) return "Generally Unfavorable";
    return "Overwhelming Dislike";
  };

  const sizeClasses = {
    sm: "w-10 h-10 text-sm",
    md: "w-14 h-14 text-xl",
    lg: "w-20 h-20 text-3xl",
    xl: "w-28 h-28 text-4xl"
  };

  if (score === null || score === undefined) {
    return (
      <div className={cn(
        "rounded-xl bg-zinc-800/50 flex items-center justify-center font-bold text-zinc-500",
        sizeClasses[size]
      )}>
        —
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn(
        "rounded-xl bg-gradient-to-br flex items-center justify-center font-bold text-white shadow-lg",
        sizeClasses[size],
        getScoreColor(score)
      )}>
        {Math.round(score)}
      </div>
      {showLabel && (
        <span className="text-xs text-zinc-400 font-medium">
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}