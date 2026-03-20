import { motion } from "framer-motion";
import { useWizard } from "@/context/WizardContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, BarChart3, Image, Megaphone, Layers, Target } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SyncSummary {
  campaigns: any[];
  adSets: any[];
  ads: any[];
  creatives: any[];
  insights: any[];
  loading: boolean;
}

export const DataReviewStep = () => {
  const { setStep } = useWizard();
  const [data, setData] = useState<SyncSummary>({
    campaigns: [],
    adSets: [],
    ads: [],
    creatives: [],
    insights: [],
    loading: true,
  });
  const [activeTab, setActiveTab] = useState<string>("campaigns");

  useEffect(() => {
    const fetchAll = async () => {
      const [campaigns, adSets, ads, creatives, insights] = await Promise.all([
        supabase.from("campaigns").select("*").order("created_at", { ascending: false }),
        supabase.from("ad_sets").select("*").order("created_at", { ascending: false }),
        supabase.from("ads").select("*").order("created_at", { ascending: false }),
        supabase.from("ad_creatives").select("*").order("created_at", { ascending: false }),
        supabase.from("ad_insights").select("*").order("created_at", { ascending: false }),
      ]);

      setData({
        campaigns: campaigns.data || [],
        adSets: adSets.data || [],
        ads: ads.data || [],
        creatives: creatives.data || [],
        insights: insights.data || [],
        loading: false,
      });
    };
    fetchAll();
  }, []);

  if (data.loading) {
    return (
      <div className="container max-w-5xl py-16 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const tabs = [
    { key: "campaigns", label: "Campaigns", icon: Megaphone, count: data.campaigns.length },
    { key: "adSets", label: "Ad Sets", icon: Layers, count: data.adSets.length },
    { key: "ads", label: "Ads", icon: Target, count: data.ads.length },
    { key: "creatives", label: "Creatives", icon: Image, count: data.creatives.length },
    { key: "insights", label: "Insights", icon: BarChart3, count: data.insights.length },
  ];

  const renderTable = () => {
    switch (activeTab) {
      case "campaigns":
        return (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 px-3 font-medium text-muted-foreground">Name</th>
                <th className="py-2 px-3 font-medium text-muted-foreground">Campaign ID</th>
                <th className="py-2 px-3 font-medium text-muted-foreground">Status</th>
                <th className="py-2 px-3 font-medium text-muted-foreground">Objective</th>
              </tr>
            </thead>
            <tbody>
              {data.campaigns.map((c) => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2 px-3 text-foreground font-medium">{c.campaign_name}</td>
                  <td className="py-2 px-3 text-muted-foreground font-mono text-xs">{c.campaign_id}</td>
                  <td className="py-2 px-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-muted-foreground">{c.objective || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case "adSets":
        return (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 px-3 font-medium text-muted-foreground">Name</th>
                <th className="py-2 px-3 font-medium text-muted-foreground">Ad Set ID</th>
                <th className="py-2 px-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.adSets.map((a) => (
                <tr key={a.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2 px-3 text-foreground font-medium">{a.adset_name}</td>
                  <td className="py-2 px-3 text-muted-foreground font-mono text-xs">{a.adset_id}</td>
                  <td className="py-2 px-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case "ads":
        return (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 px-3 font-medium text-muted-foreground">Name</th>
                <th className="py-2 px-3 font-medium text-muted-foreground">Ad ID</th>
                <th className="py-2 px-3 font-medium text-muted-foreground">Status</th>
                <th className="py-2 px-3 font-medium text-muted-foreground">Creative ID</th>
              </tr>
            </thead>
            <tbody>
              {data.ads.map((a) => (
                <tr key={a.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2 px-3 text-foreground font-medium">{a.ad_name}</td>
                  <td className="py-2 px-3 text-muted-foreground font-mono text-xs">{a.ad_id}</td>
                  <td className="py-2 px-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-muted-foreground font-mono text-xs">{a.creative_id || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case "creatives":
        return (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 px-3 font-medium text-muted-foreground">Type</th>
                <th className="py-2 px-3 font-medium text-muted-foreground">Headline</th>
                <th className="py-2 px-3 font-medium text-muted-foreground">CTA</th>
                <th className="py-2 px-3 font-medium text-muted-foreground">Images</th>
                <th className="py-2 px-3 font-medium text-muted-foreground">Destination</th>
              </tr>
            </thead>
            <tbody>
              {data.creatives.map((c) => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2 px-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.creative_type.startsWith('static') ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {c.creative_type}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-foreground max-w-[200px] truncate">{c.headline || "—"}</td>
                  <td className="py-2 px-3 text-muted-foreground text-xs">{c.call_to_action || "—"}</td>
                  <td className="py-2 px-3 text-muted-foreground">{Array.isArray(c.image_urls) ? c.image_urls.length : 0}</td>
                  <td className="py-2 px-3 text-muted-foreground text-xs max-w-[200px] truncate">{c.destination_url || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case "insights":
        return (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 px-3 font-medium text-muted-foreground">Date Range</th>
                <th className="py-2 px-3 font-medium text-muted-foreground">Spend</th>
                <th className="py-2 px-3 font-medium text-muted-foreground">Impressions</th>
                <th className="py-2 px-3 font-medium text-muted-foreground">Clicks</th>
                <th className="py-2 px-3 font-medium text-muted-foreground">CTR</th>
                <th className="py-2 px-3 font-medium text-muted-foreground">CPC</th>
                <th className="py-2 px-3 font-medium text-muted-foreground">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {data.insights.map((i) => (
                <tr key={i.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2 px-3 text-foreground text-xs">{i.date_start} → {i.date_stop}</td>
                  <td className="py-2 px-3 text-foreground font-medium">${Number(i.spend || 0).toFixed(2)}</td>
                  <td className="py-2 px-3 text-muted-foreground">{Number(i.impressions || 0).toLocaleString()}</td>
                  <td className="py-2 px-3 text-muted-foreground">{Number(i.clicks || 0).toLocaleString()}</td>
                  <td className="py-2 px-3 text-muted-foreground">{Number(i.ctr || 0).toFixed(2)}%</td>
                  <td className="py-2 px-3 text-muted-foreground">${Number(i.cpc || 0).toFixed(2)}</td>
                  <td className="py-2 px-3 font-medium text-primary">{Number(i.roas || 0).toFixed(2)}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container max-w-5xl py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Synced Data Review</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Here's everything pulled from your Meta ad account.
            </p>
          </div>
          <Button size="lg" className="gap-2" onClick={() => setStep("insights")}>
            Continue <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`p-3 rounded-lg border text-left transition-all ${
                activeTab === tab.key
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <tab.icon className="w-4 h-4 text-muted-foreground mb-1" />
              <div className="text-lg font-bold text-foreground">{tab.count}</div>
              <div className="text-xs text-muted-foreground">{tab.label}</div>
            </button>
          ))}
        </div>

        {/* Data table */}
        <div className="rounded-lg border border-border bg-card overflow-x-auto">
          {renderTable()}
          {(data as any)[activeTab]?.length === 0 && (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No data found for this category.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
