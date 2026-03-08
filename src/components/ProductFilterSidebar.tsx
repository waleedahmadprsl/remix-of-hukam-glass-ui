import React from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, Star, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface FilterState {
  minPrice: number;
  maxPrice: number;
  categories: string[];
  minRating: number;
  tags: string[];
}

interface Props {
  categories: Category[];
  allTags: string[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

const ProductFilterSidebar: React.FC<Props> = ({ categories, allTags, filters, onFiltersChange, onClose, isMobile }) => {
  const update = (partial: Partial<FilterState>) => onFiltersChange({ ...filters, ...partial });

  const toggleCategory = (id: string) => {
    const cats = filters.categories.includes(id)
      ? filters.categories.filter((c) => c !== id)
      : [...filters.categories, id];
    update({ categories: cats });
  };

  const toggleTag = (tag: string) => {
    const tags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    update({ tags });
  };

  const clearAll = () => onFiltersChange({ minPrice: 0, maxPrice: 50000, categories: [], minRating: 0, tags: [] });

  const hasActiveFilters = filters.minPrice > 0 || filters.maxPrice < 50000 || filters.categories.length > 0 || filters.minRating > 0 || filters.tags.length > 0;

  return (
    <div className={`${isMobile ? "p-5" : "glass-card p-5 rounded-2xl sticky top-28"} space-y-6`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-foreground text-sm">Filters</h3>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button onClick={clearAll} className="text-xs text-primary font-medium hover:underline">Clear All</button>
          )}
          {isMobile && onClose && (
            <button onClick={onClose} className="p-1"><X className="w-5 h-5 text-muted-foreground" /></button>
          )}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Price Range</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.minPrice || ""}
            onChange={(e) => update({ minPrice: Number(e.target.value) || 0 })}
            placeholder="Min"
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground"
          />
          <span className="text-muted-foreground text-xs">—</span>
          <input
            type="number"
            value={filters.maxPrice >= 50000 ? "" : filters.maxPrice}
            onChange={(e) => update({ maxPrice: Number(e.target.value) || 50000 })}
            placeholder="Max"
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground"
          />
        </div>
        <input
          type="range"
          min={0}
          max={50000}
          step={500}
          value={filters.maxPrice}
          onChange={(e) => update({ maxPrice: Number(e.target.value) })}
          className="w-full mt-2 accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>₨ {filters.minPrice.toLocaleString()}</span>
          <span>₨ {filters.maxPrice >= 50000 ? "50,000+" : filters.maxPrice.toLocaleString()}</span>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Categories</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                  className="rounded accent-primary"
                />
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Rating */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Minimum Rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => update({ minRating: filters.minRating === star ? 0 : star })}
              className="p-1"
            >
              <Star
                className={`w-5 h-5 transition-colors ${star <= filters.minRating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
              />
            </button>
          ))}
          {filters.minRating > 0 && (
            <span className="text-xs text-muted-foreground self-center ml-1">& up</span>
          )}
        </div>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tags</p>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <motion.button
                key={tag}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  filters.tags.includes(tag)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {tag}
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilterSidebar;
export type { FilterState };
