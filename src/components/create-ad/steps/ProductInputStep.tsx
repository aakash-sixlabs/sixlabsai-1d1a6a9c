import { CreateAdState } from "../CreateAdFlow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Check, Link2, ImagePlus } from "lucide-react";
import { useState } from "react";
import {
  STEP_CONTAINER,
  STEP_HEADING,
  STEP_SUBTITLE,
  CARD_BASE,
  CARD_SELECTED,
  CARD_IDLE,
  CTA_SHAPE,
} from "./_shared";

interface ProductInputStepProps {
  state: CreateAdState;
  onUpdate: (partial: Partial<CreateAdState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const ProductInputStep = ({ state, onUpdate, onNext, onBack }: ProductInputStepProps) => {
  const [method, setMethod] = useState<"url" | "image" | null>(state.productInputMethod);
  const [url, setUrl] = useState(state.productUrl);
  const [error, setError] = useState("");

  const handleContinue = () => {
    if (method === "url") {
      if (!url.trim()) { setError("Please enter a product URL"); return; }
      if (!url.startsWith("http")) { setError("Please enter a valid URL starting with https://"); return; }
      setError("");
      onUpdate({ productUrl: url, productInputMethod: "url" });
    } else if (method === "image") {
      onUpdate({ productInputMethod: "image" });
    }
    onNext();
  };

  const options: { value: "url" | "image"; label: string; description: string; icon: React.ElementType }[] = [
    { value: "url", label: "Product URL", description: "Paste your Shopify or store link", icon: Link2 },
    { value: "image", label: "Upload Image", description: "Drop a product photo", icon: ImagePlus },
  ];

  return (
    <div className={STEP_CONTAINER}>
      <h2 className={STEP_HEADING}>Add your product</h2>
      <p className={STEP_SUBTITLE}>
        Share the product you want to advertise. We'll extract key details automatically.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {options.map((o) => {
          const Icon = o.icon;
          const isSelected = method === o.value;
          return (
            <button
              key={o.value}
              onClick={() => setMethod(o.value)}
              className={`${CARD_BASE} p-5 ${isSelected ? CARD_SELECTED : CARD_IDLE}`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <p className="font-semibold text-sm text-foreground pr-6">{o.label}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{o.description}</p>
            </button>
          );
        })}
      </div>

      {method === "url" && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Product Page URL</label>
          <div className="relative">
            <Link2 className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="https://yourstore.com/products/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )}

      {method === "image" && (
        <div className="rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 p-12 text-center hover:border-primary/40 transition-colors cursor-pointer">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <ImagePlus className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">Click to upload or drag & drop</p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
        </div>
      )}

      <div className="mt-10 flex justify-between">
        <Button variant="ghost" size="lg" onClick={onBack} className={CTA_SHAPE}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button size="lg" onClick={handleContinue} disabled={!method} className={CTA_SHAPE}>
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
