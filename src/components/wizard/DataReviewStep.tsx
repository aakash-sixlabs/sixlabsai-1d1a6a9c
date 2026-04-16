import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CadRow {
  id: number;
  campaign_name: string | null;
  campaign_status: string | null;
  adset_name: string | null;
  ad_name: string | null;
  ad_status: string | null;
  creative_title: string | null;
  creative_body: string | null;
  creative_image_url: string | null;
  call_to_action: string | null;
  spend: number | null;
  impressions: number | null;
  clicks: number | null;
  ctr: number | null;
  cpc: number | null;
  cpm: number | null;
  roas: number | null;
  date: string | null;
}

const fmt = (n: number | null, prefix = "", suffix = "") =>
  n != null ? `${prefix}${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}${suffix}` : "—";

export const DataReviewStep = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<CadRow[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      // Try production table first
      const { data: cadData } = await supabase
        .from("campaign_ad_data")
        .select("*")
        .order("created_at", { ascending: false });

      if (cadData && cadData.length > 0) {
        setRows(cadData as unknown as CadRow[]);
      } else {
        // Fallback: build from legacy tables
        const [c, as2, a, cr, i] = await Promise.all([
          supabase.from("campaigns").select("*").order("created_at", { ascending: false }),
          supabase.from("ad_sets").select("*").order("created_at", { ascending: false }),
          supabase.from("ads").select("*").order("created_at", { ascending: false }),
          supabase.from("ad_creatives").select("*").order("created_at", { ascending: false }),
          supabase.from("ad_insights").select("*").order("created_at", { ascending: false }),
        ]);
        const campaigns = c.data || [];
        const adSets = as2.data || [];
        const ads = a.data || [];
        const creatives = cr.data || [];
        const insights = i.data || [];

        const campaignMap = new Map(campaigns.map((c: any) => [c.id, c]));
        const adSetMap = new Map(adSets.map((a: any) => [a.id, a]));
        const creativeByAd = new Map<string, any>();
        creatives.forEach((c: any) => creativeByAd.set(c.ad_id, c));
        const insightByAd = new Map<string, any>();
        insights.forEach((i: any) => insightByAd.set(i.ad_id, i));

        const legacyRows: CadRow[] = ads.map((ad: any) => {
          const adSet = adSetMap.get(ad.adset_id);
          const campaign = adSet ? campaignMap.get(adSet.campaign_id) : undefined;
          if (!adSet || !campaign) return null;
          const creative = creativeByAd.get(ad.id);
          const insight = insightByAd.get(ad.id);
          const imgs = Array.isArray(creative?.image_urls) ? creative.image_urls : [];
          return {
            id: ad.id,
            campaign_name: campaign.campaign_name,
            campaign_status: campaign.status,
            adset_name: adSet.adset_name,
            ad_name: ad.ad_name,
            ad_status: ad.status,
            creative_title: creative?.headline || null,
            creative_body: creative?.primary_text || null,
            creative_image_url: imgs[0] || null,
            call_to_action: creative?.call_to_action || null,
            spend: insight?.spend ?? null,
            impressions: insight?.impressions ?? null,
            clicks: insight?.clicks ?? null,
            ctr: insight?.ctr ?? null,
            cpc: insight?.cpc ?? null,
            cpm: insight?.cpm ?? null,
            roas: insight?.roas ?? null,
            date: null,
          };
        }).filter(Boolean) as CadRow[];
        setRows(legacyRows);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const uniqueAds = useMemo(() => {
    // Deduplicate by ad_name (campaign_ad_data has daily rows)
    const seen = new Map<string, CadRow>();
    rows.forEach(r => {
      const key = r.ad_name || String(r.id);
      if (!seen.has(key)) seen.set(key, r);
    });
    return Array.from(seen.values());
  }, [rows]);

  if (loading) {
    return <div className="container max-w-7xl py-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="container max-w-[95vw] py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Synced Data Review</h2>
            <p className="text-muted-foreground text-sm mt-1">{uniqueAds.length} ads · {rows.length} daily rows</p>
          </div>
          <Button size="lg" className="gap-2" onClick={() => navigate("/home")}>Continue <ArrowRight className="w-4 h-4" /></Button>
        </div>
        <div className="rounded-lg border border-border bg-card overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-left">
                <th className="px-3 py-3 font-semibold text-muted-foreground whitespace-nowrap">Creative</th>
                <th className="px-3 py-3 font-semibold text-muted-foreground whitespace-nowrap">Campaign</th>
                <th className="px-3 py-3 font-semibold text-muted-foreground whitespace-nowrap">Ad Set</th>
                <th className="px-3 py-3 font-semibold text-muted-foreground whitespace-nowrap">Ad Name</th>
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
              {uniqueAds.map((row) => (
                <tr key={row.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors align-top">
                  <td className="px-3 py-3">
                    {row.creative_image_url ? (
                      <a href={row.creative_image_url} target="_blank" rel="noopener noreferrer" className="block shrink-0 rounded-md overflow-hidden border border-border/50 hover:border-primary/50 transition-colors">
                        <img src={row.creative_image_url} alt="" className="w-20 h-20 object-cover" loading="lazy" />
                      </a>
                    ) : (
                      <div className="w-20 h-20 rounded-md bg-muted/30 flex items-center justify-center text-muted-foreground text-xs">No img</div>
                    )}
                  </td>
                  <td className="px-3 py-3"><div className="font-medium text-foreground max-w-[160px] truncate" title={row.campaign_name || ""}>{row.campaign_name || "—"}</div></td>
                  <td className="px-3 py-3"><div className="text-foreground max-w-[160px] truncate" title={row.adset_name || ""}>{row.adset_name || "—"}</div></td>
                  <td className="px-3 py-3"><div className="text-foreground max-w-[180px] truncate" title={row.ad_name || ""}>{row.ad_name || "—"}</div><span className={`text-[10px] px-1.5 py-0.5 rounded-full ${row.ad_status === "ACTIVE" ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>{row.ad_status || "—"}</span></td>
                  <td className="px-3 py-3"><div className="max-w-[180px]">{row.creative_title && <div className="text-foreground text-xs line-clamp-2">{row.creative_title}</div>}{row.creative_body && <div className="text-muted-foreground text-xs line-clamp-2 mt-0.5">{row.creative_body}</div>}</div></td>
                  <td className="px-3 py-3 text-right font-medium text-foreground whitespace-nowrap">{fmt(row.spend, "$")}</td>
                  <td className="px-3 py-3 text-right text-foreground whitespace-nowrap">{fmt(row.impressions)}</td>
                  <td className="px-3 py-3 text-right text-foreground whitespace-nowrap">{fmt(row.clicks)}</td>
                  <td className="px-3 py-3 text-right text-foreground whitespace-nowrap">{fmt(row.ctr, "", "%")}</td>
                  <td className="px-3 py-3 text-right text-foreground whitespace-nowrap">{fmt(row.cpc, "$")}</td>
                  <td className="px-3 py-3 text-right font-medium text-foreground whitespace-nowrap">{fmt(row.roas, "", "x")}</td>
                </tr>
              ))}
              {uniqueAds.length === 0 && (
                <tr><td colSpan={11} className="px-3 py-12 text-center text-muted-foreground">No ad data found. Try syncing your account first.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
