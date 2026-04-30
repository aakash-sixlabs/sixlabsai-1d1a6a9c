import { useState } from "react";
import { ChevronLeft, ChevronRight, Zap, Award, BarChart3 } from "lucide-react";

export interface TopPerformerSlide {
  name: string;
  metricLabel: string;
  metricValue: string;
  avgSpend: number;
  topFormat: string;
}

interface DigestCardsProps {
  activeCreativeCount: number;
  topPerformers: TopPerformerSlide[];
  formatMix: {
    video: number;
    static: number;
    carousel: number;
  };
}

export const DigestCards = ({
  activeCreativeCount,
  topPerformers,
  formatMix,
}: DigestCardsProps) => {
  const total = formatMix.video + formatMix.static + formatMix.carousel || 1;
  const staticPct = Math.round((formatMix.static / total) * 100);
  const carouselPct = Math.round((formatMix.carousel / total) * 100);
  const videoPct = Math.round((formatMix.video / total) * 100);

  const [slide, setSlide] = useState(0);
  const slideCount = topPerformers.length;
  const current = slideCount > 0 ? topPerformers[slide % slideCount] : null;
  const go = (delta: number) => {
    if (slideCount === 0) return;
    setSlide((s) => (s + delta + slideCount) % slideCount);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10">
      {/* Tile 1: Active Creatives */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap className="w-4.5 h-4.5 text-primary" />
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Creatives</p>
        </div>
        <p className="text-4xl font-bold text-foreground mb-1.5 tracking-tight">{activeCreativeCount}</p>
        <p className="text-sm text-muted-foreground mb-1">unique creatives</p>
        <p className="text-xs text-muted-foreground/70">currently used in active ads</p>
      </div>

      {/* Tile 2: Top Performer (3-slide carousel) */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
              <Award className="w-4.5 h-4.5 text-accent" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {current ? `Top by ${current.metricLabel}` : "Top Performer"}
            </p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => go(-1)}
              disabled={slideCount === 0}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors border border-border/40 disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button
              onClick={() => go(1)}
              disabled={slideCount === 0}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors border border-border/40 disabled:opacity-40"
            >
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
        {current ? (
          <div>
            <p className="text-sm font-bold text-foreground mb-1.5 truncate">{current.name}</p>
            <p className="text-lg font-bold text-accent mb-3">{current.metricValue}</p>
            <div className="text-xs text-muted-foreground space-y-1.5">
              <div className="flex items-center justify-between py-1 border-b border-border/30">
                <span>Avg Spend</span>
                <span className="text-foreground font-semibold">${current.avgSpend.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Format</span>
                <span className="text-foreground font-semibold">{current.topFormat}</span>
              </div>
            </div>
            {slideCount > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-3">
                {topPerformers.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === slide ? "w-4 bg-accent" : "w-1.5 bg-border"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No data yet</p>
        )}
      </div>

      {/* Tile 3: Format Mix */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-4.5 h-4.5 text-primary" />
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Format Mix</p>
        </div>
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
