import { CreateAdState } from "../CreateAdFlow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Check, Link2, ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { supabase } from "@/integrations/prod/client";
import { toast } from "sonner";
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

const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export const ProductInputStep = ({ state, onUpdate, onNext, onBack }: ProductInputStepProps) => {
  const [method, setMethod] = useState<"url" | "image" | null>(state.productInputMethod);
  const [url, setUrl] = useState(state.productUrl);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(state.productImage ?? null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelected = async (file: File) => {
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please upload a PNG or JPG image");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be 10MB or smaller");
      return;
    }

    setUploading(true);
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData.user) throw new Error("Not authenticated");

      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${userData.user.id}/uploads/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("ad-creatives")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadErr) throw uploadErr;

      const { data: pub } = supabase.storage.from("ad-creatives").getPublicUrl(path);
      setUploadedUrl(pub.publicUrl);
      onUpdate({ productImage: pub.publicUrl, productInputMethod: "image" });
      toast.success("Image uploaded");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = () => {
    if (method === "url") {
      if (!url.trim()) { setError("Please enter a product URL"); return; }
      if (!url.startsWith("http")) { setError("Please enter a valid URL starting with https://"); return; }
      setError("");
      onUpdate({ productUrl: url, productInputMethod: "url", productImage: null });
    } else if (method === "image") {
      if (!uploadedUrl) { setError("Please upload an image first"); return; }
      setError("");
      onUpdate({ productImage: uploadedUrl, productInputMethod: "image" });
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
        <div>
          <input
            ref={fileInputRef}
            id="product-image-input"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileSelected(f);
              e.target.value = "";
            }}
          />

          {uploadedUrl ? (
            <div className="relative rounded-2xl border border-border/80 bg-muted/20 p-4 flex items-center gap-4">
              <img
                src={uploadedUrl}
                alt="Uploaded product"
                className="w-20 h-20 rounded-lg object-cover border border-border"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Image uploaded</p>
                <p className="text-xs text-muted-foreground truncate">{uploadedUrl}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setUploadedUrl(null);
                  onUpdate({ productImage: null });
                }}
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <label
              htmlFor="product-image-input"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f && !uploading) handleFileSelected(f);
              }}
              className={`block w-full rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 p-12 text-center hover:border-primary/40 transition-colors ${
                uploading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
              }`}
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                {uploading ? (
                  <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                ) : (
                  <ImagePlus className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm font-medium text-foreground">
                {uploading ? "Uploading…" : "Click to upload or drag & drop"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP up to 10MB</p>
            </label>
          )}

          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </div>
      )}

      <div className="mt-10 flex justify-between">
        <Button variant="ghost" size="lg" onClick={onBack} className={CTA_SHAPE}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!method || uploading || (method === "image" && !uploadedUrl)}
          className={CTA_SHAPE}
        >
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
