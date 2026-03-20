import { motion, AnimatePresence } from "framer-motion";
import { useWizard } from "@/context/WizardContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, ChevronRight, ChevronDown, Megaphone, Layers, Target, Image, BarChart3 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Campaign { id: string; campaign_id: string; campaign_name: string; status: string | null; objective: string | null; }
interface AdSet { id: string; adset_id: string; adset_name: string; status: string | null; campaign_id: string; }
interface Ad { id: string; ad_id: string; ad_name: string; status: string | null; adset_id: string; creative_id: string | null; }
interface Creative { id: string; ad_id: string; creative_type: string; headline: string | null; primary_text: string | null; call_to_action: string | null; image_urls: any; destination_url: string | null; }
interface Insight { id: string; ad_id: string; spend: number | null; impressions: number | null; clicks: number | null; ctr: number | null; cpc: number | null; cpm: number | null; roas: number | null; conversions: number | null; conversion_value: number | null; }

const StatusBadge = ({ status }: { status: string | null }) => (
  <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
    status === "ACTIVE" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
  }`}>{status || "—"}</span>
);

const MetricPill = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col items-center px-3 py-1.5 rounded-md bg-muted/50">
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    <span className="text-sm font-semibold text-foreground">{value}</span>
  </div>
);

export const DataReviewStep = () => {
  const { setStep } = useWizard();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [adSets, setAdSets] = useState<AdSet[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);

  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());
  const [expandedAdSets, setExpandedAdSets] = useState<Set<string>>(new Set());
  const [expandedAds, setExpandedAds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchAll = async () => {
      const [c, as, a, cr, i] = await Promise.all([
        supabase.from("campaigns").select("*").order("created_at", { ascending: false }),
        supabase.from("ad_sets").select("*").order("created_at", { ascending: false }),
        supabase.from("ads").select("*").order("created_at", { ascending: false }),
        supabase.from("ad_creatives").select("*").order("created_at", { ascending: false }),
        supabase.from("ad_insights").select("*").order("created_at", { ascending: false }),
      ]);
      setCampaigns(c.data || []);
      setAdSets(as.data || []);
      setAds(a.data || []);
      setCreatives(cr.data || []);
      setInsights(i.data || []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Build lookup maps
  const adSetsByCampaign = useMemo(() => {
    const map = new Map<string, AdSet[]>();
    adSets.forEach((a) => {
      const list = map.get(a.campaign_id) || [];
      list.push(a);
      map.set(a.campaign_id, list);
    });
    return map;
  }, [adSets]);

  const adsByAdSet = useMemo(() => {
    const map = new Map<string, Ad[]>();
    ads.forEach((a) => {
      const list = map.get(a.adset_id) || [];
      list.push(a);
      map.set(a.adset_id, list);
    });
    return map;
  }, [ads]);

  const creativeByAd = useMemo(() => {
    const map = new Map<string, Creative>();
    creatives.forEach((c) => map.set(c.ad_id, c));
    return map;
  }, [creatives]);

  const insightByAd = useMemo(() => {
    const map = new Map<string, Insight>();
    insights.forEach((i) => map.set(i.ad_id, i));
    return map;
  }, [insights]);

  const toggle = (set: Set<string>, id: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    setter(next);
  };

  const expandAll = () => {
    setExpandedCampaigns(new Set(campaigns.map((c) => c.id)));
    setExpandedAdSets(new Set(adSets.map((a) => a.id)));
    setExpandedAds(new Set(ads.map((a) => a.id)));
  };

  const collapseAll = () => {
    setExpandedCampaigns(new Set());
    setExpandedAdSets(new Set());
    setExpandedAds(new Set());
  };

  if (loading) {
    return (
      <div className="container max-w-5xl py-16 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const fmt = (n: number | null, prefix = "", suffix = "") =>
    n != null ? `${prefix}${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}${suffix}` : "—";

  return (
    <div className="container max-w-5xl py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Synced Data Review</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {campaigns.length} campaigns · {adSets.length} ad sets · {ads.length} ads · {creatives.length} creatives · {insights.length} insights
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>Expand All</Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>Collapse All</Button>
            <Button size="lg" className="gap-2" onClick={() => setStep("insights")}>
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {campaigns.map((campaign) => {
            const cExpanded = expandedCampaigns.has(campaign.id);
            const cAdSets = adSetsByCampaign.get(campaign.id) || [];

            return (
              <div key={campaign.id} className="rounded-lg border border-border bg-card overflow-hidden">
                {/* Campaign row */}
                <button
                  onClick={() => toggle(expandedCampaigns, campaign.id, setExpandedCampaigns)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors text-left"
                >
                  {cExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                  <Megaphone className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-semibold text-foreground flex-1 truncate">{campaign.campaign_name}</span>
                  <StatusBadge status={campaign.status} />
                  <span className="text-xs text-muted-foreground">{campaign.objective || ""}</span>
                  <span className="text-xs text-muted-foreground">{cAdSets.length} ad sets</span>
                </button>

                <AnimatePresence>
                  {cExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="pl-6 border-t border-border/50">
                        {cAdSets.length === 0 && <div className="py-3 px-3 text-sm text-muted-foreground">No ad sets</div>}
                        {cAdSets.map((adSet) => {
                          const asExpanded = expandedAdSets.has(adSet.id);
                          const asAds = adsByAdSet.get(adSet.id) || [];

                          return (
                            <div key={adSet.id} className="border-b border-border/30 last:border-b-0">
                              {/* Ad Set row */}
                              <button
                                onClick={() => toggle(expandedAdSets, adSet.id, setExpandedAdSets)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-muted/20 transition-colors text-left"
                              >
                                {asExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                                <Layers className="w-3.5 h-3.5 text-accent-foreground shrink-0" />
                                <span className="font-medium text-foreground flex-1 truncate text-sm">{adSet.adset_name}</span>
                                <StatusBadge status={adSet.status} />
                                <span className="text-xs text-muted-foreground">{asAds.length} ads</span>
                              </button>

                              <AnimatePresence>
                                {asExpanded && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <div className="pl-6">
                                      {asAds.length === 0 && <div className="py-3 px-3 text-sm text-muted-foreground">No ads</div>}
                                      {asAds.map((ad) => {
                                        const adExpanded = expandedAds.has(ad.id);
                                        const creative = creativeByAd.get(ad.id);
                                        const insight = insightByAd.get(ad.id);

                                        return (
                                          <div key={ad.id} className="border-b border-border/20 last:border-b-0">
                                            {/* Ad row */}
                                            <button
                                              onClick={() => toggle(expandedAds, ad.id, setExpandedAds)}
                                              className="w-full flex items-center gap-3 p-3 hover:bg-muted/10 transition-colors text-left"
                                            >
                                              {adExpanded ? <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />}
                                              <Target className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                              <span className="text-sm text-foreground flex-1 truncate">{ad.ad_name}</span>
                                              <StatusBadge status={ad.status} />
                                              {insight && (
                                                <span className="text-xs font-medium text-primary">{fmt(insight.spend, "$")} spend</span>
                                              )}
                                            </button>

                                            <AnimatePresence>
                                              {adExpanded && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                  <div className="pl-10 pr-3 pb-4 space-y-3">
                                                    {/* Creative info */}
                                                    {creative && (
                                                      <div className="rounded-md border border-border/50 bg-muted/20 p-3">
                                                        <div className="flex items-center gap-2 mb-2">
                                                          <Image className="w-3.5 h-3.5 text-muted-foreground" />
                                                          <span className="text-xs font-medium text-foreground">Creative</span>
                                                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${creative.creative_type.startsWith("static") ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                                                            {creative.creative_type}
                                                          </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                          {creative.headline && (
                                                            <div><span className="text-muted-foreground">Headline:</span> <span className="text-foreground">{creative.headline}</span></div>
                                                          )}
                                                          {creative.primary_text && (
                                                            <div className="col-span-2"><span className="text-muted-foreground">Text:</span> <span className="text-foreground line-clamp-2">{creative.primary_text}</span></div>
                                                          )}
                                                          {creative.call_to_action && (
                                                            <div><span className="text-muted-foreground">CTA:</span> <span className="text-foreground">{creative.call_to_action}</span></div>
                                                          )}
                                                          {creative.destination_url && (
                                                            <div className="col-span-2 truncate"><span className="text-muted-foreground">URL:</span> <span className="text-foreground">{creative.destination_url}</span></div>
                                                          )}
                                                          <div><span className="text-muted-foreground">Images:</span> <span className="text-foreground">{Array.isArray(creative.image_urls) ? creative.image_urls.length : 0}</span></div>
                                                        </div>
                                                      </div>
                                                    )}

                                                    {/* Performance metrics */}
                                                    {insight && (
                                                      <div className="rounded-md border border-border/50 bg-muted/20 p-3">
                                                        <div className="flex items-center gap-2 mb-2">
                                                          <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
                                                          <span className="text-xs font-medium text-foreground">Performance</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                          <MetricPill label="Spend" value={fmt(insight.spend, "$")} />
                                                          <MetricPill label="Impressions" value={fmt(insight.impressions)} />
                                                          <MetricPill label="Clicks" value={fmt(insight.clicks)} />
                                                          <MetricPill label="CTR" value={fmt(insight.ctr, "", "%")} />
                                                          <MetricPill label="CPC" value={fmt(insight.cpc, "$")} />
                                                          <MetricPill label="CPM" value={fmt(insight.cpm, "$")} />
                                                          <MetricPill label="ROAS" value={fmt(insight.roas, "", "x")} />
                                                          <MetricPill label="Conversions" value={fmt(insight.conversions)} />
                                                          <MetricPill label="Conv. Value" value={fmt(insight.conversion_value, "$")} />
                                                        </div>
                                                      </div>
                                                    )}

                                                    {!creative && !insight && (
                                                      <div className="text-xs text-muted-foreground py-2">No creative or performance data for this ad.</div>
                                                    )}
                                                  </div>
                                                </motion.div>
                                              )}
                                            </AnimatePresence>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
