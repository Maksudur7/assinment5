interface AdSlotProps {
  type: "header" | "sidebar" | "footer" | "below-player";
  className?: string;
}

export function AdSlot({ type, className = "" }: AdSlotProps) {
  const dimensions = {
    header: "728 × 90",
    sidebar: "300 × 600",
    footer: "728 × 90",
    "below-player": "728 × 90",
  };

  const heights = {
    header: "h-[90px]",
    sidebar: "h-[600px]",
    footer: "h-[90px]",
    "below-player": "h-[90px]",
  };

  return (
    <div
      className={`bg-zinc-900 border border-white/5 rounded-lg flex flex-col items-center justify-center ${heights[type]} ${className}`}
    >
      <p className="text-white/40 text-sm">Advertisement</p>
      <p className="text-white/20 text-xs mt-1">{dimensions[type]} Ad Slot</p>
    </div>
  );
}
