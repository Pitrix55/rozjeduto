// Supabase details for signing in and saving builds (Supabase → Project Settings → API).
// Both values are public and may be visible in the browser; the data is protected by the rules in supabase.sql.
// Until these are filled in, builds are saved only in the visitor's browser and sign-in is hidden.
globalThis.CONFIG = {
  SUPABASE_URL: "https://bqlpanxztcqjkowcwwxs.supabase.co",
  SUPABASE_KEY: "sb_publishable_tMeN_Mf86TAAz5IOcjegLQ_gR6xHKqB"    // public "Publishable key" – safe in the browser
};
