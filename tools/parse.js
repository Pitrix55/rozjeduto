// Turns free-text system requirements ("Processor: Intel Core i5-4460 / AMD FX-6300 …")
// into parts from data/parts.js. Used by tools/crawl.js (GitHub Action and tools/builder.html).
//
// ReqParser.parse(text) → { cpu: [names] | null, gpu: [names] | null, ram: GB | null }
globalThis.ReqParser = (() => {
  "use strict";

  // lower-case, drop brand words and punctuation, keep word boundaries as single spaces
  const clean = s => " " + String(s || "").toLowerCase()
    .replace(/®|™|\(r\)|\(tm\)/g, "")
    .replace(/\b(intel|amd|ati|nvidia|geforce|radeon|core|graphics|series|processor|cpu|gpu|video card|or better|or equivalent|equivalent)\b/g, " ")
    .replace(/[^a-z0-9.]+/g, " ")
    .replace(/\s+/g, " ") + " ";

  // Build one regex per part: tokens may be written together or apart ("rtx3060" / "rtx 3060").
  function index(parts) {
    return parts.filter(p => !p.hidden).map(p => {
      const base = clean(p.name.replace(/\s*\(.*\)\s*/, " ")).trim();      // "Radeon 780M (integrovaná)" → "780m"
      // split letter/digit runs so "i5-4460" → ["i5","4460"], "rx580" → ["rx","580"]
      const tokens = base.split(" ").filter(Boolean);
      const pattern = tokens.map(t => t.replace(/\./g, "\\.")).join("\\s?");
      return { part: p, len: base.length, re: new RegExp("(^|[^a-z0-9])(" + pattern + ")(?=[^a-z0-9]|$)") };
    }).sort((a, b) => b.len - a.len);                                         // longest (most specific) first
  }
  // short names from PART_ALIASES ("GTX 1060" → "GTX 1060 6GB") are matched too
  const withAliases = (parts, kind) => {
    const byName = new Map(parts.map(p => [p.name, p]));
    const extra = Object.entries((globalThis.PART_ALIASES || {})[kind] || {})
      .map(([alias, name]) => byName.get(name) && { ...byName.get(name), name: alias, real: byName.get(name) }).filter(Boolean);
    return parts.concat(extra);
  };
  let IDX = null;
  const idx = () => IDX || (IDX = {
    cpu: index(withAliases(globalThis.CPUS, "cpu")).map(it => ({ ...it, part: it.part.real || it.part })),
    gpu: index(withAliases(globalThis.GPUS, "gpu")).map(it => ({ ...it, part: it.part.real || it.part }))
  });
  const INTEGRATED = /integrovan|steam deck|rog ally|legion go|msi claw|adreno|intel hd|intel uhd|iris/i;

  function match(kind, text) {
    let t = clean(text);
    const found = [];
    for (const it of idx()[kind]) {
      const m = t.match(it.re);
      if (!m) continue;
      found.push(it.part);
      // blank out the matched text so a shorter name can't match inside it ("RTX 3060" inside "RTX 3060 Ti")
      const start = m.index + m[1].length;
      t = t.slice(0, start) + " ".repeat(m[2].length) + t.slice(start + m[2].length);
    }
    if (kind === "gpu" && found.some(p => !INTEGRATED.test(p.name))) return found.filter(p => !INTEGRATED.test(p.name));
    return found;
  }

  // ---- generic requirements when no model is named ----
  const ghz = s => { const m = String(s).match(/(\d+(?:[.,]\d+)?)\s*ghz/i); return m ? parseFloat(m[1].replace(",", ".")) : null; };
  function genericCpu(s) {
    // a family without a model number: "Intel Core i7", "AMD Ryzen 5"
    const fam = String(s).match(/(?:core\W*)?\bi([3579])\b(?![\W_]*\d{3,})/i);   // "Intel Core i7", "Intel cpu i3"
    if (fam) return "obecný Core i" + fam[1];
    if (/pentium\s*(4|iv)\b|single[\s-]?core|athlon\s*64(?!\s*x2)/i.test(s)) return "obecný jednojádrový procesor (Pentium 4)";
    const ry = String(s).match(/ryzen\W*([3579])\b(?![\W_]*\d{3,})/i);
    if (ry) return "obecný Ryzen " + ry[1];
    const quad = /quad|4[\s-]?core|four[\s-]?core|4 jádr|6[\s-]?core|8[\s-]?core/i.test(s), dual = /dual|2[\s-]?core|two[\s-]?core/i.test(s);
    const f = ghz(s);
    if (quad) return f == null || f <= 2.7 ? "obecný čtyřjádrový procesor 2,6 GHz" : f <= 3.1 ? "obecný čtyřjádrový procesor 3 GHz" : "obecný čtyřjádrový procesor 3,2 GHz";
    if (dual || f != null) return f == null || f <= 2.0 ? "obecný procesor: 2 GHz" : f <= 2.5 ? "obecný dvoujádrový procesor 2,4 GHz" : f <= 2.9 ? "obecný dvoujádrový procesor 2,8 GHz" : "obecný dvoujádrový procesor 3 GHz";
    if (/sse2|x64|x86|64[\s-]?bit/i.test(s)) return "obecný procesor: x64 s SSE2";
    return null;
  }
  function genericGpu(s) {
    const gb = (String(s).match(/(\d+)\s*gb/i) || [])[1];
    if (/direct\s*x\s*1[12]|dx\s*1[12]|shader model 5|vulkan|opengl 4/i.test(s)) return gb && +gb >= 1 ? "obecná grafika: 1 GB, DirectX 11" : "obecná grafika: DirectX 11";
    if (/direct\s*x\s*10|dx\s*10|shader model 4|opengl 3/i.test(s)) return gb && +gb >= 2 ? "obecná grafika: 2 GB, DirectX 10" : "obecná grafika: 1 GB, DirectX 10";
    if (/\d+\s*mb|shader model [123]|direct\s*x\s*[789]|dx\s*[789]|opengl [12]/i.test(s)) return "obecná grafika: 256 MB, Shader Model 3";
    return null;
  }

  // ---- split the requirement text into labelled fields ----
  const LABELS = ["OS", "Processor", "CPU", "Memory", "RAM", "Graphics", "Video Card", "Video", "GPU", "DirectX", "Network", "Storage",
    "Hard Drive", "Hard Disk Space", "Hard Disk", "Disk Space", "Sound Card", "Sound", "Additional Notes", "VR Support", "Peripherals", "Supported Graphics Cards"];
  const LABEL_RE = new RegExp("(" + LABELS.map(l => l.replace(/ /g, "\\s")).join("|") + ")\\s*\\*?\\s*:", "g");
  function fields(text) {
    const s = String(text || "").replace(/^\s*(minimum|recommended)\s*:?/i, "");
    const hits = [...s.matchAll(LABEL_RE)];
    const out = {};
    hits.forEach((h, i) => {
      const key = h[1].replace(/\s+/g, " ").toLowerCase();
      const end = i + 1 < hits.length ? hits[i + 1].index : s.length;
      out[key] = (out[key] ? out[key] + " " : "") + s.slice(h.index + h[0].length, end).trim();
    });
    return out;
  }

  function parse(text) {
    const f = fields(text);
    const cpuText = f.processor || f.cpu || "";
    const gpuText = f.graphics || f["video card"] || f.video || f.gpu || f["supported graphics cards"] || "";
    const memText = f.memory || f.ram || "";

    let cpu = cpuText ? match("cpu", cpuText).map(p => p.name) : [];
    if (!cpu.length && cpuText) { const g = genericCpu(cpuText); if (g) cpu = [g]; }
    let gpu = gpuText ? match("gpu", gpuText).map(p => p.name) : [];
    if (!gpu.length && gpuText) { const g = genericGpu(gpuText); if (g) gpu = [g]; }

    let ram = null;
    const m = memText.match(/(\d+(?:[.,]\d+)?)\s*(gb|mb)/i);
    if (m) { ram = parseFloat(m[1].replace(",", ".")); if (/mb/i.test(m[2])) ram = Math.round(ram / 1024 * 10) / 10; }

    return { cpu: cpu.length ? cpu : null, gpu: gpu.length ? gpu : null, ram, raw: { cpu: cpuText, gpu: gpuText, ram: memText } };
  }

  return { parse, fields, match };
})();
