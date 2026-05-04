import { CreateAdState } from "../CreateAdFlow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Link2, ImagePlus } from "lucide-react";
import { useState } from "react";

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

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-1">Add your product</h2>
      <p className="text-muted-foreground mb-8">
        Share the product you want to advertise. We'll extract key details automatically.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setMethod("url")}
          className={`p-6 rounded-lg border-2 text-center transition-all ${
            method === "url"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/40 bg-card"
          }`}
        >
          <Link2 className={`w-8 h-8 mx-auto mb-3 ${method === "url" ? "text-primary" : "text-muted-foreground"}`} />
          <p className="font-semibold text-foreground text-sm">Product URL</p>
          <p className="text-xs text-muted-foreground mt-1">Paste your Shopify or store link</p>
        </button>
        <button
          onClick={() => setMethod("image")}
          className={`p-6 rounded-lg border-2 text-center transition-all ${
            method === "image"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/40 bg-card"
          }`}
        >
          <ImagePlus className={`w-8 h-8 mx-auto mb-3 ${method === "image" ? "text-primary" : "text-muted-foreground"}`} />
          <p className="font-semibold text-foreground text-sm">Upload Image</p>
          <p className="text-xs text-muted-foreground mt-1">Drop a product photo</p>
        </button>
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
              className="pl-9"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )}

      {method === "image" && (
        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/40 transition-colors cursor-pointer">
          <ImagePlus className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">Click to upload or drag & drop</p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <Button variant="ghost" size="lg" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button size="lg" onClick={handleContinue} disabled={!method} className="gap-2">
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
