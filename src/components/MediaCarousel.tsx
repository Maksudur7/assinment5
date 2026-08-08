"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "./ui/utils";

interface MediaCarouselProps {
  children: React.ReactNode[];
  className?: string;
  slideSize?: string; // e.g. "w-[180px]" or "w-[220px]"
}

export function MediaCarousel({
  children,
  className,
  slideSize = "w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px]",
}: MediaCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (!children || children.length === 0) return null;

  return (
    <div className={cn("relative group/carousel", className)}>
      {/* Left Arrow */}
      <button
        onClick={scrollPrev}
        aria-label="Scroll left"
        className={cn(
          "absolute left-0 top-0 bottom-0 z-20 flex items-center justify-center w-12 bg-gradient-to-r from-background to-transparent transition-opacity duration-200 -translate-x-0",
          canScrollPrev
            ? "opacity-0 group-hover/carousel:opacity-100"
            : "opacity-0 pointer-events-none"
        )}
      >
        <div className="w-9 h-9 rounded-full bg-background/90 dark:bg-zinc-900/90 border border-border flex items-center justify-center shadow-lg hover:bg-background dark:hover:bg-zinc-800 transition-colors">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </div>
      </button>

      {/* Scroll Container */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3 md:gap-4">
          {children.map((child, i) => (
            <div key={i} className={cn("shrink-0", slideSize)}>
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Right Arrow */}
      <button
        onClick={scrollNext}
        aria-label="Scroll right"
        className={cn(
          "absolute right-0 top-0 bottom-0 z-20 flex items-center justify-center w-12 bg-gradient-to-l from-background to-transparent transition-opacity duration-200",
          canScrollNext
            ? "opacity-0 group-hover/carousel:opacity-100"
            : "opacity-0 pointer-events-none"
        )}
      >
        <div className="w-9 h-9 rounded-full bg-background/90 dark:bg-zinc-900/90 border border-border flex items-center justify-center shadow-lg hover:bg-background dark:hover:bg-zinc-800 transition-colors">
          <ChevronRight className="w-5 h-5 text-foreground" />
        </div>
      </button>
    </div>
  );
}
