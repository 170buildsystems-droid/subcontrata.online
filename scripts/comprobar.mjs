// Comprobaciones tras el build: enlaces internos, H1 único, títulos, CTAs con utm, tamaño.
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const DIST = "dist";
const errores = [];
const avisos = [];

async function html(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await html(p)));
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}
async function existe(p) { try { await stat(p); return true; } catch { return false; } }

const ficheros = await html(DIST);
for (const f of ficheros) {
  const rel = "/" + relative(DIST, f).replace(/\\/g, "/");
  const src = await readFile(f, "utf8");
  const h1 = (src.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) errores.push(`${rel}: ${h1} h1`);
  const titulo = (src.match(/<title>(.*?)<\/title>/) || [])[1] || "";
  const desc = (src.match(/name="description" content="(.*?)"/) || [])[1] || "";
  if (!titulo) errores.push(`${rel}: sin <title>`);
  if (titulo.length > 60) avisos.push(`${rel}: título ${titulo.length} car.`);
  if (desc.length > 155) avisos.push(`${rel}: descripción ${desc.length} car.`);
  if (!/rel="canonical"/.test(src)) errores.push(`${rel}: sin canonical`);
  for (const m of src.matchAll(/<img\b[^>]*>/g)) if (!/\balt=/.test(m[0])) errores.push(`${rel}: img sin alt`);
  for (const m of src.matchAll(/href="(https?:\/\/reformapresupuesto\.com\/solicitar[^"]*)"/g)) {
    const u = m[1].replace(/&amp;/g, "&");
    for (const k of ["utm_source=", "utm_medium=landing", "utm_campaign=", "utm_content="]) if (!u.includes(k)) errores.push(`${rel}: CTA sin ${k}`);
  }
  for (const m of src.matchAll(/href="(\/[^"#?]*)/g)) {
    const h = m[1];
    const cands = h.endsWith("/") ? [join(DIST, h, "index.html")] : [join(DIST, h + ".html"), join(DIST, h), join(DIST, h, "index.html")];
    let ok = false;
    for (const c of cands) if (await existe(c)) { ok = true; break; }
    if (!ok) errores.push(`${rel}: enlace roto ${h}`);
  }
  const bytes = Buffer.byteLength(src);
  if (bytes > 1024 * 1024) errores.push(`${rel}: ${(bytes / 1024).toFixed(0)} KB > 1 MB`);
}
for (const extra of ["sitemap.xml", "robots.txt", "styles.css", "app.js", "logo.svg", "404.html", "_headers", "_redirects"]) {
  if (!(await existe(join(DIST, extra)))) errores.push(`falta ${extra}`);
}
console.log(`${ficheros.length} páginas comprobadas.`);
for (const a of avisos) console.log("aviso:", a);
for (const e of errores) console.log("ERROR:", e);
if (errores.length) process.exit(1);
console.log("✔ sin errores");
