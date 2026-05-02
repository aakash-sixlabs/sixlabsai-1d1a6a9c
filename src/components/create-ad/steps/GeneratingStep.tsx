import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/prod/client";
import { useWizard } from "@/context/WizardContext";
import { isDevSession } from "@/lib/devMode";
import type { CreateAdState } from "../CreateAdFlow";

interface GeneratingStepProps {
  state: CreateAdState;
}

/**
 * Fire-and-forget kickoff for a creative generation request.
 * Triggers the edge function and immediately navigates the user back to /home.
 * The global GenerationNotificationsProvider listens for the job's status
 * change and will toast + ping the bell when it's done.
 */
export const GeneratingStep = ({ state }: GeneratingStepProps) => {
  const navigate = useNavigate();
  const { state: wizardState } = useWizard();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      // Dev mode — keep local stub behavior, but still don't block the user.
      if (isDevSession()) {
        const ratios = state.aspectRatios?.length ? state.aspectRatios : ["1:1"];
        const dimsFor = (r: string) => {
          switch (r) {
            case "9:16": return { w: 720, h: 1280 };
            case "16:9": return { w: 1280, h: 720 };
            case "4:5": return { w: 1080, h: 1350 };
            default: return { w: 1080, h: 1080 };
          }
        };
        const creatives: any[] = [];
        let idx = 0;
        for (const ratio of ratios) {
          const { w, h } = dimsFor(ratio);
          for (let v = 0; v < 3; v++) {
            const seed = `dev-${Date.now()}-${idx}`;
            creatives.push({
              id: `dev_${idx}`,
              variant_index: idx,
              aspect_ratio: ratio,
              image_url: `https://picsum.photos/seed/${seed}/${w}/${h}`,
              thumbnail_url: `https://picsum.photos/seed/${seed}/${Math.round(w / 4)}/${Math.round(h / 4)}`,
              headline: `Headline variant ${idx + 1}`,
              primary_text: `Generated copy for ${state.goal ?? "your ad"} (${ratio}).`,
              description: "Dev mode stub.",
            });
            idx++;
          }
        }
        const devJobId = `dev_${Date.now()}`;
        try {
          sessionStorage.setItem(`dev_creatives_${devJobId}`, JSON.stringify(creatives));
        } catch {}
        toast.success("Generation complete (dev)", {
          description: "Tap to view your new creatives.",
          action: { label: "View", onClick: () => navigate(`/output?jobId=${devJobId}`) },
        });
        return;
      }

      // Real flow — fire and forget. We don't await the response; the user
      // is sent back to /home and notified when the job finishes.
      supabase.functions
        .invoke("generate-creatives", {
          body: { ...state, adAccountId: wizardState.selectedAccount ?? null },
        })
        .then(({ error }) => {
          if (error) {
            toast.error("Couldn't start generation", {
              description: error.message ?? "Please try again.",
            });
          }
        });

      toast.success("Generation started", {
        description: "We'll notify you when your creatives are ready.",
      });
    })();

    // Hand control back to the user immediately.
    navigate("/home");
  }, [state, wizardState.selectedAccount, navigate]);

  return null;
};
