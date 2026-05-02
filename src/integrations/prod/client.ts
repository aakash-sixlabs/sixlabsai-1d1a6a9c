// Prod Supabase client — frontend auth + DB queries hit Mubeen's prod project.
// Edge functions are still hosted on the Lovable Cloud project, so functions
// calls are routed there explicitly. The prod-issued JWT is forwarded and
// validated in-code by each edge function (verify_jwt = false on the platform).
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const PROD_SUPABASE_URL = "https://jkzbuypbhqbssmqjpdtj.supabase.co";
const PROD_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpremJ1eXBiaHFic3NtcWpwZHRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NzI0MjUsImV4cCI6MjA4OTI0ODQyNX0.u0Kk3br2iq71ESnN_ipmwe2_KqpvsBlUqSlvbQMTSA4";

// Edge functions live on the Lovable Cloud project (this is fixed by the
// platform). They authenticate the prod JWT manually using the prod admin
// client built from PROD_SUPABASE_* secrets.
const FUNCTIONS_URL =
  "https://bhcusyaonpevmwaruvlx.supabase.co/functions/v1";

export const supabase = createClient<Database>(
  PROD_SUPABASE_URL,
  PROD_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {},
  },
);

// Override the functions endpoint so invoke() hits Lovable Cloud, not prod.
// (The supabase-js client doesn't accept a custom functions URL via constructor
// options in v2, but we can set it on the FunctionsClient directly.)
// @ts-expect-error — internal but stable: rewrite the base URL used by invoke().
supabase.functions.url = FUNCTIONS_URL;

export const SUPABASE_URL = PROD_SUPABASE_URL;
export const SUPABASE_PUBLISHABLE_KEY = PROD_SUPABASE_ANON_KEY;
export const FUNCTIONS_BASE_URL = FUNCTIONS_URL;
