import { cn } from "./utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted dark:bg-zinc-800",
        className
      )}
      {...props}
    />
  );
}

/** Skeleton for a VideoCard (aspect-[2/3] poster card) */
export function VideoCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("w-full", className)}>
      <Skeleton className="w-full aspect-[2/3] rounded-xl" />
      <Skeleton className="mt-2 h-3.5 w-3/4 rounded" />
      <Skeleton className="mt-1.5 h-3 w-1/2 rounded" />
    </div>
  );
}

/** Skeleton row: a section heading + multiple VideoCardSkeletons in a flex row */
export function CarouselRowSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("mb-12", className)}>
      <Skeleton className="h-6 w-40 rounded mb-6" />
      <div className="flex gap-3 md:gap-4 overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="shrink-0 w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px]"
          >
            <VideoCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton for the Hero Banner */
export function HeroSkeleton() {
  return (
    <div className="relative h-[65vh] min-h-120 mb-12 bg-muted dark:bg-zinc-900 animate-pulse rounded-none overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
      <div className="relative max-w-360 mx-auto px-6 h-full flex items-center">
        <div className="max-w-2xl space-y-4">
          <Skeleton className="h-5 w-28 rounded" />
          <Skeleton className="h-12 w-96 rounded" />
          <Skeleton className="h-4 w-80 rounded" />
          <Skeleton className="h-4 w-64 rounded" />
          <div className="flex gap-3 mt-4">
            <Skeleton className="h-11 w-32 rounded-md" />
            <Skeleton className="h-11 w-32 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton for watch page video area */
export function VideoPlayerSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden border border-white/10 bg-zinc-900">
      <Skeleton className="w-full aspect-video bg-zinc-800" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-8 w-3/4 rounded" />
        <Skeleton className="h-4 w-1/2 rounded" />
        <Skeleton className="h-4 w-2/3 rounded" />
        <Skeleton className="h-16 w-full rounded" />
      </div>
    </div>
  );
}

/** Skeleton for the history page list items */
export function HistoryItemSkeleton() {
  return (
    <div className="flex gap-4 p-4 rounded-xl border border-border bg-card">
      <Skeleton className="w-32 h-20 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </div>
  );
}

export { Skeleton };
