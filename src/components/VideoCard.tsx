interface VideoCardProps {
  id: string;
  title: string;
  thumbnail: string;
  duration?: string;
  rating?: number;
  year?: string;
  category?: string;
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
  isNew,
  onClick,
}: VideoCardProps) {
  return (
    <div
      className="group relative cursor-pointer rounded-lg overflow-hidden bg-zinc-900 transition-all duration-300 hover:scale-105 hover:z-10"
      onClick={onClick}
    >
      <div className="relative aspect-2/3 overflow-hidden">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-2 left-2 flex gap-2">
          {isNew && <span className="bg-[#E50914] text-white px-2 py-0.5 rounded text-xs">NEW</span>}
          {category && (
            <span className="bg-black/60 border border-white/20 text-white px-2 py-0.5 rounded text-xs">
              {category}
            </span>
          )}
        </div>

        {duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-white text-xs">
            {duration}
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="text-white line-clamp-2 mb-1">{title}</h3>
        <div className="flex items-center gap-3 text-white/60 text-sm">
          {year && <span>{year}</span>}
          {rating && <span>⭐ {rating}</span>}
        </div>
      </div>
    </div>
  );
}
