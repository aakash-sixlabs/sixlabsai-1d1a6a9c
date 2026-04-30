import { motion } from "framer-motion";
import { MoreHorizontal, TrendingUp } from "lucide-react";
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
  subtitle?: string;
  onAdClick?: (id: string) => void;
}

const fmtCompact = (n: number | null | undefined, prefix = "") => {
  if (n == null) return "—";
  const v = Number(n);
  if (v >= 1_000_000) return `${prefix}${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${prefix}${(v / 1_000).toFixed(1)}K`;
  return `${prefix}${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

export const AdCreativeGrid = ({ ads, title, subtitle, onAdClick }: AdCreativeGridProps) => {
  if (ads.length === 0) return null;

  return (
    <div className="mb-10">
      <h3 className="font-display font-semibold text-sm text-foreground mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {ads.map((ad, i) => (
          <AdCard key={ad.id} ad={ad} index={i} onClick={() => onAdClick?.(ad.id)} />
        ))}
      </div>
    </div>
  );
};

function AdCard({ ad, index, onClick }: { ad: AdCreativeCardData; index: number; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="rounded-2xl border border-border/60 bg-card overflow-hidden group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-square bg-secondary/20">
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
        {/* Score pill */}
        <div className="absolute bottom-2.5 left-2.5">
          <Badge className="bg-card/95 backdrop-blur-md text-foreground border-0 text-[10px] font-semibold gap-1 shadow-md rounded-lg px-2 py-1">
            <TrendingUp className="w-3 h-3 text-accent" />
            {ad.score}
          </Badge>
        </div>
        {/* Menu */}
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-card/90 backdrop-blur-md hover:bg-card rounded-lg shadow-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 rounded-xl">
              <DropdownMenuItem className="text-xs rounded-lg">View Details</DropdownMenuItem>
              <DropdownMenuItem className="text-xs rounded-lg">Save Ad</DropdownMenuItem>
              <DropdownMenuItem className="text-xs rounded-lg">Remix</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Info */}
      <div className="px-4 py-3.5">
        <p className="text-sm font-semibold text-foreground truncate mb-3">{ad.adName}</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-secondary/50 px-2 py-1.5">
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground font-semibold leading-none mb-1">Spend</p>
            <p className="text-sm font-semibold text-foreground leading-none">{fmtCompact(ad.spend, "$")}</p>
          </div>
          <div className="rounded-lg bg-accent/10 px-2 py-1.5">
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground font-semibold leading-none mb-1">ROAS</p>
            <p className="text-sm font-semibold text-accent leading-none">
              {ad.roas != null ? `${ad.roas.toFixed(1)}x` : "—"}
            </p>
          </div>
          <div className="rounded-lg bg-secondary/50 px-2 py-1.5">
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground font-semibold leading-none mb-1">CTR</p>
            <p className="text-sm font-semibold text-foreground leading-none">
              {ad.ctr != null ? `${ad.ctr.toFixed(1)}%` : "—"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
