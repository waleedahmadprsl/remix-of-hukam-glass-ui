import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RatingData {
  avg: number;
  count: number;
}

// Fetches all product ratings in a single query, returns a map of productId -> { avg, count }
export function useProductRatings() {
  const [ratings, setRatings] = useState<Record<string, RatingData>>({});

  useEffect(() => {
    supabase
      .from("reviews")
      .select("product_id, rating")
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, { total: number; count: number }> = {};
        data.forEach((r: any) => {
          if (!map[r.product_id]) map[r.product_id] = { total: 0, count: 0 };
          map[r.product_id].total += r.rating;
          map[r.product_id].count += 1;
        });
        const result: Record<string, RatingData> = {};
        Object.entries(map).forEach(([id, v]) => {
          result[id] = { avg: Math.round((v.total / v.count) * 10) / 10, count: v.count };
        });
        setRatings(result);
      });
  }, []);

  return ratings;
}

// Tiny star display component
export function StarRating({ avg, count, size = "sm" }: { avg: number; count: number; size?: "sm" | "xs" }) {
  const sizeClass = size === "xs" ? "w-3 h-3" : "w-3.5 h-3.5";
  const textClass = size === "xs" ? "text-[10px]" : "text-[11px]";

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${sizeClass} ${star <= Math.round(avg) ? "text-amber-400" : "text-border"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className={`${textClass} text-muted-foreground`}>({count})</span>
    </div>
  );
}
