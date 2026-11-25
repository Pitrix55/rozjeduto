// Downloads PC games from RAWG, reads their system requirements with ReqParser and builds
// the contents of data/games.js. Shared by:
//   - tools/update-data.js  (run by GitHub every week – see .github/workflows/update-data.yml)
//   - tools/builder.html    (manual fallback in a browser)
// Needs globalThis.CPUS/GPUS (data/parts.js) and globalThis.ReqParser (tools/parse.js) loaded first.
globalThis.RawgCrawler = (() => {
  "use strict";
  const API = "https://api.rawg.io/api";
  const PC = 4;                                   // RAWG platform id for PC
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // pull the PC requirements out of a RAWG game object
  function requirements(g) {
    const pc = (g.platforms || []).find(p => p.platform && p.platform.id === PC);
    const req = pc && (pc.requirements_en || pc.requirements);
    if (!req) return null;
    let min = req.minimum || "", rec = req.recommended || "";
    if (!rec && /recommended\s*:/i.test(min)) { const i = min.search(/recommended\s*:/i); rec = min.slice(i); min = min.slice(0, i); }
    return min || rec ? { min, rec } : null;
  }

  /**
   * opts: { key, popular = 3500, upcoming = 100, months = 1, log(msg), progress(fraction, label), stopped() → bool, onStats(stats) }
   * returns { games: [...], stats, samples }
   */
  async function run(opts) {
    const { key } = opts;
    const log = opts.log || (() => {}), progress = opts.progress || (() => {}), stopped = opts.stopped || (() => false), onStats = opts.onStats || (() => {});
    if (!key) throw new Error("Chybí RAWG klíč.");
    const games = new Map(), samples = [];
    const stats = { seen: 0, req: 0, ok: 0, up: 0, requests: 0 };
    let detailMode = false;

    async function get(url) {
      for (let attempt = 0; attempt < 4; attempt++) {
        stats.requests++;
        const r = await fetch(url);
        if (r.status === 401 || r.status === 403) throw new Error("RAWG klíč nefunguje (chyba " + r.status + "). Zkontroluj ho.");
        if (r.status === 429 || r.status >= 500) { log(`  RAWG odpověděl ${r.status}, zkusím to znovu…`); await sleep(3000 * (attempt + 1)); continue; }
        if (r.status === 404) return null;
        if (!r.ok) throw new Error("RAWG chyba " + r.status);
        return r.json();
      }
      throw new Error("RAWG opakovaně neodpovídá, zkus to později.");
    }

    // Every game is kept, so people can find it and read at least something:
    //   recognised CPU + GPU → full verdict; only one of them → partial verdict;
    //   nothing recognised → original text shown; no requirements at all → "requirements unknown".
    const clip = s => { const t = String(s || "").replace(/\s+/g, " ").trim(); return t.length > 500 ? t.slice(0, 497) + "…" : t; };
    function handle(g, upcoming) {
      stats.seen++;
      const req = requirements(g);
      const min = req ? ReqParser.parse(req.min) : null, rec = req && req.rec ? ReqParser.parse(req.rec) : null;
      const full = !!(min && min.cpu && min.gpu);
      if (req) { stats.req++; if (samples.length < 400) samples.push({ name: g.name, min, ok: full }); }
      // picture: main image, else the second one, else a screenshot (the site draws a placeholder if none)
      const img = g.background_image || g.background_image_additional || ((g.short_screenshots || [])[0] || {}).image || null;
      const prev = games.get(g.id);
      const isUp = upcoming || (prev && prev.upcoming) || false;
      if (!prev) {
        if (full) stats.ok++; else if (min && (min.cpu || min.gpu)) stats.partial = (stats.partial || 0) + 1; else stats.unknown = (stats.unknown || 0) + 1;
        if (isUp) stats.up++;
      } else if (isUp && !prev.upcoming) stats.up++;
      const part = r => r && (r.cpu || r.gpu || r.ram) ? { cpu: r.cpu, gpu: r.gpu, ram: r.ram } : null;
      const game = {
        id: g.id, slug: g.slug, name: g.name,
        pop: prev ? prev.pop : stats.seen,          // popularity rank on RAWG (1 = most popular) – the site's default sort
        released: g.released || null, year: g.released ? +g.released.slice(0, 4) : null, tba: !!g.tba,
        genres: (g.genres || []).slice(0, 2).map(x => x.name),
        img,
        upcoming: isUp,
        min: part(min) || { cpu: null, gpu: null, ram: null },
        rec: part(rec)
      };
      if (!req) game.noReq = true;
      // original text, only where something wasn't recognised – the site shows it so people can read it themselves
      else if (!full || (rec && !(rec.cpu && rec.gpu))) game.reqText = { min: clip(req.min), rec: clip(req.rec) };
      games.set(g.id, game);
    }

    // Goes through RAWG's list page by page until `maxGames` games have been handled.
    async function crawl(label, baseUrl, maxGames, upcoming) {
      log(`▶ ${label} (nejvýš ${maxGames})`);
      let done = 0;
      const pages = Math.ceil(maxGames / 40);
      for (let page = 1; page <= pages && done < maxGames && !stopped(); page++) {
        const data = await get(`${baseUrl}&page=${page}&key=${encodeURIComponent(key)}`);
        if (!data || !data.results) break;
        // RAWG's list leaves out requirements – then ask for each game's detail (1 request per game)
        if (!detailMode && page === 1 && !data.results.some(g => (g.platforms || []).some(p => "requirements_en" in p || "requirements" in p))) {
          detailMode = true;
          log("  Seznam her neobsahuje požadavky – načítám je po jedné hře.");
        }
        for (const g of data.results) {
          if (stopped() || done >= maxGames) break;
          done++;
          let game = g;
          if (detailMode) {
            const d = await get(`${API}/games/${g.id}?key=${encodeURIComponent(key)}`);
            if (d) game = { ...g, platforms: d.platforms || g.platforms, background_image: g.background_image || d.background_image, background_image_additional: d.background_image_additional };
            await sleep(120);
          }
          handle(game, upcoming);
        }
        onStats(stats);
        progress(done / maxGames, `${label}: ${done} z ${maxGames}`);
        if (!data.next) break;
        await sleep(250);
      }
    }

    // Budget (RAWG free tier = 20 000 requests a month): 3 500 popular + 100 upcoming ≈ 3 700 requests
    // per weekly run → ≈ 18 500 even in a month with five Mondays.
    const clampInt = (v, def, max) => Math.max(0, Math.min(max, v == null || v === "" || isNaN(+v) ? def : Math.round(+v)));
    const popular = clampInt(opts.popular, 3500, 10000);
    const upcomingCount = clampInt(opts.upcoming, 100, 2000);
    const months = clampInt(opts.months, 1, 24);
    if (popular) await crawl("Populární PC hry", `${API}/games?platforms=${PC}&ordering=-added&page_size=40`, popular, false);
    if (upcomingCount && months && !stopped()) {
      const from = new Date(), to = new Date(); to.setMonth(to.getMonth() + months);
      const d = x => x.toISOString().slice(0, 10);
      // most anticipated first (-added); the site sorts them by date
      await crawl("Vycházející PC hry", `${API}/games?platforms=${PC}&dates=${d(from)},${d(to)}&ordering=-added&page_size=40`, upcomingCount, true);
    }
    log(`✔ Hotovo: ${games.size} her – ${stats.ok} plně rozpoznaných, ${stats.partial || 0} částečně, ${stats.unknown || 0} bez rozpoznaných požadavků; ${stats.up} vycházejících; ${stats.requests} dotazů na RAWG.`);
    return { games: [...games.values()].sort((a, b) => a.name.localeCompare(b.name)), stats, samples };
  }

  // text of data/games.js
  function toFile(games) {
    return "// Vygenerováno z dat RAWG (rawg.io) – tools/update-data.js nebo tools/builder.html.\n" +
      "// Neupravuj ručně – při další aktualizaci se soubor vytvoří znovu.\n" +
      `globalThis.GAMES_UPDATED = ${JSON.stringify(new Date().toISOString().slice(0, 10))};\n` +
      "globalThis.GAMES_SOURCE = \"rawg\";\n" +
      "globalThis.GAMES = " + JSON.stringify(games) + ";\n";
  }

  return { run, toFile };
})();
