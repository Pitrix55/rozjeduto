// Saved PC builds + sign-in.
// - Not signed in (or Supabase not set up in config.js): builds are kept in this browser (localStorage).
// - Signed in (magic link by email): builds are stored in Supabase (table "builds", see supabase.sql)
//   and available on every device. Builds saved in the browser before signing in are moved to the account.
// Talks to app.js only through the form fields (#cpu, #gpu, #ram) – it fills them and fires their events.
(() => {
  "use strict";
  const $ = s => document.querySelector(s);
  const LOCAL_KEY = "rozjede-builds";

  const cfg = globalThis.CONFIG || {};
  const hasCloud = !!(cfg.SUPABASE_URL && !String(cfg.SUPABASE_URL).startsWith("FILL_IN") && globalThis.supabase);
  const sb = hasCloud ? globalThis.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_KEY) : null;
  let session = null;
  let builds = [];          // [{ id, name, cpu, gpu, ram }]
  const signedIn = () => !!(sb && session);

  // ---------- storage: browser or Supabase ----------
  const local = {
    read() { try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"); } catch (e) { return []; } },
    write(list) { try { localStorage.setItem(LOCAL_KEY, JSON.stringify(list)); return true; } catch (e) { return false; } }
  };
  async function load() {
    if (signedIn()) {
      const { data, error } = await sb.from("builds").select("id,name,cpu,gpu,ram").order("created_at");
      builds = error ? [] : data;
    } else builds = local.read();
    fillSelect();
  }
  async function add(b) {
    if (signedIn()) {
      const { data, error } = await sb.from("builds").insert({ name: b.name, cpu: b.cpu, gpu: b.gpu, ram: b.ram }).select("id,name,cpu,gpu,ram").single();
      if (error) throw new Error(error.message);
      builds.push(data); return data;
    }
    const item = { ...b, id: "local-" + Date.now() };
    builds.push(item);
    if (!local.write(builds)) throw new Error("Prohlížeč nedovolil uložení (např. anonymní okno).");
    return item;
  }
  async function remove(id) {
    if (signedIn()) { const { error } = await sb.from("builds").delete().eq("id", id); if (error) throw new Error(error.message); }
    builds = builds.filter(b => b.id !== id);
    if (!signedIn()) local.write(builds);
  }
  // after signing in: move builds saved in the browser into the account
  async function moveLocalToAccount() {
    const old = local.read();
    if (!old.length) return;
    const { error } = await sb.from("builds").insert(old.map(b => ({ name: b.name, cpu: b.cpu, gpu: b.gpu, ram: b.ram })));
    if (!error) local.write([]);
  }

  // ---------- the form fields owned by app.js ----------
  function currentBuild() {
    const cpuOk = $("#cpuMsg").classList.contains("good"), gpuOk = $("#gpuMsg").classList.contains("good");
    const ram = Number($("#ram").value);
    return cpuOk && gpuOk && ram ? { cpu: $("#cpu").value.trim(), gpu: $("#gpu").value.trim(), ram } : null;
  }
  function applyBuild(b) {
    for (const k of ["cpu", "gpu"]) { const e = $("#" + k); e.value = b[k]; e.dispatchEvent(new Event("input")); e.dispatchEvent(new Event("change")); }
    const r = $("#ram"); r.value = String(b.ram); r.dispatchEvent(new Event("change"));
  }

  // ---------- saved builds dropdown ----------
  const sel = $("#savedSel");
  function fillSelect(selectedId) {
    sel.length = 1;
    for (const b of builds) { const o = document.createElement("option"); o.value = b.id; o.textContent = `${b.name} – ${b.gpu}`; sel.append(o); }
    sel.value = selectedId && builds.some(b => b.id === selectedId) ? selectedId : "";
    sel.hidden = !builds.length;
    $("#delBtn").hidden = !sel.value;
  }
  sel.addEventListener("change", () => {
    const b = builds.find(x => x.id === sel.value);
    if (b) applyBuild(b);
    $("#delBtn").hidden = !sel.value;
  });
  $("#delBtn").addEventListener("click", async () => {
    const b = builds.find(x => x.id === sel.value);
    if (!b || !confirm(`Smazat sestavu „${b.name}“?`)) return;
    try { await remove(b.id); fillSelect(); } catch (e) { alert("Sestavu se nepodařilo smazat: " + e.message); }
  });

  // ---------- save dialog ----------
  const saveDlg = $("#saveDlg");
  const showMsg = (el, text, ok) => { el.textContent = text; el.className = "form-msg " + (ok ? "ok" : "bad"); el.hidden = !text; };
  $("#saveBtn").addEventListener("click", () => {
    const b = currentBuild();
    showMsg($("#saveMsg"), "", true);
    $("#saveWhere").textContent = b
      ? (signedIn() ? `${b.cpu} · ${b.gpu} · ${b.ram} GB – uloží se do tvého účtu.`
        : `${b.cpu} · ${b.gpu} · ${b.ram} GB – uloží se jen v tomhle prohlížeči.` + (hasCloud ? " Přihlas se, aby byla dostupná všude." : ""))
      : "Nejdřív vyplň procesor, grafickou kartu i paměť.";
    $("#buildName").disabled = $("#saveConfirm").disabled = !b;
    $("#buildName").value = b ? (builds.length ? "" : "Moje PC") : "";
    saveDlg.showModal();
    if (b) $("#buildName").focus();
  });
  $("#saveForm").addEventListener("submit", async ev => {
    ev.preventDefault();
    const b = currentBuild(), name = $("#buildName").value.trim();
    if (!b || !name) return;
    $("#saveConfirm").disabled = true;
    try { const item = await add({ ...b, name }); fillSelect(item.id); saveDlg.close(); }
    catch (e) { showMsg($("#saveMsg"), "Uložení se nepovedlo: " + e.message, false); }
    $("#saveConfirm").disabled = false;
  });

  // ---------- sign in / out (only when Supabase is set up) ----------
  function updateAccount() {
    $("#account").hidden = !hasCloud;
    $("#loginBtn").hidden = signedIn();
    $("#logoutBtn").hidden = !signedIn();
    $("#userBox").hidden = !signedIn();
    const email = (session && session.user && session.user.email) || "";
    $("#userEmail").textContent = email; $("#userBox").title = email;
    $("#userAvatar").textContent = (email || "?").charAt(0).toUpperCase();
  }
  if (hasCloud) {
    const loginDlg = $("#loginDlg");
    $("#loginBtn").addEventListener("click", () => { showMsg($("#loginMsg"), "", true); loginDlg.showModal(); $("#loginEmail").focus(); });
    $("#logoutBtn").addEventListener("click", () => sb.auth.signOut());
    $("#loginForm").addEventListener("submit", async ev => {
      ev.preventDefault();
      const email = $("#loginEmail").value.trim();
      $("#loginSend").disabled = true;
      const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname } });
      $("#loginSend").disabled = false;
      if (error) showMsg($("#loginMsg"), /rate|limit|too many/i.test(error.message)
        ? "Teď se posílá moc přihlašovacích e-mailů. Zkus to prosím za chvíli znovu."
        : "Odkaz se nepodařilo poslat: " + error.message, false);
      else showMsg($("#loginMsg"), "Hotovo! Zkontroluj e-mail a klikni na odkaz.", true);
    });
    sb.auth.onAuthStateChange(async (event, s) => {
      const was = signedIn();
      session = s; updateAccount();
      if (!was && signedIn()) await moveLocalToAccount();
      await load();
    });
    sb.auth.getSession().then(({ data }) => { session = data.session; updateAccount(); load(); });
  } else { updateAccount(); load(); }

  document.querySelectorAll("#saveDlg [data-close], #loginDlg [data-close]").forEach(b => b.addEventListener("click", () => b.closest("dialog").close()));
})();
