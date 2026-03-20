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
  Flame,
  Sparkles,
  Filter,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────────

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
  score: number;
  decayScore: number;
  whatsWorking: string[];
  whatsNot: string[];
  opportunities: string[];
}

// ─── Mock Data ───────────────────────────────────────────────────

const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop",
];

const MOCK_AD_NAMES = [
  "Summer-Collection-Hero", "UGC-Testimonial-v3", "Lifestyle-Yoga-Scene",
  "Product-Closeup-Red", "Review-Stars-Overlay", "Before-After-Split",
  "Holiday-Gift-Guide", "Flash-Sale-Countdown", "Influencer-Unbox",
  "Brand-Story-Carousel",
];

const MOCK_HEADLINES = [
  "Can't believe this sold out 3x", "\"Best purchase I've made\"", "Limited drop — 48hrs only",
  "Your new daily essential", "★★★★★ 10K+ reviews", "See the transformation",
  "Gift they'll actually love", "Up to 60% off today", "Watch me unbox this",
  "Our story, your style",
];

function generateMockData(): EnrichedCreative[] {
  const items: EnrichedCreative[] = [];

  const configs = [
    // Top performers
    { spend: 31200, roas: 4.8, ctr: 3.2, impressions: 1350000, clicks: 43200, conversions: 892, convValue: 149760, cpc: 0.72, decay: 12 },
    { spend: 27400, roas: 3.9, ctr: 2.8, impressions: 1100000, clicks: 30800, conversions: 614, convValue: 106860, cpc: 0.89, decay: 18 },
    // Middle
    { spend: 16200, roas: 2.1, ctr: 1.5, impressions: 901000, clicks: 13515, conversions: 203, convValue: 34020, cpc: 1.20, decay: 42 },
    { spend: 12800, roas: 1.8, ctr: 1.2, impressions: 780000, clicks: 9360, conversions: 156, convValue: 23040, cpc: 1.37, decay: 55 },
    { spend: 9400, roas: 1.5, ctr: 1.0, impressions: 620000, clicks: 6200, conversions: 98, convValue: 14100, cpc: 1.52, decay: 48 },
    { spend: 8100, roas: 1.3, ctr: 0.9, impressions: 540000, clicks: 4860, conversions: 72, convValue: 10530, cpc: 1.67, decay: 61 },
    { spend: 7200, roas: 1.1, ctr: 0.8, impressions: 480000, clicks: 3840, conversions: 54, convValue: 7920, cpc: 1.88, decay: 58 },
    { spend: 6500, roas: 1.0, ctr: 0.7, impressions: 420000, clicks: 2940, conversions: 38, convValue: 6500, cpc: 2.21, decay: 65 },
    // Bottom performers
    { spend: 5200, roas: 0.6, ctr: 0.4, impressions: 310000, clicks: 1240, conversions: 12, convValue: 3120, cpc: 4.19, decay: 82 },
    { spend: 4800, roas: 0.3, ctr: 0.2, impressions: 250000, clicks: 500, conversions: 4, convValue: 1440, cpc: 9.60, decay: 91 },
  ];

  configs.forEach((cfg, i) => {
    const insight: Insight = {
      ad_id: `mock-${i}`,
      spend: cfg.spend,
      impressions: cfg.impressions,
      clicks: cfg.clicks,
      ctr: cfg.ctr,
      cpc: cfg.cpc,
      roas: cfg.roas,
      conversions: cfg.conversions,
      conversion_value: cfg.convValue,
    };

    const creative: Creative = {
      id: `mock-c-${i}`,
      ad_id: `mock-${i}`,
      creative_type: i % 3 === 0 ? "static_carousel" : "static_single",
      headline: MOCK_HEADLINES[i],
      primary_text: "Shop now and discover what everyone's talking about.",
      call_to_action: ["SHOP_NOW", "LEARN_MORE", "GET_OFFER", "SIGN_UP"][i % 4],
      image_urls: [MOCK_IMAGES[i]],
      destination_url: "https://example.com",
    };

    const ad: Ad = {
      id: `mock-${i}`,
      ad_id: `mock-ad-${i}`,
      ad_name: MOCK_AD_NAMES[i],
      status: "ACTIVE",
    };

    const score = Math.min(100, Math.round(cfg.roas * 15 + cfg.ctr * 20));
    const analysis = analyzeCreative(creative, insight);

    items.push({
      creative,
      ad,
      insight,
      score,
      decayScore: cfg.decay,
      whatsWorking: analysis.working,
      whatsNot: analysis.notWorking,
      opportunities: analysis.opportunities,
    });
  });

  items.sort((a, b) => b.score - a.score);
  return items;
}

// ─── Helpers ─────────────────────────────────────────────────────

const fmtCompact = (n: number | null | undefined, prefix = "", suffix = "") => {
  if (n == null) return "—";
  const v = Number(n);
  if (v >= 1_000_000) return `${prefix}${(v / 1_000_000).toFixed(1)}M${suffix}`;
  if (v >= 1_000) return `${prefix}${(v / 1_000).toFixed(1)}K${suffix}`;
  return `${prefix}${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}${suffix}`;
};

const fmtNum = (n: number | null | undefined, decimals = 2) =>
  n != null ? Number(n).toLocaleString(undefined, { maximumFractionDigits: decimals }) : "—";

function analyzeCreative(creative: Creative, insight: Insight | undefined): { working: string[]; notWorking: string[]; opportunities: string[] } {
  const working: string[] = [];
  const notWorking: string[] = [];
  const opportunities: string[] = [];

  const ctr = insight?.ctr ?? 0;
  const roas = insight?.roas ?? 0;
  const cpc = insight?.cpc ?? 0;
  const spend = insight?.spend ?? 0;
  const conversions = insight?.conversions ?? 0;

  if (ctr > 1.5) working.push("Strong click-through rate");
  if (roas > 3) working.push("High return on ad spend");
  if (cpc < 1 && cpc > 0) working.push("Efficient cost per click");
  if (conversions > 5) working.push("Driving conversions");
  if (creative.headline && creative.headline.split(" ").length <= 8) working.push("Concise headline");
  if (creative.call_to_action) working.push(`CTA: ${creative.call_to_action.replace(/_/g, " ")}`);

  if (ctr < 0.5 && spend > 10) notWorking.push("Below-average CTR");
  if (roas < 1 && spend > 50) notWorking.push("Negative ROAS");
  if (cpc > 3) notWorking.push("High cost per click");
  if (!creative.headline) notWorking.push("Missing headline");
  if (spend > 100 && conversions === 0) notWorking.push("No conversions despite spend");

  if (ctr < 1) opportunities.push("Test lifestyle imagery to boost engagement");
  if (roas < 2 && spend > 20) opportunities.push("Refresh creative to combat fatigue");
  if (creative.creative_type !== "static_carousel") opportunities.push("Test carousel format");
  if (!creative.call_to_action) opportunities.push("Add a clear call-to-action");
  if (conversions === 0 && spend > 0) opportunities.push("Rethink targeting + creative angle");

  if (working.length === 0) working.push("Active and running");
  if (notWorking.length === 0) notWorking.push("No major issues detected");

  return { working, notWorking, opportunities };
}

// ─── Main Component ──────────────────────────────────────────────

export const InsightsStep = () => {
  const { setStep } = useWizard();
  const [loading, setLoading] = useState(true);
  const [enriched, setEnriched] = useState<EnrichedCreative[]>([]);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [a, cr, i] = await Promise.all([
        supabase.from("ads").select("*"),
        supabase.from("ad_creatives").select("*"),
        supabase.from("ad_insights").select("*"),
      ]);

      const ads = a.data || [];
      const creatives = cr.data || [];
      const insights = i.data || [];

      if (creatives.length === 0) {
        setEnriched([]);
        setLoading(false);
        return;
      }

      const insightByAd = new Map<string, Insight>();
      insights.forEach((ins: any) => insightByAd.set(ins.ad_id, ins));
      const adMap = new Map<string, Ad>();
      ads.forEach((ad: any) => adMap.set(ad.id, ad));

      const items = creatives
        .filter((c: any) => c.creative_type === "static_single" || c.creative_type === "static_carousel")
        .map((c: any) => {
          const insight = insightByAd.get(c.ad_id);
          const ad = adMap.get(c.ad_id);
          if (!ad) return null;
          const roas = insight?.roas ?? 0;
          const ctr = insight?.ctr ?? 0;
          const score = Math.min(100, Math.round(roas * 15 + ctr * 20));
          const decayScore = computeDecay(insight);
          const analysis = analyzeCreative(c, insight);
          return { creative: c, ad, insight, score, decayScore, whatsWorking: analysis.working, whatsNot: analysis.notWorking, opportunities: analysis.opportunities } as EnrichedCreative;
        })
        .filter(Boolean) as EnrichedCreative[];

      items.sort((a, b) => b.score - a.score);
      setEnriched(items);
      setLoading(false);
    };
    fetchData();
  }, []);

  const top20 = useMemo(() => enriched.slice(0, Math.max(1, Math.ceil(enriched.length * 0.2))), [enriched]);
  const bottom20 = useMemo(() => enriched.slice(-Math.max(1, Math.ceil(enriched.length * 0.2))), [enriched]);
  const middle = useMemo(() => {
    const t = Math.max(1, Math.ceil(enriched.length * 0.2));
    const b = Math.max(1, Math.ceil(enriched.length * 0.2));
    return enriched.slice(t, enriched.length - b);
  }, [enriched]);

  // Summary stats
  const totalSpend = enriched.reduce((s, e) => s + (e.insight?.spend ?? 0), 0);
  const avgRoas = enriched.length > 0 ? enriched.reduce((s, e) => s + (e.insight?.roas ?? 0), 0) / enriched.length : 0;
  const totalConversions = enriched.reduce((s, e) => s + (e.insight?.conversions ?? 0), 0);
  const avgDecay = enriched.length > 0 ? Math.round(enriched.reduce((s, e) => s + e.decayScore, 0) / enriched.length) : 0;

  if (loading) {
    return (
      <div className="container max-w-7xl py-16 flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Analyzing creatives…</p>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4.5 h-4.5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Creative Insights</h2>
            </div>
            <p className="text-muted-foreground text-sm ml-10">
              {enriched.length} creatives analyzed · Ranked by performance
            </p>
          </div>
          <Button size="lg" className="gap-2 shadow-md" onClick={() => setStep("pdp-input")}>
            Generate New Creative <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Summary Strip */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          <SummaryCard label="Total Spend" value={fmtCompact(totalSpend, "$")} icon={<BarChart3 className="w-4 h-4" />} />
          <SummaryCard label="Avg. ROAS" value={`${fmtNum(avgRoas)}x`} icon={<TrendingUp className="w-4 h-4" />} />
          <SummaryCard label="Total Conversions" value={fmtCompact(totalConversions)} icon={<CheckCircle2 className="w-4 h-4" />} />
          <SummaryCard label="Avg. Decay Score" value={`${avgDecay}/100`} icon={<Flame className="w-4 h-4" />} accent={avgDecay > 50 ? "destructive" : avgDecay > 30 ? "warning" : "success"} />
        </div>

        {/* Sort pills */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs text-muted-foreground font-medium">Sorted by</span>
          <Badge variant="secondary" className="text-xs font-semibold gap-1">
            <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">1</span>
            ROAS
          </Badge>
          <Badge variant="secondary" className="text-xs font-semibold gap-1">
            <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">2</span>
            Spend
          </Badge>
        </div>

        {/* Top 20% */}
        <TierSection
          title="Top 20% Performers"
          subtitle="Your best creatives — scale these"
          icon={<TrendingUp className="w-5 h-5" />}
          tierColor="success"
          items={top20}
          showRegenerate={false}
          expandedCard={expandedCard}
          setExpandedCard={setExpandedCard}
        />

        {/* Middle */}
        <TierSection
          title="Middle Performers"
          subtitle="Potential to improve — test variations"
          icon={<Minus className="w-5 h-5" />}
          tierColor="warning"
          items={middle}
          showRegenerate={true}
          expandedCard={expandedCard}
          setExpandedCard={setExpandedCard}
        />

        {/* Bottom 20% */}
        <TierSection
          title="Bottom 20% Performers"
          subtitle="Underperforming — refresh or replace"
          icon={<TrendingDown className="w-5 h-5" />}
          tierColor="destructive"
          items={bottom20}
          showRegenerate={true}
          expandedCard={expandedCard}
          setExpandedCard={setExpandedCard}
        />
      </motion.div>
    </div>
  );
};

function computeDecay(insight: Insight | undefined): number {
  if (!insight) return 0;
  const spend = insight.spend ?? 0;
  const roas = insight.roas ?? 0;
  const ctr = insight.ctr ?? 0;
  if (spend === 0) return 0;
  const roasDecay = roas < 1 ? 80 : roas < 2 ? 50 : roas < 4 ? 25 : 10;
  const ctrDecay = ctr < 0.5 ? 30 : ctr < 1 ? 15 : 0;
  return Math.min(100, Math.round((roasDecay + ctrDecay) * (spend > 100 ? 1.2 : 1)));
}

// ─── Sub-components ──────────────────────────────────────────────

function SummaryCard({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent?: string }) {
  const accentColor = accent === "destructive" ? "text-destructive" : accent === "warning" ? "text-warning" : accent === "success" ? "text-success" : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className={`text-xl font-bold ${accent ? accentColor : "text-foreground"}`}>{value}</div>
    </div>
  );
}

function TierSection({
  title, subtitle, icon, tierColor, items, showRegenerate, expandedCard, setExpandedCard,
}: {
  title: string; subtitle: string; icon: React.ReactNode; tierColor: string;
  items: EnrichedCreative[]; showRegenerate: boolean;
  expandedCard: string | null; setExpandedCard: (id: string | null) => void;
}) {
  if (items.length === 0) return null;

  const colorMap: Record<string, string> = {
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const dotMap: Record<string, string> = {
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
  };

  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-1">
        <div className={`w-2 h-2 rounded-full ${dotMap[tierColor]}`} />
        <h3 className="font-display font-semibold text-lg text-foreground">{title}</h3>
        <Badge variant="outline" className={colorMap[tierColor]}>
          {items.length}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground mb-4 ml-5">{subtitle}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <CreativeCard
            key={item.creative.id}
            item={item}
            showRegenerate={showRegenerate}
            isExpanded={expandedCard === item.creative.id}
            onToggle={() => setExpandedCard(expandedCard === item.creative.id ? null : item.creative.id)}
            tierColor={tierColor}
          />
        ))}
      </div>
    </div>
  );
}

function DecayBar({ score }: { score: number }) {
  const color = score >= 60 ? "bg-destructive" : score >= 30 ? "bg-warning" : "bg-success";
  const label = score >= 60 ? "High" : score >= 30 ? "Moderate" : "Low";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-[10px] font-semibold text-muted-foreground whitespace-nowrap">{label} ({score})</span>
    </div>
  );
}

function CreativeCard({
  item, showRegenerate, isExpanded, onToggle, tierColor,
}: {
  item: EnrichedCreative; showRegenerate: boolean;
  isExpanded: boolean; onToggle: () => void; tierColor: string;
}) {
  const imgs = Array.isArray(item.creative.image_urls) ? item.creative.image_urls : [];
  const heroImg = imgs[0] as string | undefined;

  const borderAccent: Record<string, string> = {
    success: "hover:border-success/40",
    warning: "hover:border-warning/40",
    destructive: "hover:border-destructive/40",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl border border-border bg-card overflow-hidden cursor-pointer transition-all ${borderAccent[tierColor]} ${isExpanded ? "col-span-1 md:col-span-2 lg:col-span-3" : ""}`}
      onClick={onToggle}
    >
      {/* Image */}
      <div className="relative">
        {heroImg ? (
          <img
            src={heroImg}
            alt={item.ad.ad_name}
            className={`w-full object-cover ${isExpanded ? "h-64" : "h-52"} transition-all`}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-52 bg-muted/30 flex items-center justify-center text-muted-foreground text-xs">
            No preview
          </div>
        )}
        {/* Overlay badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-background/80 backdrop-blur-sm text-foreground border-0 text-[10px] font-semibold shadow-sm">
            Score: {item.score}
          </Badge>
        </div>
        {item.creative.creative_type === "static_carousel" && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-background/80 backdrop-blur-sm text-foreground border-0 text-[10px] shadow-sm">
              Carousel
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="font-semibold text-sm text-foreground truncate mb-0.5" title={item.ad.ad_name}>
          {item.ad.ad_name}
        </h4>
        {item.creative.headline && (
          <p className="text-xs text-muted-foreground truncate mb-3">"{item.creative.headline}"</p>
        )}

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
          <MetricRow label="Spend" value={fmtCompact(item.insight?.spend, "$")} />
          <MetricRow label="ROAS" value={fmtNum(item.insight?.roas)} bold />
          <MetricRow label="Revenue" value={fmtCompact(item.insight?.conversion_value, "$")} />
          <MetricRow label="Impressions" value={fmtCompact(item.insight?.impressions)} />
        </div>

        {/* Decay bar */}
        <div className="mb-3">
          <div className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
            <Flame className="w-3 h-3" /> Creative Decay
          </div>
          <DecayBar score={item.decayScore} />
        </div>

        {/* Expanded details */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="pt-3 border-t border-border space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* What's working */}
              <div>
                <div className="flex items-center gap-1 text-xs font-semibold text-success mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> What's Working
                </div>
                <ul className="space-y-1.5">
                  {item.whatsWorking.map((w, i) => (
                    <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                      <span className="text-success mt-0.5 shrink-0">✓</span> {w}
                    </li>
                  ))}
                </ul>
              </div>

              {/* What's not working */}
              <div>
                <div className="flex items-center gap-1 text-xs font-semibold text-destructive mb-2">
                  <XCircle className="w-3.5 h-3.5" /> What's Not Working
                </div>
                <ul className="space-y-1.5">
                  {item.whatsNot.map((w, i) => (
                    <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                      <span className="text-destructive mt-0.5 shrink-0">✗</span> {w}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Opportunities */}
              {showRegenerate && item.opportunities.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-primary mb-2">
                    <Lightbulb className="w-3.5 h-3.5" /> Opportunities
                  </div>
                  <ul className="space-y-1.5 mb-3">
                    {item.opportunities.slice(0, 3).map((o, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-primary mt-0.5 shrink-0">→</span> {o}
                      </li>
                    ))}
                  </ul>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={(e) => e.stopPropagation()}>
                    <RefreshCw className="w-3.5 h-3.5" /> Regenerate Creative
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function MetricRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-xs ${bold ? "font-bold text-foreground" : "font-semibold text-foreground"}`}>{value}</span>
    </div>
  );
}
