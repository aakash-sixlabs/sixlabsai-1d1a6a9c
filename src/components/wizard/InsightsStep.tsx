import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, Sparkles, Wand2, Trophy, Target, TrendingUp, ArrowUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { isDevSession } from "@/lib/devMode";
import { InsightsSidebar } from "@/components/insights/InsightsSidebar";
import { InsightsTopBar } from "@/components/insights/InsightsTopBar";
import { DigestCards, TopPerformerSlide } from "@/components/insights/DigestCards";
import { AdCreativeGrid } from "@/components/insights/AdCreativeGrid";
import { CreativePreviewDialog } from "@/components/insights/CreativePreviewDialog";
import { DateRangeFilter, DateRangeKey } from "@/components/insights/DateRangeFilter";
import { GeneratedCreativesByJob } from "@/components/insights/GeneratedCreativesByJob";
import { GenerationsTable } from "@/components/insights/GenerationsTable";

import { useWizard } from "@/context/WizardContext";

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
  adset_id: string;
}

interface Campaign {
  id: string;
  campaign_name: string;
}

interface AdSet {
  id: string;
  campaign_id: string;
}

interface EnrichedAd {
  id: string;
  creativeId: string;
  adName: string;
  campaignName: string;
  campaignId: string;
  imageUrl: string | null;
  creativeType: string;
  score: number;
  decayScore: number;
  spend: number | null;
  roas: number | null;
  ctr: number | null;
  impressions: number | null;
  purchases: number | null;
  costPerPurchase: number | null;
  hasActiveAd: boolean;
}

// ─── Sort options ────────────────────────────────────────────────

type SortKey = "score" | "spend" | "roas" | "ctr" | "impressions" | "decay" | "name";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "score", label: "Score" },
  { key: "spend", label: "Spend" },
  { key: "roas", label: "ROAS" },
  { key: "ctr", label: "CTR" },
  { key: "impressions", label: "Impressions" },
  { key: "decay", label: "Decay score" },
  { key: "name", label: "Ad name (A→Z)" },
];

function sortAds(list: EnrichedAd[], key: SortKey): EnrichedAd[] {
  const out = [...list];
  const numDesc = (getter: (a: EnrichedAd) => number | null | undefined) =>
    out.sort((a, b) => {
      const av = getter(a);
      const bv = getter(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return (bv as number) - (av as number);
    });
  switch (key) {
    case "score": return numDesc((a) => a.score);
    case "spend": return numDesc((a) => a.spend);
    case "roas": return numDesc((a) => a.roas);
    case "ctr": return numDesc((a) => a.ctr);
    case "impressions": return numDesc((a) => a.impressions);
    case "decay": return numDesc((a) => a.decayScore);
    case "name": return out.sort((a, b) => a.adName.localeCompare(b.adName));
  }
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

const MOCK_CAMPAIGNS = [
  { id: "camp-1", name: "Summer Campaign" },
  { id: "camp-2", name: "Holiday Promo" },
  { id: "camp-3", name: "Brand Awareness" },
];

function generateMockData(): EnrichedAd[] {
  const configs = [
    { spend: 31200, roas: 4.8, ctr: 3.2, impressions: 1350000, decay: 12, campaign: 0 },
    { spend: 27400, roas: 3.9, ctr: 2.8, impressions: 1100000, decay: 18, campaign: 0 },
    { spend: 16200, roas: 2.1, ctr: 1.5, impressions: 901000, decay: 42, campaign: 1 },
    { spend: 12800, roas: 1.8, ctr: 1.2, impressions: 780000, decay: 55, campaign: 1 },
    { spend: 9400, roas: 1.5, ctr: 1.0, impressions: 620000, decay: 48, campaign: 2 },
    { spend: 8100, roas: 1.3, ctr: 0.9, impressions: 540000, decay: 61, campaign: 2 },
    { spend: 7200, roas: 1.1, ctr: 0.8, impressions: 480000, decay: 58, campaign: 0 },
    { spend: 6500, roas: 1.0, ctr: 0.7, impressions: 420000, decay: 65, campaign: 1 },
    { spend: 5200, roas: 0.6, ctr: 0.4, impressions: 310000, decay: 82, campaign: 2 },
    { spend: 4800, roas: 0.3, ctr: 0.2, impressions: 250000, decay: 91, campaign: 0 },
  ];

  return configs.map((cfg, i) => ({
    id: `mock-${i}`,
    creativeId: `mock-creative-${i}`,
    adName: MOCK_AD_NAMES[i],
    campaignName: MOCK_CAMPAIGNS[cfg.campaign].name,
    campaignId: MOCK_CAMPAIGNS[cfg.campaign].id,
    imageUrl: MOCK_IMAGES[i],
    creativeType: i % 3 === 0 ? "static_carousel" : "static_single",
    score: Math.min(100, Math.round(cfg.roas * 15 + cfg.ctr * 20)),
    decayScore: cfg.decay,
    spend: cfg.spend,
    roas: cfg.roas,
    ctr: cfg.ctr,
    impressions: cfg.impressions,
    purchases: Math.round((cfg.spend * cfg.roas) / 50),
    costPerPurchase: cfg.roas > 0 ? 50 / cfg.roas : null,
    hasActiveAd: i < 7,
  }));
}

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

// ─── Main Component ──────────────────────────────────────────────

export const InsightsStep = () => {
  const navigate = useNavigate();
  const { state } = useWizard();
  const [loading, setLoading] = useState(true);
  const [cadRows, setCadRows] = useState<any[] | null>(null);
  const [mockAds, setMockAds] = useState<EnrichedAd[] | null>(null);
  const [activeView, setActiveView] = useState("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [adAccounts, setAdAccounts] = useState<{ id: string; account_id: string; account_name: string }[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "complete" | "error">("idle");
  const [syncStep, setSyncStep] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [dateRange, setDateRange] = useState<DateRangeKey>("30");
  const [previewAdId, setPreviewAdId] = useState<string | null>(null);

  const enrichAndSet = useCallback((dbAds: Ad[], creatives: Creative[], insights: Insight[], adSets: AdSet[], campaigns: Campaign[]) => {
    const insightByAd = new Map<string, Insight>();
    insights.forEach((ins: any) => insightByAd.set(ins.ad_id, ins));

    const adMap = new Map<string, Ad>();
    dbAds.forEach((ad: any) => adMap.set(ad.id, ad));

    const adSetMap = new Map<string, AdSet>();
    adSets.forEach((as: any) => adSetMap.set(as.id, as));

    const campaignMap = new Map<string, Campaign>();
    campaigns.forEach((c: any) => campaignMap.set(c.id, c));

    const enriched: EnrichedAd[] = creatives
      .map((c: any) => {
        const ad = adMap.get(c.ad_id);
        if (!ad) return null;
        const insight = insightByAd.get(c.ad_id);
        const adSet = adSetMap.get(ad.adset_id);
        const campaign = adSet ? campaignMap.get(adSet.campaign_id) : undefined;
        const imgs = Array.isArray(c.image_urls) ? c.image_urls : [];
        const roas = insight?.roas ?? 0;
        const ctr = insight?.ctr ?? 0;

        return {
          id: c.id,
          adName: ad.ad_name,
          campaignName: campaign?.campaign_name || "Unknown Campaign",
          campaignId: campaign?.id || "",
          imageUrl: (imgs[0] as string) || null,
          creativeType: c.creative_type,
          score: Math.min(100, Math.round(roas * 15 + ctr * 20)),
          decayScore: computeDecay(insight),
          spend: insight?.spend ?? null,
          roas: insight?.roas ?? null,
          ctr: insight?.ctr ?? null,
          impressions: insight?.impressions ?? null,
        };
      })
      .filter(Boolean) as EnrichedAd[];

    enriched.sort((a, b) => b.score - a.score);
    return enriched;
  }, []);

  const fetchData = useCallback(async () => {
    // Dev-mode sandbox: never touch Supabase. Use a fixed set of mock accounts
    // and generated mock ads so testers see a fully populated dashboard
    // regardless of any real account data tied to this browser.
    if (isDevSession()) {
      const mockAccounts = [
        { id: "mock-acc-1", account_id: "act_111222333", account_name: "Glow Skin Co. Ads" },
        { id: "mock-acc-2", account_id: "act_444555666", account_name: "FitFuel Performance" },
        { id: "mock-acc-3", account_id: "act_777888999", account_name: "UrbanThreads Growth" },
      ];
      setAdAccounts(mockAccounts);
      if (!selectedAccountId) setSelectedAccountId(mockAccounts[0].id);
      setCadRows([]);
      setMockAds(generateMockData());
      setLoading(false);
      return;
    }

    const accountsRes = await supabase.from("ad_accounts").select("id, account_id, account_name");
    const fetchedAccounts = accountsRes.data || [];

    if (fetchedAccounts.length === 0) {
      const mockAccounts = [
        { id: "mock-acc-1", account_id: "act_111222333", account_name: "Glow Skin Co. Ads" },
        { id: "mock-acc-2", account_id: "act_444555666", account_name: "FitFuel Performance" },
        { id: "mock-acc-3", account_id: "act_777888999", account_name: "UrbanThreads Growth" },
      ];
      setAdAccounts(mockAccounts);
      if (!selectedAccountId) setSelectedAccountId(mockAccounts[0].id);
    } else {
      setAdAccounts(fetchedAccounts);
      if (!selectedAccountId) setSelectedAccountId(fetchedAccounts[0].id);
    }

    // Build rows from live tables (campaign_ad_data MV was removed in May 2026 schema rebuild).
    // RLS already scopes everything to the user's account; filter campaigns/adsets to this ad_account.
    const accountIdFilter = state.selectedAccount;
    const [creativesRes, perfRes, adsetsRes, campaignsRes] = await Promise.all([
      supabase.from("ad_creatives").select("id, ad_id, creative_type, headline, primary_text, stored_image_url, image_url, stored_image_urls").limit(1000),
      supabase.from("ad_performance_daily").select("ad_id, date, spend, impressions, clicks, ctr, roas, purchases").limit(1000),
      supabase.from("ad_sets").select("id, campaign_id, name").limit(1000),
      supabase.from("campaigns").select("id, name").eq("ad_account_id", accountIdFilter as any).limit(1000),
    ]);
    const campIds = new Set((campaignsRes.data || []).map((c: any) => c.id));
    const adsetsScoped = (adsetsRes.data || []).filter((a: any) => campIds.has(a.campaign_id));
    const adsetIds = new Set(adsetsScoped.map((a: any) => a.id));
    const adsRes = await supabase
      .from("ads")
      .select("id, meta_ad_id, name, ad_set_id, effective_status, status")
      .in("ad_set_id", Array.from(adsetIds) as string[])
      .limit(2000);

    const ads = adsRes.data || [];
    const creatives = creativesRes.data || [];
    const perf = perfRes.data || [];
    const adsets = adsetsScoped;
    const campaigns = campaignsRes.data || [];



    if (ads.length === 0) {
      setCadRows([]);
      setMockAds(generateMockData());
    } else {
      const adsetMap = new Map(adsets.map((a: any) => [a.id, a]));
      const campMap = new Map(campaigns.map((c: any) => [c.id, c]));
      const adById = new Map(ads.map((a: any) => [a.id, a]));
      const creativeByAdId = new Map(creatives.map((c: any) => [c.ad_id, c]));

      const rows: any[] = [];
      for (const p of perf) {
        const ad = adById.get(p.ad_id);
        if (!ad) continue;
        const c = creativeByAdId.get(p.ad_id);
        const adset = ad ? adsetMap.get((ad as any).ad_set_id) : undefined;
        const camp = adset ? campMap.get((adset as any).campaign_id) : undefined;
        rows.push({
          ad_id: p.ad_id,
          ad_name: (ad as any).name,
          ad_effective_status: (ad as any).effective_status,
          campaign_id: camp ? (camp as any).id : "",
          campaign_name: camp ? (camp as any).name : "Unknown Campaign",
          creative_id: c ? (c as any).id : null,
          creative_type: c ? (c as any).creative_type : "static_single",
          image_url: c ? ((c as any).stored_image_url || (c as any).image_url) : null,
          image_urls: c ? ((c as any).stored_image_urls || []) : [],
          date: p.date,
          spend: p.spend,
          impressions: p.impressions,
          clicks: p.clicks,
          purchases: p.purchases,
          roas: p.roas,
        });
      }
      setCadRows(rows);
      setMockAds(rows.length === 0 ? generateMockData() : null);
    }
    setLoading(false);
  }, [selectedAccountId, state.selectedAccount]);

  // Derive ads from raw cad rows + selected date range
  const ads: EnrichedAd[] = useMemo(() => {
    if (mockAds) return mockAds;
    if (!cadRows || cadRows.length === 0) return [];

    const cutoff = (() => {
      if (dateRange === "all") return null;
      const days = parseInt(dateRange, 10);
      const d = new Date();
      d.setDate(d.getDate() - days);
      d.setHours(0, 0, 0, 0);
      return d;
    })();

    const inRange = cutoff
      ? cadRows.filter((r) => r.date && new Date(r.date) >= cutoff)
      : cadRows;

    const adAgg = new Map<string, any>();
    inRange.forEach((row: any) => {
      const key = row.ad_id || `${row.brand_id}-${row.date}`;
      if (!adAgg.has(key)) {
        const imgs = Array.isArray(row.image_urls) ? row.image_urls : [];
        adAgg.set(key, {
          id: key,
          creativeId: row.creative_id || key,
          adName: row.ad_name || "Unknown",
          campaignName: row.campaign_name || "Unknown Campaign",
          campaignId: row.campaign_id || "",
          imageUrl: row.image_url || imgs[0] || null,
          creativeType: row.creative_type || "static_single",
          spend: 0, impressions: 0, clicks: 0, purchases: 0, roasSum: 0, days: 0,
          hasActiveAd: false,
        });
      }
      const agg = adAgg.get(key)!;
      agg.spend += Number(row.spend || 0);
      agg.impressions += Number(row.impressions || 0);
      agg.clicks += Number(row.clicks || 0);
      agg.purchases += Number(row.purchases || 0);
      agg.roasSum += Number(row.roas || 0);
      agg.days += 1;
      if (String(row.ad_effective_status || "").toUpperCase() === "ACTIVE") {
        agg.hasActiveAd = true;
      }
    });

    const enriched: EnrichedAd[] = Array.from(adAgg.values()).map((agg: any) => {
      const roas = agg.days > 0 ? agg.roasSum / agg.days : 0;
      const ctr = agg.impressions > 0 ? (agg.clicks / agg.impressions) * 100 : 0;
      const costPerPurchase = agg.purchases > 0 ? agg.spend / agg.purchases : null;
      return {
        id: agg.id,
        creativeId: agg.creativeId,
        adName: agg.adName,
        campaignName: agg.campaignName,
        campaignId: agg.campaignId,
        imageUrl: agg.imageUrl,
        creativeType: agg.creativeType,
        score: Math.min(100, Math.round(roas * 15 + ctr * 20)),
        decayScore: roas < 1 ? 80 : roas < 2 ? 50 : roas < 4 ? 25 : 10,
        spend: agg.spend,
        roas,
        ctr,
        impressions: agg.impressions,
        purchases: agg.purchases,
        costPerPurchase,
        hasActiveAd: agg.hasActiveAd,
      };
    });
    enriched.sort((a, b) => b.score - a.score);
    return enriched;
  }, [cadRows, mockAds, dateRange]);


  // Background sync for returning users (and manual resync)
  const triggerBackgroundSync = useCallback(async () => {
    const accountId = state.selectedAccount;
    if (!accountId) return;
    // Prevent overlapping syncs in this tab
    if (syncStatus === "syncing") return;

    setSyncStatus("syncing");
    setSyncStep("Connecting to Meta");

    // 1. Check for an in-flight sync_job for this account (avoid duplicate Meta API load).
    //    If one is active and progressing, latch onto it instead of kicking off a new one.
    const STALE_MS = 5 * 60 * 1000;
    const { data: existingJobs } = await supabase
      .from("sync_jobs")
      .select("id, status, current_step, updated_at")
      .eq("ad_account_id", accountId)
      .in("status", ["running", "pending"])
      .order("created_at", { ascending: false })
      .limit(1);
    const existing = existingJobs?.[0];
    const isFresh = existing && (Date.now() - new Date(existing.updated_at).getTime()) < STALE_MS;

    let activeJobId: string | null = isFresh ? existing!.id : null;
    if (isFresh && existing?.current_step) setSyncStep(existing.current_step);

    // 2. Subscribe to realtime BEFORE invoking the function so we never miss the
    //    first progress update.
    const channel = supabase
      .channel(`bg-sync-progress-${Date.now()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sync_jobs", filter: `ad_account_id=eq.${accountId}` },
        (payload) => {
          const job = payload.new as any;
          if (!job) return;
          // Only react to our active job once we know which one it is
          if (activeJobId && job.id !== activeJobId) return;
          if (!activeJobId) activeJobId = job.id;

          if (job.current_step) setSyncStep(job.current_step);
          if (job.status === "completed" || job.status === "complete") {
            setSyncStatus("complete");
            fetchData();
            supabase.removeChannel(channel);
            setTimeout(() => setSyncStatus("idle"), 2500);
          }
          if (job.status === "failed" || job.status === "error") {
            setSyncStatus("error");
            setSyncStep(job.error_message || "Sync failed");
            supabase.removeChannel(channel);
          }
        },
      )
      .subscribe();

    // If we latched onto an existing job, don't re-invoke.
    if (isFresh) return;

    try {
      // Resync only the last 30 days — Meta's attribution windows close by 28 days,
      // so older days won't change. Keeps repulls fast and bounded.
      const { data, error } = await supabase.functions.invoke("meta-sync-accounts", {
        body: { adAccountId: accountId, dateRangeDays: "30" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.syncJobId) activeJobId = data.syncJobId;
    } catch (err: any) {
      console.error("Background sync error:", err);
      setSyncStatus("error");
      setSyncStep(err?.message || "Sync failed");
      supabase.removeChannel(channel);
    }
  }, [state.selectedAccount, state.dateRange, fetchData, syncStatus]);

  // Initial load: fetch existing data immediately, then sync in background
  useEffect(() => {
    fetchData().then(() => {
      // New user just completed onboarding sync — skip redundant background sync
      if (state.syncComplete) return;

      // For dev mode, simulate a background sync — never call real sync edge fn
      const isDevMode =
        isDevSession() ||
        sessionStorage.getItem("meta_connection")?.includes("mock");
      if (isDevMode) {
        setSyncStatus("syncing");
        setSyncStep("Connecting to Meta");
        const steps = [
          "Pulling campaigns and ad sets",
          "Pulling ads and creatives",
          "Pulling ad performance",
          "Filtering supported formats",
          "Preparing insights",
        ];
        let i = 0;
        const interval = setInterval(() => {
          if (i < steps.length) {
            setSyncStep(steps[i]);
            i++;
          } else {
            clearInterval(interval);
            setSyncStatus("complete");
          }
        }, 1200);
        return;
      }
      // Returning user — sync in background, but throttle auto-resync to once
      // per hour per account. Manual resync button bypasses this.
      if (state.selectedAccount) {
        const AUTO_SYNC_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
        const key = `last_auto_sync_${state.selectedAccount}`;
        try {
          const last = Number(localStorage.getItem(key) || 0);
          if (Date.now() - last < AUTO_SYNC_COOLDOWN_MS) {
            return;
          }
          localStorage.setItem(key, String(Date.now()));
        } catch {}
        triggerBackgroundSync();
      }
    });
  }, []);

  // Derived data
  const filteredAds = useMemo(() => {
    // Always start from a score-sorted baseline so "top" slicing is meaningful
    let result = sortAds(ads, "score");
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) => a.adName.toLowerCase().includes(q) || a.campaignName.toLowerCase().includes(q)
      );
    }
    if (activeView === "top") {
      result = result.slice(0, Math.max(1, Math.ceil(ads.length * 0.2)));
    }
    if (activeView === "opportunities") {
      result = result.filter((a) => (a.spend ?? 0) > 1000 && (a.roas ?? 0) < 2);
    }
    if (activeView === "needs-review") {
      result = result.filter((a) => a.decayScore > 50);
    }
    // Apply user-selected sort. For opinionated views, default sort key falls back
    // to that view's natural ranking.
    if (sortKey === "score") {
      if (activeView === "opportunities") return sortAds(result, "spend");
      if (activeView === "needs-review") return sortAds(result, "decay");
      return result;
    }
    return sortAds(result, sortKey);
  }, [ads, searchQuery, activeView, sortKey]);

  const campaignBoards = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();
    ads.forEach((a) => {
      if (!map.has(a.campaignId)) {
        map.set(a.campaignId, { id: a.campaignId, name: a.campaignName, count: 0 });
      }
      map.get(a.campaignId)!.count++;
    });
    return Array.from(map.values());
  }, [ads]);

  const activeCreativeCount = useMemo(() => {
    const set = new Set<string>();
    ads.forEach((a) => {
      if (a.hasActiveAd) set.add(a.creativeId);
    });
    return set.size;
  }, [ads]);

  const topPerformers: TopPerformerSlide[] = useMemo(() => {
    if (ads.length === 0) return [];
    const fmt = (a: EnrichedAd) => a.creativeType.includes("carousel") ? "Carousel" : a.creativeType.includes("video") ? "Video" : "Static";
    const compactNum = (n: number) =>
      n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : `${n}`;

    const bySpend = [...ads].sort((a, b) => (b.spend ?? 0) - (a.spend ?? 0))[0];
    const byPurchases = [...ads].sort((a, b) =>
      (b.purchases ?? 0) - (a.purchases ?? 0) || (b.spend ?? 0) - (a.spend ?? 0)
    )[0];
    const byImpressions = [...ads].sort((a, b) =>
      (b.impressions ?? 0) - (a.impressions ?? 0) || (b.spend ?? 0) - (a.spend ?? 0)
    )[0];

    const slides: TopPerformerSlide[] = [];
    if (bySpend) slides.push({
      name: bySpend.adName,
      metricLabel: "Spend",
      metricValue: `$${compactNum(Math.round(bySpend.spend ?? 0))} spend`,
      avgSpend: Math.round(bySpend.spend ?? 0),
      topFormat: fmt(bySpend),
    });
    if (byPurchases) slides.push({
      name: byPurchases.adName,
      metricLabel: "Purchases",
      metricValue: `${(byPurchases.purchases ?? 0).toLocaleString()} purchases`,
      avgSpend: Math.round(byPurchases.spend ?? 0),
      topFormat: fmt(byPurchases),
    });
    if (byImpressions) slides.push({
      name: byImpressions.adName,
      metricLabel: "Impressions",
      metricValue: `${compactNum(byImpressions.impressions ?? 0)} impressions`,
      avgSpend: Math.round(byImpressions.spend ?? 0),
      topFormat: fmt(byImpressions),
    });
    return slides;
  }, [ads]);

  const formatMix = useMemo(() => {
    const mix = { video: 0, static: 0, carousel: 0 };
    ads.forEach((a) => {
      if (a.creativeType.includes("video")) mix.video++;
      else if (a.creativeType.includes("carousel")) mix.carousel++;
      else mix.static++;
    });
    return mix;
  }, [ads]);

  const totalSpend = ads.reduce((s, a) => s + (a.spend ?? 0), 0);

  // Top / bottom sections
  const topAds = filteredAds.slice(0, Math.max(1, Math.ceil(filteredAds.length * 0.2)));
  const latestAds = filteredAds;

  const viewTitle = useMemo(() => {
    switch (activeView) {
      case "top": return "Top Performers";
      case "opportunities": return "Opportunities";
      case "needs-review": return "Needs Review";
      case "library": return "Ad Library";
      default: return "All Ads";
    }
  }, [activeView]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Analyzing creatives…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[hsl(222,47%,11%)]">
      {/* Dark top bar — full width */}
      <InsightsTopBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterClick={() => setShowFilters(!showFilters)}
        onResync={triggerBackgroundSync}
        syncStatus={syncStatus}
        syncStep={syncStep}
        canResync={!!state.selectedAccount}
      />
      {/* Sidebar + Main content as one card */}
      <div className="flex flex-1 overflow-hidden bg-card rounded-t-2xl">
        <InsightsSidebar
          activeView={activeView}
          onViewChange={setActiveView}
          campaignBoards={campaignBoards}
          adAccounts={adAccounts}
          selectedAccountId={selectedAccountId}
          onAccountChange={setSelectedAccountId}
        />
        <main className="flex-1 overflow-auto border-l border-border/60">
          {activeView === "generations" ? (
            <GenerationsTable />
          ) : activeView === "library" ? (
            <GeneratedCreativesByJob
              title="Ad Library"
              subtitle="Every creative you've generated, grouped by the request that produced it."
              hideEmptyJobs
            />
          ) : (
          <div className="px-8 py-10 max-w-[1200px] mx-auto">
            {/* Hero — Create your next ad */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered Creative Intelligence
              </div>
              <h1 className="font-display font-bold text-4xl text-foreground mb-3 tracking-tight">
                Create your next winning ad
              </h1>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
                Powered by what's already working in your account, what's winning for competitors, and what's trending right now.
              </p>
              <div className="flex flex-col items-center gap-4 mb-8">
                <Button
                  size="lg"
                  className="gap-2.5 rounded-xl px-8 py-3 shadow-md hover:shadow-lg transition-shadow text-sm font-semibold h-12"
                  onClick={() => navigate("/create-ad")}
                >
                  <Wand2 className="w-4 h-4" />
                  Create New Ad
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-2 bg-card border border-border/60 rounded-xl px-4 py-2 shadow-sm"><Trophy className="w-3.5 h-3.5 text-accent" /> Your Top Performers</span>
                <span className="flex items-center gap-2 bg-card border border-border/60 rounded-xl px-4 py-2 shadow-sm"><Target className="w-3.5 h-3.5 text-primary" /> Competitor Insights</span>
                <span className="flex items-center gap-2 bg-card border border-border/60 rounded-xl px-4 py-2 shadow-sm"><TrendingUp className="w-3.5 h-3.5 text-accent" /> Industry Trends</span>
              </div>
            </motion.div>

            {/* Date range filter — controls all metrics on the page */}
            <div className="flex items-center justify-end mb-5">
              <DateRangeFilter value={dateRange} onChange={setDateRange} />
            </div>

            {/* Digest Cards — only on Home */}
            {activeView === "discover" && (
              <DigestCards
                activeCreativeCount={activeCreativeCount}
                topPerformers={topPerformers}
                formatMix={formatMix}
              />
            )}

            {/* Section header */}
            <div className="flex items-center justify-between mb-5 mt-2">
              <h2 className="font-display font-bold text-xl text-foreground tracking-tight">{viewTitle}</h2>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      Sort: {SORT_OPTIONS.find((o) => o.key === sortKey)?.label}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 rounded-xl">
                    {SORT_OPTIONS.map((opt) => (
                      <DropdownMenuItem
                        key={opt.key}
                        className="text-xs rounded-lg flex items-center justify-between"
                        onClick={() => setSortKey(opt.key)}
                      >
                        {opt.label}
                        {sortKey === opt.key && <Check className="w-3.5 h-3.5 text-accent" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <span className="text-xs text-muted-foreground bg-secondary/80 px-3 py-1 rounded-full font-medium">{filteredAds.length} creatives</span>
              </div>
            </div>

            {/* Top performers — on Home */}
            {activeView === "discover" && (
              <>
                <AdCreativeGrid
                  ads={topAds}
                  title="🔥 Top Performers"
                  subtitle="These creatives are driving the strongest returns — use them to inform your next ad"
                  onAdClick={(id) => setPreviewAdId(id)}
                />
              </>
            )}

            {/* Main grid */}
            <AdCreativeGrid
              ads={latestAds}
              title={activeView === "discover" ? "All Ads" : viewTitle}
              onAdClick={(id) => setPreviewAdId(id)}
            />

            {/* Reinforcement */}
            <p className="text-center text-xs text-muted-foreground/40 mt-12 mb-6 font-medium">
              Every ad you create makes the next one smarter ✨
            </p>
          </div>
          )}
        </main>
      </div>

      <CreativePreviewDialog
        ad={previewAdId ? (filteredAds.find((a) => a.id === previewAdId) || ads.find((a) => a.id === previewAdId) || null) : null}
        open={!!previewAdId}
        onOpenChange={(o) => !o && setPreviewAdId(null)}
      />
    </div>
  );
};
