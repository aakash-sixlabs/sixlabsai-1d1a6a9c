import { TrendingUp, ChevronLeft, ChevronRight, Play, Image, LayoutGrid } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DigestCardsProps {
  totalAds: number;
  newAdsLast14Days: number;
  velocityChange: number;
  topPerformer: {
    name: string;
    roas: number;
    newAds: number;
    avgSpend: number;
    topFormat: string;
  } | null;
  formatMix: {
    video: number;
    static: number;
    carousel: number;
  };
}

const fmtPct = (n: number) => `${Math.round(n)}%`;

export const DigestCards = ({
  totalAds,
  newAdsLast14Days,
  velocityChange,
  topPerformer,
  formatMix,
}: DigestCardsProps) => {
  const total = formatMix.video + formatMix.static + formatMix.carousel || 1;
  const videoPct = (formatMix.video / total) * 100;
  const staticPct = (formatMix.static / total) * 100;
  const carouselPct = (formatMix.carousel / total) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
      {/* Creative Velocity */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display font-semibold text-base text-foreground">Creative Velocity</h3>
          <Badge
            variant="secondary"
            className={`text-xs font-semibold gap-1 ${velocityChange >= 0 ? "text-success" : "text-destructive"}`}
          >
            <TrendingUp className="w-3 h-3" />
            {velocityChange >= 0 ? "+" : ""}
            {velocityChange}% last 14 days
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm mb-4">
          <span className="text-2xl font-bold text-foreground">{totalAds.toLocaleString()}</span>{" "}
          total ads tracked
        </p>
        <p className="text-xs text-muted-foreground">
          {newAdsLast14Days} new creatives in last 14 days
        </p>
      </div>

      {/* Top Performer Spotlight */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-base text-foreground">Top Performer</h3>
          <div className="flex gap-1">
            <button className="w-6 h-6 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors">
              <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button className="w-6 h-6 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors">
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
        {topPerformer ? (
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">★</span>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{topPerformer.name}</p>
                <p className="text-xs text-success font-medium">
                  +{topPerformer.roas.toFixed(1)}x ROAS
                </p>
              </div>
            </div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>
                • <span className="font-medium text-foreground">{topPerformer.newAds}</span> ads in last 14 days
              </li>
              <li>
                • Avg spend: <span className="font-medium text-foreground">${topPerformer.avgSpend.toLocaleString()}</span>
              </li>
              <li>
                • Top format: <span className="font-medium text-foreground">{topPerformer.topFormat}</span>
              </li>
            </ul>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No performance data yet</p>
        )}
      </div>

      {/* Format Mix Trends */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-display font-semibold text-base text-foreground mb-4">Format Mix</h3>
        <div className="flex items-center gap-6">
          {/* Donut chart (CSS) */}
          <div className="relative w-24 h-24 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle
                cx="18" cy="18" r="14"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="4"
              />
              <circle
                cx="18" cy="18" r="14"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="4"
                strokeDasharray={`${videoPct * 0.88} ${88 - videoPct * 0.88}`}
                strokeDashoffset="0"
              />
              <circle
                cx="18" cy="18" r="14"
                fill="none"
                stroke="hsl(var(--destructive))"
                strokeWidth="4"
                strokeDasharray={`${carouselPct * 0.88} ${88 - carouselPct * 0.88}`}
                strokeDashoffset={`${-videoPct * 0.88}`}
              />
              <circle
                cx="18" cy="18" r="14"
                fill="none"
                stroke="hsl(var(--accent))"
                strokeWidth="4"
                strokeDasharray={`${staticPct * 0.88} ${88 - staticPct * 0.88}`}
                strokeDashoffset={`${-(videoPct + carouselPct) * 0.88}`}
              />
            </svg>
          </div>
          {/* Legend */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">Video</span>
              <span className="text-xs font-semibold text-foreground ml-auto">{fmtPct(videoPct)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
              <span className="text-xs text-muted-foreground">Carousel</span>
              <span className="text-xs font-semibold text-foreground ml-auto">{fmtPct(carouselPct)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-accent" />
              <span className="text-xs text-muted-foreground">Static</span>
              <span className="text-xs font-semibold text-foreground ml-auto">{fmtPct(staticPct)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
