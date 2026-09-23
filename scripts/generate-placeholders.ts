/**
 * Genera le immagini segnaposto del sito: composizioni astratte da club notturno,
 * senza persone né sagome. Deterministico: stesso seed → stesso file.
 *
 *   npm run placeholders
 *
 * Output:
 *   public/placeholders/*.webp   immagini di esempio (in seguito caricate su Supabase dal seed)
 *   public/brand/favicon.svg            la «Z» al neon
 *   public/brand/favicon.svg
 *   public/og-image.webp / og-image.jpg
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import opentype from "opentype.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "placeholders");
const brandDir = path.join(root, "public", "brand");
mkdirSync(outDir, { recursive: true });
mkdirSync(brandDir, { recursive: true });

/* ---------- PRNG deterministico ---------- */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Palette = { base: string; deep: string; a: string; b: string; c: string };

const palettes: Record<string, Palette> = {
  // I due tubi del logo sono sempre «a» e «b»; «c» è l'anima accesa.
  default: { base: "#07040A", deep: "#1C1224", a: "#E939D7", b: "#3B81E9", c: "#F6EDF7" },
  "notte-bianca": { base: "#0A070E", deep: "#241B2C", a: "#E8B7F0", b: "#7FB2FF", c: "#FFFFFF" },
  "red-velvet": { base: "#0B040A", deep: "#3A0A28", a: "#FF2E83", b: "#8E1F83", c: "#FFE6FB" },
  halloween: { base: "#07050A", deep: "#1E0D2B", a: "#F06A2A", b: "#A34BE8", c: "#F6EDF7" },
  gatsby: { base: "#080609", deep: "#221A0F", a: "#E9C349", b: "#3B81E9", c: "#F6EDF7" },
  uniform: { base: "#06080C", deep: "#141F2E", a: "#3B81E9", b: "#E939D7", c: "#E4EEFF" },
  carnevale: { base: "#08050B", deep: "#26103A", a: "#8E2BC0", b: "#E939D7", c: "#F6EDF7" },
  neon: { base: "#050507", deep: "#140B1C", a: "#E939D7", b: "#3B81E9", c: "#FFE6FB" },
};

/* ---------- mattoni SVG ---------- */
const defsCommon = (w: number, h: number) => `
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n"/>
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="table" tableValues="0 0.10"/></feComponentTransfer>
  </filter>
  <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${Math.round(w / 90)}"/></filter>
  <filter id="softer" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${Math.round(w / 30)}"/></filter>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${Math.round(w / 160)}"/></filter>
  <radialGradient id="vignette" cx="50%" cy="50%" r="75%">
    <stop offset="55%" stop-color="#000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#000" stop-opacity="0.75"/>
  </radialGradient>
  <rect id="full" width="${w}" height="${h}"/>`;

function base(w: number, h: number, p: Palette, rnd: () => number) {
  const cx = 30 + rnd() * 40;
  const cy = 20 + rnd() * 50;
  return `
  <radialGradient id="bgGlow" cx="${cx}%" cy="${cy}%" r="80%">
    <stop offset="0%" stop-color="${p.deep}"/>
    <stop offset="100%" stop-color="${p.base}"/>
  </radialGradient>
  <rect width="${w}" height="${h}" fill="url(#bgGlow)"/>`;
}

function beams(w: number, h: number, p: Palette, rnd: () => number, count = 5) {
  let s = "";
  for (let i = 0; i < count; i++) {
    const x = w * (0.15 + rnd() * 0.7);
    const spread = w * (0.08 + rnd() * 0.18);
    const tilt = (rnd() - 0.5) * w * 0.6;
    const color = rnd() > 0.35 ? p.a : p.b;
    const id = `beam${i}`;
    s += `
    <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${color}" stop-opacity="${0.55 + rnd() * 0.3}"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </linearGradient>
    <polygon points="${x},${-h * 0.05} ${x + tilt - spread},${h * 1.05} ${x + tilt + spread},${h * 1.05}" fill="url(#${id})" filter="url(#soft)" opacity="0.8"/>`;
  }
  return s;
}

function bokeh(w: number, h: number, p: Palette, rnd: () => number, count = 36, band?: [number, number]) {
  let s = `<radialGradient id="dot"><stop offset="0%" stop-color="#fff" stop-opacity="0.9"/><stop offset="60%" stop-color="#fff" stop-opacity="0.35"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></radialGradient>`;
  const colors = [p.a, p.a, p.b, p.c];
  for (let i = 0; i < count; i++) {
    const r = w * (0.008 + rnd() * rnd() * 0.06);
    const x = rnd() * w;
    const y = band ? h * (band[0] + rnd() * (band[1] - band[0])) : rnd() * h;
    const col = colors[Math.floor(rnd() * colors.length)];
    // Tutto fuori fuoco: i dischi grandi sono i più sfocati, come in un obiettivo aperto.
    const big = r > w * 0.025;
    const blur = big ? ` filter="url(#soft)"` : ` filter="url(#glow)"`;
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(big ? r * 1.4 : r).toFixed(1)}" fill="${col}" opacity="${(0.14 + rnd() * 0.4).toFixed(2)}"${blur}/>`;
  }
  return s;
}

function velvet(w: number, h: number, p: Palette, seed: number) {
  return `
  <filter id="velvetF" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.0025 0.06" numOctaves="3" seed="${seed}"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.4 -0.35"/>
  </filter>
  <rect width="${w}" height="${h}" fill="${p.deep}" opacity="0.9"/>
  <rect width="${w}" height="${h}" filter="url(#velvetF)" fill="#000" opacity="0.85"/>`;
}

function goldLines(w: number, h: number, p: Palette, rnd: () => number, count = 4) {
  let s = "";
  for (let i = 0; i < count; i++) {
    const y0 = h * (0.2 + rnd() * 0.6);
    const y1 = y0 + (rnd() - 0.5) * h * 0.5;
    const c1 = y0 + (rnd() - 0.5) * h * 0.8;
    const d = `M ${-w * 0.05} ${y0} C ${w * 0.35} ${c1}, ${w * 0.65} ${y1 - (c1 - y0)}, ${w * 1.05} ${y1}`;
    const sw = Math.max(1.2, w / 900);
    s += `<path d="${d}" stroke="${p.a}" stroke-width="${sw * 5}" fill="none" opacity="0.25" filter="url(#glow)"/>`;
    s += `<path d="${d}" stroke="${p.a}" stroke-width="${sw}" fill="none" opacity="0.8"/>`;
  }
  return s;
}

function neon(w: number, h: number, p: Palette, rnd: () => number) {
  let s = "";
  const shapes = 2 + Math.floor(rnd() * 2);
  for (let i = 0; i < shapes; i++) {
    const col = i % 2 ? p.b : p.a;
    const sw = w / 260;
    const cx = w * (0.2 + rnd() * 0.6);
    const cy = h * (0.25 + rnd() * 0.5);
    const r = Math.min(w, h) * (0.12 + rnd() * 0.22);
    const shape =
      rnd() > 0.5
        ? `<circle cx="${cx}" cy="${cy}" r="${r}"`
        : `<rect x="${cx - r}" y="${cy - r * 0.6}" width="${r * 2}" height="${r * 1.2}" rx="${r * 0.6}"`;
    s += `${shape} fill="none" stroke="${col}" stroke-width="${sw * 6}" opacity="0.35" filter="url(#soft)"/>`;
    s += `${shape} fill="none" stroke="${col}" stroke-width="${sw}" opacity="0.95"/>`;
  }
  return s;
}

function smoke(w: number, h: number, seed: number, opacity = 0.35) {
  return `
  <filter id="smokeF" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.004 0.009" numOctaves="4" seed="${seed}"/>
    <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.6 -0.7"/>
  </filter>
  <rect width="${w}" height="${h}" filter="url(#smokeF)" opacity="${opacity}"/>`;
}

function finish(w: number, h: number) {
  return `<rect width="${w}" height="${h}" fill="url(#vignette)"/><rect width="${w}" height="${h}" filter="url(#grain)"/>`;
}

type Recipe = "stage" | "velvet" | "mix" | "event" | "show" | "themeBg";

function compose(recipe: Recipe, w: number, h: number, p: Palette, seed: number) {
  const rnd = mulberry32(seed);
  let body = base(w, h, p, rnd);
  switch (recipe) {
    case "stage":
      body += smoke(w, h, seed, 0.18) + beams(w, h, p, rnd, 6) + bokeh(w, h, p, rnd, 40, [0.55, 1]);
      break;
    case "velvet":
      body += velvet(w, h, p, seed) + goldLines(w, h, p, rnd, 3) + bokeh(w, h, p, rnd, 22, [0.1, 0.45]);
      break;
    case "mix": {
      const v = rnd();
      if (v < 0.33) body += neon(w, h, p, rnd) + bokeh(w, h, p, rnd, 26);
      else if (v < 0.66) body += beams(w, h, p, rnd, 4) + smoke(w, h, seed, 0.22) + bokeh(w, h, p, rnd, 30);
      else body += velvet(w, h, p, seed) + neon(w, h, p, rnd) + goldLines(w, h, p, rnd, 2);
      break;
    }
    case "event":
      body += smoke(w, h, seed, 0.2) + beams(w, h, p, rnd, 4) + goldLines(w, h, p, rnd, 2) + bokeh(w, h, p, rnd, 34);
      break;
    case "show":
      body += beams(w, h, p, rnd, 7) + smoke(w, h, seed, 0.25) + bokeh(w, h, p, rnd, 18, [0.7, 1]);
      break;
    case "themeBg":
      body += velvet(w, h, p, seed) + smoke(w, h, seed, 0.15) + beams(w, h, p, rnd, 3) + bokeh(w, h, p, rnd, 30, [0.5, 1]);
      break;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defsCommon(w, h)}</defs>${body}${finish(w, h)}</svg>`;
}

async function render(file: string, recipe: Recipe, w: number, h: number, palette: string, seed: number) {
  const p = palettes[palette];
  if (!p) throw new Error(`palette mancante: ${palette}`);
  const svg = compose(recipe, w, h, p, seed);
  await sharp(Buffer.from(svg)).webp({ quality: 82 }).toFile(path.join(outDir, file));
  // Miniatura 480px sul lato lungo, come nella pipeline reale.
  const thumb = file.replace(/\.webp$/, "-480.webp");
  const resize = w >= h ? { width: 480 } : { height: 480 };
  await sharp(path.join(outDir, file)).resize(resize).webp({ quality: 78 }).toFile(path.join(outDir, thumb));
  process.stdout.write(".");
}

/* ---------- favicon: la sola «Z», nel font dei tubi ---------- */
function loadFont(pkg: string, file: string) {
  const buf = readFileSync(path.join(root, "node_modules", "@fontsource", pkg, "files", file));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

async function buildFavicon() {
  const neon = loadFont("tilt-neon", "tilt-neon-latin-400-normal.woff");
  const z = neon.getPath("Z", 0, 0, 46);
  const b = z.getBoundingBox();
  const fx = (64 - (b.x2 - b.x1)) / 2 - b.x1;
  const fy = (64 - (b.y2 - b.y1)) / 2 - b.y1;
  writeFileSync(
    path.join(brandDir, "favicon.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#07040A"/><path transform="translate(${fx.toFixed(1)} ${fy.toFixed(1)})" fill="#E939D7" d="${z.toPathData(2)}"/></svg>\n`,
  );
}

async function buildOg() {
  const w = 1200;
  const h = 630;
  const bg = await sharp(Buffer.from(compose("stage", w, h, palettes.default!, 4242))).png().toBuffer();
  const signW = Math.round(w * 0.74);
  const sign = await sharp(path.join(brandDir, "insegna-neon.webp")).resize(signW).png().toBuffer();
  const signH = Math.round((signW * 352) / 1600);
  const out = sharp(bg).composite([{ input: sign, left: Math.round((w - signW) / 2), top: Math.round((h - signH) / 2) }]);
  await out.clone().webp({ quality: 85 }).toFile(path.join(root, "public", "og-image.webp"));
  await out.clone().jpeg({ quality: 86 }).toFile(path.join(root, "public", "og-image.jpg"));
}

async function main() {
  mkdirSync(path.join(root, "src", "components", "brand"), { recursive: true });
  await buildFavicon();
  await buildOg();

  const jobs: Array<Parameters<typeof render>> = [];
  ["default", "gatsby", "red-velvet"].forEach((pal, i) => jobs.push([`hero-0${i + 1}.webp`, "stage", 2400, 1350, pal, 100 + i]));
  for (let i = 1; i <= 4; i++) jobs.push([`locale-0${i}.webp`, "velvet", 1600, 1067, i % 2 ? "default" : "red-velvet", 200 + i]);
  const galleryPalettes = ["default", "neon", "red-velvet", "gatsby", "halloween", "carnevale", "notte-bianca", "uniform"];
  for (let i = 1; i <= 16; i++) {
    const land = i % 2 === 1;
    const n = String(i).padStart(2, "0");
    jobs.push([`gallery-${n}.webp`, "mix", land ? 1600 : 1067, land ? 1067 : 1600, galleryPalettes[(i - 1) % galleryPalettes.length]!, 300 + i]);
  }
  ["notte-bianca", "red-velvet", "halloween", "gatsby", "uniform", "carnevale"].forEach((t, i) =>
    jobs.push([`event-${t}.webp`, "event", 1600, 900, t, 400 + i]),
  );
  ["default", "neon", "gatsby", "red-velvet"].forEach((pal, i) => jobs.push([`show-0${i + 1}.webp`, "show", 1600, 1067, pal, 500 + i]));
  ["notte-bianca", "red-velvet", "halloween", "gatsby"].forEach((t, i) => jobs.push([`theme-bg-${t}.webp`, "themeBg", 2400, 1350, t, 700 + i]));

  for (const job of jobs) await render(...job);
  process.stdout.write(`\n${jobs.length} immagini in public/placeholders, favicon e og-image aggiornate.\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
