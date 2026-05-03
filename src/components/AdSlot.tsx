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
      className={`bg-card border border-border rounded-lg flex flex-col items-center justify-center ${heights[type]} ${className}`}
    >
      <p className="text-muted-foreground text-sm">Advertisement</p>
      <p className="text-muted-foreground/60 text-xs mt-1">{dimensions[type]} Ad Slot</p>
    </div>
  );
}
