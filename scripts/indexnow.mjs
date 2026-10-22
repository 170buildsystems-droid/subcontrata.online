// Avisa a los buscadores de IndexNow (Bing, Yandex, Seznam, Naver, Yep y los que
// beben de Bing: DuckDuckGo, Ecosia, Qwant, ChatGPT/Copilot) de todas las URLs
// del sitemap. Google no participa: a Google se le da el sitemap en Search
// Console. Se ejecuta tras cada publicación (npm run publicar).
import { readdirSync, readFileSync } from "node:fs";
import { SITIO } from "../src/data/sitio.mjs";

const clave = readdirSync("public").find((f) => /^[a-f0-9]{32}\.txt$/.test(f))?.replace(".txt", "");
if (!clave) { console.error("Falta public/<clave>.txt"); process.exit(1); }
const host = new URL(SITIO.url).host;

const comprobacion = await fetch(`${SITIO.url}/${clave}.txt`).then((r) => r.ok ? r.text() : "").catch(() => "");
if (comprobacion.trim() !== clave) { console.error(`La clave aún no está publicada en ${SITIO.url}/${clave}.txt; espera al despliegue y repite.`); process.exit(1); }

const xml = readFileSync("dist/sitemap.xml", "utf8");
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const r = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key: clave, keyLocation: `${SITIO.url}/${clave}.txt`, urlList }),
});
const motivos = { 200: "aceptado", 202: "recibido; la clave se validará en unos minutos", 400: "petición inválida", 403: "clave no válida o no publicada", 422: "URLs no pertenecen al host", 429: "demasiadas peticiones" };
console.log(`IndexNow: ${urlList.length} URLs → ${r.status} ${motivos[r.status] ?? ""}`);
process.exit(r.status === 200 || r.status === 202 ? 0 : 1);
