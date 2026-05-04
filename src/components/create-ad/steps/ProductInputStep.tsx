import { CreateAdState } from "../CreateAdFlow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Link2, ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface ProductInputStepProps {
  state: CreateAdState;
  onUpdate: (partial: Partial<CreateAdState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

export const ProductInputStep = ({ state, onUpdate, onNext, onBack }: ProductInputStepProps) => {
  const [method, setMethod] = useState<"url" | "image" | null>(state.productInputMethod);
  const [url, setUrl] = useState(state.productUrl);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(state.productImage);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (file: File) => {
    if (!ALLOWED.includes(file.type) && !/\.(png|jpe?g|webp)$/i.test(file.name)) {
      toast.error("Please upload a PNG, JPG, or WEBP image");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image too large. Max 10MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      onUpdate({ productImage: dataUrl, productInputMethod: "image" });
    };
    reader.onerror = () => toast.error("Couldn't read that file. Try another.");
    reader.readAsDataURL(file);
  };

  const handleContinue = () => {
    if (method === "url") {
      if (!url.trim()) { setError("Please enter a product URL"); return; }
      if (!url.startsWith("http")) { setError("Please enter a valid URL starting with https://"); return; }
      setError("");
      onUpdate({ productUrl: url, productInputMethod: "url" });
    } else if (method === "image") {
      if (!imagePreview) { toast.error("Please upload an image first"); return; }
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
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
          {imagePreview ? (
            <div className="relative rounded-lg border border-border bg-card p-4">
              <img
                src={imagePreview}
                alt="Product preview"
                className="mx-auto max-h-64 rounded-md object-contain"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => {
                  setImagePreview(null);
                  onUpdate({ productImage: null });
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handleFile(f);
              }}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
                isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
              }`}
            >
              <ImagePlus className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">Click to upload or drag & drop</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
            </div>
          )}
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
