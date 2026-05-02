import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getProdSupabaseUrl } from "../_shared/supabase-url.ts";

Deno.serve(async (_req) => {
  const admin = createClient(
    getProdSupabaseUrl(),
    Deno.env.get("PROD_SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    const { data: stuckJobs, error } = await admin
      .from("generation_jobs")
      .select("id")
      .eq("status", "generating")
      .lt("updated_at", tenMinutesAgo);

    if (error) {
      console.error("Watchdog query error:", error);
      return new Response(
        JSON.stringify({ checked: false, error: error.message }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    if (!stuckJobs?.length) {
      return new Response(
        JSON.stringify({ checked: true, stuck: 0 }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    const stuckIds = stuckJobs.map((j) => j.id);

    await admin
      .from("generation_jobs")
      .update({
        status: "failed",
        error_message: "Generation timed out. Please try again.",
        updated_at: new Date().toISOString(),
      })
      .in("id", stuckIds);

    console.log(`Watchdog: marked ${stuckJobs.length} jobs failed`);

    return new Response(
      JSON.stringify({ checked: true, stuck: stuckJobs.length, failed_ids: stuckIds }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Watchdog error:", msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }
});
