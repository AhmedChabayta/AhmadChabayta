// Generates the PWA icon set for VOID INVADERS as real PNGs — no deps.
// Pixels are computed procedurally (space gradient + neon ship + glow),
// then encoded with Node's zlib (PNG = zlib-deflated filtered scanlines).
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");
mkdirSync(OUT, { recursive: true });

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return (buf) => {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = t[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
})();

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(CRC(td), 0);
  return Buffer.concat([len, td, crc]);
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0; // filter: none
    rgba.copy(raw, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const smooth = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};
const mix = (a, b, t) => a + (b - a) * t;
// Signed distance to triangle (iquilezles).
function sdTri(px, py, ax, ay, bx, by, cx, cy) {
  const e0x = bx - ax, e0y = by - ay, e1x = cx - bx, e1y = cy - by, e2x = ax - cx, e2y = ay - cy;
  const v0x = px - ax, v0y = py - ay, v1x = px - bx, v1y = py - by, v2x = px - cx, v2y = py - cy;
  const d0 = clamp((v0x * e0x + v0y * e0y) / (e0x * e0x + e0y * e0y), 0, 1);
  const p0x = v0x - e0x * d0, p0y = v0y - e0y * d0;
  const d1 = clamp((v1x * e1x + v1y * e1y) / (e1x * e1x + e1y * e1y), 0, 1);
  const p1x = v1x - e1x * d1, p1y = v1y - e1y * d1;
  const d2 = clamp((v2x * e2x + v2y * e2y) / (e2x * e2x + e2y * e2y), 0, 1);
  const p2x = v2x - e2x * d2, p2y = v2y - e2y * d2;
  const s = Math.sign(e0x * e2y - e0y * e2x);
  const dd = Math.min(
    Math.min(p0x * p0x + p0y * p0y, p1x * p1x + p1y * p1y),
    p2x * p2x + p2y * p2y,
  );
  const sg = Math.min(
    Math.min(s * (v0x * e0y - v0y * e0x), s * (v1x * e1y - v1y * e1x)),
    s * (v2x * e2y - v2y * e2x),
  );
  return -Math.sqrt(dd) * Math.sign(sg);
}

function render(size, maskable) {
  const rgba = Buffer.alloc(size * size * 4);
  const pad = maskable ? 0.16 : 0.0; // keep art inside the maskable safe zone
  const stars = [
    [0.18, 0.22, 0.9], [0.82, 0.15, 0.7], [0.7, 0.78, 0.85],
    [0.26, 0.74, 0.6], [0.9, 0.55, 0.5], [0.5, 0.12, 0.55], [0.12, 0.55, 0.45],
  ];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // uv in -1..1, with maskable padding pulling art toward center
      let u = (x / size) * 2 - 1;
      let v = (y / size) * 2 - 1;
      const us = u, vs = v;
      u /= 1 - pad * 1.2;
      v /= 1 - pad * 1.2;
      const r = Math.sqrt(us * us + vs * vs);

      // deep space background
      let R = mix(10, 30, smooth(1.3, -0.2, r));
      let G = mix(2, 6, smooth(1.3, -0.2, r));
      let B = mix(16, 60, smooth(1.3, -0.2, r));
      R += 22 * Math.exp(-((u + 0.05) ** 2 + (v + 0.25) ** 2) * 2.0); // magenta nebula
      B += 50 * Math.exp(-((u + 0.05) ** 2 + (v + 0.25) ** 2) * 2.0);
      G += 6 * Math.exp(-((u - 0.3) ** 2 + (v - 0.4) ** 2) * 3.0);
      B += 30 * Math.exp(-((u - 0.3) ** 2 + (v - 0.4) ** 2) * 3.0);

      // orbit ring
      const ring = Math.exp(-Math.abs(r - 0.86) * 26) * smooth(1.05, 0.7, r);
      R += 90 * ring; G += 40 * ring; B += 120 * ring;

      // stars
      for (const [sx, sy, sb] of stars) {
        const d = Math.hypot(u - (sx * 2 - 1), v - (sy * 2 - 1));
        const g = Math.exp(-d * 34) * sb;
        R += 200 * g; G += 220 * g; B += 255 * g;
      }

      // ship — chevron body + fins + thruster, glowing
      const sxp = u, syp = v + 0.04;
      const dBody = sdTri(sxp, syp, 0, -0.62, 0.5, 0.42, -0.5, 0.42);
      const dNotch = sdTri(sxp, syp, 0, 0.5, 0.34, 0.18, -0.34, 0.18);
      let d = Math.max(dBody, -dNotch);
      const dFinL = sdTri(sxp, syp, -0.5, 0.42, -0.86, 0.62, -0.32, 0.26);
      const dFinR = sdTri(sxp, syp, 0.5, 0.42, 0.86, 0.62, 0.32, 0.26);
      d = Math.min(d, Math.min(dFinL, dFinR));

      const core = smooth(0.02, -0.05, d);
      const edge = smooth(0.012, -0.012, d);
      const glow = Math.exp(clamp(d, 0, 2) * -7.0);
      // cyan body, hot white core, orange leading edge
      const cR = mix(40, 255, core) + 255 * (1 - core) * edge;
      const cG = mix(240, 255, core);
      const cB = mix(255, 220, core);
      R = mix(R, cR, edge);
      G = mix(R === cR ? G : G, cG, edge); // (kept simple; edge dominates)
      G = mix(G, cG, edge);
      B = mix(B, cB, edge);
      R += 120 * glow; G += 180 * glow; B += 230 * glow;

      // thruster plume
      const pl = Math.exp(-(((u) ** 2) * 70 + ((v - 0.62) ** 2) * 26)) *
        smooth(0.38, 0.62, v);
      R += 255 * pl; G += 140 * pl; B += 40 * pl;

      // vignette
      const vig = smooth(1.45, 0.4, r);
      R *= mix(0.45, 1, vig); G *= mix(0.45, 1, vig); B *= mix(0.45, 1, vig);

      const i = (y * size + x) * 4;
      rgba[i] = clamp(Math.round(R), 0, 255);
      rgba[i + 1] = clamp(Math.round(G), 0, 255);
      rgba[i + 2] = clamp(Math.round(B), 0, 255);
      rgba[i + 3] = 255;
    }
  }
  return encodePNG(size, size, rgba);
}

const targets = [
  ["icon-192.png", 192, false],
  ["icon-512.png", 512, false],
  ["icon-maskable-512.png", 512, true],
  ["apple-touch-icon.png", 180, false],
  ["icon-64.png", 64, false],
];
for (const [name, size, mask] of targets) {
  writeFileSync(join(OUT, name), render(size, mask));
  console.log("wrote", name, size + "x" + size);
}
