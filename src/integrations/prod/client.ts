// Prod Supabase client — points at Mubeen's production project.
// Anon (publishable) key is safe to inline in client code.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const PROD_SUPABASE_URL = "https://jkzbuypbhqbssmqjpdtj.supabase.co";
const PROD_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpremJ1eXBiaHFic3NtcWpwZHRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NzI0MjUsImV4cCI6MjA4OTI0ODQyNX0.u0Kk3br2iq71ESnN_ipmwe2_KqpvsBlUqSlvbQMTSA4";

export const supabase = createClient<Database>(
  PROD_SUPABASE_URL,
  PROD_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);

export const SUPABASE_URL = PROD_SUPABASE_URL;
export const SUPABASE_PUBLISHABLE_KEY = PROD_SUPABASE_ANON_KEY;
