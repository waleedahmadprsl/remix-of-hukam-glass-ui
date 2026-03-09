import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface BlurImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

/**
 * Lazy-loaded image with blur-up placeholder effect.
 * Shows a blurred low-res shimmer while loading, then fades in the full image.
 */
const BlurImage = React.forwardRef<HTMLImageElement, BlurImageProps>(
  ({ src, alt, className, fallback = "/placeholder.svg", onError, ...props }, ref) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    const imgRef = useRef<HTMLImageElement | null>(null);

    // Reset state when src changes
    useEffect(() => {
      setLoaded(false);
      setError(false);
    }, [src]);

    // Check if already cached (for back/forward navigations)
    useEffect(() => {
      if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
        setLoaded(true);
      }
    }, [src]);

    const handleLoad = () => setLoaded(true);

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setError(true);
      (e.target as HTMLImageElement).src = fallback;
      onError?.(e);
    };

    const setRefs = (el: HTMLImageElement | null) => {
      imgRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLImageElement | null>).current = el;
    };

    return (
      <div className={cn("relative overflow-hidden", className)}>
        {/* Blur placeholder */}
        {!loaded && !error && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <img
          ref={setRefs}
          src={error ? fallback : src || fallback}
          alt={alt}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full object-cover transition-all duration-500",
            loaded ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]"
          )}
          {...props}
        />
      </div>
    );
  }
);

BlurImage.displayName = "BlurImage";

export default BlurImage;
