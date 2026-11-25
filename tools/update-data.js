// The GitHub updater (see .github/workflows/). Needs Node 18+.
//
//   MODE=full    (weekly, "Aktualizace dat z RAWG"):
//                parts from Supabase → download games from RAWG → save them into Supabase
//                (games you edited by hand – manual = true – are left alone) → export files for the site
//   MODE=export  ("Publikovat změny z databáze"): only export Supabase → data/parts.js + data/games.js
//
// Secrets (GitHub → Settings → Secrets and variables → Actions):
//   RAWG_API_KEY, SUPABASE_URL, SUPABASE_SECRET_KEY
// Without the Supabase secrets it falls back to the old way: RAWG → data/games.js directly.
"use strict";
const fs = require("fs");
const path = require("path");

require("../data/parts.js");   // → globalThis.CPUS, GPUS, PART_ALIASES (the file version; used to fill an empty database)
require("./parse.js");         // → globalThis.ReqParser
require("./crawl.js");         // → globalThis.RawgCrawler
require("./db.js");            // → globalThis.Db

const DATA = path.join(__dirname, "..", "data");
const MODE = (process.env.MODE || "full").toLowerCase();
const MIN_GAMES = 50;          // never publish fewer games than this – protects the site from a bad run

// ---------- parts: database rows ↔ the shape the site uses ----------
function partsToRows() {
  const aliases = { cpu: {}, gpu: {} };
  for (const kind of ["cpu", "gpu"]) {
    for (const [alias, name] of Object.entries((globalThis.PART_ALIASES || {})[kind] || {})) (aliases[kind][name] = aliases[kind][name] || []).push(alias);
  }
  const rows = (kind, list) => list.map(p => ({ kind, name: p.name, score: p.score, hidden: !!p.hidden, aliases: aliases[kind][p.name] || [] }));
  return [...rows("cpu", globalThis.CPUS), ...rows("gpu", globalThis.GPUS)];
}
function applyParts(rows) {
  const pick = kind => rows.filter(r => r.kind === kind).map(r => ({ name: r.name, score: r.score, hidden: !!r.hidden }));
  const aliases = { cpu: {}, gpu: {} };
  for (const r of rows) for (const a of r.aliases || []) aliases[r.kind][a] = r.name;
  globalThis.CPUS = pick("cpu");
  globalThis.GPUS = pick("gpu");
  globalThis.PART_ALIASES = aliases;
}
function partsFile() {
  return "// Vygenerováno z tabulky \"parts\" v Supabase – tools/update-data.js.\n" +
    "// Komponenty upravuj v Supabase (Table Editor → parts), ne tady – soubor se při další aktualizaci přepíše.\n" +
    "// Skóre: GeForce GTX 1060 6GB = 100 (grafiky), Intel Core i5-8400 = 100 (procesory).\n" +
    "globalThis.GPUS = " + JSON.stringify(globalThis.GPUS) + ";\n" +
    "globalThis.CPUS = " + JSON.stringify(globalThis.CPUS) + ";\n" +
    "globalThis.PART_ALIASES = " + JSON.stringify(globalThis.PART_ALIASES) + ";\n";
}

// ---------- games: crawler objects ↔ database rows ----------
const gameToRow = g => ({
  id: g.id, slug: g.slug || null, name: g.name, pop: g.pop || null,
  released: g.released || null, year: g.year || null, tba: !!g.tba, genres: g.genres || [], img: g.img || null,
  upcoming: !!g.upcoming, min: g.min, rec: g.rec || null, req_text: g.reqText || null, no_req: !!g.noReq
});
function gameFromRow(r, today) {
  const g = {
    id: r.id, slug: r.slug, name: r.name, pop: r.pop, released: r.released, year: r.year, tba: r.tba,
    genres: r.genres || [], img: r.img,
    // "upcoming" follows the date, so last month's upcoming games move to the main list by themselves
    upcoming: r.released ? r.released > today : !!(r.tba || r.upcoming),
    min: r.min || { cpu: null, gpu: null, ram: null }, rec: r.rec || null
  };
  if (r.req_text) g.reqText = r.req_text;
  if (r.no_req) g.noReq = true;
  return g;
}

function write(file, text) { fs.writeFileSync(path.join(DATA, file), text); }
const rawgRun = () => {
  const key = process.env.RAWG_API_KEY;
  if (!key) throw new Error("Chybí RAWG_API_KEY (GitHub → Settings → Secrets and variables → Actions).");
  return RawgCrawler.run({
    key, popular: process.env.POPULAR, upcoming: process.env.UPCOMING, months: process.env.MONTHS,   // defaults: 3500 / 100 / 1 month
    log: msg => console.log(msg)
  });
};

(async () => {
  const url = process.env.SUPABASE_URL, secret = process.env.SUPABASE_SECRET_KEY;

  // ----- without a database: the old way (RAWG → file) -----
  if (!url || !secret) {
    if (MODE === "export") throw new Error("Pro publikování z databáze nastav na GitHubu secrets SUPABASE_URL a SUPABASE_SECRET_KEY.");
    console.log("Supabase není nastavený – stahuji z RAWG rovnou do data/games.js.");
    const { games } = await rawgRun();
    if (games.length < MIN_GAMES) throw new Error(`Podezřele málo her (${games.length}) – soubor nepřepisuji.`);
    write("games.js", RawgCrawler.toFile(games));
    console.log(`Uloženo ${games.length} her.`);
    return;
  }

  const db = Db.client(url, secret);

  // ----- 1. parts (fill the empty table from data/parts.js the first time) -----
  let partRows = await db.all("parts", "kind,name,score,hidden,aliases");
  if (!partRows.length) {
    const seed = partsToRows();
    console.log(`Tabulka parts je prázdná – nahrávám ${seed.length} komponent z data/parts.js.`);
    await db.upsert("parts", seed, "kind,name");
    partRows = await db.all("parts", "kind,name,score,hidden,aliases");
  }
  applyParts(partRows);
  console.log(`Komponenty z databáze: ${globalThis.CPUS.length} procesorů, ${globalThis.GPUS.length} grafik.`);

  // ----- 2. RAWG → database (skip games edited by hand) -----
  if (MODE === "full") {
    const { games } = await rawgRun();
    if (games.length < MIN_GAMES) throw new Error(`Z RAWG přišlo podezřele málo her (${games.length}) – databázi neměním.`);
    const manual = new Set((await db.all("games", "id,manual")).filter(r => r.manual).map(r => r.id));
    const rows = games.filter(g => !manual.has(g.id)).map(gameToRow);
    await db.upsert("games", rows, "id");
    console.log(`Do databáze uloženo ${rows.length} her (${manual.size} ručně upravených jsem nechal být).`);
  }

  // ----- 3. database → files for the site -----
  const today = new Date().toISOString().slice(0, 10);
  const games = (await db.all("games")).map(r => gameFromRow(r, today)).sort((a, b) => a.name.localeCompare(b.name));
  if (games.length < MIN_GAMES) throw new Error(`V databázi je podezřele málo her (${games.length}) – soubory pro web nepřepisuji.`);
  write("parts.js", partsFile());
  write("games.js", RawgCrawler.toFile(games));
  console.log(`Soubory pro web: ${games.length} her, ${globalThis.CPUS.length + globalThis.GPUS.length} komponent.`);
})().catch(e => { console.error("✖ " + (e.message || e)); process.exit(1); });
