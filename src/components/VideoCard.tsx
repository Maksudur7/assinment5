import { Play, Star } from "lucide-react";
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
  compact?: boolean; // NEW: compact mode for mobile 4-col grid
  onClick?: () => void;
}

export function VideoCard(props: VideoCardProps & { poster?: string }) {
  const {
    id,
    title,
    description,
    thumbnail,
    poster,
    duration,
    rating,
    year,
    category,
    isNew,
    compact = false,
    onClick,
  } = props;

  const imageSrc = thumbnail || poster || "";

  if (compact) {
    // ── Compact mode: title and year INSIDE the poster image (bottom overlay) ──
    return (
      <div
        data-media-id={id}
        className="group relative aspect-[2/3] w-full cursor-pointer rounded-lg overflow-hidden border border-white/5 bg-zinc-950 shadow-md transition-all duration-300 hover:scale-[1.03] hover:border-[#E50914]/40"
        onClick={onClick}
      >
        <ImageWithFallback
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
        />

        {/* Dark gradient overlay at bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 pointer-events-none" />

        {/* Badges Overlay (Top Left) */}
        <div className="absolute top-1.5 left-1.5 flex flex-row items-center gap-1.5 z-20 pointer-events-none">
          {isNew && (
            <Badge className="bg-[#E50914] hover:bg-[#E50914] text-white text-[8px] font-black px-1.5 py-0 rounded border-0 shadow-[0_2px_8px_rgba(229,9,20,0.5)] leading-4 w-fit">
              NEW
            </Badge>
          )}
          {category && (
            <Badge className="bg-black/80 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md text-[9px] font-bold px-2 py-0.5 rounded-md leading-tight whitespace-nowrap max-w-[70px] truncate w-fit shadow-md">
              {category}
            </Badge>
          )}
        </div>

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <div className="bg-[#E50914] rounded-full p-2.5 shadow-[0_0_20px_rgba(229,9,20,0.7)]">
            <Play className="w-4 h-4 fill-white text-white translate-x-[1px]" />
          </div>
        </div>

        {/* Title + Year only at bottom — left aligned, inside the card */}
        <div className="absolute inset-x-0 bottom-0 px-2 pb-2 pt-8 z-20 flex flex-col items-start justify-end">
          <h3 className="text-white font-black text-[12px] leading-tight line-clamp-2 drop-shadow-md text-left w-full">
            {title}
          </h3>
          {year && (
            <div className="mt-1 flex items-center justify-start gap-1 w-full text-left">
              <span className="text-zinc-300 drop-shadow-md text-[10px] font-semibold leading-none">{year}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Default full card ──
  return (
    <div
      data-media-id={id}
      className="group relative aspect-[2/3] w-full cursor-pointer rounded-xl overflow-hidden border border-white/5 bg-zinc-950 shadow-2xl transition-all duration-500 ease-out hover:scale-[1.04] hover:-translate-y-1 hover:border-[#E50914]/40 hover:shadow-[0_20px_35px_rgba(0,0,0,0.9)]"
      onClick={onClick}
    >
      {/* Movie Poster Image */}
      <ImageWithFallback
        src={imageSrc}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
      />

      {/* Cinematic Vignette/Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-85 transition-opacity duration-500 group-hover:opacity-100 z-10 pointer-events-none" />

      {/* Action Hover Overlay (Play Button) */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out z-20">
        <div className="bg-[#E50914] text-white rounded-full p-3.5 transform scale-75 group-hover:scale-100 transition-all duration-300 ease-out shadow-[0_0_25px_rgba(229,9,20,0.8)] border border-red-500/30">
          <Play className="w-6 h-6 fill-white text-white translate-x-[1px]" />
        </div>
      </div>

      {/* Badges Overlay (Top Left) */}
      <div className="absolute top-1.5 left-1.5 flex flex-row items-center gap-1 z-20 pointer-events-none">
        {isNew && (
          <Badge className="bg-[#E50914] hover:bg-[#E50914] text-white text-[8px] font-black px-1.5 py-0 rounded border-0 shadow-[0_2px_8px_rgba(229,9,20,0.5)] leading-4 whitespace-nowrap">
            NEW
          </Badge>
        )}
        {category && (
          <Badge className="bg-black/70 hover:bg-black/70 text-zinc-200 border border-white/10 backdrop-blur-md text-[8px] font-bold px-1.5 py-0 rounded leading-4 whitespace-nowrap max-w-[60px] truncate">
            {category}
          </Badge>
        )}
      </div>

      {/* Media Details Overlay (Bottom) */}
      <div className="absolute inset-x-0 bottom-0 p-2 flex flex-col items-start justify-end z-20 transition-all duration-300 ease-out translate-y-2 group-hover:translate-y-0">
        {/* Title */}
        <h3 className="text-white font-black text-sm sm:text-base leading-tight tracking-tight line-clamp-1 group-hover:line-clamp-2 mb-1 drop-shadow-md text-left w-full">
          {title}
        </h3>

        {/* Metadata Line */}
        <div className="flex items-center justify-start gap-2 text-zinc-300 text-[11px] font-semibold drop-shadow-md">
          {year && <span>{year}</span>}
          {year && rating && <span className="text-zinc-600">•</span>}
          {rating && (
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-amber-400">{Number(rating).toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Dynamic Synopsis (Revealed on Hover) */}
        {description && (
          <p className="text-zinc-400 text-[11px] leading-normal line-clamp-2 h-0 opacity-0 group-hover:h-8 group-hover:opacity-100 transition-all duration-300 ease-out mt-2 font-medium text-left w-full">
            {description}
          </p>
        )}

        {/* Glassmorphic "View Details" hint */}
        <div className="flex items-center gap-1 text-[10px] font-black text-[#E50914] mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span>VIEW DETAILS</span>
          <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300">→</span>
        </div>
      </div>
    </div>
  );
}
