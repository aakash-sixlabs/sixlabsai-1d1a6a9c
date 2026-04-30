import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Sparkles, Wand2 } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export interface PreviewAd {
  id: string;
  adName: string;
  campaignName: string;
  imageUrl: string | null;
  creativeType: string;
  score: number;
  decayScore: number;
  spend: number | null;
  roas: number | null;
  ctr: number | null;
  impressions: number | null;
  purchases?: number | null;
}

interface Props {
  ad: PreviewAd | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const fmtCompact = (n: number | null | undefined, prefix = "") => {
  if (n == null) return "—";
  const v = Number(n);
  if (v >= 1_000_000) return `${prefix}${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${prefix}${(v / 1_000).toFixed(1)}K`;
  return `${prefix}${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

const Metric = ({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) => (
  <div className="rounded-xl border border-border/60 bg-secondary/30 px-4 py-3">
    <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
      {label}
    </p>
    <p
      className={`font-display font-semibold text-2xl ${
        accent ? "text-accent" : "text-foreground"
      }`}
    >
      {value}
    </p>
  </div>
);

export const CreativePreviewDialog = ({ ad, open, onOpenChange }: Props) => {
  if (!ad) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl">
        <VisuallyHidden>
          <DialogTitle>{ad.adName}</DialogTitle>
          <DialogDescription>Creative preview and performance metrics</DialogDescription>
        </VisuallyHidden>

        <div className="grid md:grid-cols-2">
          {/* Image */}
          <div className="relative bg-secondary/30 aspect-square md:aspect-auto md:min-h-[520px] flex items-center justify-center">
            {ad.imageUrl ? (
              <img
                src={ad.imageUrl}
                alt={ad.adName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-muted-foreground text-sm">No preview available</div>
            )}
            <div className="absolute top-3 left-3">
              <Badge className="bg-card/95 backdrop-blur-md text-foreground border-0 text-xs font-semibold gap-1 shadow-md rounded-lg px-2.5 py-1">
                <TrendingUp className="w-3.5 h-3.5 text-accent" />
                Score {ad.score}
              </Badge>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col gap-5">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                {ad.campaignName}
              </p>
              <h2 className="font-display font-semibold text-xl text-foreground leading-tight">
                {ad.adName}
              </h2>
              <Badge variant="secondary" className="mt-2 text-[10px] rounded-md">
                {ad.creativeType.replace(/_/g, " ")}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Metric label="Spend" value={fmtCompact(ad.spend, "$")} />
              <Metric
                label="ROAS"
                value={ad.roas != null ? `${ad.roas.toFixed(2)}x` : "—"}
                accent
              />
              <Metric
                label="CTR"
                value={ad.ctr != null ? `${ad.ctr.toFixed(2)}%` : "—"}
              />
              <Metric label="Impressions" value={fmtCompact(ad.impressions)} />
              {ad.purchases != null && (
                <Metric label="Purchases" value={fmtCompact(ad.purchases)} />
              )}
              <Metric label="Decay Score" value={`${ad.decayScore}`} />
            </div>

            <div className="mt-auto flex gap-2 pt-4 border-t border-border/60">
              <Button className="flex-1 gap-1.5" size="sm">
                <Wand2 className="w-3.5 h-3.5" />
                Remix this creative
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
