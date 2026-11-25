// Heure Bleue — widget pour l'app Scriptable (iPhone)
// Nom du script dans Scriptable : Heure Bleue
// 1) Lancé depuis l'app Heure Bleue (bouton « Mettre à jour le widget ») : lit le presse-papiers et enregistre les données.
// 2) Lancé par le widget : affiche les données enregistrées.
// Widget Sport (silhouette + rangs) : dans les réglages du widget, mets « sport » dans Parameter.

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
// Badge de rang dessiné en image : reste lisible en mode Teinté / Transparent
// (l'iPhone y garde le contraste clair/foncé d'une image, alors qu'un texte posé sur un fond coloré devient blanc sur blanc).
function rankImg(r, size) {
  const dc = new DrawContext(); dc.size = new Size(size, size); dc.opaque = false; dc.respectScreenScale = true;
  const p = new Path(); p.addRoundedRect(new Rect(0, 0, size, size), size * 0.12, size * 0.12);
  dc.addPath(p); dc.setFillColor(col(RKC[r] || "#9db3e6")); dc.fillPath();
  dc.setFont(Font.blackSystemFont(size * 0.66)); dc.setTextColor(col("#06163a")); dc.setTextAlignedCenter();
  dc.drawTextInRect(r || "?", new Rect(0, size * 0.1, size, size * 0.85));
  return dc.getImage();
}
function rankBox(stack, r, size) {
  const im = stack.addImage(rankImg(r, size)); im.imageSize = new Size(size, size);
}

/* ---- widget Sport : silhouette + rangs (paramètre du widget : sport) ---- */
const ab=[106,124,142].flatMap(y=>[[88,99],[101,112]].map(([a,b])=>[[a,y],[b,y],[b,y+16],[a,y+16]]));
const FRONT=[['epaules',[[58,66],[84,62],[78,84],[66,102],[54,90]],1],['torse',[[86,64],[99,67],[99,100],[82,104],[74,94],[80,82]],1],['bras',[[54,96],[68,104],[64,140],[52,140],[48,116]],1],['bras',[[48,144],[64,144],[58,182],[46,182],[42,162]],1],...ab.map(p=>['abdos',p,0]),['abdos',[[76,104],[86,106],[86,158],[78,150],[74,126]],1],['cuisses',[[76,166],[98,188],[96,250],[84,252],[72,250],[70,204]],1],['mollets',[[74,270],[92,270],[90,330],[80,336],[72,310]],1]];
const BACK=[['dos',[[84,58],[116,58],[112,76],[100,96],[88,76]],0],['dos',[[76,86],[88,80],[99,98],[99,148],[86,150],[74,118]],1],['dos',[[88,150],[112,150],[110,166],[90,166]],0],['epaules',[[58,66],[82,62],[78,82],[66,100],[54,90]],1],['bras',[[54,96],[68,104],[64,140],[52,140],[48,116]],1],['bras',[[48,144],[64,144],[58,182],[46,182],[42,162]],1],['cuisses',[[80,166],[99,170],[99,200],[80,202],[72,186]],1],['cuisses',[[72,206],[97,206],[95,250],[84,252],[72,250]],1],['mollets',[[72,270],[93,270],[91,318],[81,336],[72,314]],1]];
const BASE=[[[88,14],[112,14],[120,32],[112,50],[88,50],[80,32]],[[92,50],[108,50],[110,62],[90,62]],[[80,160],[120,160],[118,182],[100,192],[82,182]]];
const BASEM=[[[44,184],[58,186],[56,202],[44,200]],[[72,252],[96,252],[92,268],[76,268]],[[72,338],[90,338],[94,350],[68,350]],[[60,62],[100,56],[100,190],[70,180],[50,96]]];
function bodyImage(d, W, H) {
  const dc = new DrawContext(); dc.size = new Size(W, H); dc.opaque = false; dc.respectScreenScale = true;
  const k = Math.min(W / 410, H / 380), ox0 = (W - 410 * k) / 2;
  const G = {}; for (const g of (d.groups || [])) if (g.k) G[g.k] = g;
  const poly = (pts, ox, color, sc) => {
    const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
    const path = new Path();
    path.addLines(pts.map(([x, y]) => new Point(ox0 + (ox + cx + (x - cx) * sc) * k, (cy + (y - cy) * sc) * k)));
    path.closeSubpath(); dc.addPath(path); dc.setFillColor(color); dc.fillPath();
  };
  const M = pts => pts.map(([x, y]) => [200 - x, y]);
  const base = col(C.mute, 0.35), base2 = col(C.mute, 0.2);
  for (const ox of [0, 210]) {
    poly(BASEM[3], ox, base2, 1); poly(M(BASEM[3]), ox, base2, 1);
    for (const p of BASEM.slice(0, 3)) { poly(p, ox, base, 1); poly(M(p), ox, base, 1) }
    for (const p of BASE) poly(p, ox, base, 1);
    for (const [key, pts, mir] of (ox ? BACK : FRONT)) {
      const g = G[key], s = g ? g.s : 0, c = col(g ? g.c : C.mute, 0.2 + Math.min(6, s) / 6 * 0.8), sc = 1 + s * 0.035;
      poly(pts, ox, c, sc); if (mir) poly(M(pts), ox, c, sc);
    }
  }
  return dc.getImage();
}
function buildSport(d, family) {
  const w = new ListWidget();
  const g = new LinearGradient(); g.colors = [col(C.bg2), col(C.bg1)]; g.locations = [0, 1]; g.startPoint = new Point(1, 0); g.endPoint = new Point(0, 1);
  w.backgroundGradient = g; w.setPadding(12, 12, 12, 12); w.url = "https://timothemahoukou.github.io/Heure-Bleue/";
  w.refreshAfterDate = new Date(Date.now() + 30 * 60 * 1000);
  if (!d || !d.groups) { txt(w, "HEURE BLEUE · SPORT", 11, C.cyan, "black"); w.addSpacer(6); txt(w, "Dans l’app, touche « Mettre à jour le widget ».", 13, C.ink).lineLimit = 3; return w }
  const small = family === "small", large = family === "large";
  if (small) {
    const top = w.addStack(); top.centerAlignContent(); txt(top, "SPORT", 11, C.cyan, "black"); top.addSpacer(); rankBox(top, d.rank, 30);
    w.addSpacer(4); const im = w.addImage(bodyImage(d, 260, 240)); im.centerAlignImage(); w.addSpacer();
    return w;
  }
  const row = w.addStack(); row.centerAlignContent();
  const im = row.addImage(bodyImage(d, large ? 300 : 170, large ? 278 : 158)); im.imageSize = new Size(large ? 160 : 150, large ? 148 : 139);
  row.addSpacer(10);
  const right = row.addStack(); right.layoutVertically();
  const h = right.addStack(); h.centerAlignContent(); rankBox(h, d.rank, 40); h.addSpacer(8);
  const hv = h.addStack(); hv.layoutVertically(); txt(hv, "RANG GLOBAL", 10, C.cyan, "black"); txt(hv, d.pct ? "mieux que ~" + d.pct + " %" : "Ton corps", 12, C.ink, "bold");
  right.addSpacer(6);
  const gs = (d.groups || []).slice(0, 7);
  const grid = right.addStack(); grid.layoutHorizontally();
  for (const colIdx of [0, 1]) {
    const cst = grid.addStack(); cst.layoutVertically();
    for (const x of gs.filter((_, i) => i % 2 === colIdx)) {
      const r = cst.addStack(); r.centerAlignContent(); rankBox(r, x.r, 15); r.addSpacer(4);
      const sw = r.addStack(); sw.size = new Size(3, 12); sw.backgroundColor = col(x.c); r.addSpacer(3);
      txt(r, x.n, 10, C.ink, "bold"); cst.addSpacer(2);
    }
    grid.addSpacer(8);
  }
  if (large) {
    w.addSpacer(10); txt(w, "RECORDS", 11, C.pink, "black"); w.addSpacer(4);
    for (const r of (d.recs || []).slice(0, 5)) { const st = w.addStack(); st.centerAlignContent(); const sw = st.addStack(); sw.size = new Size(4, 16); sw.backgroundColor = col(r.c); st.addSpacer(6); txt(st, r.n, 13, C.ink, "bold"); st.addSpacer(); txt(st, r.v, 13, C.ink, "black"); w.addSpacer(3) }
    if (!(d.recs || []).length) txt(w, "Note ta première perf dans l’app.", 12, C.mute);
  }
  w.addSpacer();
  return w;
}

function buildLock(d, family) {
  const w = new ListWidget(); w.url = "https://timothemahoukou.github.io/Heure-Bleue/";
  w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);
  const white = new Color("#ffffff");
  const t = (st, s, size, weight) => { const x = st.addText(String(s)); x.font = weight === "black" ? Font.blackSystemFont(size) : weight === "bold" ? Font.boldSystemFont(size) : Font.semiboldSystemFont(size); x.textColor = white; x.lineLimit = 1; x.minimumScaleFactor = 0.6; return x };
  if (!d) { t(w, family === "accessoryCircular" ? "HB" : "Heure Bleue : touche Mettre à jour le widget", 12, "bold"); return w }
  const tot = fmt((d.week && d.week.tot) || 0), e = (d.next || [])[0];
  const nextTxt = e ? dayLbl(e.s) + " " + hm(e.s) + " · " + e.t : "Rien de prévu";
  if (family === "accessoryInline") {
    t(w, (d.timer ? "● " + d.timer.n : "Rang " + (d.rank || "?") + " · " + tot) + (e ? " · " + hm(e.s) + " " + e.t : ""), 12, "bold");
  } else if (family === "accessoryCircular") {
    w.addAccessoryWidgetBackground = true;
    const s = w.addStack(); s.layoutVertically(); s.centerAlignContent();
    const r1 = s.addStack(); r1.addSpacer(); t(r1, d.rank || "?", 26, "black"); r1.addSpacer();
    const r2 = s.addStack(); r2.addSpacer(); t(r2, tot, 10, "bold"); r2.addSpacer();
  } else {
    const top = w.addStack(); top.centerAlignContent();
    t(top, "HEURE BLEUE · RANG " + (d.rank || "?"), 11, "black"); top.addSpacer();
    if (d.timer) { const tm = top.addDate(new Date(d.timer.s)); tm.applyTimerStyle(); tm.font = Font.boldMonospacedSystemFont(11); tm.textColor = white; tm.lineLimit = 1 }
    t(w, nextTxt, 13, "bold");
    t(w, "Semaine : " + tot + (d.today ? " · auj. " + fmt(d.today) : ""), 12);
  }
  return w;
}

function build(d, family) {
  if (family && String(family).startsWith("accessory")) return buildLock(d, family);
  if (d && d.pal && d.pal.bg1) C = Object.assign({}, C, d.pal); else if (d && d.skin === "vert") C = VERT;
  if (String(args.widgetParameter || "").trim().toLowerCase().startsWith("sport")) return buildSport(d, family);
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
