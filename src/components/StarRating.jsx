import React from 'react';
import { Star } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function StarRating({ rating, onChange, readonly = false, size = "md" }) {
  const stars = 5;
  const filledStars = Math.round((rating / 100) * stars);
  
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  const handleClick = (index) => {
    if (readonly) return;
    const newRating = ((index + 1) / stars) * 100;
    onChange?.(newRating);
  };

  return (
    <div className="flex gap-1">
      {Array.from({ length: stars }).map((_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => handleClick(index)}
          disabled={readonly}
          className={cn(
            "transition-all duration-200",
            !readonly && "hover:scale-110 cursor-pointer",
            readonly && "cursor-default"
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              index < filledStars
                ? "fill-violet-400 text-violet-400"
                : "fill-transparent text-zinc-600"
            )}
          />
        </button>
      ))}
    </div>
  );
}