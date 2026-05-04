import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWizard } from "@/context/WizardContext";
import { isDevSession } from "@/lib/devMode";
import { getCurrentAccountId } from "@/lib/accountContext";
import type { CreateAdState } from "../CreateAdFlow";

interface GeneratingStepProps {
  state: CreateAdState;
}

const MOCK_DELAY_MS = 1 * 60 * 1000; // 1 minute

/**
 * Mock generation kickoff:
 *  - Inserts a `generation_jobs` row (status: pending)
 *  - Navigates user back to /home with a confirmation toast
 *  - After 3 minutes, marks the job `completed` so the realtime
 *    notification provider toasts + pings the bell.
 */
export const GeneratingStep = ({ state }: GeneratingStepProps) => {
  const navigate = useNavigate();
  const { state: wizardState } = useWizard();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      // Dev-mode sandbox: skip Supabase entirely.
      if (isDevSession()) {
        toast.success("Generation started (dev)", {
          description: "We'll notify you in ~3 minutes when it's ready.",
        });
        navigate("/home");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You need to be signed in to generate ads.");
        navigate("/home");
        return;
      }

      const accountId = await getCurrentAccountId();
      if (!accountId) {
        toast.error("Couldn't resolve your workspace.");
        navigate("/home");
        return;
      }

      const { data: job, error } = await supabase
        .from("generation_jobs")
        .insert({
          account_id: accountId,
          user_id: user.id,
          ad_account_id: wizardState.selectedAccount ?? null,
          status: "pending",
          trigger_type: "manual",
          goal: state.goal,
          promo_scope: state.promoScope,
          aspect_ratios: state.aspectRatios ?? [],
          product_input_method: state.productInputMethod,
          product_url: state.productUrl || null,
          product_image_url: state.productImage || null,
          icp_id: state.icpId,
          icp_snapshot: state.icpName
            ? { id: state.icpId, name: state.icpName, description: state.icpDescription }
            : null,
          promo_details: state.promoDetails as any,
          offer_type: state.promoDetails?.offerType ?? null,
          disclaimer_ids: state.promoDetails?.disclaimerIds ?? [],
          service_request_payload: {
            ...state,
            adAccountId: wizardState.selectedAccount ?? null,
            mocked: true,
          } as any,
        })
        .select("id")
        .single();

      if (error || !job) {
        toast.error("Couldn't start generation", {
          description: error?.message ?? "Please try again.",
        });
        navigate("/home");
        return;
      }

      toast.success("Generation started", {
        description: "We'll notify you when your creatives are ready.",
      });
      navigate("/home");

      // Mock background processing — pick matching creatives from the
      // shared mock_creative_library, insert them, then flip job to completed.
      setTimeout(async () => {
        try {
          const goal = state.goal;
          const offerName =
            (state.promoDetails as any)?.offerName ??
            state.promoDetails?.customOfferHeadline ??
            null;
          const icpName = (state.icpName ?? "").toLowerCase();

          let query = supabase.from("mock_creative_library").select("*");
          if (goal) query = query.eq("goal", goal);
          if (offerName) query = query.eq("offer_name", offerName);
          const { data: libRows } = await query;

          // Filter by ICP keyword (substring, case-insensitive) if any.
          const matched = (libRows ?? []).filter((r: any) => {
            if (!r.icp_keyword) return true;
            return icpName.includes(String(r.icp_keyword).toLowerCase());
          });

          if (matched.length > 0) {
            const rows = matched.map((r: any, idx: number) => ({
              account_id: accountId,
              user_id: user.id,
              job_id: job.id,
              variant_index: idx,
              image_url: r.image_url,
              thumbnail_url: r.thumbnail_url ?? r.image_url,
              aspect_ratio: r.aspect_ratio,
              headline: r.headline,
              primary_text: r.primary_text,
              status: "pending_review",
              metadata: { source: "mock_library", library_id: r.id },
            }));
            await supabase.from("generated_creatives").insert(rows);
          }
        } catch (e) {
          console.error("Mock creative seeding failed", e);
        }

        await supabase
          .from("generation_jobs")
          .update({ status: "completed" })
          .eq("id", job.id);
      }, MOCK_DELAY_MS);
    })();
  }, [state, wizardState.selectedAccount, navigate]);

  return null;
};
