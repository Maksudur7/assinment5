import { Clock, Lock, Play, Star, Unlock } from "lucide-react";

import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Badge } from "./ui/badge";

interface VideoCardProps {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  duration?: string;
  rating?: number;
  year?: string;
  category?: string;

  isNew?: boolean;
  onClick?: () => void;
}

export function VideoCard({
  id,
  title,
  description,
  thumbnail,
  duration,
  rating,
  year,
  category,

  isNew,
  onClick,
}: VideoCardProps) {
  return (
    <div
      data-media-id={id}
      className="group relative h-full cursor-pointer rounded-lg overflow-hidden border border-border bg-card text-card-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
      onClick={onClick}
    >
      <div className="relative aspect-2/3 overflow-hidden">
        <ImageWithFallback
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-primary rounded-full p-3">
            <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
          </div>
        </div>

        <div className="absolute top-2 left-2 flex gap-2">
          {isNew && (
            <Badge className="bg-primary text-primary-foreground border-0">NEW</Badge>
          )}
          {category && (
            <Badge variant="outline" className="bg-background/60 border-border text-foreground backdrop-blur-sm">
              {category}
            </Badge>
          )}
        </div>



        {duration && (
          <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-foreground text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {duration}
          </div>
        )}
      </div>

      <div className="flex h-full min-h-36 flex-col p-3">
        <h3 className="text-foreground line-clamp-2 mb-1">{title}</h3>
        <p className="text-muted-foreground text-xs line-clamp-2 min-h-8 mb-2">
          {description ?? "Explore ratings, cast and details for this title."}
        </p>
        <div className="flex items-center gap-3 text-muted-foreground text-sm">
          {year && <span>{year}</span>}
          {rating && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span>{rating}</span>
            </div>
          )}
        </div>
        <button
          type="button"
          className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-border bg-background/60 px-3 py-1.5 text-sm text-foreground hover:bg-accent transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
}
