import { TrendingUp, ChevronLeft, ChevronRight, Zap, Award, BarChart3 } from "lucide-react";

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10">
      {/* Creative Velocity */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap className="w-4.5 h-4.5 text-primary" />
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Creative Velocity</p>
        </div>
        <p className="text-4xl font-bold text-foreground mb-1.5 tracking-tight">{totalAds}</p>
        <p className="text-sm text-muted-foreground mb-3">active creatives</p>
        <div className="flex items-center gap-2 text-xs">
          <span className={`font-semibold px-2 py-0.5 rounded-full ${velocityChange >= 0 ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}>
            {velocityChange >= 0 ? "+" : ""}{velocityChange}%
          </span>
          <span className="text-muted-foreground">vs last 14 days</span>
        </div>
      </div>

      {/* Top Performer */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
              <Award className="w-4.5 h-4.5 text-accent" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top Performer</p>
          </div>
          <div className="flex gap-1">
            <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors border border-border/40">
              <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors border border-border/40">
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
        {topPerformer ? (
          <div>
            <p className="text-sm font-bold text-foreground mb-1.5">{topPerformer.name}</p>
            <p className="text-lg font-bold text-accent mb-3">{topPerformer.roas.toFixed(1)}x ROAS</p>
            <div className="text-xs text-muted-foreground space-y-1.5">
              <div className="flex items-center justify-between py-1 border-b border-border/30">
                <span>Avg Spend</span>
                <span className="text-foreground font-semibold">${topPerformer.avgSpend.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Format</span>
                <span className="text-foreground font-semibold">{topPerformer.topFormat}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No data yet</p>
        )}
      </div>

      {/* Format Mix */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-4.5 h-4.5 text-primary" />
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Format Mix</p>
        </div>
        {/* Stacked bar */}
        <div className="flex rounded-full overflow-hidden h-3 mb-4 bg-secondary shadow-inner">
          <div className="bg-primary h-full transition-all duration-500" style={{ width: `${staticPct}%` }} />
          <div className="bg-accent h-full transition-all duration-500" style={{ width: `${carouselPct}%` }} />
          <div className="bg-muted-foreground/20 h-full transition-all duration-500" style={{ width: `${videoPct}%` }} />
        </div>
        <div className="flex items-center gap-5 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm" /> Static {staticPct}%
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent shadow-sm" /> Carousel {carouselPct}%
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" /> Video {videoPct}%
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground/60 mt-3">Static drives most performance — test video for incremental lift</p>
      </div>
    </div>
  );
};
