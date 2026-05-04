import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Wand2, ArrowRight, TrendingUp, TrendingDown, Target,
  Zap, Trophy, Lightbulb, Radar, Eye, Layers, Type, Image as ImageIcon,
  Activity, BarChart3, Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DateRangeFilter, DateRangeKey } from "@/components/insights/DateRangeFilter";
import { useNavigate } from "react-router-dom";

// ── Types (kept loose — mirrors EnrichedAd in InsightsStep) ─────────
interface DashboardAd {
  id: string;
  adName: string;
  campaignName: string;
  imageUrl: string | null;
  creativeType: string;
  score: number;
  spend: number | null;
  roas: number | null;
  ctr: number | null;
  impressions: number | null;
  purchases?: number | null;
  costPerPurchase?: number | null;
}

interface Props {
  brandName?: string | null;
  accountName?: string | null;
  ads: DashboardAd[];
  dateRange: DateRangeKey;
  onDateRangeChange: (v: DateRangeKey) => void;
  onAdClick?: (id: string) => void;
  onViewAllGenerations?: () => void;
  onKpisChange?: (kpis: { label: string; value: string; hint?: string }[]) => void;
}

// ── Utilities ───────────────────────────────────────────────────────
const compact = (n: number | null | undefined, prefix = "") => {
  if (n == null || isNaN(Number(n))) return "—";
  const v = Number(n);
  if (v >= 1_000_000) return `${prefix}${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${prefix}${(v / 1_000).toFixed(1)}K`;
  return `${prefix}${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

// Mock competitor / category / opportunity data — kept self-contained so this
// page reads as a "creative intelligence command center" even before the real
// inference pipeline is wired up.
import liquidIvLogo from "@/assets/competitors/liquid-iv.jpeg";
import waterdropLogo from "@/assets/competitors/waterdrop.webp";
import cureLogo from "@/assets/competitors/cure.avif";
import dripdropLogo from "@/assets/competitors/dripdrop.jpeg";
import liquidIvAd from "@/assets/competitors/ad-liquid-iv.png";
import dripdropAd from "@/assets/competitors/ad-dripdrop.png";
import cureAd from "@/assets/competitors/ad-cure.png";
import waterdropAd from "@/assets/competitors/ad-waterdrop.png";

const MOCK_COMPETITORS = [
  { name: "Liquid I.V.", logo: liquidIvLogo, active: 28, trend: "Heavy UGC usage", up: true },
  { name: "Waterdrop",   logo: waterdropLogo, active: 19, trend: "Increasing promo volume", up: true },
  { name: "Cure",        logo: cureLogo, active: 14, trend: "Review-led messaging", up: true },
  { name: "DripDrop",    logo: dripdropLogo, active: 11, trend: "Lifestyle imagery dropping", up: false },
];

const MOCK_COMPETITOR_CREATIVES = [
  { src: liquidIvAd, brand: "Liquid I.V.", tag: "Collab" },
  { src: dripdropAd, brand: "DripDrop", tag: "Offer-led" },
  { src: cureAd, brand: "Cure", tag: "Stat-led" },
  { src: waterdropAd, brand: "Waterdrop", tag: "Bold hook" },
];

const CATEGORY_TRENDS = [
  { title: "Offer-first creatives are dominating the category", detail: "+42% share of voice vs last quarter", up: true },
  { title: "Competitors leaning into review-based messaging", detail: "5-star overlays appearing in 1 of 3 ads", up: true },
  { title: "Lifestyle imagery underperforming product-led", detail: "−18% CTR across category benchmarks", up: false },
  { title: "Spring sale & limited-time urgency on the rise", detail: "Detected across 6 of 10 tracked brands", up: true },
];

// ── Component ───────────────────────────────────────────────────────
export const HomeDashboard = ({
  brandName, accountName, ads, dateRange, onDateRangeChange,
  onAdClick, onViewAllGenerations, onKpisChange,
}: Props) => {
  const navigate = useNavigate();

  // ── Derived KPI metrics from real ads data ────────────────────
  const kpis = useMemo(() => {
    const totalSpend = ads.reduce((s, a) => s + (a.spend ?? 0), 0);
    const totalPurchases = ads.reduce((s, a) => s + (a.purchases ?? 0), 0);
    const totalImpr = ads.reduce((s, a) => s + (a.impressions ?? 0), 0);
    // Impression-weighted CTR (more accurate than a flat average)
    const ctrAvg = totalImpr > 0
      ? ads.reduce((s, a) => s + ((a.ctr ?? 0) * (a.impressions ?? 0)), 0) / totalImpr
      : 0;
    const roasAvg = totalSpend > 0
      ? ads.reduce((s, a) => s + ((a.roas ?? 0) * (a.spend ?? 0)), 0) / totalSpend
      : 0;
    const cac = totalPurchases > 0 ? totalSpend / totalPurchases : null;
    const activeCreatives = ads.filter((a) => (a.spend ?? 0) > 0 || (a.impressions ?? 0) > 0).length;
    return { ctrAvg, roasAvg, cac, totalImpr, totalSpend, totalPurchases, activeCreatives };
  }, [ads]);

  // Push KPIs upward so the sidebar can render them
  useEffect(() => {
    if (!onKpisChange) return;
    onKpisChange([
      { label: "Avg ROAS", value: kpis.roasAvg ? `${kpis.roasAvg.toFixed(2)}x` : "—", hint: `${kpis.activeCreatives} creatives` },
      { label: "CTR", value: kpis.ctrAvg ? `${kpis.ctrAvg.toFixed(2)}%` : "—", hint: `${compact(kpis.totalImpr)} impr.` },
      { label: "Avg CAC", value: kpis.cac != null ? `$${kpis.cac.toFixed(2)}` : "—", hint: `${kpis.totalPurchases.toLocaleString()} purchases` },
      { label: "Total Spend", value: compact(kpis.totalSpend, "$"), hint: `${MOCK_COMPETITORS.length} competitors tracked` },
    ]);
  }, [kpis, onKpisChange]);

  // ── Top creatives (by score) ──────────────────────────────────
  const topCreatives = useMemo(
    () => [...ads].filter((a) => a.imageUrl).sort((a, b) => b.score - a.score).slice(0, 6),
    [ads]
  );

  // ── Pattern insights (heuristic over real data) ───────────────
  const patternInsights = useMemo(() => {
    const withSpend = ads.filter((a) => (a.spend ?? 0) > 0);
    const staticAds = withSpend.filter((a) => !a.creativeType.includes("carousel") && !a.creativeType.includes("video"));
    const carouselAds = withSpend.filter((a) => a.creativeType.includes("carousel"));

    const avgRoas = (list: DashboardAd[]) => {
      const tot = list.reduce((s, a) => s + (a.spend ?? 0), 0);
      if (tot === 0) return 0;
      return list.reduce((s, a) => s + ((a.roas ?? 0) * (a.spend ?? 0)), 0) / tot;
    };
    const staticRoas = avgRoas(staticAds);
    const carRoas = avgRoas(carouselAds);
    const winningFormat = staticRoas >= carRoas ? "Static" : "Carousel";
    const lift = Math.abs(staticRoas - carRoas);

    return [
      {
        tag: "Visual",
        icon: ImageIcon,
        title: `${winningFormat} creatives are outperforming the rest`,
        detail: `Driving ${lift > 0 ? `+${lift.toFixed(1)}x` : "higher"} avg ROAS across active spend`,
        confidence: 92,
      },
      {
        tag: "Offer",
        icon: Zap,
        title: "Offer-led headlines are reducing CAC",
        detail: "Discount & savings hooks correlate with −18% CAC vs feature-led copy",
        confidence: 87,
      },
      {
        tag: "Hook",
        icon: Type,
        title: "Short, benefit-first copy is winning",
        detail: "Top 20% of creatives use ≤ 8-word primary hooks",
        confidence: 81,
      },
      {
        tag: "Format",
        icon: Layers,
        title: "4:5 vertical is your highest-leverage ratio",
        detail: "70% of top performers shipped in 4:5",
        confidence: 78,
      },
    ];
  }, [ads]);

  const winningBreakdown = [
    { label: "Best hook", value: "Limited-time savings" },
    { label: "Best visual", value: "Product + offer badge" },
    { label: "Best copy angle", value: "Benefit-first" },
    { label: "Best format", value: "4:5 static" },
  ];

  const opportunities = [
    {
      title: "Test offer-led creative for your top-selling SKU",
      why: "Offer-led hooks are driving −18% CAC across your account.",
      impact: "High", confidence: 92, source: "Brand data",
    },
    {
      title: "Launch a UGC-style variant for your highest-CAC audience",
      why: "Competitors are gaining share with founder & customer-shot creatives.",
      impact: "High", confidence: 87, source: "Category trend",
    },
    {
      title: "Use review-driven messaging for cold acquisition",
      why: "5-star overlays are appearing in 1 of 3 category ads this month.",
      impact: "Medium", confidence: 81, source: "Category trend",
    },
    {
      title: "Repurpose your winning hook into 9:16 format",
      why: "Top-performing 4:5 hook has no Reels/Stories variant live.",
      impact: "Medium", confidence: 76, source: "Brand data",
    },
    {
      title: "Create a competitor-inspired spring promo angle",
      why: "Urgency-driven seasonal language is up 42% across tracked brands.",
      impact: "Medium", confidence: 72, source: "Category trend",
    },
    {
      title: "Launch a product-highlight ad for a high-margin SKU",
      why: "Product-led visuals are outperforming lifestyle by 23% in your account.",
      impact: "Low", confidence: 68, source: "Brand data",
    },
  ];

  return (
    <div className="px-8 py-10 max-w-[1280px] mx-auto">
      {/* ─────────── Hero ─────────── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="mb-10"
      >
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className="bg-primary/10 text-primary border-0 gap-1.5 rounded-full px-3 py-1">
              <Sparkles className="w-3 h-3" /> Creative Intelligence
            </Badge>
            {brandName && (
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{brandName}</span>
                {accountName ? ` · ${accountName}` : ""}
              </span>
            )}
          </div>
          <DateRangeFilter value={dateRange} onChange={onDateRangeChange} />
        </div>

        <h1 className="font-display font-bold text-[40px] leading-[1.05] tracking-tight text-foreground max-w-3xl">
          What to make next.
        </h1>
        <p className="text-base text-muted-foreground mt-3 max-w-2xl leading-relaxed">
          We analyzed your top-performing ads, tracked your competitors, and surfaced the highest-leverage creative opportunities for your brand.
        </p>

        <div className="flex items-center gap-3 mt-6 flex-wrap">
          <Button
            size="lg" onClick={() => navigate("/create-ad")}
            className="gap-2 rounded-xl px-6 h-12 shadow-md hover:shadow-lg transition-shadow font-semibold"
          >
            <Wand2 className="w-4 h-4" /> Create Ad <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            size="lg" variant="outline" onClick={onViewAllGenerations}
            className="gap-2 rounded-xl px-5 h-12 font-medium"
          >
            <Eye className="w-4 h-4" /> View All Generations
          </Button>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
          <KpiCard label="Avg ROAS" value={kpis.roasAvg ? `${kpis.roasAvg.toFixed(2)}x` : "—"} delta={`${kpis.activeCreatives} creatives`} subtle />
          <KpiCard label="CTR" value={kpis.ctrAvg ? `${kpis.ctrAvg.toFixed(2)}%` : "—"} delta={`${compact(kpis.totalImpr)} impressions`} subtle />
          <KpiCard label="Avg CAC" value={kpis.cac != null ? `$${kpis.cac.toFixed(2)}` : "—"} delta={`${kpis.totalPurchases.toLocaleString()} purchases`} subtle />
          <KpiCard label="Total Spend" value={compact(kpis.totalSpend, "$")} delta={`${MOCK_COMPETITORS.length} competitors tracked`} subtle />
        </div>
      </motion.section>

      {/* ─────────── Action summary: Opportunities + What's working snapshot ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-14">
        {/* Left: Opportunities — visual, hookable */}
        <div className="lg:col-span-3">
          <SectionHeader
            eyebrow="Start here"
            title="Your biggest opportunities"
            subtitle="Prioritized next moves, grounded in your brand data and category signals."
            icon={Lightbulb}
            compact
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {opportunities.slice(0, 4).map((op, i) => (
              <OpportunityCard key={op.title} {...op} index={i} />
            ))}
          </div>
        </div>

        {/* Right: Summary of what's working + category */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <SummaryPanel
            icon={Trophy}
            title="Working for you"
            tone="accent"
            items={winningBreakdown.map((w) => ({ label: w.label, value: w.value }))}
          />
          <SummaryPanel
            icon={Radar}
            title="Working in your category"
            tone="primary"
            items={CATEGORY_TRENDS.slice(0, 4).map((t) => ({
              label: t.up ? "Rising" : "Falling",
              value: t.title,
            }))}
          />
        </div>
      </div>

      {/* ─────────── Section 2: What's working for your brand (deep-dive) ─────────── */}
      <SectionHeader
        eyebrow="Section 2"
        title="What's working for your brand"
        subtitle="Patterns we found across your account's top-performing creatives."
        icon={Trophy}
      />

      {/* Pattern insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {patternInsights.map((p) => (
          <InsightCard key={p.title} {...p} />
        ))}
      </div>

      {/* Best creatives strip */}
      <h3 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
        <Flame className="w-4 h-4 text-accent" /> Best-performing creatives
      </h3>
      {topCreatives.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {topCreatives.map((c) => (
            <button
              key={c.id} onClick={() => onAdClick?.(c.id)}
              className="group text-left rounded-xl overflow-hidden border border-border/60 bg-card hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="aspect-[4/5] bg-secondary/30 relative overflow-hidden">
                {c.imageUrl ? (
                  <img src={c.imageUrl} alt={c.adName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                ) : null}
                <div className="absolute top-2 left-2">
                  <Badge className="bg-card/90 text-foreground border-0 text-[10px] gap-1 rounded-md px-1.5 py-0.5">
                    <TrendingUp className="w-2.5 h-2.5 text-accent" /> {c.score}
                  </Badge>
                </div>
              </div>
              <div className="p-2.5">
                <p className="text-[11px] font-semibold text-foreground truncate">{c.adName}</p>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <Chip>{c.roas != null ? `${c.roas.toFixed(1)}x ROAS` : "—"}</Chip>
                  <Chip>{c.ctr != null ? `${c.ctr.toFixed(1)}% CTR` : "—"}</Chip>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground mb-8">No creatives in this date range yet.</p>
      )}

      {/* Winning breakdown */}
      <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card to-secondary/30 p-6 mb-12">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-sm text-foreground">Winning breakdown</h3>
          <span className="text-xs text-muted-foreground">— why your best ads are working</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {winningBreakdown.map((w) => (
            <div key={w.label} className="rounded-xl bg-card border border-border/40 p-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">{w.label}</p>
              <p className="text-sm font-semibold text-foreground">{w.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────── Section 3: What's working in your category ─────────── */}
      <SectionHeader
        eyebrow="Section 3"
        title="What's working in your category"
        subtitle="We're tracking your competitors so you don't have to."
        icon={Radar}
      />

      {/* Competitor cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {MOCK_COMPETITORS.map((c) => (
          <div key={c.name} className="rounded-2xl border border-border/60 bg-card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-lg bg-secondary/60 flex items-center justify-center overflow-hidden">
                <img src={c.logo} alt={c.name} className="w-full h-full object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{c.name}</p>
                <p className="text-[10px] text-accent font-semibold uppercase tracking-wider">Tracked</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{c.active} active</span>
              <span className={`flex items-center gap-1 font-medium ${c.up ? "text-accent" : "text-muted-foreground"}`}>
                {c.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {c.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Competitor creative gallery */}
      <h3 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-primary" /> Competitor creatives in the wild
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {MOCK_COMPETITOR_CREATIVES.map((c, i) => (
          <div key={i} className="rounded-xl overflow-hidden border border-border/60 bg-card hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="aspect-[4/5] relative bg-secondary/30">
              <img src={c.src} alt={c.brand} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute top-2 left-2">
                <Badge className="bg-card/90 text-foreground border-0 text-[9px] rounded-md px-1.5 py-0.5">
                  {c.tag}
                </Badge>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground px-2.5 py-1.5 truncate">{c.brand}</p>
          </div>
        ))}
      </div>

      {/* Category trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-12">
        {CATEGORY_TRENDS.map((t) => (
          <div key={t.title} className="rounded-xl border border-border/60 bg-card p-4 flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${t.up ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
              {t.up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground leading-snug">{t.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t.detail}</p>
            </div>
          </div>
        ))}
      </div>


      {/* Footer reinforcement */}
      <p className="text-center text-xs text-muted-foreground/50 mt-4 mb-2 font-medium">
        Every ad you create makes the next one smarter ✨
      </p>
    </div>
  );
};

// ── Subcomponents ───────────────────────────────────────────────────
const KpiCard = ({ label, value, delta, up, subtle }: { label: string; value: string; delta?: string; up?: boolean; subtle?: boolean }) => (
  <div className="rounded-xl border border-border/60 bg-card p-4 hover:shadow-sm transition-shadow">
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">{label}</p>
    <p className="text-xl font-bold text-foreground tracking-tight">{value}</p>
    {delta && (
      <p className={`text-[11px] font-medium mt-1 ${subtle ? "text-muted-foreground" : up ? "text-accent" : "text-destructive"}`}>
        {delta}
      </p>
    )}
  </div>
);

const SectionHeader = ({ eyebrow, title, subtitle, icon: Icon }: { eyebrow: string; title: string; subtitle: string; icon: any }) => (
  <div className="mb-5">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{eyebrow}</span>
    </div>
    <h2 className="font-display font-bold text-2xl text-foreground tracking-tight">{title}</h2>
    <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
  </div>
);

const InsightCard = ({ tag, icon: Icon, title, detail, confidence }: { tag: string; icon: any; title: string; detail: string; confidence: number }) => (
  <div className="rounded-2xl border border-border/60 bg-card p-5 hover:shadow-md transition-all hover:-translate-y-0.5">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-accent" />
        </div>
        <Badge variant="secondary" className="text-[10px] rounded-md px-2">{tag}</Badge>
      </div>
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <Activity className="w-3 h-3" /> {confidence}% confidence
      </div>
    </div>
    <p className="text-sm font-semibold text-foreground leading-snug mb-1">{title}</p>
    <p className="text-xs text-muted-foreground leading-relaxed">{detail}</p>
  </div>
);

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center text-[9px] font-medium text-muted-foreground bg-secondary/70 rounded px-1.5 py-0.5">
    {children}
  </span>
);

const OpportunityCard = ({
  title, why, impact, confidence, source, onGenerate,
}: { title: string; why: string; impact: string; confidence: number; source: string; onGenerate: () => void }) => {
  const impactTone =
    impact === "High" ? "bg-accent/15 text-accent" : impact === "Medium" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground";
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground leading-snug">{title}</p>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{why}</p>
        </div>
        <div className={`shrink-0 text-[10px] font-semibold rounded-md px-2 py-1 ${impactTone}`}>
          {impact} impact
        </div>
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {confidence}% confidence</span>
          <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {source}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onGenerate} className="gap-1.5 rounded-lg h-8 text-xs font-semibold">
          <Wand2 className="w-3.5 h-3.5" /> Generate Creative <ArrowUpRight className="w-3 h-3" />
        </Button>
        <Button size="sm" variant="ghost" className="rounded-lg h-8 text-xs text-muted-foreground hover:text-foreground">
          Save idea
        </Button>
      </div>
    </div>
  );
};
