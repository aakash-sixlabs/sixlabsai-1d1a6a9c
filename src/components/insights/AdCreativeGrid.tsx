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

export const AdCreativeGrid = ({ ads, title, onAdClick }: AdCreativeGridProps) => {
  if (ads.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="font-display font-semibold text-sm text-muted-foreground mb-3">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className="rounded-xl border border-border bg-card overflow-hidden group hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-square bg-secondary/30">
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
        <div className="absolute bottom-2 left-2">
          <Badge className="bg-card/90 backdrop-blur-sm text-foreground border-0 text-[10px] font-medium gap-1 shadow-sm">
            <TrendingUp className="w-3 h-3" />
            {ad.score}
          </Badge>
        </div>
        {/* Menu */}
        <div className="absolute top-1.5 right-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-card/80 backdrop-blur-sm hover:bg-card"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem className="text-xs">View Details</DropdownMenuItem>
              <DropdownMenuItem className="text-xs">Save Ad</DropdownMenuItem>
              <DropdownMenuItem className="text-xs">Remix</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Info */}
      <div className="px-3 py-2.5">
        <p className="text-xs font-medium text-foreground truncate mb-1">{ad.adName}</p>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span>{fmtCompact(ad.spend, "$")}</span>
          <span>{ad.roas != null ? `${ad.roas.toFixed(1)}x` : "—"}</span>
          <span>{ad.ctr != null ? `${ad.ctr.toFixed(1)}% CTR` : ""}</span>
        </div>
      </div>
    </motion.div>
  );
}
