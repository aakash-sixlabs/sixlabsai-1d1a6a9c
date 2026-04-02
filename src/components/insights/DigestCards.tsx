import { TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";

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

export const DigestCards = ({
  totalAds,
  newAdsLast14Days,
  velocityChange,
  topPerformer,
  formatMix,
}: DigestCardsProps) => {
  const total = formatMix.video + formatMix.static + formatMix.carousel || 1;
  const staticPct = Math.round((formatMix.static / total) * 100);
  const carouselPct = Math.round((formatMix.carousel / total) * 100);
  const videoPct = Math.round((formatMix.video / total) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
      {/* Creative Velocity */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs font-medium text-muted-foreground mb-3">Creative Velocity</p>
        <p className="text-3xl font-bold text-foreground mb-1">{totalAds} <span className="text-sm font-normal text-muted-foreground">active creatives</span></p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={velocityChange >= 0 ? "text-accent font-medium" : "text-destructive font-medium"}>
            {velocityChange >= 0 ? "+" : ""}{velocityChange}%
          </span>
          <span>vs last 14 days</span>
        </div>
        <p className="text-[11px] text-muted-foreground/70 mt-2">You're scaling production — keep momentum with data-backed creatives.</p>
      </div>

      {/* Top Performer */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground">Top Performer</p>
          <div className="flex gap-0.5">
            <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-secondary transition-colors">
              <ChevronLeft className="w-3 h-3 text-muted-foreground" />
            </button>
            <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-secondary transition-colors">
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        </div>
        {topPerformer ? (
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">{topPerformer.name}</p>
            <p className="text-xs text-accent font-medium mb-2">{topPerformer.roas.toFixed(1)}x ROAS</p>
            <div className="text-[11px] text-muted-foreground space-y-0.5">
              <p>Avg spend: <span className="text-foreground font-medium">${topPerformer.avgSpend.toLocaleString()}</span></p>
              <p>Format: <span className="text-foreground font-medium">{topPerformer.topFormat}</span></p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No data yet</p>
        )}
      </div>

      {/* Format Mix */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs font-medium text-muted-foreground mb-3">Format Mix</p>
        {/* Stacked bar */}
        <div className="flex rounded-full overflow-hidden h-2 mb-3 bg-secondary">
          <div className="bg-primary h-full" style={{ width: `${staticPct}%` }} />
          <div className="bg-accent h-full" style={{ width: `${carouselPct}%` }} />
          <div className="bg-muted-foreground/30 h-full" style={{ width: `${videoPct}%` }} />
        </div>
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" /> Static {staticPct}%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent" /> Carousel {carouselPct}%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/30" /> Video {videoPct}%
          </span>
        </div>
      </div>
    </div>
  );
};
