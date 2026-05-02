import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  ImageOff,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Target,
  Tag,
  Layers,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface GenerationJob {
  id: string;
  created_at: string;
  status: string;
  goal: string | null;
  promo_scope: string | null;
  product_input_method: string | null;
  product_url: string | null;
  product_image_url: string | null;
  offer_type: string | null;
  disclaimer_ids: string[] | null;
  aspect_ratios: string[] | null;
  promo_details: any;
  icp_id: string | null;
  icp_snapshot: any;
  error_message: string | null;
  service_request_payload: any;
}

interface GeneratedCreative {
  id: string;
  variant_index: number;
  aspect_ratio: string | null;
  image_url: string;
  thumbnail_url: string | null;
  headline: string | null;
  feedback: "like" | "dislike" | null;
}

const titleCase = (s: string | null | undefined) =>
  s ? s.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const GenerationDetail = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<GenerationJob | null>(null);
  const [creatives, setCreatives] = useState<GeneratedCreative[]>([]);
  const [icpName, setIcpName] = useState<string | null>(null);
  const [icpDescription, setIcpDescription] = useState<string | null>(null);
  const [disclaimers, setDisclaimers] = useState<{ id: string; label: string; text: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!jobId) return;
      setLoading(true);

      const { data: jobData } = await supabase
        .from("generation_jobs")
        .select("*")
        .eq("id", jobId)
        .maybeSingle();

      if (!jobData) {
        if (!cancelled) {
          setJob(null);
          setLoading(false);
        }
        return;
      }

      const { data: cr } = await supabase
        .from("generated_creatives")
        .select("id, variant_index, aspect_ratio, image_url, thumbnail_url, headline, feedback")
        .eq("job_id", jobId)
        .order("variant_index", { ascending: true });

      // Resolve ICP (prefer snapshot, fallback to live ICP row)
      let resolvedIcpName: string | null = null;
      let resolvedIcpDesc: string | null = null;
      if (jobData.icp_snapshot && typeof jobData.icp_snapshot === "object" && !Array.isArray(jobData.icp_snapshot)) {
        const snap = jobData.icp_snapshot as Record<string, any>;
        resolvedIcpName = (snap.name as string) ?? null;
        resolvedIcpDesc = (snap.description as string) ?? null;
      }
      if (!resolvedIcpName && jobData.icp_id) {
        const { data: icp } = await supabase
          .from("icps")
          .select("name, description")
          .eq("id", jobData.icp_id)
          .maybeSingle();
        if (icp) {
          resolvedIcpName = icp.name;
          resolvedIcpDesc = icp.description;
        }
      }

      // Resolve disclaimers
      let resolvedDisclaimers: { id: string; label: string; text: string }[] = [];
      if (jobData.disclaimer_ids && jobData.disclaimer_ids.length > 0) {
        const { data: dList } = await supabase
          .from("disclaimers")
          .select("id, label, text")
          .in("id", jobData.disclaimer_ids);
        resolvedDisclaimers = dList ?? [];
      }

      if (!cancelled) {
        setJob(jobData as any);
        setCreatives((cr ?? []) as any);
        setIcpName(resolvedIcpName);
        setIcpDescription(resolvedIcpDesc);
        setDisclaimers(resolvedDisclaimers);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const setFeedback = async (creativeId: string, value: "like" | "dislike") => {
    const current = creatives.find((c) => c.id === creativeId);
    const next = current?.feedback === value ? null : value;
    setCreatives((prev) =>
      prev.map((c) => (c.id === creativeId ? { ...c, feedback: next } : c)),
    );
    await supabase.from("generated_creatives").update({ feedback: next }).eq("id", creativeId);
  };

  const backButton = (
    <button
      onClick={() => navigate("/home")}
      className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1.5"
    >
      <ArrowLeft className="w-4 h-4" /> Back to dashboard
    </button>
  );

  if (loading) {
    return (
      <AppShell headerLeft={backButton}>
        <div className="max-w-[1100px] mx-auto px-6 py-10 space-y-6">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  if (!job) {
    return (
      <AppShell headerLeft={backButton}>
        <div className="max-w-xl mx-auto px-6 py-20 text-center">
          <h1 className="font-display font-bold text-2xl text-foreground mb-2">
            Generation not found
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            This generation request doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate("/home")}>Back to dashboard</Button>
        </div>
      </AppShell>
    );
  }

  const promo = (job.promo_details ?? {}) as any;
  const hasPromo = job.offer_type || promo.discountValue || promo.promoCode || promo.startDate;

  return (
    <AppShell headerLeft={backButton}>
      <div className="max-w-[1100px] mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(job.created_at)}
            <span className="mx-1">·</span>
            <span className="capitalize">{job.status}</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-foreground tracking-tight">
            {titleCase(job.goal)} generation
          </h1>
          {job.error_message && (
            <p className="mt-2 text-sm text-destructive">{job.error_message}</p>
          )}
        </div>

        {/* Inputs panel */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-border/60 bg-card p-6 mb-10"
        >
          <h2 className="font-display font-semibold text-sm text-foreground mb-5 flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" /> Inputs used for this generation
          </h2>

          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <Field icon={<Target className="w-3.5 h-3.5" />} label="Goal" value={titleCase(job.goal)} />
            <Field icon={<Layers className="w-3.5 h-3.5" />} label="Scope" value={titleCase(job.promo_scope)} />
            <Field
              icon={<Layers className="w-3.5 h-3.5" />}
              label="Aspect ratios"
              value={
                job.aspect_ratios && job.aspect_ratios.length > 0
                  ? job.aspect_ratios.join(", ")
                  : "—"
              }
            />
            <Field
              icon={<Tag className="w-3.5 h-3.5" />}
              label="ICP"
              value={icpName ?? "—"}
              hint={icpDescription ?? undefined}
            />
          </dl>

          {/* Product */}
          {(job.product_url || job.product_image_url) && (
            <>
              <Divider />
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Product
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {job.product_image_url && (
                  <img
                    src={job.product_image_url}
                    alt="Product"
                    className="w-32 h-32 object-cover rounded-xl border border-border/60"
                  />
                )}
                <div className="space-y-2 text-sm">
                  {job.product_input_method && (
                    <div className="text-muted-foreground text-xs">
                      Input method:{" "}
                      <span className="text-foreground capitalize">
                        {job.product_input_method}
                      </span>
                    </div>
                  )}
                  {job.product_url && (
                    <a
                      href={job.product_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-primary hover:underline break-all"
                    >
                      <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                      {job.product_url}
                    </a>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Promo / offer */}
          {hasPromo && (
            <>
              <Divider />
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Offer details
              </h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <Field label="Offer type" value={titleCase(job.offer_type)} />
                {promo.discountValue && (
                  <Field label="Discount value" value={String(promo.discountValue)} />
                )}
                {promo.buyQty && promo.getQty && (
                  <Field label="BOGO" value={`Buy ${promo.buyQty}, get ${promo.getQty}`} />
                )}
                {promo.bogoDiscount && (
                  <Field label="BOGO discount" value={String(promo.bogoDiscount)} />
                )}
                {promo.trialPrice && (
                  <Field label="Trial price" value={String(promo.trialPrice)} />
                )}
                {promo.freebieDescription && (
                  <Field label="Freebie" value={String(promo.freebieDescription)} />
                )}
                {promo.customOfferHeadline && (
                  <Field label="Custom headline" value={String(promo.customOfferHeadline)} />
                )}
                {promo.promoCode && (
                  <Field label="Promo code" value={String(promo.promoCode)} />
                )}
                {promo.startDate && (
                  <Field label="Start date" value={String(promo.startDate)} />
                )}
                {promo.endDate && <Field label="End date" value={String(promo.endDate)} />}
              </dl>
              {promo.additionalNotes && (
                <div className="mt-4">
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    Additional notes
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {promo.additionalNotes}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Disclaimers */}
          {disclaimers.length > 0 && (
            <>
              <Divider />
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Disclaimers
              </h3>
              <ul className="space-y-3">
                {disclaimers.map((d) => (
                  <li
                    key={d.id}
                    className="rounded-xl border border-border/60 bg-secondary/40 p-3"
                  >
                    <div className="text-sm font-medium text-foreground">{d.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{d.text}</div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </motion.section>

        {/* Creatives */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg text-foreground flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
              Generated creatives
              <span className="text-xs font-medium text-muted-foreground ml-1">
                ({creatives.length})
              </span>
            </h2>
          </div>

          {creatives.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-secondary/30 px-4 py-12 text-center text-sm text-muted-foreground">
              {job.status === "complete"
                ? "No creatives were produced for this generation."
                : (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creatives haven't been produced yet.
                  </span>
                )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {creatives.map((c, i) => (
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
      </div>
    </AppShell>
  );
};

const Divider = () => <div className="my-6 h-px bg-border/60" />;

const Field = ({
  icon,
  label,
  value,
  hint,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) => (
  <div>
    <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
      {icon}
      {label}
    </dt>
    <dd className="text-sm font-medium text-foreground">{value}</dd>
    {hint && <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{hint}</p>}
  </div>
);

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

export default GenerationDetail;
