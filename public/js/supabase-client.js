import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

let clientPromise = null;

export function getSupabase() {
  if (!clientPromise) {
    clientPromise = fetch("/api/config")
      .then((r) => r.json())
      .then(({ supabaseUrl, supabaseAnonKey }) => {
        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error("Supabase is not configured yet (set SUPABASE_URL / SUPABASE_ANON_KEY).");
        }
        return createClient(supabaseUrl, supabaseAnonKey);
      });
  }
  return clientPromise;
}
