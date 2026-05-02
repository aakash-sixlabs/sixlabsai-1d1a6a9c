import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, History, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/prod/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { isDevSession } from "@/lib/devMode";

interface JobRow {
  id: string;
  created_at: string;
  status: string;
  goal: string | null;
  promo_scope: string | null;
  aspect_ratios: string[] | null;
  creative_count: number;
}

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const titleCase = (s: string | null) =>
  s ? s.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—";

const StatusBadge = ({ status }: { status: string }) => {
  const isDone = status === "completed" || status === "complete";
  const isFailed = status === "error" || status === "failed";
  const tone = isDone
    ? "bg-accent/15 text-accent"
    : isFailed
    ? "bg-destructive/10 text-destructive"
    : "bg-primary/10 text-primary";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${tone}`}
    >
      {isDone ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : isFailed ? (
        <XCircle className="w-3 h-3" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin" />
      )}
      {isDone ? "Completed" : status}
    </span>
  );
};

export const GenerationsTable = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<JobRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      if (isDevSession()) {
        if (!cancelled) {
          setRows([]);
          setLoading(false);
        }
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) {
          setRows([]);
          setLoading(false);
        }
        return;
      }

      const [{ data: jobs }, { data: creatives }] = await Promise.all([
        supabase
          .from("generation_jobs")
          .select("id, created_at, status, goal, promo_scope, aspect_ratios")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("generated_creatives")
          .select("job_id")
          .eq("user_id", user.id),
      ]);

      const counts = new Map<string, number>();
      (creatives ?? []).forEach((c: any) => {
        counts.set(c.job_id, (counts.get(c.job_id) ?? 0) + 1);
      });

      const built: JobRow[] = (jobs ?? []).map((j: any) => ({
        id: j.id,
        created_at: j.created_at,
        status: j.status,
        goal: j.goal,
        promo_scope: j.promo_scope,
        aspect_ratios: j.aspect_ratios,
        creative_count: counts.get(j.id) ?? 0,
      }));

      if (!cancelled) {
        setRows(built);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="px-8 py-10 max-w-[1200px] mx-auto">
        <h2 className="font-display font-bold text-xl text-foreground mb-6">
          My Past Generations
        </h2>
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="px-8 py-20 max-w-[1200px] mx-auto text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-secondary/60 mb-4">
          <History className="w-5 h-5 text-muted-foreground" />
        </div>
        <h2 className="font-display font-bold text-xl text-foreground mb-2">
          My Past Generations
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          You haven't started any generations yet.
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
        <h2 className="font-display font-bold text-xl text-foreground tracking-tight">
          My Past Generations
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          A log of every generation request you've started. Click a row to see
          the inputs and the creatives it produced.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-border/60 bg-card overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Date</TableHead>
              <TableHead>Goal</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead>Aspect ratios</TableHead>
              <TableHead className="text-right">Creatives</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow
                key={r.id}
                onClick={() => navigate(`/generations/${r.id}`)}
                className="cursor-pointer"
              >
                <TableCell className="text-xs text-muted-foreground tabular-nums">
                  {formatDate(r.created_at)}
                </TableCell>
                <TableCell className="text-sm font-medium text-foreground">
                  {titleCase(r.goal)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {titleCase(r.promo_scope)}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {r.aspect_ratios && r.aspect_ratios.length > 0
                    ? r.aspect_ratios.join(", ")
                    : "—"}
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums">
                  {r.creative_count}
                </TableCell>
                <TableCell>
                  <StatusBadge status={r.status} />
                </TableCell>
                <TableCell>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
};
