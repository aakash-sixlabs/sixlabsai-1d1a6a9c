import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Campaign { id: string; campaign_id: string; campaign_name: string; status: string | null; objective: string | null; }
interface AdSet { id: string; adset_id: string; adset_name: string; status: string | null; campaign_id: string; }
interface Ad { id: string; ad_id: string; ad_name: string; status: string | null; adset_id: string; creative_id: string | null; }
interface Creative { id: string; ad_id: string; creative_type: string; headline: string | null; primary_text: string | null; call_to_action: string | null; image_urls: any; destination_url: string | null; }
interface Insight { id: string; ad_id: string; spend: number | null; impressions: number | null; clicks: number | null; ctr: number | null; cpc: number | null; cpm: number | null; roas: number | null; conversions: number | null; conversion_value: number | null; }

interface FlatRow { campaign: Campaign; adSet: AdSet; ad: Ad; creative: Creative | undefined; insight: Insight | undefined; }

const fmt = (n: number | null, prefix = "", suffix = "") =>
  n != null ? `${prefix}${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}${suffix}` : "—";

export const DataReviewStep = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [adSets, setAdSets] = useState<AdSet[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const [c, as2, a, cr, i] = await Promise.all([
        supabase.from("campaigns").select("*").order("created_at", { ascending: false }),
        supabase.from("ad_sets").select("*").order("created_at", { ascending: false }),
        supabase.from("ads").select("*").order("created_at", { ascending: false }),
        supabase.from("ad_creatives").select("*").order("created_at", { ascending: false }),
        supabase.from("ad_insights").select("*").order("created_at", { ascending: false }),
      ]);
      setCampaigns(c.data || []);
      setAdSets(as2.data || []);
      setAds(a.data || []);
      setCreatives(cr.data || []);
      setInsights(i.data || []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const campaignMap = useMemo(() => new Map(campaigns.map(c => [c.id, c])), [campaigns]);
  const adSetMap = useMemo(() => new Map(adSets.map(a => [a.id, a])), [adSets]);
  const creativeByAd = useMemo(() => { const map = new Map<string, Creative>(); creatives.forEach(c => map.set(c.ad_id, c)); return map; }, [creatives]);
  const insightByAd = useMemo(() => { const map = new Map<string, Insight>(); insights.forEach(i => map.set(i.ad_id, i)); return map; }, [insights]);

  const rows: FlatRow[] = useMemo(() => {
    return ads.map(ad => {
      const adSet = adSetMap.get(ad.adset_id);
      const campaign = adSet ? campaignMap.get(adSet.campaign_id) : undefined;
      if (!adSet || !campaign) return null;
      return { campaign, adSet, ad, creative: creativeByAd.get(ad.id), insight: insightByAd.get(ad.id) };
    }).filter(Boolean) as FlatRow[];
  }, [ads, adSetMap, campaignMap, creativeByAd, insightByAd]);

  if (loading) {
    return <div className="container max-w-7xl py-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="container max-w-[95vw] py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Synced Data Review</h2>
            <p className="text-muted-foreground text-sm mt-1">{campaigns.length} campaigns · {adSets.length} ad sets · {ads.length} ads · {creatives.length} creatives</p>
          </div>
          <Button size="lg" className="gap-2" onClick={() => navigate("/insights")}>Continue <ArrowRight className="w-4 h-4" /></Button>
        </div>
        <div className="rounded-lg border border-border bg-card overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-left">
                <th className="px-3 py-3 font-semibold text-muted-foreground whitespace-nowrap">Creative</th>
                <th className="px-3 py-3 font-semibold text-muted-foreground whitespace-nowrap">Campaign</th>
                <th className="px-3 py-3 font-semibold text-muted-foreground whitespace-nowrap">Ad Set</th>
                <th className="px-3 py-3 font-semibold text-muted-foreground whitespace-nowrap">Ad Name</th>
                <th className="px-3 py-3 font-semibold text-muted-foreground whitespace-nowrap">Type</th>
                <th className="px-3 py-3 font-semibold text-muted-foreground whitespace-nowrap">Headline</th>
                <th className="px-3 py-3 font-semibold text-muted-foreground whitespace-nowrap text-right">Spend</th>
                <th className="px-3 py-3 font-semibold text-muted-foreground whitespace-nowrap text-right">Impr.</th>
                <th className="px-3 py-3 font-semibold text-muted-foreground whitespace-nowrap text-right">Clicks</th>
                <th className="px-3 py-3 font-semibold text-muted-foreground whitespace-nowrap text-right">CTR</th>
                <th className="px-3 py-3 font-semibold text-muted-foreground whitespace-nowrap text-right">CPC</th>
                <th className="px-3 py-3 font-semibold text-muted-foreground whitespace-nowrap text-right">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const imgs = Array.isArray(row.creative?.image_urls) ? row.creative!.image_urls : [];
                return (
                  <tr key={row.ad.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors align-top">
                    <td className="px-3 py-3">
                      {imgs.length > 0 ? (
                        <div className="flex gap-1.5">
                          {imgs.map((url: string, i: number) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block shrink-0 rounded-md overflow-hidden border border-border/50 hover:border-primary/50 transition-colors">
                              <img src={url} alt="" className="w-20 h-20 object-cover" loading="lazy" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-md bg-muted/30 flex items-center justify-center text-muted-foreground text-xs">No img</div>
                      )}
                    </td>
                    <td className="px-3 py-3"><div className="font-medium text-foreground max-w-[160px] truncate" title={row.campaign.campaign_name}>{row.campaign.campaign_name}</div><div className="text-xs text-muted-foreground">{row.campaign.objective || ""}</div></td>
                    <td className="px-3 py-3"><div className="text-foreground max-w-[160px] truncate" title={row.adSet.adset_name}>{row.adSet.adset_name}</div></td>
                    <td className="px-3 py-3"><div className="text-foreground max-w-[180px] truncate" title={row.ad.ad_name}>{row.ad.ad_name}</div><span className={`text-[10px] px-1.5 py-0.5 rounded-full ${row.ad.status === "ACTIVE" ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>{row.ad.status || "—"}</span></td>
                    <td className="px-3 py-3">{row.creative && <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${row.creative.creative_type.startsWith("static") ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{row.creative.creative_type.replace("_", " ")}</span>}</td>
                    <td className="px-3 py-3"><div className="max-w-[180px]">{row.creative?.headline && <div className="text-foreground text-xs line-clamp-2">{row.creative.headline}</div>}{row.creative?.primary_text && <div className="text-muted-foreground text-xs line-clamp-2 mt-0.5">{row.creative.primary_text}</div>}</div></td>
                    <td className="px-3 py-3 text-right font-medium text-foreground whitespace-nowrap">{fmt(row.insight?.spend ?? null, "$")}</td>
                    <td className="px-3 py-3 text-right text-foreground whitespace-nowrap">{fmt(row.insight?.impressions ?? null)}</td>
                    <td className="px-3 py-3 text-right text-foreground whitespace-nowrap">{fmt(row.insight?.clicks ?? null)}</td>
                    <td className="px-3 py-3 text-right text-foreground whitespace-nowrap">{fmt(row.insight?.ctr ?? null, "", "%")}</td>
                    <td className="px-3 py-3 text-right text-foreground whitespace-nowrap">{fmt(row.insight?.cpc ?? null, "$")}</td>
                    <td className="px-3 py-3 text-right font-medium text-foreground whitespace-nowrap">{fmt(row.insight?.roas ?? null, "", "x")}</td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr><td colSpan={12} className="px-3 py-12 text-center text-muted-foreground">No ad data found. Try syncing your account first.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
