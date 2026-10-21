// Generador estático de subcontrata.online. Sin dependencias: `node build.mjs` → dist/
import { mkdir, rm, writeFile, cp, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { SITIO, TIPOS, URGENCIAS, CALIDADES } from "./src/data/sitio.mjs";
import { GREMIOS } from "./src/data/gremios.mjs";
import { PRESUPUESTOS } from "./src/data/presupuestos.mjs";
import { CIUDADES } from "./src/data/ciudades.mjs";
import { FAQS } from "./src/data/faqs.mjs";

const DIST = "dist";
// BASE_PATH=/repo para previsualizar en usuario.github.io/repo; vacío en producción.
const BASE = (process.env.BASE_PATH || "").replace(/\/$/, "");
const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const paginas = []; // { ruta, titulo, descripcion, prioridad, claves }

// URL de CTA con atribución completa (formato obligatorio del brief)
function urlCta({ tipo = "", ciudad = "", cp = "", campaign, content, term = "" }) {
  const p = new URLSearchParams();
  if (tipo) p.set("tipo", tipo);
  if (ciudad) p.set("ciudad", ciudad);
  if (cp) p.set("cp", cp);
  p.set("utm_source", SITIO.dominio);
  p.set("utm_medium", "landing");
  p.set("utm_campaign", campaign);
  p.set("utm_content", content);
  if (term) p.set("utm_term", term);
  return `${SITIO.destino}?${p.toString()}`;
}

const boton = (texto, href, content, extra = "") =>
  `<a class="btn btn-accion ${extra}" href="${esc(href)}" data-cta="${esc(content)}">${esc(texto)} →</a>`;

// ---------- Formulario de dos pasos ----------
function formulario({ tipo = "", ciudad = "", cp = "", campaign, content = "formulario", titulo = "¿Qué necesitas?" }) {
  const pasoTipo = tipo
    ? `<div class="paso" data-paso="1" hidden></div>`
    : `<div class="paso" data-paso="1">
        <p class="paso-titulo"><span class="num">1</span> ${esc(titulo)}</p>
        <div class="tipos" role="group" aria-label="Tipo de trabajo">
          ${TIPOS.map((t) => `<button type="button" class="tipo" data-tipo="${esc(t)}">${esc(t)}</button>`).join("")}
        </div>
      </div>`;
  return `
<section class="form-card" id="solicitar" aria-labelledby="form-h">
  <h2 id="form-h" class="form-h">${tipo ? `Pide presupuesto de ${esc(tipo.toLowerCase())}` : "Publica tu obra en 2 minutos"}</h2>
  <form class="solicitud" data-campaign="${esc(campaign)}" data-content="${esc(content)}" data-tipo-fijo="${esc(tipo)}" novalidate>
    <input type="hidden" name="tipo" value="${esc(tipo)}">
    ${pasoTipo}
    <div class="paso" data-paso="2" ${tipo ? "" : "hidden"}>
      <p class="paso-titulo"><span class="num">${tipo ? "1" : "2"}</span> ¿Dónde es la obra?</p>
      <p class="elegido" data-elegido ${tipo ? "hidden" : ""}>Has elegido: <strong data-elegido-txt></strong> <button type="button" class="enlace" data-cambiar>cambiar</button></p>
      <div class="fila">
        <label>Ciudad<input name="ciudad" type="text" autocomplete="address-level2" required value="${esc(ciudad)}" placeholder="Madrid"></label>
        <label>Código postal<input name="cp" type="text" inputmode="numeric" pattern="[0-9]{5}" maxlength="5" autocomplete="postal-code" required value="${esc(cp)}" placeholder="28001"></label>
      </div>
      <div class="fila">
        <label>¿Para cuándo?<select name="urgencia">${URGENCIAS.map((u) => `<option value="${esc(u.v)}">${esc(u.t)}</option>`).join("")}</select></label>
        <label>m² aproximados <span class="opc">(opcional)</span><input name="superficie" type="number" min="1" max="5000" inputmode="numeric" placeholder="80"></label>
      </div>
      <div class="fila">
        <label>Calidad <span class="opc">(opcional)</span><select name="calidad"><option value="">Sin definir</option>${CALIDADES.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join("")}</select></label>
        <label class="check"><input type="checkbox" name="empresa"> Soy empresa o autónomo y necesito subcontratar</label>
      </div>
      <p class="aviso-legal-form">Al continuar serás llevado a ${esc(SITIO.destinoNombre)}, donde completarás tu solicitud. Responsable del tratamiento: ${esc(SITIO.titular)}. Más información en la <a href="/privacidad">política de privacidad</a>.</p>
      <p class="error" data-error hidden role="alert"></p>
      <button type="submit" class="btn btn-accion btn-grande" data-txt-particular="Ver presupuestos gratis →" data-txt-empresa="Pedir cuadrilla →">Ver presupuestos gratis →</button>
      <p class="sin-tarjeta">Sin tarjeta. Sin compromiso. Los profesionales pagan la plataforma, tú no.</p>
    </div>
  </form>
</section>`;
}

// ---------- Plantilla ----------
function pagina({ ruta, titulo, descripcion, cuerpo, jsonld = [], noindex = false, prioridad = "0.6", claves = [], campaign = "general" }) {
  const url = SITIO.url + (ruta === "/" ? "/" : ruta);
  const migas = [{ n: "Inicio", u: "/" }];
  const partes = ruta.split("/").filter(Boolean);
  let acumulado = "";
  for (const p of partes) {
    acumulado += "/" + p;
    const idx = acumulado.endsWith("/") ? acumulado : acumulado;
    migas.push({ n: p.replace(/-/g, " "), u: partes.indexOf(p) === partes.length - 1 ? ruta : idx + "/" });
  }
  const breadcrumb = ruta === "/" ? null : {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: migas.map((m, i) => ({ "@type": "ListItem", position: i + 1, name: m.n, item: SITIO.url + (m.u === "/" ? "/" : m.u) })),
  };
  const ld = [...jsonld, breadcrumb].filter(Boolean);
  const gtm = SITIO.gtmId
    ? `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});</script>
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${SITIO.gtmId}');</script>`
    : `<script>window.dataLayer=window.dataLayer||[];</script>`;
  if (!noindex) paginas.push({ ruta, titulo, descripcion, prioridad, claves });
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descripcion)}">
<link rel="canonical" href="${esc(url)}">
${noindex ? '<meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(SITIO.nombre)}">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descripcion)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${SITIO.url}/og.png">
<meta property="og:locale" content="es_ES">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0f172a">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/styles.css">
<script>window.SC={ads:${JSON.stringify(SITIO.adsConversion)},destino:${JSON.stringify(SITIO.destino)},dominio:${JSON.stringify(SITIO.dominio)}};</script>
${gtm}
${ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n")}
</head>
<body>
<a class="saltar" href="#contenido">Saltar al contenido</a>
<header class="cabecera">
  <div class="contenedor cabecera-int">
    <a class="marca" href="/" aria-label="${esc(SITIO.nombre)}, inicio"><img src="/logo.svg" alt="" width="36" height="36"><span>subcontrata<b>.online</b></span></a>
    <nav class="nav" aria-label="Principal">
      <a href="/subcontratar/">Subcontratar</a>
      <a href="/presupuesto/">Presupuestos</a>
      <a href="/como-funciona">Cómo funciona</a>
    </nav>
    <a class="btn btn-accion btn-cab" href="#solicitar" data-cta="cabecera">Presupuesto gratis</a>
  </div>
</header>
<main id="contenido">
${cuerpo}
</main>
<footer class="pie">
  <div class="contenedor pie-int">
    <div>
      <p class="pie-marca">subcontrata<b>.online</b></p>
      <p>Puerta de entrada a <a href="https://${esc(SITIO.destinoNombre)}" rel="noopener">${esc(SITIO.destinoNombre)}</a>, plataforma de ${esc(SITIO.titular)}. Para quien pide, gratis.</p>
    </div>
    <nav aria-label="Subcontratar"><p class="pie-t">Subcontratar</p>${GREMIOS.map((g) => `<a href="/subcontratar/${g.slug}">${esc(g.nombre)}</a>`).join("")}</nav>
    <nav aria-label="Presupuestos"><p class="pie-t">Presupuestos</p>${PRESUPUESTOS.map((p) => `<a href="/presupuesto/${p.slug}">${esc(p.tipo)}</a>`).join("")}<p class="pie-t">Ciudades</p><a href="/subcontratar-en/">Las 15 ciudades</a></nav>
    <nav aria-label="Legal"><p class="pie-t">Información</p><a href="/como-funciona">Cómo funciona</a><a href="/preguntas-frecuentes">Preguntas frecuentes</a><a href="/contacto">Contacto</a><a href="/aviso-legal">Aviso legal</a><a href="/privacidad">Privacidad</a><a href="/cookies">Cookies</a><button type="button" class="enlace" data-abrir-cookies>Configurar cookies</button></nav>
  </div>
  <p class="contenedor pie-copy">© ${SITIO.anio} ${esc(SITIO.titular)} (${esc(SITIO.nombreComercial)}). Plazos habituales, no garantizados. Los precios orientativos no constituyen oferta.</p>
</footer>
<a class="btn btn-accion cta-fija" href="#solicitar" data-cta="fija-movil">Ver presupuestos gratis →</a>
<div class="cookies" data-cookies hidden role="dialog" aria-labelledby="ck-t" aria-live="polite">
  <p id="ck-t"><strong>Cookies.</strong> Solo usamos cookies de medición (Google Analytics) si las aceptas. Sin ellas la web funciona igual. <a href="/cookies">Más información</a></p>
  <div class="cookies-btns"><button type="button" class="btn btn-sec" data-ck="denied">Rechazar</button><button type="button" class="btn btn-accion" data-ck="granted">Aceptar</button></div>
</div>
<script src="/app.js" defer></script>
</body>
</html>`;
}

// ---------- Bloques reutilizables ----------
const faqHtml = (faqs) => `<section class="bloque" aria-labelledby="faq-h"><h2 id="faq-h">Preguntas frecuentes</h2>${faqs.map((f) => `<details class="faq"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</section>`;
const faqLd = (faqs) => ({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });
const lista = (items) => `<ul class="lista">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
const comoFunciona = () => `
<section class="bloque pasos" aria-labelledby="cf-h">
  <h2 id="cf-h">Cómo funciona</h2>
  <ol class="tres">
    <li><span class="num">1</span><strong>Describe el trabajo</strong><p>Qué necesitas y dónde. Dos pasos, sin registro, sin tarjeta.</p></li>
    <li><span class="num">2</span><strong>Te llaman profesionales verificados</strong><p>Hasta cuatro de tu provincia, habitualmente en 48 horas, con presupuesto.</p></li>
    <li><span class="num">3</span><strong>Comparas y decides</strong><p>Eliges al que más te convenza, o a ninguno. Sin comisión para quien pide.</p></li>
  </ol>
</section>`;
const pruebas = () => `
<section class="bloque tarjetas" aria-label="Qué recibes">
  <article><h3>Qué recibes</h3><p>Llamadas de profesionales que han visto tu solicitud y han decidido contactarte. Los verificados tienen NIF, nombre real, nombre comercial, teléfono y email comprobados.</p></article>
  <article><h3>Por qué es gratis</h3><p>Los profesionales pagan a ${esc(SITIO.destinoNombre)} por acceder a los contactos. Tú no pagas nada: ni cuota, ni comisión sobre la obra.</p></article>
  <article><h3>Para empresas y particulares</h3><p>Si tienes una obra y te falta un gremio, publica igual que un particular: indica que eres empresa, el alcance y el plazo.</p></article>
</section>`;
const ctaFinal = (campaign, tipo = "", ciudad = "", cp = "") => `
<section class="bloque cta-final">
  <h2>¿Empezamos?</h2>
  <p>Describe el trabajo en dos minutos. Profesionales verificados te llaman con presupuesto, habitualmente en 48 horas.</p>
  ${boton("Publicar mi obra gratis", urlCta({ tipo, ciudad, cp, campaign, content: "cta-final" }), "cta-final", "btn-grande")}
</section>`;
const enlacesGremios = (excluir = "") => `<section class="bloque"><h2>Otros gremios que puedes subcontratar</h2><p class="chips">${GREMIOS.filter((g) => g.slug !== excluir).map((g) => `<a href="/subcontratar/${g.slug}">${esc(g.nombre)}</a>`).join("")}</p></section>`;
const enlacesCiudades = (excluir = "") => `<section class="bloque"><h2>Subcontratar por ciudad</h2><p class="chips">${CIUDADES.filter((c) => c.slug !== excluir).map((c) => `<a href="/subcontratar-en/${c.slug}">${esc(c.nombre)}</a>`).join("")}</p></section>`;

async function escribir(ruta, html) {
  // eslint-disable-next-line no-param-reassign
  const fichero = ruta === "/" ? "index.html" : ruta.endsWith("/") ? ruta.slice(1) + "index.html" : ruta.slice(1) + ".html";
  const destino = join(DIST, fichero);
  await mkdir(dirname(destino), { recursive: true });
  if (BASE) html = html.replace(/(href|src)="\/(?!\/)/g, `$1="${BASE}/`);
  await writeFile(destino, html);
}

// ---------- Páginas ----------
async function portada() {
  const org = { "@context": "https://schema.org", "@type": "Organization", name: SITIO.titular, alternateName: [SITIO.nombreComercial, SITIO.nombre], url: SITIO.url, logo: SITIO.url + "/logo.svg", email: SITIO.email, telephone: "+34 " + SITIO.telefono, sameAs: ["https://" + SITIO.destinoNombre] };
  const cuerpo = `
<section class="hero">
  <div class="contenedor hero-int">
    <div class="hero-txt">
      <h1>${esc(SITIO.lema)}</h1>
      <p class="sub">Para empresas que subcontratan y para quien va a reformar su casa. Comparas, eliges y decides tú.</p>
      <ul class="ticks"><li>Sin tarjeta ni registro para pedir</li><li>Hasta 4 presupuestos de tu provincia</li><li>Profesionales con NIF y teléfono comprobados</li></ul>
    </div>
    ${formulario({ campaign: "portada", content: "form-portada" })}
  </div>
</section>
<div class="contenedor">
${comoFunciona()}
${pruebas()}
<section class="bloque" aria-labelledby="sub-h">
  <h2 id="sub-h">¿Tienes una obra y te falta un gremio?</h2>
  <p>Publica el trabajo como empresa y recibe presupuestos de subcontratas de tu provincia. Cada página te explica cómo se presupuesta ese gremio, qué plazos son normales y qué pedir por escrito.</p>
  <p class="chips">${GREMIOS.map((g) => `<a href="/subcontratar/${g.slug}">${esc(g.nombre)}</a>`).join("")}</p>
</section>
<section class="bloque" aria-labelledby="pre-h">
  <h2 id="pre-h">¿Vas a reformar tu casa?</h2>
  <p>Cuánto cuesta, qué incluye y cómo comparar presupuestos sin equivocarte. Rangos orientativos; el precio real lo fija cada presupuesto.</p>
  <p class="chips">${PRESUPUESTOS.map((p) => `<a href="/presupuesto/${p.slug}">${esc(p.titulo)}</a>`).join("")}</p>
</section>
${faqHtml(FAQS.slice(0, 5))}
${ctaFinal("portada")}
</div>`;
  await escribir("/", pagina({ ruta: "/", titulo: "Subcontratar gremios y presupuesto de reforma gratis", descripcion: "Publica tu obra gratis y profesionales verificados te llaman con presupuesto en 48 horas. Para empresas que subcontratan y para reformar tu casa.", cuerpo, jsonld: [org, faqLd(FAQS.slice(0, 5))], prioridad: "1.0", claves: ["subcontratar gremios", "buscar gremios para reforma", "presupuesto reforma gratis", "empresa de reformas cerca de mí", "pedir presupuesto reforma", "subcontratar albañiles", "profesionales verificados reforma", "presupuestos reforma comparar", "subcontrata obra", "necesito un gremio para obra"], campaign: "portada" }));
}

async function indiceSubcontratar() {
  const cuerpo = `<div class="contenedor"><section class="bloque"><h1>Subcontratar un gremio para tu obra</h1>
<p class="sub">Tienes la obra y te falta mano de obra. Elige el gremio: te explicamos cómo se presupuesta, plazos normales y qué pedir por escrito, y publicas el trabajo en dos minutos.</p>
<div class="rejilla">${GREMIOS.map((g) => `<a class="caja" href="/subcontratar/${g.slug}"><strong>${esc(g.nombre)}</strong><span>${esc(g.titulo)}</span></a>`).join("")}</div></section>
${formulario({ campaign: "subcontratar", content: "form-indice" })}
${comoFunciona()}${enlacesCiudades()}</div>`;
  await escribir("/subcontratar/", pagina({ ruta: "/subcontratar/", titulo: "Subcontratar gremios para tu obra: presupuesto 48 h", descripcion: "Subcontratas de albañilería, pladur, electricidad, fontanería, pintura y más. Publica gratis y empresas verificadas te llaman con presupuesto.", cuerpo, prioridad: "0.9", claves: ["subcontratar gremios", "subcontratas para obra", "buscar gremios", "cuadrilla para obra", "empresa subcontrata reformas", "subcontratar mano de obra", "gremios para reforma", "subcontratación construcción", "necesito gremios", "subcontrata de obra"], campaign: "subcontratar" }));
}

async function gremio(g) {
  const servicio = { "@context": "https://schema.org", "@type": "Service", name: g.titulo, serviceType: g.nombre, areaServed: "ES", provider: { "@type": "Organization", name: SITIO.titular, url: "https://" + SITIO.destinoNombre }, description: g.descripcion, offers: { "@type": "Offer", price: "0", priceCurrency: "EUR", description: "Publicar la solicitud es gratuito para quien pide." } };
  const cuerpo = `
<section class="hero hero-int-pag"><div class="contenedor hero-int">
  <div class="hero-txt"><p class="miga"><a href="/">Inicio</a> › <a href="/subcontratar/">Subcontratar</a> › ${esc(g.nombre)}</p><h1>${esc(g.h1)}</h1><p class="sub">${esc(g.intro)}</p></div>
  ${formulario({ tipo: g.tipo, campaign: "subcontratar", content: "form-" + g.slug })}
</div></section>
<div class="contenedor">
<section class="bloque"><h2>Qué incluye subcontratar ${esc(g.nombre.toLowerCase())}</h2>${lista(g.incluye)}</section>
<section class="bloque"><h2>Cómo se presupuesta</h2><p>${esc(g.presupuesto)}</p></section>
<section class="bloque"><h2>Plazos habituales</h2><p>${esc(g.plazos)}</p></section>
<section class="bloque dos-col"><div><h2>Qué pedir por escrito</h2>${lista(g.porEscrito)}</div><div><h2>Errores típicos al subcontratar</h2>${lista(g.errores)}</div></section>
${faqHtml(g.faqs)}
${ctaFinal("subcontratar", g.tipo)}
${enlacesGremios(g.slug)}${enlacesCiudades()}
</div>`;
  await escribir(`/subcontratar/${g.slug}`, pagina({ ruta: `/subcontratar/${g.slug}`, titulo: g.tituloSeo, descripcion: g.descSeo, cuerpo, jsonld: [servicio, faqLd(g.faqs)], prioridad: "0.8", claves: [`subcontratar ${g.nombre.toLowerCase()}`, `${g.nombre.toLowerCase()} para obra`, `empresa de ${g.nombre.toLowerCase()} subcontrata`, `cuadrilla ${g.nombre.toLowerCase()}`, `presupuesto ${g.nombre.toLowerCase()} obra`, `necesito ${g.nombre.toLowerCase()} para reforma`, `subcontrata ${g.nombre.toLowerCase()} precio`, `${g.nombre.toLowerCase()} por m2`, `contratar ${g.nombre.toLowerCase()} empresa`, `profesionales ${g.nombre.toLowerCase()} verificados`], campaign: "subcontratar" }));
}

async function indicePresupuesto() {
  const cuerpo = `<div class="contenedor"><section class="bloque"><h1>Presupuesto de reforma: cuánto cuesta y cómo comparar</h1>
<p class="sub">Rangos orientativos por tipo de reforma y qué mirar en cada presupuesto. Publica tu reforma gratis y profesionales verificados te llaman en 48 horas.</p>
<div class="rejilla">${PRESUPUESTOS.map((p) => `<a class="caja" href="/presupuesto/${p.slug}"><strong>${esc(p.tipo)}</strong><span>${esc(p.titulo)}</span></a>`).join("")}</div></section>
${formulario({ campaign: "presupuesto", content: "form-indice" })}
${comoFunciona()}</div>`;
  await escribir("/presupuesto/", pagina({ ruta: "/presupuesto/", titulo: "Presupuesto de reforma gratis: cocina, baño, integral", descripcion: "Cuánto cuesta reformar y cómo comparar presupuestos de cocina, baño, pintura, suelos, ventanas o reforma integral. Publica gratis y te llaman en 48 horas.", cuerpo, prioridad: "0.9", claves: ["presupuesto reforma", "cuánto cuesta reformar un piso", "presupuesto reforma gratis", "empresa de reformas", "comparar presupuestos reforma", "presupuesto reforma online", "reformas precio", "pedir presupuesto reforma", "presupuesto obra vivienda", "reformas baratas"], campaign: "presupuesto" }));
}

async function presupuesto(p) {
  const servicio = { "@context": "https://schema.org", "@type": "Service", name: p.titulo, serviceType: p.tipo, areaServed: "ES", provider: { "@type": "Organization", name: SITIO.titular, url: "https://" + SITIO.destinoNombre }, description: p.descripcion };
  const cuerpo = `
<section class="hero hero-int-pag"><div class="contenedor hero-int">
  <div class="hero-txt"><p class="miga"><a href="/">Inicio</a> › <a href="/presupuesto/">Presupuestos</a> › ${esc(p.tipo)}</p><h1>${esc(p.h1)}</h1><p class="sub">${esc(p.intro)}</p></div>
  ${formulario({ tipo: p.tipo, campaign: "presupuesto", content: "form-" + p.slug })}
</div></section>
<div class="contenedor">
<section class="bloque destacado"><h2>Cuánto cuesta (orientativo)</h2><p>${esc(p.rango)}</p><p class="nota">Orientativo; el precio real lo fija cada presupuesto. Los rangos varían por ciudad, calidades y estado de la vivienda.</p></section>
<section class="bloque dos-col"><div><h2>Qué partidas debe incluir el presupuesto</h2>${lista(p.partidas)}</div><div><h2>Consejos para comparar</h2>${lista(p.consejos)}</div></section>
${faqHtml(p.faqs)}
${ctaFinal("presupuesto", p.tipo)}
<section class="bloque"><h2>Otros presupuestos</h2><p class="chips">${PRESUPUESTOS.filter((x) => x.slug !== p.slug).map((x) => `<a href="/presupuesto/${x.slug}">${esc(x.tipo)}</a>`).join("")}</p></section>
${enlacesCiudades()}
</div>`;
  await escribir(`/presupuesto/${p.slug}`, pagina({ ruta: `/presupuesto/${p.slug}`, titulo: p.tituloSeo, descripcion: p.descSeo, cuerpo, jsonld: [servicio, faqLd(p.faqs)], prioridad: "0.8", claves: [`presupuesto ${p.tipo.toLowerCase()}`, `cuánto cuesta ${p.tipo.toLowerCase()}`, `precio ${p.tipo.toLowerCase()}`, `reforma ${p.tipo.toLowerCase()} precio`, `empresa reformas ${p.tipo.toLowerCase()}`, `${p.tipo.toLowerCase()} presupuesto online`, `${p.tipo.toLowerCase()} precio m2`, `comparar presupuestos ${p.tipo.toLowerCase()}`, `${p.tipo.toLowerCase()} reforma barata`, `presupuesto ${p.tipo.toLowerCase()} gratis`], campaign: "presupuesto" }));
}

async function indiceCiudades() {
  const cuerpo = `<div class="contenedor"><section class="bloque"><h1>Subcontratar y pedir presupuesto en las 15 ciudades más grandes</h1>
<p class="sub">Cada ciudad tiene su parque de vivienda, sus licencias y sus plazos. Elige la tuya. Si no está, publica igualmente: ${esc(SITIO.destinoNombre)} cubre toda España.</p>
<div class="rejilla">${CIUDADES.map((c) => `<a class="caja" href="/subcontratar-en/${c.slug}"><strong>${esc(c.nombre)}</strong><span>${esc(c.provincia)}</span></a>`).join("")}</div></section>
${formulario({ campaign: "ciudad", content: "form-indice" })}</div>`;
  await escribir("/subcontratar-en/", pagina({ ruta: "/subcontratar-en/", titulo: "Subcontratar gremios por ciudad: presupuesto 48 h", descripcion: "Subcontratas y presupuestos de reforma en Madrid, Barcelona, Valencia, Sevilla y otras 11 ciudades. Publica gratis y te llaman en 48 horas.", cuerpo, prioridad: "0.7", claves: ["reformas por ciudad", "subcontratar gremios ciudad", "empresa reformas madrid", "empresa reformas barcelona", "empresa reformas valencia", "reformas sevilla", "reformas zaragoza", "reformas malaga", "reformas bilbao", "reformas murcia"], campaign: "ciudad" }));
}

async function ciudad(c) {
  const gremiosC = c.gremios.map((s) => GREMIOS.find((g) => g.slug === s)).filter(Boolean);
  const cuerpo = `
<section class="hero hero-int-pag"><div class="contenedor hero-int">
  <div class="hero-txt"><p class="miga"><a href="/">Inicio</a> › <a href="/subcontratar-en/">Ciudades</a> › ${esc(c.nombre)}</p><h1>Subcontratar gremios y pedir presupuesto en ${esc(c.nombre)}</h1><p class="sub">Publica tu obra en ${esc(c.nombre)} y profesionales verificados de ${esc(c.provincia)} te llaman con presupuesto, habitualmente en 48 horas. Gratis para quien pide.</p></div>
  ${formulario({ ciudad: c.nombre, cp: c.cp, campaign: "ciudad", content: "form-" + c.slug })}
</div></section>
<div class="contenedor">
<section class="bloque"><h2>Reformar y subcontratar en ${esc(c.nombre)}</h2><p>${esc(c.texto)}</p></section>
<section class="bloque"><h2>Lo que más se subcontrata en ${esc(c.nombre)}</h2><div class="rejilla">${gremiosC.map((g) => `<a class="caja" href="/subcontratar/${g.slug}"><strong>${esc(g.nombre)}</strong><span>${esc(g.titulo)}</span></a>`).join("")}</div></section>
${comoFunciona()}
${ctaFinal("ciudad", "", c.nombre, c.cp)}
${enlacesGremios()}${enlacesCiudades(c.slug)}
</div>`;
  await escribir(`/subcontratar-en/${c.slug}`, pagina({ ruta: `/subcontratar-en/${c.slug}`, titulo: `Reformas y subcontratas en ${c.corto || c.nombre}: presupuesto 48 h`, descripcion: `Empresas de reformas y subcontratas verificadas en ${c.nombre}. Publica tu obra gratis y te llaman con presupuesto en 48 horas. Sin comisión.`, cuerpo, prioridad: "0.7", claves: [`reformas ${c.nombre.toLowerCase()}`, `empresa de reformas ${c.nombre.toLowerCase()}`, `subcontratar gremios ${c.nombre.toLowerCase()}`, `presupuesto reforma ${c.nombre.toLowerCase()}`, `albañiles ${c.nombre.toLowerCase()}`, `reforma baño ${c.nombre.toLowerCase()}`, `reforma cocina ${c.nombre.toLowerCase()}`, `reforma integral ${c.nombre.toLowerCase()}`, `pladur ${c.nombre.toLowerCase()}`, `electricista ${c.nombre.toLowerCase()}`], campaign: "ciudad" }));
}

async function estaticas() {
  const simple = (ruta, titulo, descripcion, h1, html, extra = {}) => escribir(ruta, pagina({ ruta, titulo, descripcion, cuerpo: `<div class="contenedor"><article class="bloque texto"><h1>${esc(h1)}</h1>${html}</article></div>`, ...extra }));

  await escribir("/como-funciona", pagina({ ruta: "/como-funciona", titulo: "Cómo funciona: publicas, te llaman, comparas", descripcion: "Describes el trabajo en dos pasos, terminas la solicitud en reformapresupuesto.com y profesionales verificados te llaman con presupuesto en 48 h.", cuerpo: `<div class="contenedor"><section class="bloque"><h1>Cómo funciona</h1><p class="sub">Tres pasos. Nada de registros ni tarjetas para pedir.</p></section>${comoFunciona()}
<section class="bloque texto"><h2>Qué pasa con tu solicitud</h2><p>Aquí solo indicas qué necesitas y dónde. Al pulsar el botón te llevamos a ${esc(SITIO.destinoNombre)} con esos datos ya rellenos; allí añades una descripción, tu nombre y un teléfono, y publicas. Los profesionales de tu provincia ven la solicitud y los que decidan contactarte te llaman. Solo ellos ven tus datos.</p>
<h2>Qué significa «verificado»</h2><p>Un profesional verificado en ${esc(SITIO.destinoNombre)} ha acreditado NIF, nombre real, nombre comercial, teléfono y email, y mantiene una suscripción activa. Lo verás señalado en su perfil. Aun así, pide siempre por escrito seguro de responsabilidad civil y alta de trabajadores antes de empezar.</p>
<h2>Cuánto tarda</h2><p>Habitualmente, 48 horas. No es un plazo garantizado: depende de que haya profesionales con capacidad en tu zona y del tipo de trabajo.</p>
<h2>Qué cuesta</h2><p>A quien pide, nada. Ni al publicar, ni al recibir llamadas, ni al contratar. Los profesionales pagan la plataforma por acceder a los contactos. Esa es la única fuente de ingresos y por eso no hay comisión sobre tu obra.</p></section>
${pruebas()}${formulario({ campaign: "como-funciona", content: "form-como-funciona" })}</div>`, prioridad: "0.7", claves: ["cómo funciona subcontrata online", "cómo pedir presupuesto reforma", "plataforma presupuestos reforma", "profesionales verificados", "pedir presupuesto gratis reforma", "comparar presupuestos", "reformapresupuesto", "presupuesto en 48 horas", "sin comisión reforma", "publicar obra gratis"] }));

  await escribir("/preguntas-frecuentes", pagina({ ruta: "/preguntas-frecuentes", titulo: "Preguntas frecuentes | subcontrata.online", descripcion: "Qué es subcontrata.online, cuánto cuesta, quién te llama, cuándo, qué datos das y quién los trata. Respuestas claras antes de publicar tu obra.", cuerpo: `<div class="contenedor"><section class="bloque"><h1>Preguntas frecuentes</h1></section>${faqHtml(FAQS)}${formulario({ campaign: "faq", content: "form-faq" })}</div>`, jsonld: [faqLd(FAQS)], prioridad: "0.6", claves: ["preguntas frecuentes presupuesto reforma", "es gratis pedir presupuesto", "quién me llama", "profesionales verificados reforma", "subcontratar dudas", "plataforma reformas gratis", "presupuestos sin compromiso", "datos personales reforma", "cuánto tardan en llamar", "obligado a contratar"] }));

  await simple("/contacto", "Contacto | subcontrata.online", "Contacto de 170 Build&Systems, titular de subcontrata.online. Para pedir presupuesto usa el formulario; para todo lo demás, correo o teléfono.", "Contacto", `
<p>Para <strong>pedir presupuesto o publicar una obra</strong> no hace falta escribirnos: usa el <a href="/#solicitar">formulario</a>, es más rápido.</p>
<p>Para cualquier otra cosa (prensa, colaboración, dudas legales, ejercicio de derechos sobre tus datos):</p>
<ul class="lista"><li>Correo: <a href="mailto:${esc(SITIO.email)}">${esc(SITIO.email)}</a></li><li>Teléfono: <a href="tel:+34${SITIO.telefono.replace(/\s/g, "")}">${esc(SITIO.telefono)}</a></li><li>Titular: ${esc(SITIO.titular)} (${esc(SITIO.nombreComercial)})</li></ul>
<p>Si eres profesional y quieres recibir solicitudes, date de alta en <a href="https://${esc(SITIO.destinoNombre)}/para-profesionales" rel="noopener">${esc(SITIO.destinoNombre)}/para-profesionales</a>.</p>`, { prioridad: "0.4", claves: ["contacto subcontrata online", "170 build systems contacto", "reformapresupuesto contacto"] });

  await simple("/aviso-legal", "Aviso legal | subcontrata.online", "Datos identificativos del titular de subcontrata.online conforme a la LSSI: 170 Build&Systems, condiciones de uso y propiedad intelectual.", "Aviso legal", `
<h2>Titular</h2><p>En cumplimiento del artículo 10 de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI), se informa de que el titular de este sitio web es <strong>${esc(SITIO.titular)}</strong>, con nombre comercial ${esc(SITIO.nombreComercial)}, NIF ${esc(SITIO.nif)}, domicilio en ${esc(SITIO.domicilio)}, correo electrónico ${esc(SITIO.email)} y teléfono ${esc(SITIO.telefono)}.</p>
<h2>Objeto</h2><p>${esc(SITIO.dominio)} es una página de captación: permite describir una necesidad de obra o reforma y redirige al usuario a ${esc(SITIO.destinoNombre)}, plataforma del mismo titular, donde se completa y publica la solicitud. Este sitio no presta servicios de reforma ni interviene en la contratación entre usuarios y profesionales.</p>
<h2>Condiciones de uso</h2><p>El uso es gratuito para quien solicita presupuesto. Los plazos indicados («habitualmente 48 horas») son estimaciones y no constituyen garantía. Los rangos de precio publicados son orientativos, proceden de la experiencia del sector y no constituyen oferta contractual; el precio real lo fija cada presupuesto que reciba el usuario.</p>
<h2>Propiedad intelectual</h2><p>Los textos, el diseño y el código de este sitio son titularidad de ${esc(SITIO.titular)}. Queda prohibida su reproducción sin autorización, salvo para citas con mención de la fuente.</p>
<h2>Responsabilidad</h2><p>El titular no responde del contenido de sitios de terceros enlazados ni de los presupuestos, trabajos o relaciones contractuales entre usuarios y profesionales, que se rigen por las condiciones de ${esc(SITIO.destinoNombre)}.</p>
<h2>Legislación</h2><p>Estas condiciones se rigen por la legislación española. Para cualquier controversia, los juzgados y tribunales del domicilio del usuario, cuando sea consumidor, o del titular en los demás casos.</p>`, { prioridad: "0.2", claves: ["aviso legal"] });

  await simple("/privacidad", "Política de privacidad | subcontrata.online", "Esta web no almacena datos personales: te redirige a reformapresupuesto.com con tu solicitud empezada. Responsable: 170 Build&Systems.", "Política de privacidad", `
<h2>Responsable</h2><p>${esc(SITIO.titular)} (${esc(SITIO.nombreComercial)}), NIF ${esc(SITIO.nif)}, ${esc(SITIO.domicilio)}, ${esc(SITIO.email)}.</p>
<h2>Qué datos trata este sitio</h2><p><strong>Ninguno de carácter identificativo.</strong> El formulario de esta web recoge únicamente el tipo de trabajo, la ciudad, el código postal, la urgencia, los metros y la calidad deseada, y los transmite en la dirección de destino al redirigirte a ${esc(SITIO.destinoNombre)}. No se guardan en ningún servidor de ${esc(SITIO.dominio)}. Tu nombre, teléfono y correo se piden en ${esc(SITIO.destinoNombre)}, bajo su propia <a href="https://${esc(SITIO.destinoNombre)}/privacidad" rel="noopener">política de privacidad</a> y con tu consentimiento expreso allí.</p>
<h2>Medición</h2><p>Solo si aceptas las cookies de medición, se cargan Google Analytics 4 y Google Tag Manager, que tratan identificadores de dispositivo y datos de navegación de forma seudonimizada para medir el uso del sitio y la eficacia de la publicidad. Base jurídica: tu consentimiento (art. 6.1.a RGPD), que puedes retirar en cualquier momento desde «Configurar cookies» en el pie de página. Sin consentimiento no se cargan estas herramientas.</p>
<h2>Destinatarios</h2><p>Google Ireland Ltd. como encargado de tratamiento de las herramientas de medición, con las garantías del marco de transferencias UE–EE. UU. No se ceden datos a terceros con fines propios.</p>
<h2>Conservación</h2><p>Este sitio no conserva datos. Los datos de medición se conservan el plazo configurado en Google Analytics (máximo 14 meses).</p>
<h2>Derechos</h2><p>Acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a ${esc(SITIO.email)} con copia de un documento identificativo. Puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).</p>
<h2>Menores</h2><p>El sitio no se dirige a menores de 14 años.</p>`, { prioridad: "0.2", claves: ["política de privacidad"] });

  await simple("/cookies", "Política de cookies | subcontrata.online", "Qué cookies usa subcontrata.online: ninguna sin tu consentimiento salvo la que recuerda tu elección. Medición con Google Analytics solo si aceptas.", "Política de cookies", `
<h2>Qué es una cookie</h2><p>Un pequeño archivo que el navegador guarda para recordar información entre visitas. Esta web usa el almacenamiento local del navegador para una sola cosa sin pedir permiso: recordar si has aceptado o rechazado las cookies de medición (clave <code>sc_consent</code>, 12 meses).</p>
<h2>Cookies de medición (solo con tu consentimiento)</h2><table class="tabla"><tr><th>Herramienta</th><th>Finalidad</th><th>Duración</th></tr><tr><td>Google Analytics 4 (_ga, _ga_*)</td><td>Medir visitas, páginas y envíos del formulario de forma seudonimizada</td><td>Hasta 2 años</td></tr><tr><td>Google Ads (_gcl_*)</td><td>Atribuir solicitudes a campañas publicitarias</td><td>Hasta 90 días</td></tr></table>
<p>Se cargan mediante Google Tag Manager con el modo de consentimiento de Google v2: por defecto todo está <strong>denegado</strong>. Solo al pulsar «Aceptar» se activa la medición.</p>
<h2>Cómo cambiar tu elección</h2><p>Pulsa «Configurar cookies» en el pie de cualquier página, o borra los datos del sitio desde tu navegador. También puedes bloquear cookies de terceros en la configuración del navegador.</p>
<h2>Más información</h2><p>Consulta la <a href="/privacidad">política de privacidad</a> y la <a href="https://policies.google.com/technologies/cookies?hl=es" rel="noopener">política de cookies de Google</a>.</p>`, { prioridad: "0.2", claves: ["política de cookies"] });

  await writeFile(join(DIST, "404.html"), pagina({ ruta: "/404", titulo: "Página no encontrada | subcontrata.online", descripcion: "Esta página no existe.", noindex: true, cuerpo: `<div class="contenedor"><section class="bloque texto"><h1>Página no encontrada</h1><p>La dirección no existe o ha cambiado. Puedes <a href="/">volver al inicio</a> o publicar tu obra directamente.</p>${boton("Publicar mi obra gratis", urlCta({ campaign: "404", content: "404" }), "404")}</section></div>` }));
}

// ---------- Ficheros auxiliares ----------
async function auxiliares() {
  const hoy = new Date().toISOString().slice(0, 10);
  await writeFile(join(DIST, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paginas.map((p) => `  <url><loc>${SITIO.url}${p.ruta === "/" ? "/" : p.ruta}</loc><lastmod>${hoy}</lastmod><priority>${p.prioridad}</priority></url>`).join("\n")}\n</urlset>\n`);
  await writeFile(join(DIST, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /404.html\n\nSitemap: ${SITIO.url}/sitemap.xml\n`);
  // Cloudflare Pages: cabeceras de seguridad y redirecciones
  await writeFile(join(DIST, "_headers"), `/*\n  X-Frame-Options: DENY\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload\n  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net; img-src 'self' data: https://www.googletagmanager.com https://www.google-analytics.com https://www.facebook.com; connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://www.facebook.com; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://${SITIO.destinoNombre}\n\n/styles.css\n  Cache-Control: public, max-age=86400\n/app.js\n  Cache-Control: public, max-age=86400\n/logo.svg\n  Cache-Control: public, max-age=604800\n`);
  await writeFile(join(DIST, "_redirects"), `https://www.${SITIO.dominio}/* ${SITIO.url}/:splat 301\n`);
  await cp("public", DIST, { recursive: true });
  // CNAME para GitHub Pages (inofensivo en Cloudflare)
  if (!BASE) await writeFile(join(DIST, "CNAME"), SITIO.dominio + "\n"); // con BASE_PATH es previsualización, sin dominio
  await writeFile(join(DIST, ".nojekyll"), "");

  // Entregable 2: palabras clave + título/descripción por página
  const md = [`# Palabras clave objetivo por página\n\nGenerado por \`node build.mjs\` (${hoy}). Título ≤ 60 y descripción ≤ 155 caracteres: se marca con ⚠ lo que se pasa.\n`];
  for (const p of paginas) {
    md.push(`## ${p.ruta}\n\n- **Título** (${p.titulo.length}${p.titulo.length > 60 ? " ⚠" : ""}): ${p.titulo}\n- **Descripción** (${p.descripcion.length}${p.descripcion.length > 155 ? " ⚠" : ""}): ${p.descripcion}\n- **Palabras clave**: ${p.claves.join(" · ") || "—"}\n`);
  }
  await mkdir("seo", { recursive: true });
  await writeFile("seo/palabras-clave.md", md.join("\n"));
}

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });
await portada();
await indiceSubcontratar();
for (const g of GREMIOS) await gremio(g);
await indicePresupuesto();
for (const p of PRESUPUESTOS) await presupuesto(p);
await indiceCiudades();
for (const c of CIUDADES) await ciudad(c);
await estaticas();
await auxiliares();
console.log(`✔ ${paginas.length} páginas generadas en ${DIST}/`);
