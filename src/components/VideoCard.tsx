import { Clock, Lock, Play, Star, Unlock } from "lucide-react";

import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Badge } from "./ui/badge";

interface VideoCardProps {
  id: string;
  title: string;
  thumbnail: string;
  duration?: string;
  rating?: number;
  year?: string;
  category?: string;
  pricing?: "free" | "premium";
  isLocked?: boolean;
  isNew?: boolean;
  onClick?: () => void;
}

export function VideoCard({
  title,
  thumbnail,
  duration,
  rating,
  year,
  category,
  pricing,
  isLocked,
  isNew,
  onClick,
}: VideoCardProps) {
  return (
    <div
      className="group relative cursor-pointer rounded-lg overflow-hidden bg-zinc-900 transition-all duration-300 hover:scale-105 hover:z-10"
      onClick={onClick}
    >
      <div className="relative aspect-2/3 overflow-hidden">
        <ImageWithFallback
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-[#E50914] rounded-full p-3">
            <Play className="w-6 h-6 text-white fill-white" />
          </div>
        </div>

        <div className="absolute top-2 left-2 flex gap-2">
          {isNew && (
            <Badge className="bg-[#E50914] text-white border-0">NEW</Badge>
          )}
          {category && (
            <Badge variant="outline" className="bg-black/60 border-white/20 text-white backdrop-blur-sm">
              {category}
            </Badge>
          )}
        </div>

        {(pricing || typeof isLocked === "boolean") ? (
          <div className="absolute top-2 right-2 flex gap-2">
            {pricing ? (
              <Badge className={pricing === "premium" ? "bg-amber-500 text-black border-0" : "bg-emerald-600 text-white border-0"}>
                {pricing === "premium" ? "PREMIUM" : "FREE"}
              </Badge>
            ) : null}
            {typeof isLocked === "boolean" ? (
              <Badge variant="outline" className="bg-black/60 border-white/20 text-white backdrop-blur-sm">
                {isLocked ? <Lock className="w-3 h-3 mr-1" /> : <Unlock className="w-3 h-3 mr-1" />}
                {isLocked ? "Locked" : "Open"}
              </Badge>
            ) : null}
          </div>
        ) : null}

        {duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-white text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {duration}
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="text-white line-clamp-2 mb-1">{title}</h3>
        <div className="flex items-center gap-3 text-white/60 text-sm">
          {year && <span>{year}</span>}
          {rating && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span>{rating}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
