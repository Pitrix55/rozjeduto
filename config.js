// Supabase details for signing in and saving builds (Supabase → Project Settings → API).
// Both values are public and may be visible in the browser; the data is protected by the rules in supabase.sql.
// Until these are filled in, builds are saved only in the visitor's browser and sign-in is hidden.
globalThis.CONFIG = {
  SUPABASE_URL: "FILL_IN_SUPABASE_URL",          // e.g. https://abcdefgh.supabase.co
  SUPABASE_KEY: "FILL_IN_SUPABASE_PUBLIC_KEY"    // "Publishable key" (sb_publishable_…) or the older "anon public" key
};
