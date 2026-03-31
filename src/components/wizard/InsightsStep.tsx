import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { InsightsSidebar } from "@/components/insights/InsightsSidebar";
import { InsightsTopBar } from "@/components/insights/InsightsTopBar";
import { DigestCards } from "@/components/insights/DigestCards";
import { AdCreativeGrid } from "@/components/insights/AdCreativeGrid";
import { SyncNotificationBar } from "@/components/insights/SyncNotificationBar";
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
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState<EnrichedAd[]>([]);
  const [activeView, setActiveView] = useState("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [adAccounts, setAdAccounts] = useState<{ id: string; account_id: string; account_name: string }[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      // Fetch ad accounts
      const accountsRes = await supabase.from("ad_accounts").select("id, account_id, account_name");
      const fetchedAccounts = accountsRes.data || [];
      
      if (fetchedAccounts.length === 0) {
        // Mock ad accounts for dev mode
        const mockAccounts = [
          { id: "mock-acc-1", account_id: "act_111222333", account_name: "Glow Skin Co. Ads" },
          { id: "mock-acc-2", account_id: "act_444555666", account_name: "FitFuel Performance" },
          { id: "mock-acc-3", account_id: "act_777888999", account_name: "UrbanThreads Growth" },
        ];
        setAdAccounts(mockAccounts);
        setSelectedAccountId(mockAccounts[0].id);
      } else {
        setAdAccounts(fetchedAccounts);
        setSelectedAccountId(fetchedAccounts[0].id);
      }

      const [adsRes, creativesRes, insightsRes, adSetsRes, campaignsRes] = await Promise.all([
        supabase.from("ads").select("*"),
        supabase.from("ad_creatives").select("*"),
        supabase.from("ad_insights").select("*"),
        supabase.from("ad_sets").select("*"),
        supabase.from("campaigns").select("*"),
      ]);

      const dbAds = adsRes.data || [];
      const creatives = creativesRes.data || [];
      const insights = insightsRes.data || [];
      const adSets = adSetsRes.data || [];
      const campaigns = campaignsRes.data || [];

      if (creatives.length === 0) {
        setAds(generateMockData());
        setLoading(false);
        return;
      }

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
      setAds(enriched);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Derived data
  const filteredAds = useMemo(() => {
    let result = ads;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) => a.adName.toLowerCase().includes(q) || a.campaignName.toLowerCase().includes(q)
      );
    }
    if (activeView.startsWith("campaign-")) {
      const campId = activeView.replace("campaign-", "");
      result = result.filter((a) => a.campaignId === campId);
    }
    if (activeView === "top") {
      result = result.slice(0, Math.max(1, Math.ceil(ads.length * 0.2)));
    }
    if (activeView === "fatigue") {
      result = [...result].sort((a, b) => b.decayScore - a.decayScore);
    }
    return result;
  }, [ads, searchQuery, activeView]);

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

  const topPerformer = useMemo(() => {
    if (ads.length === 0) return null;
    const top = ads[0];
    const campaignAds = ads.filter((a) => a.campaignId === top.campaignId);
    return {
      name: top.adName,
      roas: top.roas ?? 0,
      newAds: campaignAds.length,
      avgSpend: Math.round(
        campaignAds.reduce((s, a) => s + (a.spend ?? 0), 0) / campaignAds.length
      ),
      topFormat: top.creativeType.includes("carousel") ? "Carousel" : "Static",
    };
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
    <div className="min-h-screen flex flex-col bg-background">
      <InsightsTopBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterClick={() => setShowFilters(!showFilters)}
      />
      <div className="flex flex-1 overflow-hidden">
        <InsightsSidebar
          activeView={activeView}
          onViewChange={setActiveView}
          campaignBoards={campaignBoards}
          adAccounts={adAccounts}
          selectedAccountId={selectedAccountId}
          onAccountChange={setSelectedAccountId}
        />
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-[1400px]">
            {/* Digest header */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h1 className="font-display font-bold text-2xl text-foreground">Your Creative Digest</h1>
                  <p className="text-sm text-muted-foreground">
                    Performance overview across {ads.length} creatives
                  </p>
                </div>
                <Button size="lg" className="gap-2 shadow-md" onClick={() => navigate("/pdp-input")}>
                  Generate New Creative <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Tab pills */}
              <div className="flex items-center gap-1 mt-4 mb-6">
                {["Explore", "For You"].map((tab) => (
                  <button
                    key={tab}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      tab === "For You"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Digest Cards */}
            <DigestCards
              totalAds={ads.length}
              newAdsLast14Days={Math.min(ads.length, 5)}
              velocityChange={40}
              topPerformer={topPerformer}
              formatMix={formatMix}
            />

            {/* Top performers */}
            {activeView !== "fatigue" && (
              <AdCreativeGrid
                ads={topAds}
                title="🔥 Top Performers"
                onAdClick={(id) => console.log("View ad", id)}
              />
            )}

            {/* All / Latest Ads */}
            <AdCreativeGrid
              ads={latestAds}
              title={activeView === "fatigue" ? "Creative Fatigue — Highest First" : "All Ads"}
              onAdClick={(id) => console.log("View ad", id)}
            />
          </div>
        </main>
      </div>
    </div>
  );
};
