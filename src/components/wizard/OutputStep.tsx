import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, ChevronLeft, ChevronRight, ImageOff, ThumbsUp, ThumbsDown } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface GeneratedCreative {
  id: string;
  variant_index: number;
  aspect_ratio: string | null;
  image_url: string;
  thumbnail_url: string | null;
  headline: string | null;
  primary_text: string | null;
  description: string | null;
  feedback?: "like" | "dislike" | null;
}

const LazyImage = ({
  src,
  alt,
  className,
  aspectClass,
}: {
  src: string;
  alt: string;
  className?: string;
  aspectClass: string;
}) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div className={`relative ${aspectClass} bg-muted overflow-hidden`}>
      {!loaded && !errored && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      {errored ? (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <ImageOff className="w-6 h-6" />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          } ${className ?? ""}`}
        />
      )}
    </div>
  );
};

export const OutputStep = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [creatives, setCreatives] = useState<GeneratedCreative[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const submitFeedback = async (creativeId: string, value: "like" | "dislike") => {
    const current = creatives.find((c) => c.id === creativeId);
    const next = current?.feedback === value ? null : value;

    setCreatives((prev) =>
      prev.map((c) => (c.id === creativeId ? { ...c, feedback: next } : c))
    );

    if (jobId?.startsWith("dev_")) return;

    const { error } = await supabase
      .from("generated_creatives")
      .update({ feedback: next })
      .eq("id", creativeId);
    if (error) toast.error("Couldn't save feedback. Try again.");
  };

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      return;
    }
    // Dev mode: read stubbed creatives from sessionStorage
    if (jobId.startsWith("dev_")) {
      try {
        const raw = sessionStorage.getItem(`dev_creatives_${jobId}`);
        if (raw) {
          setCreatives(JSON.parse(raw));
        }
      } catch {
        toast.error("Failed to load dev creatives.");
      }
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("generated_creatives")
        .select("*")
        .eq("job_id", jobId)
        .order("variant_index", { ascending: true });
      if (error) {
        toast.error("Failed to load creatives.");
        setLoading(false);
        return;
      }
      setCreatives((data ?? []) as GeneratedCreative[]);
      setLoading(false);
    })();
  }, [jobId]);

  const selectedCreative = creatives.find((c) => c.id === selected);
  const selectedIndex = creatives.findIndex((c) => c.id === selected);

  // Preload neighbors in lightbox
  useEffect(() => {
    if (selectedIndex < 0) return;
    [selectedIndex - 1, selectedIndex + 1].forEach((i) => {
      const c = creatives[i];
      if (c) {
        const img = new Image();
        img.src = c.image_url;
      }
    });
  }, [selectedIndex, creatives]);

  const navigateCreative = (dir: 1 | -1) => {
    const next = selectedIndex + dir;
    if (next >= 0 && next < creatives.length) {
      setSelected(creatives[next].id);
    }
  };

  const downloadAll = () => toast.success("Downloading all creatives…");
  const regenerateAll = () => toast.message("Regenerate flow coming soon.");

  const aspectClassFor = (ratio: string | null): string => {
    switch (ratio) {
      case "9:16":
        return "aspect-[9/16]";
      case "16:9":
        return "aspect-[16/9]";
      case "4:5":
        return "aspect-[4/5]";
      case "1:1":
      default:
        return "aspect-square";
    }
  };

  if (loading) {
    return (
      <div className="container max-w-6xl py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!jobId || creatives.length === 0) {
    return (
      <div className="container max-w-6xl py-20 text-center">
        <h2 className="text-2xl font-bold text-foreground font-display mb-2">
          No creatives yet
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Start a new generation to see your creatives here.
        </p>
        <Button onClick={() => navigate("/create-ad")}>Create New Ad</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground font-display">Your Creatives</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {creatives.length} creatives generated. Click to enlarge or download.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={regenerateAll}>
              <RefreshCw className="w-3.5 h-3.5" /> Regenerate All
            </Button>
            <Button size="sm" className="gap-1.5" onClick={downloadAll}>
              <Download className="w-3.5 h-3.5" /> Download All
            </Button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {creatives.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
              className="group relative rounded-xl border border-border bg-card overflow-hidden cursor-pointer hover:shadow-md transition-all"
              onClick={() => setSelected(c.id)}
            >
              <LazyImage
                src={c.thumbnail_url ?? c.image_url}
                alt={c.headline ?? `Variant ${i + 1}`}
                aspectClass="aspect-square"
              />
              <div className="px-3 py-2.5 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-foreground truncate">
                  Variant {i + 1}
                  {c.aspect_ratio && (
                    <span className="text-muted-foreground"> · {c.aspect_ratio}</span>
                  )}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <FeedbackBtn
                    active={c.feedback === "like"}
                    tone="like"
                    onClick={(e) => {
                      e.stopPropagation();
                      submitFeedback(c.id, "like");
                    }}
                  />
                  <FeedbackBtn
                    active={c.feedback === "dislike"}
                    tone="dislike"
                    onClick={(e) => {
                      e.stopPropagation();
                      submitFeedback(c.id, "dislike");
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Back */}
        <div className="mt-8">
          <Button variant="outline" onClick={() => navigate("/create-ad")}>
            ← Create Another Ad
          </Button>
        </div>
      </motion.div>

      {/* Lightbox */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden bg-card border-border">
          {selectedCreative && (
            <div className="flex flex-col">
              <div className="relative">
                <LazyImage
                  src={selectedCreative.image_url}
                  alt={selectedCreative.headline ?? `Variant ${selectedIndex + 1}`}
                  aspectClass={aspectClassFor(selectedCreative.aspect_ratio)}
                />

                {selectedIndex > 0 && (
                  <button
                    onClick={() => navigateCreative(-1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors shadow-sm"
                  >
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                  </button>
                )}
                {selectedIndex < creatives.length - 1 && (
                  <button
                    onClick={() => navigateCreative(1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors shadow-sm"
                  >
                    <ChevronRight className="w-5 h-5 text-foreground" />
                  </button>
                )}
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-foreground">
                      Variant {selectedIndex + 1}
                      {selectedCreative.aspect_ratio && (
                        <span className="text-muted-foreground text-sm font-normal ml-2">
                          {selectedCreative.aspect_ratio}
                        </span>
                      )}
                    </h3>
                    {selectedCreative.headline && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedCreative.headline}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => window.open(selectedCreative.image_url, "_blank")}
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </Button>
                </div>
                {selectedCreative.primary_text && (
                  <p className="text-sm text-foreground/80">{selectedCreative.primary_text}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const FeedbackBtn = ({
  active,
  tone,
  onClick,
}: {
  active: boolean;
  tone: "like" | "dislike";
  onClick: (e: React.MouseEvent) => void;
}) => {
  const Icon = tone === "like" ? ThumbsUp : ThumbsDown;
  const activeClass =
    tone === "like"
      ? "bg-accent/15 text-accent"
      : "bg-destructive/10 text-destructive";
  return (
    <button
      type="button"
      onClick={onClick}
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
