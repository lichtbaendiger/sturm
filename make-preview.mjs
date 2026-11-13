/* Erstellt das Social-Media-Vorschaubild (1200 x 630 PNG) fuer index.html.
   Gezeichnet wird dieselbe Optik wie in der 3D-Demo: Achsenpunkt, Linse, Bundel,
   Fokalfiguren, beide Bildlinien, kleinster Verwirrungskreis - mit klassischer
   Blickrichtung (Objekt links, Bild rechts). Reines Node, keine Zusatzbibliothek. */
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

/* ---------- Optik (wie in der Demo) ---------- */
/* Vorschau-Parameter: wie die Voreinstellung "Starker Astigmatismus" in der Demo,
   damit beide Bildlinien und der Verwirrungskreis deutlich zu sehen sind.        */
const P = { g: 400, phiT: 12.5, phiS: 7.5, R: 34 };
const fT = 1000 / P.phiT, fS = 1000 / P.phiS;
const bT = 1 / (1 / fT - 1 / P.g), bS = 1 / (1 / fS - 1 / P.g);
const bK = 2 / (1 / fT + 1 / fS - 2 / P.g);           // kleinster Verwirrungskreis
const zEnd = bS * 1.10;
const gDraw = 175;   // fuer die Vorschau gestaucht, Bildseite bleibt original
const figure = z => ({ ax: P.R * Math.abs(1 - z / bT), ay: P.R * Math.abs(1 - z / bS) });
const hTan = P.R * Math.abs(1 - bT / bS), hSag = P.R * Math.abs(1 - bS / bT);

/* Strahlen durch die Apertur */
const rays = [];
for (let j = 0; j < 24; j++) {
  const az = j * 2 * Math.PI / 24;
  for (const f of [0.4, 0.68, 0.86, 1]) {
    const u = f * P.R * Math.cos(az), v = f * P.R * Math.sin(az);
    rays.push({ u, v, mer: Math.abs(v) < 1e-9 ? 'T' : Math.abs(u) < 1e-9 ? 'S' : '' });
  }
}
const at = (r, z) => z < 0 ? [r.u * (z + gDraw) / gDraw, r.v * (z + gDraw) / gDraw, z]
                           : [r.u * (1 - z / bT), r.v * (1 - z / bS), z];

/* ---------- Kamera: Objekt links, Bild rechts, Achse fast waagerecht ----------
   Hinweis: fuer das Vorschaubild wird die Objektstrecke gestaucht (gDraw statt g),
   damit das Konoid mit seinen beiden Bildlinien gross genug zu sehen ist.
   Die Bildseite bleibt unveraendert (Apertur R, bT, bS, bK wie in der Demo).     */
const theta = -1.05, phi = 1.32;
const T = [0, 0, (-gDraw + zEnd) / 2];
const rad = 1.15 * (zEnd + gDraw);
const cam = [T[0] + rad * Math.sin(phi) * Math.sin(theta),
             T[1] + rad * Math.cos(phi),
             T[2] + rad * Math.sin(phi) * Math.cos(theta)];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const norm = a => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const fwd = norm(sub(T, cam)), right = norm(cross(fwd, [0, 1, 0])), up = cross(right, fwd);
const uv = p => {                                   // normierte Bildschirmkoordinaten
  const v = sub(p, cam), d = dot(v, fwd) || 1e-6;
  return [dot(v, right) / d, -dot(v, up) / d];
};

/* ---------- Zielbild mit 2x Supersampling ---------- */
const W = 1200, H = 630, S = 2, BW = W * S, BH = H * S;
const buf = new Float32Array(BW * BH * 3);
let scale = 1, cx = BW / 2, cy = BH / 2;
const project = p => { const [u, v] = uv(p); return [cx + u * scale, cy + v * scale, 0]; };

(function fit() {
  const pts = [[0, 0, -gDraw]];
  for (const a of [0, 1, 2, 3].map(k => k * Math.PI / 2)) pts.push([P.R * Math.cos(a), P.R * Math.sin(a), 0]);
  for (const r of rays) pts.push(at(r, zEnd));
  pts.push([0, hTan, bT], [0, -hTan, bT], [hSag, 0, bS], [-hSag, 0, bS]);
  const q = pts.map(uv);
  const x0 = Math.min(...q.map(p => p[0])), x1 = Math.max(...q.map(p => p[0]));
  const y0 = Math.min(...q.map(p => p[1])), y1 = Math.max(...q.map(p => p[1]));
  const m = { l: 55, r: 140, t: 180, b: 70 };         // oben Platz fuer den Titel
  scale = Math.min((BW - m.l - m.r) / (x1 - x0), (BH - m.t - m.b) / (y1 - y0));
  cx = m.l + (BW - m.l - m.r) / 2 - (x0 + x1) / 2 * scale;
  cy = m.t + (BH - m.t - m.b) / 2 - (y0 + y1) / 2 * scale;
})();

/* ---------- Malhelfer: additiv, Alpha pro Bildpunkt der Linie ---------- */
const COL = {
  warm: [1.00, 0.70, 0.32], cool: [0.72, 0.85, 1.00],
  tan: [1.00, 0.33, 0.36], sag: [0.25, 0.94, 0.58], least: [0.88, 0.95, 1.00],
  rim: [0.40, 0.72, 1.00],
};
function splat(x, y, c, a) {
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
  for (const [dx, dy, w] of [[0, 0, (1 - fx) * (1 - fy)], [1, 0, fx * (1 - fy)], [0, 1, (1 - fx) * fy], [1, 1, fx * fy]]) {
    const X = xi + dx, Y = yi + dy;
    if (X < 0 || X >= BW || Y < 0 || Y >= BH || w <= 0) continue;
    const i = (Y * BW + X) * 3;
    buf[i] += c[0] * a * w; buf[i + 1] += c[1] * a * w; buf[i + 2] += c[2] * a * w;
  }
}
function seg(p0, p1, c, a, width = 1) {
  const A = project(p0), B = project(p1);
  const len = Math.hypot(B[0] - A[0], B[1] - A[1]);
  const n = Math.max(1, Math.round(len));
  for (let i = 0; i <= n; i++) {
    const x = A[0] + (B[0] - A[0]) * i / n, y = A[1] + (B[1] - A[1]) * i / n;
    if (width <= 1) splat(x, y, c, a);
    else for (let o = -width; o <= width; o++) for (let q = -width; q <= width; q++) {
      const d = Math.hypot(o, q) / width;
      if (d <= 1) splat(x + o, y + q, c, a * (1 - d) ** 1.5);
    }
  }
}
function loop(z, c, a, n = 160, width = 1) {
  const { ax, ay } = figure(z);
  for (let i = 0; i < n; i++) {
    const A = i / n * 2 * Math.PI, B = (i + 1) / n * 2 * Math.PI;
    seg([ax * Math.cos(A), ay * Math.sin(A), z], [ax * Math.cos(B), ay * Math.sin(B), z], c, a, width);
  }
}
function blob(p, c, a, r) {
  const q = project(p);
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const d = Math.hypot(dx, dy) / r; if (d > 1) continue;
    splat(q[0] + dx, q[1] + dy, c, a * (1 - d) ** 2);
  }
}

/* ---------- Hintergrund: Verlauf + Glow um die Linse ---------- */
const top = [0.030, 0.045, 0.075], bot = [0.010, 0.016, 0.028];
for (let y = 0; y < BH; y++) {
  const t = y / BH, c0 = top.map((v, i) => v * (1 - t) + bot[i] * t);
  for (let x = 0; x < BW; x++) {
    const i = (y * BW + x) * 3;
    buf[i] = c0[0]; buf[i + 1] = c0[1]; buf[i + 2] = c0[2];
  }
}
const lensQ = project([0, 0, 0]), objQ = project([0, 0, -gDraw]);
for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) {
  const d = Math.hypot(x - lensQ[0], y - lensQ[1]) / (BW * 0.13);
  const g = Math.exp(-d * d * 2.0) * 0.16;
  const i = (y * BW + x) * 3;
  buf[i] += g * 0.30; buf[i + 1] += g * 0.60; buf[i + 2] += g;
}

/* ---------- Konoid als Ellipsenschar, dann Buendel, dann Bildlinien ---------- */
seg([0, 0, -gDraw - 30], [0, 0, zEnd + 30], [0.35, 0.52, 0.78], 0.10);   // optische Achse
for (let k = 0; k <= 8; k++) {
  const z = bT + (bS - bT) * k / 8, f = figure(z);
  if (Math.min(f.ax, f.ay) < 0.5) continue;
  const t = k / 8;
  loop(z, [0.45 + 0.35 * (1 - t), 0.55 + 0.30 * t, 0.85], 0.075);
}
for (const r of rays) {
  const mer = r.mer === 'T' ? COL.tan : r.mer === 'S' ? COL.sag : null;
  const cObj = mer ? mer.map((v, i) => (v + COL.warm[i]) / 2) : COL.warm;
  seg([0, 0, -gDraw], [r.u, r.v, 0], cObj, mer ? 0.10 : 0.055);
  seg([r.u, r.v, 0], at(r, zEnd), mer || COL.cool, mer ? 0.11 : 0.06);
}
for (let i = 0; i < 260; i++) {                          // Linsenrand
  const A = i / 260 * 2 * Math.PI, B = (i + 1) / 260 * 2 * Math.PI;
  seg([P.R * Math.cos(A), P.R * Math.sin(A), 0], [P.R * Math.cos(B), P.R * Math.sin(B), 0], COL.rim, 0.16, 1.6);
}
seg([0, -hTan, bT], [0, hTan, bT], COL.tan, 0.30, 5);     // Bildlinie I (tangential, y-Richtung)
seg([0, -hTan * 1.35, bT], [0, hTan * 1.35, bT], COL.tan, 0.10, 9);
seg([-hSag, 0, bS], [hSag, 0, bS], COL.sag, 0.30, 5);     // Bildlinie II (sagittal, x-Richtung)
seg([-hSag * 1.35, 0, bS], [hSag * 1.35, 0, bS], COL.sag, 0.10, 9);
loop(bK, COL.least, 0.22, 200, 1.6);                      // kleinster Verwirrungskreis
blob([0, 0, -gDraw], [1.0, 0.86, 0.58], 1.6, 7 * S);        // Leuchtpunkt
blob([0, 0, -gDraw], [1.0, 0.80, 0.50], 0.5, 18 * S);
blob([0, 0, 0], [0.45, 0.75, 1.0], 0.25, 4 * S);      // Linsenmittelpunkt

/* ---------- 5x7-Bitmap-Schrift ---------- */
const R7 = (...r) => { if (r.length !== 7 || r.some(x => x.length !== 5)) throw new Error('Fontzeile fehlerhaft: ' + JSON.stringify(r)); return r; };
const FONT = {
  A: R7('.###.', '#   #', '#   #', '#####', '#   #', '#   #', '#   #'),
  B: R7('####.', '#   #', '#   #', '####.', '#   #', '#   #', '####.'),
  C: R7('.###.', '#   #', '#    ', '#    ', '#    ', '#   #', '.###.'),
  D: R7('####.', '#   #', '#   #', '#   #', '#   #', '#   #', '####.'),
  E: R7('#####', '#    ', '#    ', '####.', '#    ', '#    ', '#####'),
  F: R7('#####', '#    ', '#    ', '####.', '#    ', '#    ', '#    '),
  G: R7('.###.', '#   #', '#    ', '#  ##', '#   #', '#   #', '.###.'),
  H: R7('#   #', '#   #', '#   #', '#####', '#   #', '#   #', '#   #'),
  I: R7('#####', '  #  ', '  #  ', '  #  ', '  #  ', '  #  ', '#####'),
  J: R7('  ###', '    #', '    #', '    #', '#   #', '#   #', '.###.'),
  K: R7('#   #', '#  #.', '# #..', '##...', '# #..', '#  #.', '#   #'),
  L: R7('#    ', '#    ', '#    ', '#    ', '#    ', '#    ', '#####'),
  M: R7('#   #', '##  #', '# # #', '# # #', '#   #', '#   #', '#   #'),
  N: R7('#   #', '##  #', '# # #', '#  ##', '#   #', '#   #', '#   #'),
  O: R7('.###.', '#   #', '#   #', '#   #', '#   #', '#   #', '.###.'),
  P: R7('####.', '#   #', '#   #', '####.', '#    ', '#    ', '#    '),
  Q: R7('.###.', '#   #', '#   #', '#   #', '# # #', '#  #.', '.## #'),
  R: R7('####.', '#   #', '#   #', '####.', '# #..', '#  #.', '#   #'),
  S: R7('.####', '#    ', '#    ', '.###.', '    #', '    #', '####.'),
  T: R7('#####', '  #  ', '  #  ', '  #  ', '  #  ', '  #  ', '  #  '),
  U: R7('#   #', '#   #', '#   #', '#   #', '#   #', '#   #', '.###.'),
  V: R7('#   #', '#   #', '#   #', '#   #', '#   #', ' # #.', '  #  '),
  W: R7('#   #', '#   #', '#   #', '# # #', '# # #', '##  #', '#   #'),
  X: R7('#   #', ' # #.', '  #  ', ' # #.', '#   #', '#   #', '#   #'),
  Y: R7('#   #', ' # #.', '  #  ', '  #  ', '  #  ', '  #  ', '  #  '),
  Z: R7('#####', '    #', '   #.', '  #..', ' #...', '#    ', '#####'),
  ' ': R7('     ', '     ', '     ', '     ', '     ', '     ', '     '),
  '·': R7('     ', '     ', '     ', '  #  ', '     ', '     ', '     '),
  '-': R7('     ', '     ', '     ', '#####', '     ', '     ', '     '),
};
const fold = s => s.normalize('NFD').replace(/[\u0300-\u0308]/g, '').replace(/ß/g, 'S').toUpperCase();
function text(s, x, y, px, c, a) {
  const w = s.length * 6 * px - px;                    // Textbreite in Puffernormierung
  if (x + w > BW - 22 * S) x = BW - 22 * S - w;        // nie am Rand abschneiden
  if (x < 22 * S) x = 22 * S;
  let cur = x;
  for (const ch of fold(s)) {
    const g = FONT[ch] || FONT[' '];
    for (let gy = 0; gy < 7; gy++) for (let gx = 0; gx < 5; gx++) {
      if (g[gy][gx] !== '#') continue;
      for (let oy = 0; oy < px; oy++) for (let ox = 0; ox < px; ox++) splat(cur + gx * px + ox, y + gy * px + oy, c, a);
    }
    cur += 6 * px;
  }
  return cur;
}
const off = n => n * S;
text('STURMSCHES KONOID', 40 * S, 34 * S, 5 * S, [0.95, 0.97, 1.0], 0.95);
text('ZWEI BILDLINIEN - KLEINSTER VERWIRRUNGSKREIS', 42 * S, 88 * S, 2 * S, [0.60, 0.78, 0.98], 0.9);
{
  const q1 = project([0, -hTan, bT]), q2 = project([-hSag, 0, bS]), q3 = project([0, 0, -gDraw]);
  text('BILDLINIE I', q1[0] - off(28), q1[1] + off(10), 2 * S, COL.tan, 1);
  text('BILDLINIE II', q2[0] - off(24), q2[1] - off(22), 2 * S, COL.sag, 1);
  text('LEUCHTPUNKT', q3[0] - off(14), q3[1] + off(14), 2 * S, [0.98, 0.84, 0.60], 1);
  text('LINSE', project([0, -P.R, 0])[0] - off(6), project([0, -P.R, 0])[1] - off(18), 2 * S, COL.rim, 0.95);
}

/* ---------- Herunterrechnen, Tonewarp, PNG ---------- */
const out = Buffer.alloc(W * H * 3);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  let r = 0, g = 0, b = 0;
  for (let oy = 0; oy < S; oy++) for (let ox = 0; ox < S; ox++) {
    const i = (((y * S + oy) * BW) + (x * S + ox)) * 3;
    r += buf[i]; g += buf[i + 1]; b += buf[i + 2];
  }
  const n = S * S, j = (y * W + x) * 3, tone = v => 255 * (1 - Math.exp(-v * 2.6));
  out[j] = Math.min(255, tone(r / n)); out[j + 1] = Math.min(255, tone(g / n)); out[j + 2] = Math.min(255, tone(b / n));
}

const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = bytes => (bytes.reduce((c, x) => (crcTable[(c ^ x) & 255] ^ (c >>> 8)) >>> 0, 0xffffffff) ^ 0xffffffff) >>> 0;
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const t = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crcBuf]);
}
const raw = Buffer.alloc(H * (W * 3 + 1));
for (let y = 0; y < H; y++) { raw[y * (W * 3 + 1)] = 0; out.copy(raw, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3); }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
writeFileSync(process.argv[2] || 'vorschau.png', Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
]));
console.log(`vorschau: ${W}x${H}  bT=${bT.toFixed(1)} bS=${bS.toFixed(1)} bK=${bK.toFixed(1)}  R=${(P.R * Math.abs(1 - bK / bT)).toFixed(2)} mm  scale=${(scale / S).toFixed(1)} px/mm`);
