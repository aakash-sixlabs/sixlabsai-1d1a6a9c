import { useState } from "react";
import { motion } from "framer-motion";
import { ImageOff, ThumbsUp, ThumbsDown, X, Download } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { downloadImage, extOf } from "@/lib/downloadImage";

interface Creative {
  id: string;
  variant_index: number;
  aspect_ratio: string | null;
  image_url: string;
  thumbnail_url: string | null;
  headline: string | null;
  feedback: "like" | "dislike" | null;
}

interface Props {
  creative: Creative;
  index: number;
  onFeedback: (v: "like" | "dislike") => void;
}

// Map known ratio strings to a CSS aspect-ratio fallback while the image loads.
const ratioFallback = (s: string | null): string => {
  switch (s) {
    case "9:16": return "9 / 16";
    case "16:9": return "16 / 9";
    case "4:5":  return "4 / 5";
    case "1:1":  return "1 / 1";
    default:     return "1 / 1";
  }
};

export const CreativeImageCard = ({ creative, index, onFeedback }: Props) => {
  const [errored, setErrored] = useState(false);
  const [naturalRatio, setNaturalRatio] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const aspectStyle = {
    aspectRatio: naturalRatio ?? ratioFallback(creative.aspect_ratio),
  };

  // Derive a clean ratio label (e.g. "4:5") from the loaded image dimensions.
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const ratioLabel = (() => {
    if (naturalRatio) {
      const [wStr, hStr] = naturalRatio.split(" / ");
      const w = Number(wStr);
      const h = Number(hStr);
      if (w > 0 && h > 0) {
        const d = gcd(Math.round(w), Math.round(h));
        return `${Math.round(w) / d}:${Math.round(h) / d}`;
      }
    }
    return creative.aspect_ratio ?? null;
  })();

  const filename = `variant-${creative.variant_index + 1}.${extOf(creative.image_url)}`;
  const handleDownload = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    downloadImage(creative.image_url, filename);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
        className="rounded-2xl border border-border/60 bg-card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-zoom-in"
        onClick={() => setOpen(true)}
      >
        <div className="relative bg-secondary/20" style={aspectStyle}>
          {errored ? (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ImageOff className="w-6 h-6" />
            </div>
          ) : (
            <img
              src={creative.thumbnail_url ?? creative.image_url}
              alt={creative.headline ?? `Variant ${creative.variant_index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
              onLoad={(e) => {
                const img = e.currentTarget;
                if (img.naturalWidth && img.naturalHeight) {
                  setNaturalRatio(`${img.naturalWidth} / ${img.naturalHeight}`);
                }
              }}
              onError={() => setErrored(true)}
            />
          )}
        </div>
        <div className="px-3 py-2.5 flex items-center justify-between">
          <span className="text-xs font-medium text-foreground truncate">
            Variant {creative.variant_index + 1}
            {creative.aspect_ratio && (
              <span className="text-muted-foreground"> · {creative.aspect_ratio}</span>
            )}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <FeedbackButton
              active={creative.feedback === "like"}
              tone="like"
              onClick={() => onFeedback("like")}
            />
            <FeedbackButton
              active={creative.feedback === "dislike"}
              tone="dislike"
              onClick={() => onFeedback("dislike")}
            />
            <button
              type="button"
              onClick={handleDownload}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary/80 transition-colors"
              aria-label="Download"
              title="Download"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-[95vw] sm:max-w-4xl p-0 bg-transparent border-0 shadow-none"
          // Hide default close so we can render our own positioned button
        >
          <div className="relative flex items-center justify-center">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -top-3 -right-3 z-10 h-9 w-9 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-foreground hover:bg-secondary"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="absolute top-3 right-10 z-10 h-9 px-3 rounded-full bg-card/90 backdrop-blur border border-border shadow-md flex items-center gap-1.5 text-xs font-medium text-foreground hover:bg-secondary"
              aria-label="Download image"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
            <img
              src={creative.image_url}
              alt={creative.headline ?? `Variant ${creative.variant_index + 1}`}
              className="max-h-[88vh] w-auto h-auto rounded-xl shadow-2xl"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const FeedbackButton = ({
  active,
  tone,
  onClick,
}: {
  active: boolean;
  tone: "like" | "dislike";
  onClick: () => void;
}) => {
  const Icon = tone === "like" ? ThumbsUp : ThumbsDown;
  const activeClass =
    tone === "like" ? "bg-accent/15 text-accent" : "bg-destructive/10 text-destructive";
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${
        active ? activeClass : "text-muted-foreground hover:bg-secondary/80"
      }`}
      aria-label={tone === "like" ? "Like" : "Dislike"}
      aria-pressed={active}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
};
