import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, AlertTriangle, ImageOff, Clock, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type JobStatus = "pending" | "generating" | "completed" | "failed" | string;

interface GenerationJob {
  id: string;
  status: JobStatus;
  goal: string | null;
  attempt_count: number | null;
  callback_received_at: string | null;
  service_job_id: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  aspect_ratios: string[] | null;
}

interface Creative {
  id: string;
  variant_index: number;
  aspect_ratio: string | null;
  image_url: string;
  thumbnail_url: string | null;
  stored_image_url: string | null;
  stored_thumbnail_url: string | null;
  storage_status: "pending" | "stored" | "failed" | null;
  headline: string | null;
}

const displayThumb = (c: Creative) =>
  c.stored_thumbnail_url ?? c.thumbnail_url ?? c.stored_image_url ?? c.image_url;

const aspectClass = (r: string | null) => {
  switch (r) {
    case "9:16": return "aspect-[9/16]";
    case "16:9": return "aspect-[16/9]";
    case "4:5": return "aspect-[4/5]";
    default: return "aspect-square";
  }
};

const statusMeta = (s: JobStatus) => {
  switch (s) {
    case "pending":   return { label: "Queued",     pct: 10, tone: "bg-muted text-muted-foreground" };
    case "generating":return { label: "Generating", pct: 55, tone: "bg-primary/10 text-primary" };
    case "completed": return { label: "Completed",  pct: 100,tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" };
    case "failed":    return { label: "Failed",     pct: 100,tone: "bg-destructive/10 text-destructive" };
    default:          return { label: s,            pct: 25, tone: "bg-muted text-muted-foreground" };
  }
};

const ThumbCard = ({ c, i }: { c: Creative; i: number }) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const isStored = c.storage_status === "stored";
  const isFailed = c.storage_status === "failed";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
      className="relative rounded-xl border border-border bg-card overflow-hidden shadow-sm"
    >
      <div className={`relative ${aspectClass(c.aspect_ratio)} bg-muted overflow-hidden`}>
        {!loaded && !errored && <Skeleton className="absolute inset-0 w-full h-full" />}
        {errored ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <ImageOff className="w-6 h-6" />
          </div>
        ) : (
          <img
            src={displayThumb(c)}
            alt={c.headline ?? `Variant ${c.variant_index + 1}`}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
            className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          />
        )}

        <span
          className={`absolute top-2 right-2 text-[10px] font-medium rounded-full px-2 py-0.5 shadow-sm backdrop-blur ${
            isStored
              ? "bg-emerald-500/90 text-white"
              : isFailed
                ? "bg-destructive/90 text-white"
                : "bg-yellow-500/90 text-white"
          }`}
        >
          {isStored ? "✓ Saved" : isFailed ? "Save failed" : "Saving…"}
        </span>
      </div>
      <div className="px-3 py-2 flex items-center justify-between">
        <span className="text-xs font-medium text-foreground truncate">
          Variant {c.variant_index + 1}
          {c.aspect_ratio && <span className="text-muted-foreground"> · {c.aspect_ratio}</span>}
        </span>
      </div>
    </motion.div>
  );
};

const OnboardingV1Live = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const explicitJobId = params.get("jobId");

  const [userId, setUserId] = useState<string | null>(null);
  const [job, setJob] = useState<GenerationJob | null>(null);
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [loading, setLoading] = useState(true);
  const [noJob, setNoJob] = useState(false);

  // Resolve auth + initial job
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/loginv1");
        return;
      }
      setUserId(user.id);

      let initialJob: GenerationJob | null = null;
      if (explicitJobId) {
        const { data } = await supabase
          .from("generation_jobs")
          .select("id, status, goal, attempt_count, callback_received_at, service_job_id, error_message, created_at, updated_at, aspect_ratios")
          .eq("id", explicitJobId)
          .maybeSingle();
        initialJob = (data as GenerationJob | null) ?? null;
      } else {
        const { data } = await supabase
          .from("generation_jobs")
          .select("id, status, goal, attempt_count, callback_received_at, service_job_id, error_message, created_at, updated_at, aspect_ratios")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        initialJob = (data as GenerationJob | null) ?? null;
      }

      if (!initialJob) {
        setNoJob(true);
        setLoading(false);
        return;
      }
      setJob(initialJob);

      const { data: cs } = await supabase
        .from("generated_creatives")
        .select("id, variant_index, aspect_ratio, image_url, thumbnail_url, stored_image_url, stored_thumbnail_url, storage_status, headline")
        .eq("job_id", initialJob.id)
        .order("variant_index", { ascending: true });
      setCreatives((cs ?? []) as Creative[]);
      setLoading(false);
    })();
  }, [explicitJobId, navigate]);

  // Realtime subscriptions
  useEffect(() => {
    if (!job?.id) return;

    const jobChannel = supabase
      .channel(`onbv1-job-${job.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "generation_jobs", filter: `id=eq.${job.id}` },
        (payload) => {
          const next = payload.new as GenerationJob;
          setJob((prev) => ({ ...(prev as GenerationJob), ...next }));
          if (next.status === "failed") {
            toast.error("Generation failed", { description: next.error_message ?? undefined });
          }
          if (next.status === "completed") {
            toast.success("Creatives ready");
          }
        },
      )
      .subscribe();

    const creativeChannel = supabase
      .channel(`onbv1-creatives-${job.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "generated_creatives", filter: `job_id=eq.${job.id}` },
        (payload) => {
          const row = payload.new as Creative;
          setCreatives((prev) => {
            if (prev.some((c) => c.id === row.id)) return prev;
            const next = [...prev, row];
            next.sort((a, b) => a.variant_index - b.variant_index);
            return next;
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "generated_creatives", filter: `job_id=eq.${job.id}` },
        (payload) => {
          const row = payload.new as Creative;
          setCreatives((prev) => prev.map((c) => (c.id === row.id ? { ...c, ...row } : c)));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(jobChannel);
      supabase.removeChannel(creativeChannel);
    };
  }, [job?.id]);

  const expectedTotal = useMemo(() => {
    const ratios = job?.aspect_ratios?.length ?? 1;
    // Heuristic: 3 variants per ratio (matches dev stub & typical request).
    return Math.max(creatives.length, ratios * 3);
  }, [job?.aspect_ratios, creatives.length]);

  const storedCount = creatives.filter((c) => c.storage_status === "stored").length;
  const meta = job ? statusMeta(job.status) : statusMeta("pending");

  const overallPct = useMemo(() => {
    if (!job) return 0;
    if (job.status === "failed") return 100;
    if (job.status === "completed" && expectedTotal > 0) {
      return Math.round((storedCount / expectedTotal) * 100);
    }
    // Blend status progress with creative-arrival progress.
    const arrivalPct = expectedTotal > 0 ? (creatives.length / expectedTotal) * 80 : 0;
    return Math.min(95, Math.round(meta.pct * 0.4 + arrivalPct * 0.7));
  }, [job, creatives.length, storedCount, expectedTotal, meta.pct]);

  if (loading) {
    return (
      <div className="container max-w-5xl py-12">
        <Skeleton className="h-32 w-full rounded-2xl mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (noJob || !job) {
    return (
      <div className="container max-w-3xl py-20 text-center">
        <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold font-display text-foreground mb-2">No active generation</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Kick off a creative generation to see live progress here.
        </p>
        <Button onClick={() => navigate("/create-ad")}>Create New Ad</Button>
      </div>
    );
  }

  const StatusIcon =
    job.status === "completed" ? CheckCircle2 :
    job.status === "failed"    ? AlertTriangle :
                                 Loader2;

  return (
    <div className="container max-w-5xl py-10">
      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-6 shadow-sm mb-8"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Onboarding · v1 · Live generation
            </p>
            <h1 className="text-2xl font-bold font-display text-foreground">
              {job.goal ? job.goal : "Your creatives"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Job {job.id.slice(0, 8)}…
              {job.service_job_id && <> · svc {job.service_job_id.slice(0, 10)}…</>}
            </p>
          </div>
          <Badge className={`${meta.tone} border-transparent gap-1.5`}>
            <StatusIcon
              className={`w-3.5 h-3.5 ${job.status === "generating" || job.status === "pending" ? "animate-spin" : ""}`}
            />
            {meta.label}
          </Badge>
        </div>

        <Progress value={overallPct} className="h-2 mb-3" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <Stat label="Variants" value={`${creatives.length}${expectedTotal ? ` / ${expectedTotal}` : ""}`} />
          <Stat label="Saved" value={`${storedCount} / ${creatives.length || 0}`} />
          <Stat
            label="Callback"
            value={job.callback_received_at ? new Date(job.callback_received_at).toLocaleTimeString() : "Waiting…"}
            icon={<Clock className="w-3 h-3" />}
          />
          <Stat label="Attempts" value={String(job.attempt_count ?? 0)} />
        </div>

        {job.status === "failed" && job.error_message && (
          <div className="mt-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
            {job.error_message}
          </div>
        )}

        {job.status === "completed" && (
          <div className="mt-4 flex justify-end">
            <Button size="sm" onClick={() => navigate(`/output?jobId=${job.id}`)}>
              View in Output
            </Button>
          </div>
        )}
      </motion.div>

      {/* Creatives grid */}
      {creatives.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Waiting for the generation service to return creatives…
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {creatives.map((c, i) => (
              <ThumbCard key={c.id} c={c} i={i} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

const Stat = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
  <div className="rounded-lg bg-secondary/40 border border-border px-3 py-2">
    <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
      {icon}
      {label}
    </div>
    <div className="text-sm font-semibold text-foreground truncate">{value}</div>
  </div>
);

export default OnboardingV1Live;
