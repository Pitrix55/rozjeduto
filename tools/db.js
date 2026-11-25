// Minimal Supabase (PostgREST) client for the GitHub updater – no npm packages needed.
// Uses the project's SECRET key (GitHub secret SUPABASE_SECRET_KEY), which can read/write parts and games.
// Never use this key in the website itself.
globalThis.Db = (() => {
  "use strict";

  function client(url, key) {
    if (!url || !key) throw new Error("Chybí SUPABASE_URL nebo SUPABASE_SECRET_KEY.");
    const base = url.replace(/\/+$/, "") + "/rest/v1/";
    const headers = { apikey: key, "Content-Type": "application/json" };
    if (key.startsWith("eyJ")) headers.Authorization = "Bearer " + key;   // older "service_role" JWT keys

    async function req(path, opts = {}) {
      const r = await fetch(base + path, { ...opts, headers: { ...headers, ...(opts.headers || {}) } });
      const text = await r.text();
      if (!r.ok) throw new Error(`Supabase ${r.status}: ${text.slice(0, 300)}`);
      return text ? JSON.parse(text) : null;
    }

    // all rows of a table (Supabase returns at most 1000 rows per request, so read in pages)
    async function all(table, select = "*", order = "id") {
      const out = [], step = 1000;
      for (let from = 0; ; from += step) {
        const rows = await req(`${table}?select=${encodeURIComponent(select)}&order=${order}`,
          { headers: { Range: `${from}-${from + step - 1}`, "Range-Unit": "items" } });
        out.push(...rows);
        if (rows.length < step) break;
      }
      return out;
    }

    // insert or update rows by a unique column, in batches
    async function upsert(table, rows, onConflict) {
      for (let i = 0; i < rows.length; i += 500) {
        await req(`${table}?on_conflict=${onConflict}`, {
          method: "POST",
          headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
          body: JSON.stringify(rows.slice(i, i + 500))
        });
      }
    }

    return { all, upsert };
  }

  return { client };
})();
