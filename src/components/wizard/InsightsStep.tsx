import { motion } from "framer-motion";
import { useWizard } from "@/context/WizardContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Lightbulb,
  BarChart3,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Creative {
  id: string;
  ad_id: string;
  creative_type: string;
  headline: string | null;
  primary_text: string | null;
  call_to_action: string | null;
  image_urls: any;
  destination_url: string | null;
}

interface Insight {
  ad_id: string;
  spend: number | null;
  impressions: number | null;
  clicks: number | null;
  ctr: number | null;
  cpc: number | null;
  roas: number | null;
  conversions: number | null;
  conversion_value: number | null;
}

interface Ad {
  id: string;
  ad_id: string;
  ad_name: string;
  status: string | null;
}

interface EnrichedCreative {
  creative: Creative;
  ad: Ad;
  insight: Insight | undefined;
  score: number; // 0-100 performance percentile
  decayScore: number; // 0-100 how stale
  whatsWorking: string[];
  whatsNot: string[];
  opportunities: string[];
}

const fmt = (n: number | null | undefined, prefix = "", suffix = "") =>
  n != null ? `${prefix}${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}${suffix}` : "—";

function computeDecay(insight: Insight | undefined): number {
  if (!insight) return 0;
  const spend = insight.spend ?? 0;
  const roas = insight.roas ?? 0;
  const ctr = insight.ctr ?? 0;
  // Higher spend with low returns = more decay
  if (spend === 0) return 0;
  const roasDecay = roas < 1 ? 80 : roas < 2 ? 50 : roas < 4 ? 25 : 10;
  const ctrDecay = ctr < 0.5 ? 30 : ctr < 1 ? 15 : 0;
  return Math.min(100, Math.round((roasDecay + ctrDecay) * (spend > 100 ? 1.2 : 1)));
}

function analyzeCreative(creative: Creative, insight: Insight | undefined): { working: string[]; notWorking: string[]; opportunities: string[] } {
  const working: string[] = [];
  const notWorking: string[] = [];
  const opportunities: string[] = [];

  const ctr = insight?.ctr ?? 0;
  const roas = insight?.roas ?? 0;
  const cpc = insight?.cpc ?? 0;
  const spend = insight?.spend ?? 0;
  const conversions = insight?.conversions ?? 0;

  // What's working
  if (ctr > 1.5) working.push("Strong click-through rate");
  if (roas > 3) working.push("High return on ad spend");
  if (cpc < 1 && cpc > 0) working.push("Efficient cost per click");
  if (conversions > 5) working.push("Driving conversions");
  if (creative.headline && creative.headline.split(" ").length <= 8) working.push("Concise headline");
  if (creative.creative_type === "static_single") working.push("Clean single-image format");
  if (creative.call_to_action) working.push(`CTA: ${creative.call_to_action.replace(/_/g, " ")}`);

  // What's not working
  if (ctr < 0.5 && spend > 10) notWorking.push("Below-average CTR");
  if (roas < 1 && spend > 50) notWorking.push("Negative ROAS — spending more than earning");
  if (cpc > 3) notWorking.push("High cost per click");
  if (!creative.headline) notWorking.push("Missing headline copy");
  if (creative.headline && creative.headline.split(" ").length > 12) notWorking.push("Headline too long");
  if (spend > 100 && conversions === 0) notWorking.push("No conversions despite significant spend");

  // Opportunities
  if (ctr < 1) opportunities.push("Test lifestyle imagery to boost engagement");
  if (!creative.headline || creative.headline.split(" ").length > 8) opportunities.push("Shorten headline to <8 benefit-led words");
  if (roas < 2 && spend > 20) opportunities.push("Refresh creative to combat ad fatigue");
  if (creative.creative_type !== "static_carousel") opportunities.push("Test carousel format for more real estate");
  if (!creative.call_to_action) opportunities.push("Add a clear call-to-action");
  if (conversions === 0 && spend > 0) opportunities.push("Rethink targeting + creative angle");

  // Ensure at least one item in each
  if (working.length === 0) working.push("Active and running");
  if (notWorking.length === 0) notWorking.push("No major issues detected");

  return { working, notWorking, opportunities };
}

export const InsightsStep = () => {
  const { setStep } = useWizard();
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState<Ad[]>([]);
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const [a, cr, i] = await Promise.all([
        supabase.from("ads").select("*"),
        supabase.from("ad_creatives").select("*"),
        supabase.from("ad_insights").select("*"),
      ]);
      setAds(a.data || []);
      setCreatives(cr.data || []);
      setInsights(i.data || []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const insightByAd = useMemo(() => {
    const m = new Map<string, Insight>();
    insights.forEach((i) => m.set(i.ad_id, i));
    return m;
  }, [insights]);

  const adMap = useMemo(() => {
    const m = new Map<string, Ad>();
    ads.forEach((a) => m.set(a.id, a));
    return m;
  }, [ads]);

  const enriched: EnrichedCreative[] = useMemo(() => {
    // Only supported creatives
    const supported = creatives.filter(
      (c) => c.creative_type === "static_single" || c.creative_type === "static_carousel"
    );

    const withScores = supported.map((c) => {
      const insight = insightByAd.get(c.ad_id);
      const ad = adMap.get(c.ad_id);
      if (!ad) return null;

      // Score based on ROAS + CTR + spend efficiency
      const roas = insight?.roas ?? 0;
      const ctr = insight?.ctr ?? 0;
      const score = Math.min(100, Math.round(roas * 15 + ctr * 20));
      const decayScore = computeDecay(insight);
      const analysis = analyzeCreative(c, insight);

      return {
        creative: c,
        ad,
        insight,
        score,
        decayScore,
        whatsWorking: analysis.working,
        whatsNot: analysis.notWorking,
        opportunities: analysis.opportunities,
      } as EnrichedCreative;
    }).filter(Boolean) as EnrichedCreative[];

    // Sort by score descending
    withScores.sort((a, b) => b.score - a.score);
    return withScores;
  }, [creatives, insightByAd, adMap]);

  const top20 = useMemo(() => {
    const cutoff = Math.max(1, Math.ceil(enriched.length * 0.2));
    return enriched.slice(0, cutoff);
  }, [enriched]);

  const bottom20 = useMemo(() => {
    const cutoff = Math.max(1, Math.ceil(enriched.length * 0.2));
    return enriched.slice(-cutoff);
  }, [enriched]);

  const middle = useMemo(() => {
    const topCut = Math.max(1, Math.ceil(enriched.length * 0.2));
    const bottomCut = Math.max(1, Math.ceil(enriched.length * 0.2));
    return enriched.slice(topCut, enriched.length - bottomCut);
  }, [enriched]);

  if (loading) {
    return (
      <div className="container max-w-7xl py-16 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <BarChart3 className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Creative Insights</h2>
            </div>
            <p className="text-muted-foreground text-sm">
              {enriched.length} supported creatives analyzed · Ranked by performance score
            </p>
          </div>
          <Button size="lg" className="gap-2" onClick={() => setStep("pdp-input")}>
            Generate New Creative <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Top 20% */}
        <TierSection
          title="Top 20% Performers"
          icon={<TrendingUp className="w-5 h-5 text-success" />}
          badgeClass="bg-success/10 text-success border-success/20"
          items={top20}
          showRegenerate={false}
        />

        {/* Middle */}
        <TierSection
          title="Middle Performers"
          icon={<Minus className="w-5 h-5 text-warning" />}
          badgeClass="bg-warning/10 text-warning border-warning/20"
          items={middle}
          showRegenerate={true}
        />

        {/* Bottom 20% */}
        <TierSection
          title="Bottom 20% Performers"
          icon={<TrendingDown className="w-5 h-5 text-destructive" />}
          badgeClass="bg-destructive/10 text-destructive border-destructive/20"
          items={bottom20}
          showRegenerate={true}
        />
      </motion.div>
    </div>
  );
};

function TierSection({
  title,
  icon,
  badgeClass,
  items,
  showRegenerate,
}: {
  title: string;
  icon: React.ReactNode;
  badgeClass: string;
  items: EnrichedCreative[];
  showRegenerate: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="font-display font-semibold text-lg text-foreground">{title}</h3>
        <Badge variant="outline" className={badgeClass}>
          {items.length}
        </Badge>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <CreativeCard key={item.creative.id} item={item} showRegenerate={showRegenerate} />
        ))}
      </div>
    </div>
  );
}

function DecayMeter({ score }: { score: number }) {
  const color =
    score >= 60 ? "bg-destructive" : score >= 30 ? "bg-warning" : "bg-success";
  const label =
    score >= 60 ? "High Decay" : score >= 30 ? "Moderate" : "Fresh";

  return (
    <div className="flex items-center gap-2">
      <div className="text-xs font-medium text-muted-foreground w-16">{label}</div>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${score}%` }} />
      </div>
      <div className="text-xs font-semibold text-foreground w-8 text-right">{score}</div>
    </div>
  );
}

function CreativeCard({ item, showRegenerate }: { item: EnrichedCreative; showRegenerate: boolean }) {
  const imgs = Array.isArray(item.creative.image_urls) ? item.creative.image_urls : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-5 flex gap-5"
    >
      {/* Creative image — large */}
      <div className="shrink-0">
        {imgs.length > 0 ? (
          <div className="flex gap-2">
            {imgs.slice(0, 3).map((url: string, i: number) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg overflow-hidden border border-border/50 hover:border-primary/50 transition-colors"
              >
                <img src={url} alt="" className="w-36 h-36 object-cover" loading="lazy" />
              </a>
            ))}
          </div>
        ) : (
          <div className="w-36 h-36 rounded-lg bg-muted/30 flex items-center justify-center text-muted-foreground text-xs">
            No image
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Top row: name + metrics */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-semibold text-foreground text-sm truncate max-w-md" title={item.ad.ad_name}>
              {item.ad.ad_name}
            </div>
            {item.creative.headline && (
              <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.creative.headline}</div>
            )}
          </div>
          <div className="flex gap-4 text-xs shrink-0">
            <div className="text-center">
              <div className="font-bold text-foreground">{fmt(item.insight?.spend, "$")}</div>
              <div className="text-muted-foreground">Spend</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-foreground">{fmt(item.insight?.ctr, "", "%")}</div>
              <div className="text-muted-foreground">CTR</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-foreground">{fmt(item.insight?.roas, "", "x")}</div>
              <div className="text-muted-foreground">ROAS</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-foreground">{fmt(item.insight?.conversions)}</div>
              <div className="text-muted-foreground">Conv.</div>
            </div>
          </div>
        </div>

        {/* Decay score */}
        <div className="max-w-xs">
          <div className="text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Creative Decay Score
          </div>
          <DecayMeter score={item.decayScore} />
        </div>

        {/* Analysis columns */}
        <div className="grid grid-cols-2 gap-4">
          {/* What's working */}
          <div>
            <div className="flex items-center gap-1 text-xs font-semibold text-success mb-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> What's Working
            </div>
            <ul className="space-y-1">
              {item.whatsWorking.slice(0, 3).map((w, i) => (
                <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                  <span className="text-success mt-0.5 shrink-0">✓</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>

          {/* What's not working */}
          <div>
            <div className="flex items-center gap-1 text-xs font-semibold text-destructive mb-1.5">
              <XCircle className="w-3.5 h-3.5" /> What's Not Working
            </div>
            <ul className="space-y-1">
              {item.whatsNot.slice(0, 3).map((w, i) => (
                <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                  <span className="text-destructive mt-0.5 shrink-0">✗</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Opportunities + Regenerate (only for middle/bottom) */}
        {showRegenerate && item.opportunities.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center gap-1 text-xs font-semibold text-primary mb-2">
              <Lightbulb className="w-3.5 h-3.5" /> Opportunities
            </div>
            <ul className="space-y-1 mb-3">
              {item.opportunities.slice(0, 3).map((o, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-primary mt-0.5 shrink-0">→</span>
                  {o}
                </li>
              ))}
            </ul>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <RefreshCw className="w-3.5 h-3.5" /> Regenerate Creative
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
