import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ImageOff, ThumbsUp, ThumbsDown, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/prod/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { isDevSession } from "@/lib/devMode";

interface GeneratedCreative {
  id: string;
  job_id: string;
  variant_index: number;
  aspect_ratio: string | null;
  image_url: string;
  thumbnail_url: string | null;
  headline: string | null;
  feedback: "like" | "dislike" | null;
}

interface GenerationJob {
  id: string;
  created_at: string;
  status: string;
  goal: string | null;
  promo_scope: string | null;
  promo_details: any;
  product_url: string | null;
  product_image_url: string | null;
}

interface JobGroup {
  job: GenerationJob;
  creatives: GeneratedCreative[];
}

const formatJobTitle = (job: GenerationJob): string => {
  const goal = job.goal ? job.goal.replace(/_/g, " ") : "Generation";
  const scope = job.promo_scope ? ` · ${job.promo_scope.replace(/_/g, " ")}` : "";
  return `${goal.charAt(0).toUpperCase()}${goal.slice(1)}${scope}`;
};

const formatRelative = (iso: string): string => {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

interface GeneratedCreativesByJobProps {
  /** Title shown above the list. */
  title: string;
  /** Optional subtitle. */
  subtitle?: string;
  /** When true, hide jobs with zero creatives (used for Library view). */
  hideEmptyJobs?: boolean;
}

export const GeneratedCreativesByJob = ({
  title,
  subtitle,
  hideEmptyJobs = false,
}: GeneratedCreativesByJobProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<JobGroup[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);

      // Dev mode: no real data — show empty state.
      if (isDevSession()) {
        if (!cancelled) {
          setGroups([]);
          setLoading(false);
        }
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) {
          setGroups([]);
          setLoading(false);
        }
        return;
      }

      const [{ data: jobs }, { data: creatives }] = await Promise.all([
        supabase
          .from("generation_jobs")
          .select("id, created_at, status, goal, promo_scope, promo_details, product_url, product_image_url")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("generated_creatives")
          .select("id, job_id, variant_index, aspect_ratio, image_url, thumbnail_url, headline, feedback")
          .eq("user_id", user.id)
          .order("variant_index", { ascending: true }),
      ]);

      const byJob = new Map<string, GeneratedCreative[]>();
      (creatives ?? []).forEach((c: any) => {
        const arr = byJob.get(c.job_id) ?? [];
        arr.push(c);
        byJob.set(c.job_id, arr);
      });

      const built: JobGroup[] = (jobs ?? []).map((j: any) => ({
        job: j,
        creatives: byJob.get(j.id) ?? [],
      }));

      const filtered = hideEmptyJobs ? built.filter((g) => g.creatives.length > 0) : built;
      if (!cancelled) {
        setGroups(filtered);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hideEmptyJobs]);

  const setFeedback = async (creativeId: string, value: "like" | "dislike") => {
    // Toggle off if same value clicked again
    const current = groups
      .flatMap((g) => g.creatives)
      .find((c) => c.id === creativeId);
    const next = current?.feedback === value ? null : value;

    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        creatives: g.creatives.map((c) =>
          c.id === creativeId ? { ...c, feedback: next } : c
        ),
      }))
    );

    await supabase
      .from("generated_creatives")
      .update({ feedback: next })
      .eq("id", creativeId);
  };

  if (loading) {
    return (
      <div className="px-8 py-10 max-w-[1200px] mx-auto">
        <h2 className="font-display font-bold text-xl text-foreground mb-6">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="px-8 py-20 max-w-[1200px] mx-auto text-center">
        <h2 className="font-display font-bold text-xl text-foreground mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground mb-6">
          You haven't generated any creatives yet. Start your first generation to see it here.
        </p>
        <Button onClick={() => navigate("/create-ad")} className="gap-2">
          Create New Ad <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="px-8 py-10 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl text-foreground tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>

      <div className="space-y-10">
        {groups.map((group) => (
          <section key={group.job.id}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold text-sm text-foreground">
                  {formatJobTitle(group.job)}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatRelative(group.job.created_at)} ·{" "}
                  {group.creatives.length} creative
                  {group.creatives.length === 1 ? "" : "s"}
                  {group.job.status !== "complete" && (
                    <span className="ml-2 text-accent capitalize">· {group.job.status}</span>
                  )}
                </p>
              </div>
              {group.creatives.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs gap-1.5"
                  onClick={() => navigate(`/output?jobId=${group.job.id}`)}
                >
                  Open <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            {group.creatives.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 bg-secondary/30 px-4 py-8 text-center text-xs text-muted-foreground">
                No creatives produced for this generation.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {group.creatives.map((c, i) => (
                  <CreativeCard
                    key={c.id}
                    creative={c}
                    index={i}
                    onFeedback={(v) => setFeedback(c.id, v)}
                  />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};

const CreativeCard = ({
  creative,
  index,
  onFeedback,
}: {
  creative: GeneratedCreative;
  index: number;
  onFeedback: (v: "like" | "dislike") => void;
}) => {
  const [errored, setErrored] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
      className="rounded-2xl border border-border/60 bg-card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="relative aspect-square bg-secondary/20">
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
        </div>
      </div>
    </motion.div>
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
    tone === "like"
      ? "bg-accent/15 text-accent"
      : "bg-destructive/10 text-destructive";
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
