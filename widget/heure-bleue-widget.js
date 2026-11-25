// Heure Bleue — widget pour l'app Scriptable (iPhone)
// Nom du script dans Scriptable : Heure Bleue
// 1) Lancé depuis l'app Heure Bleue (bouton « Mettre à jour le widget ») : lit le presse-papiers et enregistre les données.
// 2) Lancé par le widget : affiche les données enregistrées.

const FILE = "heure-bleue.json";
const fm = FileManager.local();
const path = fm.joinPath(fm.documentsDirectory(), FILE);
let C = { bg1: "#06163a", bg2: "#123a8c", cyan: "#2ee6ff", pink: "#ff3d7f", ink: "#f3f7ff", mute: "#9db3e6" };
const VERT = { bg1: "#c2d9c9", bg2: "#8fe6b9", cyan: "#0a7a2a", pink: "#0b5a24", ink: "#0b4a1f", mute: "#2c5a3a", rk: "#0b4a1f" };
const RKC = { E: "#5b6b8f", D: "#3ddc5a", C: "#2ee6ff", B: "#4d8bff", A: "#ff3d7f", S: "#ffd23d" };
const col = (h, a) => { try { return new Color(h, a === undefined ? 1 : a) } catch (e) { return new Color(C.mute) } };

function fmt(m) { m = Math.round(m || 0); if (m < 60) return m + " min"; const h = Math.floor(m / 60), r = m % 60; return h + " h" + (r ? " " + String(r).padStart(2, "0") : "") }
function hm(t) { const d = new Date(t); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0") }
function dayLbl(t) {
  const d = new Date(t), n = new Date(), k = x => x.toDateString(), tm = new Date(); tm.setDate(n.getDate() + 1);
  if (k(d) === k(n)) return "Auj."; if (k(d) === k(tm)) return "Demain";
  return ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."][d.getDay()] + " " + d.getDate();
}
function bar(w, h, parts) {
  const dc = new DrawContext(); dc.size = new Size(w, h); dc.opaque = false; dc.respectScreenScale = true;
  dc.setFillColor(col("#ffffff", 0.12)); dc.fillRect(new Rect(0, 0, w, h));
  let x = 0; for (const p of parts) { const pw = Math.max(0, w * p.f); dc.setFillColor(col(p.c)); dc.fillRect(new Rect(x, 0, pw, h)); x += pw }
  return dc.getImage();
}
function txt(stack, s, size, color, weight) {
  const t = stack.addText(String(s));
  t.font = weight === "black" ? Font.blackSystemFont(size) : weight === "bold" ? Font.boldSystemFont(size) : Font.semiboldSystemFont(size);
  t.textColor = col(color); t.lineLimit = 1; t.minimumScaleFactor = 0.6; return t;
}
function rankBox(stack, r, size) {
  const b = stack.addStack(); b.size = new Size(size, size); b.backgroundColor = col(RKC[r] || C.mute); b.cornerRadius = 4; b.centerAlignContent();
  const t = b.addText(r || "?"); t.font = Font.blackSystemFont(size * 0.66); t.textColor = col(C.rk || "#06163a");
}

function build(d, family) {
  if (d && d.pal && d.pal.bg1) C = Object.assign({}, C, d.pal); else if (d && d.skin === "vert") C = VERT;
  const w = new ListWidget();
  const g = new LinearGradient(); g.colors = [col(C.bg2), col(C.bg1)]; g.locations = [0, 1]; g.startPoint = new Point(1, 0); g.endPoint = new Point(0, 1);
  w.backgroundGradient = g; w.setPadding(14, 14, 14, 14); w.url = "https://timothemahoukou.github.io/Heure-Bleue/";
  w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);
  if (!d) { txt(w, "HEURE BLEUE", 12, C.cyan, "black"); w.addSpacer(6); txt(w, "Dans l’app, touche « Mettre à jour le widget ».", 13, C.ink).lineLimit = 3; return w }

  const cats = (d.week && d.week.cats) || [], tot = (d.week && d.week.tot) || 0, next = d.next || [];
  const small = family === "small", large = family === "large";

  // en-tête
  const top = w.addStack(); top.centerAlignContent();
  txt(top, "HEURE BLEUE", 11, C.cyan, "black"); top.addSpacer();
  if (d.timer) { const dot = top.addText("● "); dot.font = Font.boldSystemFont(10); dot.textColor = col(C.pink); const tm = top.addDate(new Date(d.timer.s)); tm.applyTimerStyle(); tm.font = Font.boldMonospacedSystemFont(11); tm.textColor = col(C.ink); tm.lineLimit = 1 }
  w.addSpacer(6);

  // rang + total semaine
  const row = w.addStack(); row.centerAlignContent();
  rankBox(row, d.rank, small ? 40 : 46); row.addSpacer(10);
  const col1 = row.addStack(); col1.layoutVertically();
  txt(col1, "Cette semaine", 11, C.mute, "bold");
  txt(col1, fmt(tot), small ? 22 : 26, C.ink, "black");
  if (!small) { txt(col1, "Aujourd’hui : " + fmt(d.today), 11, C.mute) }
  if (!small) {
    row.addSpacer(12);
    const col2 = row.addStack(); col2.layoutVertically();
    txt(col2, "À VENIR", 11, C.pink, "black"); col2.addSpacer(2);
    if (!next.length) txt(col2, "Rien de prévu", 12, C.mute);
    for (const e of next.slice(0, 2)) { txt(col2, dayLbl(e.s) + " " + hm(e.s), 10, C.cyan, "bold"); txt(col2, e.t, 13, C.ink, "bold") }
  }
  w.addSpacer(8);

  // barre de répartition
  const sum = cats.reduce((a, c) => a + c.m, 0) || 1;
  const img = w.addImage(bar(small ? 130 : 300, 8, cats.map(c => ({ f: c.m / sum, c: c.c }))));
  img.imageSize = new Size(small ? 130 : 300, 8);
  w.addSpacer(6);

  if (small) {
    const e = next[0];
    if (e) { txt(w, dayLbl(e.s) + " " + hm(e.s), 10, C.cyan, "bold"); txt(w, e.t, 12, C.ink, "bold") }
    else txt(w, d.timer ? d.timer.n : "Rien de prévu", 12, C.mute);
  } else {
    const n = large ? 5 : 3;
    const legend = w.addStack(); legend.layoutHorizontally();
    for (const c of cats.slice(0, n)) {
      const it = legend.addStack(); it.centerAlignContent();
      const sw = it.addStack(); sw.size = new Size(8, 8); sw.backgroundColor = col(c.c); sw.cornerRadius = 1; it.addSpacer(4);
      txt(it, c.n + " " + fmt(c.m), 10, C.ink, "bold"); legend.addSpacer(8);
    }
    if (large) {
      w.addSpacer(10);
      txt(w, "PROCHAINS ÉVÉNEMENTS", 11, C.pink, "black"); w.addSpacer(4);
      for (const e of next.slice(2, 6)) {
        const r = w.addStack(); r.centerAlignContent();
        const sw = r.addStack(); sw.size = new Size(4, 22); sw.backgroundColor = col(e.c || C.ink); r.addSpacer(6);
        const v = r.addStack(); v.layoutVertically(); txt(v, dayLbl(e.s) + " " + hm(e.s), 10, C.cyan, "bold"); txt(v, e.t, 13, C.ink, "bold");
        w.addSpacer(4);
      }
      if (next.length <= 2) txt(w, "Rien d’autre de prévu.", 12, C.mute);
      if (d.groups && d.groups.length) {
        w.addSpacer(8); txt(w, "RANGS", 11, C.cyan, "black"); w.addSpacer(4);
        const gr = w.addStack();
        for (const x of d.groups.slice(0, 7)) { const it = gr.addStack(); it.layoutVertically(); it.centerAlignContent(); rankBox(it, x.r, 22); txt(it, x.n.slice(0, 5), 9, x.c); gr.addSpacer(6) }
      }
    }
  }
  w.addSpacer();
  const ago = Math.round((Date.now() - (d.at || Date.now())) / 60000);
  txt(w, "Mis à jour " + (ago < 1 ? "à l’instant" : ago < 60 ? "il y a " + ago + " min" : "le " + dayLbl(d.at) + " " + hm(d.at)), 9, C.mute);
  return w;
}

function load() { try { return fm.fileExists(path) ? JSON.parse(fm.readString(path)) : null } catch (e) { return null } }

if (config.runsInWidget) {
  Script.setWidget(build(load(), config.widgetFamily));
} else {
  let saved = false;
  try { const raw = Pasteboard.paste(); const d = JSON.parse(raw); if (d && d.hb) { fm.writeString(path, raw); saved = true } } catch (e) {}
  const d = load();
  if (!saved && !d) {
    const a = new Alert(); a.title = "Heure Bleue"; a.message = "Rien à importer. Dans l’app Heure Bleue, touche « Mettre à jour le widget »."; a.addAction("OK"); await a.present();
  }
  if (d) await build(d, "medium").presentMedium();
}
Script.complete();
