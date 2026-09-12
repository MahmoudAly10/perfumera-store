"use client";

import { Star } from "lucide-react";
import { starArray, cn } from "@/lib/utils";

export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  const stars = starArray(rating);
  return (
    <div className="inline-flex items-center gap-0.5">
      {stars.map((s, i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={cn(
            s === "empty" ? "star-empty fill-current" : "star fill-current"
          )}
        />
      ))}
    </div>
  );
}
