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
const FIG={"f":{"b":[[[82,16.5],[100.5,8.5],[114,20],[113,39],[101.5,50.5],[86.5,44.5]],[[89.5,42],[88,51.5],[87,61.5],[106,62.5],[105.5,52.5],[105,42]],[[58,72],[96,59],[137.5,63],[142.5,86.5],[129.5,103.5],[124,153.5],[133,172],[112.5,199.5],[96.5,200],[71.5,181.5],[78.5,161],[70,111.5],[55,96]],[[49.5,75],[44.5,100],[41,134.5],[57.5,138.5],[68.5,105],[74.5,80.5]],[[40,135.5],[39,150.5],[38,186],[49.5,187.5],[56,153],[58,137.5]],[[37.5,186.5],[35,198],[37,206.5],[45,208],[49,200],[50,187.5]],[[67,181.5],[66,206.5],[62,263.5],[82,267.5],[97,211.5],[104.5,188]],[[61,264.5],[59.5,286],[59.5,335.5],[71.5,336.5],[80.5,287.5],[83,266.5]],[[73.5,331.5],[57.5,330.5],[42,347],[40.5,355.5],[49,361],[76.5,349.5]],[[122,74],[132,95.5],[148.5,124.5],[164.5,117.5],[154,86],[145.5,64]],[[148,124],[153.5,137.5],[167.5,168],[178.5,164.5],[169.5,132],[165,118]],[[167.5,168.5],[171,181],[177,187.5],[185,184],[184.5,175],[178,164]],[[102,185],[113,207],[135.5,258.5],[155.5,252.5],[143,197],[138.5,173]],[[134.5,258],[139,279],[153.5,328.5],[165,326],[160,275],[156.5,253.5]],[[151,323.5],[167,320.5],[186,336.5],[188,344.5],[180.5,351],[150,341.5]]],"z":[["epaules",[[54.5,66],[48,77],[49.5,99.5],[64.5,102.5],[75.5,83],[73.5,70.5]]],["bras",[[47.5,103.5],[44,114.5],[44.5,131.5],[53,133],[60.5,118],[62,107]]],["bras",[[43,141],[42.5,149],[43,172.5],[49.5,173],[55.5,150.5],[56.5,142.5]]],["cuisses",[[70.5,190.5],[65.5,210],[64,247.5],[73.5,249.5],[84,213.5],[86,193]]],["cuisses",[[83.5,226],[79.5,244],[78.5,262],[85,263.5],[90,245.5],[92,227.5]]],["mollets",[[69.5,273.5],[67,286],[69,309.5],[74.5,310],[81,287],[81,275]]],["epaules",[[121,64.5],[121.5,76.5],[136,93],[149.5,87],[147.5,65.5],[139,57]]],["bras",[[139,96],[142,105.5],[152.5,118.5],[160,114.5],[158,99],[153,89.5]]],["bras",[[150.5,128.5],[153.5,135],[164.5,155],[170.5,153],[166,130.5],[163.5,123.5]]],["cuisses",[[121,187.5],[126,206.5],[141.5,240],[151,237],[143.5,200.5],[136,182]]],["cuisses",[[120,221.5],[124.5,239.5],[132.5,256],[139,253.5],[135.5,235.5],[128.5,218.5]]],["mollets",[[137.5,266],[138.5,279],[147.5,301],[153,300.5],[152.5,276.5],[149,264]]],["torse",[[70.5,87.5],[94.5,82],[96,116],[85.5,124.5],[70,113.5]]],["torse",[[100.5,81],[126,78.5],[130.5,106.5],[113.5,121],[102,115]]],["abdos",[[85,132.5],[97,130],[97.5,143],[86.5,145.5]]],["abdos",[[103,130],[115,130],[114.5,143],[103.5,143]]],["abdos",[[86.5,149.5],[97.5,147],[98.5,160],[88,162.5]]],["abdos",[[103.5,146.5],[115.5,147],[115,160],[104.5,159.5]]],["abdos",[[88,166.5],[98.5,164],[99.5,177],[89.5,179.5]]],["abdos",[[104.5,163.5],[115.5,164],[115.5,177],[105.5,176.5]]],["abdos",[[79.5,127],[81,133],[85.5,178.5],[81,175]]],["abdos",[[119,130],[119.5,124],[123,167],[119.5,176]]]]},"k":{"b":[[[88,15],[107.5,9],[120,22],[117,40.5],[104.5,51],[89.5,43.5]],[[93,43],[93.5,53],[94,63.5],[113.5,60.5],[111,51],[108.5,40.5]],[[62.5,63],[104,59],[142,72],[145,96],[130,111.5],[121.5,161],[128.5,181.5],[103.5,200],[87.5,199.5],[67,172],[76,153.5],[70.5,103.5],[57.5,86.5]],[[54.5,64],[46,86],[35.5,117.5],[51.5,124.5],[68,95.5],[78,74]],[[35,118],[30.5,132],[21.5,164.5],[32.5,168],[46.5,137.5],[52,124]],[[22,164],[15.5,175],[15,184],[23,187.5],[29,181],[32.5,168.5]],[[61.5,173],[57,197],[44.5,252.5],[64.5,258.5],[87,207],[98,185]],[[43.5,253.5],[40,275],[35,326],[46.5,328.5],[61,279],[65.5,258]],[[49,323.5],[33,320.5],[14,336.5],[12,344.5],[19.5,351],[50,341.5]],[[125.5,80.5],[131.5,105],[142.5,138.5],[159,134.5],[155.5,100],[150.5,75]],[[142,137.5],[144,153],[150.5,187.5],[162,186],[161,150.5],[160,135.5]],[[150,187.5],[151,200],[155,208],[163,206.5],[165,198],[162.5,186.5]],[[95.5,188],[103,211.5],[118,267.5],[138,263.5],[134,206.5],[133,181.5]],[[117,266.5],[119.5,287.5],[128.5,336.5],[140.5,335.5],[140.5,286],[139,264.5]],[[126.5,331.5],[142.5,330.5],[158,347],[159.5,355.5],[151,361],[123.5,349.5]]],"z":[["epaules",[[61.5,58.5],[54,66],[52,85.5],[64,90.5],[77,76],[77.5,65.5]]],["bras",[[49.5,87.5],[44.5,96.5],[41,115],[50,119],[61,103.5],[64,94]]],["bras",[[35.5,122],[33,129],[29.5,150],[36,152],[46.5,133.5],[48.5,126.5]]],["cuisses",[[58.5,208],[55,220],[51,244.5],[64,248.5],[75,226.5],[79.5,214.5]]],["mollets",[[45,258],[41.5,269.5],[43,297.5],[49.5,299],[61.5,273.5],[62.5,261.5]]],["epaules",[[127,72],[126,82.5],[136,100.5],[149,97.5],[150.5,77],[145,67.5]]],["bras",[[135.5,104],[137,115],[145,133],[154.5,131],[154,110.5],[151.5,100.5]]],["bras",[[144,141],[145,149],[151,170],[157.5,169.5],[159,147],[158,140]]],["cuisses",[[109.5,220.5],[111.5,233.5],[120,257],[132.5,255],[132.5,230],[131,216.5]]],["mollets",[[119.5,270.5],[119,282],[128.5,308],[135.5,307.5],[140,280],[137.5,269]]],["dos",[[83.5,68],[104.5,50],[123.5,69],[104.5,105],[98.5,105]]],["dos",[[75.5,83.5],[90.5,84.5],[95.5,120.5],[92.5,158.5],[78.5,140],[74.5,103.5]]],["dos",[[114.5,84.5],[127.5,84.5],[126,111.5],[120.5,147],[104.5,158],[105.5,120]]],["dos",[[84.5,164],[96.5,163],[96.5,163],[82.5,158]]],["dos",[[100.5,162],[112.5,164.5],[114.5,163.5],[100,168]]],["cuisses",[[70.5,164.5],[96,170],[94,205.5],[77,211],[66.5,196.5]]],["cuisses",[[99.5,176],[126,173.5],[126.5,198.5],[115,212],[98,206]]]]}};
function mixW(c, t) { const n = parseInt(String(c).replace("#", "").slice(0, 6), 16) || 0x9db3e6, f = v => Math.round(255 + (v - 255) * t); return new Color("#" + [n >> 16, n >> 8 & 255, n & 255].map(v => f(v).toString(16).padStart(2, "0")).join("")) }
function bodyImage(d, W, H) {
  const dc = new DrawContext(); dc.size = new Size(W, H); dc.opaque = false; dc.respectScreenScale = true;
  const k = Math.min(W / 410, H / 380), ox0 = (W - 410 * k) / 2;
  const G = {}; for (const g of (d.groups || [])) if (g.k) G[g.k] = g;
  const poly = (pts, ox, color, dx) => {
    const path = new Path(); path.addLines(pts.map(([x, y]) => new Point(ox0 + (ox + x + (dx || 0)) * k, (y + (dx ? 1 : 0)) * k)));
    path.closeSubpath(); dc.addPath(path); dc.setFillColor(color); dc.fillPath();
  };
  for (const [ox, f] of [[0, FIG.f], [210, FIG.k]]) {
    poly([[28, 332], [58, 44], [178, 22], [152, 352]], ox, col(C.cyan, 0.15));
    for (const p of f.b) poly(p, ox, col(C.pink, 0.6), 5);
    for (const p of f.b) poly(p, ox, new Color("#ffffff"));
    for (const [key, p] of f.z) { const g = G[key], s = g ? Math.min(6, g.s) : 0; poly(p, ox, mixW(g ? g.c : "#9db3e6", 0.2 + s / 6 * 0.8)) }
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
