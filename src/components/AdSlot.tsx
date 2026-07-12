import { PlayCircle, Zap } from "lucide-react";

interface AdSlotProps {
  type: 
    | "header" 
    | "sidebar" 
    | "sidebar-rectangle" 
    | "footer" 
    | "below-player" 
    | "banner-horizontal"
    | "in-feed";
  className?: string;
}

export function AdSlot({ type, className = "" }: AdSlotProps) {
  const adConfig = {
    header: { dim: "728 × 90", height: "h-[90px]" },
    footer: { dim: "728 × 90", height: "h-[90px]" },
    "below-player": { dim: "728 × 90", height: "h-[90px]" },
    "banner-horizontal": { dim: "728 × 90", height: "h-[90px]" },
    "in-feed": { dim: "970 × 250", height: "h-[250px]" },
    sidebar: { dim: "300 × 600", height: "h-[600px]" },
    "sidebar-rectangle": { dim: "300 × 384", height: "h-[384px]" },
  };

  const { dim, height } = adConfig[type];

  return (
    <div className={`w-full overflow-hidden rounded-lg border border-border bg-card relative group ${height} ${className}`}>
      {/* Background gradients and animations */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/40 to-muted/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(229,9,20,0.03)_0%,_transparent_100%)] group-hover:bg-[radial-gradient(circle_at_50%_50%,_rgba(229,9,20,0.06)_0%,_transparent_100%)] transition-colors duration-500" />
      
      {/* Dashed border effect */}
      <div className="absolute inset-2 border-2 border-dashed border-border/50 rounded-md pointer-events-none" />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center p-6 space-y-2 z-10">
        <div className="w-12 h-12 rounded-full bg-background/80 shadow-sm mx-auto flex items-center justify-center border border-border backdrop-blur-sm group-hover:scale-105 transition-transform duration-300">
          <Zap className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <p className="text-muted-foreground text-xs uppercase tracking-widest font-semibold">Advertisement</p>
        <p className="text-muted-foreground/60 text-[10px]">{dim} Ad Space</p>
      </div>
    </div>
  );
}
