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
const RKC = { E: "#5b6b8f", D: "#3ddc5a", C: "#2ee6ff", B: "#4d8bff", A: "#ff3d7f", S: "#ffd23d", P: "#ffffff" };
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
const FIG={"f":{"b":[[[85,20],[91,10],[100,7],[109,10],[115,20],[113,39],[106,49],[94,49],[87,39]],[[92.5,42],[91.5,52],[90,62],[110,62],[109,52],[107.5,42]],[[60,69],[100,59],[140,69],[144,93],[128,110],[121,158],[130,178],[108,198],[92,198],[70,178],[79,158],[72,110],[56,93]],[[51,73],[48,97],[45.5,130.5],[62.5,133.5],[71.5,101],[77,77]],[[45,131],[44,146],[42.5,181.5],[53.5,182.5],[60.5,148],[63,133]],[[42,181.5],[40,193.5],[42,201.5],[50,202.5],[54,194.5],[54,182.5]],[[66,183],[67.5,206.5],[69.5,261.5],[90.5,262.5],[99.5,208.5],[104,185]],[[69,261.5],[69,282.5],[72,332],[84,332],[90,283.5],[91,262.5]],[[86,328],[70,326],[60,344],[58,352],[66,358],[88,346]],[[123,77],[128.5,101],[137.5,133.5],[154.5,130.5],[152,97],[149,73]],[[137,133],[139.5,148],[146.5,182.5],[157.5,181.5],[156,146],[155,131]],[[146,182.5],[146,194.5],[150,202.5],[158,201.5],[160,193.5],[158,181.5]],[[96,185],[100.5,208.5],[109.5,262.5],[130.5,261.5],[132.5,206.5],[134,183]],[[109,262.5],[110,283.5],[116,332],[128,332],[131,282.5],[131,261.5]],[[114,328],[130,326],[140,344],[142,352],[134,358],[112,346]]],"z":[["epaules",[[56,64],[50,74.5],[52.5,96.5],[67.5,99],[77.5,79.5],[75.5,67.5]]],["bras",[[50.5,100],[47.5,110.5],[49,127],[57.5,128.5],[64.5,113.5],[65,103]]],["bras",[[47.5,136.5],[47,144],[47,167.5],[54,168.5],[60,145.5],[61.5,138]]],["cuisses",[[70.5,191],[68,210],[70,245.5],[80,246.5],[87,211],[86.5,192]]],["cuisses",[[87,223.5],[85,241],[85.5,258.5],[92.5,259],[96,241.5],[96,224]]],["mollets",[[78,270.5],[76.5,282.5],[80,305.5],[86,305.5],[90.5,283],[90,270.5]]],["epaules",[[124.5,67.5],[122.5,79.5],[132.5,99],[147.5,96.5],[150,74.5],[144,64]]],["bras",[[135,103],[135.5,113.5],[142.5,128.5],[151,127],[152.5,110.5],[149.5,100]]],["bras",[[138.5,138],[140,145.5],[146,168.5],[153,167.5],[153,144],[152.5,136.5]]],["cuisses",[[113.5,192],[113,211],[120,246.5],[130,245.5],[132,210],[129.5,191]]],["cuisses",[[104,224],[104,241.5],[107.5,259],[114.5,258.5],[115,241],[113,223.5]]],["mollets",[[110,270.5],[109.5,283],[114,305.5],[120,305.5],[123.5,282.5],[122,270.5]]],["torse",[[72,85],[97,81],[97,115],[86,123],[70,111]]],["torse",[[103,80],[128,79],[131,107],[114,121],[103,114]]],["abdos",[[85,131],[97,129],[97,142],[86,144]]],["abdos",[[103,129],[115,130],[114,143],[103,142]]],["abdos",[[85.5,148],[97,146],[97,159],[86.5,161]]],["abdos",[[103,146],[114.5,147],[113.5,160],[103,159]]],["abdos",[[86,165],[97,163],[97,176],[87,178]]],["abdos",[[103,163],[114,164],[113,177],[103,176]]],["abdos",[[82,125],[81,131],[83,177],[80,172]]],["abdos",[[119,130],[118,124],[120,172],[117,176]]]]},"k":{"b":[[[85,20],[91,10],[100,7],[109,10],[115,20],[113,39],[106,49],[94,49],[87,39]],[[92.5,42],[91.5,52],[90,62],[110,62],[109,52],[107.5,42]],[[60,69],[100,59],[140,69],[144,93],[128,110],[121,158],[130,178],[108,198],[92,198],[70,178],[79,158],[72,110],[56,93]],[[51,73],[48,97],[45.5,130.5],[62.5,133.5],[71.5,101],[77,77]],[[45,131],[44,146],[42.5,181.5],[53.5,182.5],[60.5,148],[63,133]],[[42,181.5],[40,193.5],[42,201.5],[50,202.5],[54,194.5],[54,182.5]],[[66,183],[67.5,206.5],[69.5,261.5],[90.5,262.5],[99.5,208.5],[104,185]],[[69,261.5],[69,282.5],[72,332],[84,332],[90,283.5],[91,262.5]],[[86,328],[70,326],[60,344],[58,352],[66,358],[88,346]],[[123,77],[128.5,101],[137.5,133.5],[154.5,130.5],[152,97],[149,73]],[[137,133],[139.5,148],[146.5,182.5],[157.5,181.5],[156,146],[155,131]],[[146,182.5],[146,194.5],[150,202.5],[158,201.5],[160,193.5],[158,181.5]],[[96,185],[100.5,208.5],[109.5,262.5],[130.5,261.5],[132.5,206.5],[134,183]],[[109,262.5],[110,283.5],[116,332],[128,332],[131,282.5],[131,261.5]],[[114,328],[130,326],[140,344],[142,352],[134,358],[112,346]]],"z":[["epaules",[[56.5,65.5],[51.5,75],[54,94.5],[67,96.5],[76,79],[74.5,68.5]]],["bras",[[52,97.5],[49,107.5],[50,126.5],[59.5,128.5],[67,110.5],[67.5,100.5]]],["bras",[[46.5,135],[45.5,142.5],[46.5,164.5],[53.5,165.5],[59.5,144],[60.5,137]]],["cuisses",[[72,216],[71.5,228.5],[74,252],[87,253],[92.5,230],[94,217.5]]],["mollets",[[71,266],[69,277],[75.5,304],[82.5,304],[90,278],[89,266.5]]],["epaules",[[125.5,68.5],[124,79],[133,96.5],[146,94.5],[148.5,75],[143.5,65.5]]],["bras",[[132.5,100.5],[133,110.5],[140.5,128.5],[150,126.5],[151,107.5],[148,97.5]]],["bras",[[139.5,137],[140.5,144],[146.5,165.5],[153.5,164.5],[154.5,142.5],[153.5,135]]],["cuisses",[[106,217.5],[107.5,230],[113,253],[126,252],[128.5,228.5],[128,216]]],["mollets",[[111,266.5],[110,278],[117.5,304],[124.5,304],[131,277],[129,266]]],["dos",[[80,73],[100,50],[120,72],[103,109],[97,109]]],["dos",[[74,89],[88,89],[95,125],[94,163],[81,144],[76,110]]],["dos",[[112,88],[126,87],[124,110],[119,144],[106,162],[105,124]]],["dos",[[86,169],[98,167],[98,166],[84,162]]],["dos",[[102,166],[114,168],[116,161],[102,166]]],["cuisses",[[73,170],[98,174],[98,204],[82,210],[71,196]]],["cuisses",[[102,174],[127,170],[129,195],[118,209],[102,204]]]]}};
function mixW(c, t) { const n = parseInt(String(c).replace("#", "").slice(0, 6), 16) || 0x9db3e6, f = v => Math.round(255 + (v - 255) * t); return new Color("#" + [n >> 16, n >> 8 & 255, n & 255].map(v => f(v).toString(16).padStart(2, "0")).join("")) }
function bodyImage(d, W, H) {
  const dc = new DrawContext(); dc.size = new Size(W, H); dc.opaque = false; dc.respectScreenScale = true;
  const k = Math.min(W / 410, H / 380), ox0 = (W - 410 * k) / 2;
  const G = {}; for (const g of (d.groups || [])) if (g.k) G[g.k] = g;
  const poly = (pts, ox, color, dx) => {
    const path = new Path(); path.addLines(pts.map(([x, y]) => new Point(ox0 + (ox + x + (dx || 0)) * k, (y + (dx ? 1 : 0)) * k)));
    path.closeSubpath(); dc.addPath(path); dc.setFillColor(color); dc.fillPath();
  };
  const base = (C.bg1 === "#0a5524" || C.bg1 === VERT.bg1) ? new Color("#0a4a1e") : new Color("#2d4fa6");
  for (const [ox, f] of [[0, FIG.f], [210, FIG.k]]) {
    for (const p of f.b) poly(p, ox, base);
    for (const [key, p] of f.z) { const g = G[key], s = g ? Math.min(6, g.s) : 0; poly(p, ox, col(g ? g.c : "#9db3e6", 0.22 + s / 6 * 0.78)) }
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
