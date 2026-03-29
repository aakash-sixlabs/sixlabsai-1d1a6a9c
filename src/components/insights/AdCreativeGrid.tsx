import { motion } from "framer-motion";
import { MoreHorizontal, Play, TrendingUp, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface AdCreativeCardData {
  id: string;
  adName: string;
  campaignName: string;
  imageUrl: string | null;
  creativeType: string;
  score: number;
  decayScore: number;
  spend: number | null;
  roas: number | null;
  ctr: number | null;
  impressions: number | null;
}

interface AdCreativeGridProps {
  ads: AdCreativeCardData[];
  title: string;
  onAdClick?: (id: string) => void;
}

const fmtCompact = (n: number | null | undefined, prefix = "") => {
  if (n == null) return "—";
  const v = Number(n);
  if (v >= 1_000_000) return `${prefix}${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${prefix}${(v / 1_000).toFixed(1)}K`;
  return `${prefix}${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

export const AdCreativeGrid = ({ ads, title, onAdClick }: AdCreativeGridProps) => {
  if (ads.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="font-display font-bold text-xl text-foreground mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {ads.map((ad, i) => (
          <AdCard key={ad.id} ad={ad} index={i} onClick={() => onAdClick?.(ad.id)} />
        ))}
      </div>
    </div>
  );
};

function AdCard({ ad, index, onClick }: { ad: AdCreativeCardData; index: number; onClick: () => void }) {
  const decayColor =
    ad.decayScore >= 60 ? "text-destructive" : ad.decayScore >= 30 ? "text-warning" : "text-success";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="rounded-xl border border-border bg-card overflow-hidden group hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* Header with campaign name + menu */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/50">
        <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-primary">
            {ad.campaignName.substring(0, 2).toUpperCase()}
          </span>
        </div>
        <span className="text-sm font-medium text-foreground truncate flex-1">{ad.adName}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Save Ad</DropdownMenuItem>
            <DropdownMenuItem>Regenerate</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Image / Preview */}
      <div className="relative aspect-square bg-muted/20">
        {ad.imageUrl ? (
          <img
            src={ad.imageUrl}
            alt={ad.adName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            No preview
          </div>
        )}
        {/* Type badge */}
        {ad.creativeType.includes("carousel") && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-background/80 backdrop-blur-sm text-foreground border-0 text-[10px]">
              Carousel
            </Badge>
          </div>
        )}
        {/* Play button for video */}
        {ad.creativeType.includes("video") && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-4 h-4 text-foreground fill-foreground" />
            </div>
          </div>
        )}
        {/* Score pill */}
        <div className="absolute bottom-2 left-2">
          <Badge className="bg-background/80 backdrop-blur-sm text-foreground border-0 text-[10px] font-semibold gap-1">
            <TrendingUp className="w-3 h-3" />
            {ad.score}
          </Badge>
        </div>
      </div>

      {/* Bottom metrics */}
      <div className="px-3 py-2.5 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[10px] text-muted-foreground">Spend</p>
          <p className="text-xs font-semibold text-foreground">{fmtCompact(ad.spend, "$")}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">ROAS</p>
          <p className="text-xs font-semibold text-foreground">
            {ad.roas != null ? `${ad.roas.toFixed(1)}x` : "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Decay</p>
          <p className={`text-xs font-semibold ${decayColor}`}>{ad.decayScore}</p>
        </div>
      </div>
    </motion.div>
  );
}
