# subcontrata.online

Landing estática de captación. Un solo objetivo: convertir visitas en solicitudes. El formulario completo (qué, dónde, contacto) se envía por API a **reformapresupuesto.com/api/public/leads/subcontrata** y el visitante termina en `/gracias` **sin salir de subcontrata.online**. Esta web no tiene base de datos ni cuentas; la solicitud se registra en la plataforma del grupo con `sitio=subcontrata.online`.

## Estructura

```
build.mjs            generador (Node 18+, sin dependencias) → dist/
src/data/sitio.mjs   datos del titular, dominio, GTM, tipos de trabajo  ← RELLENAR NIF y domicilio
src/data/gremios.mjs 12 páginas /subcontratar/<gremio>
src/data/presupuestos.mjs 6 páginas /presupuesto/<tipo>
src/data/ciudades.mjs 15 páginas /subcontratar-en/<ciudad>
src/data/faqs.mjs    preguntas frecuentes
public/              styles.css, app.js, logo.svg, favicon.svg (se copian tal cual)
scripts/comprobar.mjs comprobaciones de enlaces, H1, canónicas, CTAs con utm
seo/palabras-clave.md  generado en cada build: título, descripción y palabras clave por página
ads/anuncios.md      5 anuncios de Google Ads por intención
CHECKLIST-LANZAMIENTO.md
```

Páginas generadas: portada, `/subcontratar/` + 12 gremios, `/presupuesto/` + 6 tipos, `/subcontratar-en/` + 15 ciudades, `/como-funciona`, `/preguntas-frecuentes`, `/contacto`, `/aviso-legal`, `/privacidad`, `/cookies`, `404.html`, `sitemap.xml`, `robots.txt`, `_headers`, `_redirects`.

## Comandos

```bash
npm run build    # genera dist/
npm run check    # build + comprobaciones (falla si hay enlaces rotos, CTAs sin utm, etc.)
npm run dev      # build + servidor local en http://localhost:4321
```

## Cómo llega la solicitud a reformapresupuesto.com

`public/app.js` valida el formulario y hace `POST` JSON a `SITIO.api` (`https://reformapresupuesto.com/api/public/leads/subcontrata`), con CORS limitado a subcontrata.online y localhost, campo trampa `web` contra robots y límite por IP en el servidor. Campos: `tipo, ciudad, cp, urgencia, superficie, calidad, empresa, nombre, apellidos, telefono, email, descripcion, consentimiento_marketing, pagina (utm_campaign), cta (utm_content), keyword (utm_term)`. En la plataforma la fila entra en `client_requests` con `sitio=subcontrata.online` y `source=/solicitar?...utm_source=subcontrata.online...`, se avisa a los profesionales de la provincia y se envía el acuse al cliente. Si la API responde error, el formulario lo muestra y no se pierde nada escrito.

Eventos enviados a `dataLayer` (GTM): `form_start`, `form_step2`, `form_submit` (solo tras respuesta OK de la API; con `send_to` para la conversión de Ads si está configurado), `form_error`, `cta_click`, `consent_granted` / `consent_denied`.

## Desplegar gratis

### Opción A — Cloudflare Pages (recomendada: cabeceras y redirecciones incluidas)
1. Sube este repo a GitHub.
2. Cloudflare → Workers & Pages → Create → Pages → Connect to Git → elige el repo.
3. Build command: `npm run build` · Build output directory: `dist` · Node version: 22 (variable `NODE_VERSION=22`).
4. Custom domains → añade `subcontrata.online` y `www.subcontrata.online` (el `www` redirige al apex por `_redirects`).
5. Cada `git push` a `main` publica solo.

Alternativa sin GitHub: `npx wrangler pages deploy dist --project-name subcontrata-online`.

### Opción B — GitHub Pages (la que está activa ahora)
1. `npm run publicar` genera `dist/` y lo sube a la rama `gh-pages` (script `scripts/publicar-gh-pages.sh`). Settings → Pages apunta a esa rama.
2. Settings → Pages → Custom domain: `subcontrata.online` (el fichero `CNAME` va en `dist/`). Activa «Enforce HTTPS» cuando el DNS resuelva.
3. DNS: registros A del apex a 185.199.108.153, 185.199.109.153, 185.199.110.153 y 185.199.111.153, y CNAME `www` → `170buildsystems-droid.github.io`.
   Nota: GitHub Pages no aplica `_headers` ni `_redirects`; las cabeceras de seguridad y el 301 de `www` hay que ponerlos delante (Cloudflare DNS proxy con una regla de redirección) o migrar a la opción A.
   Si se prefiere GitHub Actions, el workflow está en `despliegue/github-pages-workflow.yml` (cópialo a `.github/workflows/`; requiere un token con permiso `workflow`).

## Antes de publicar
- Rellena `nif` y `domicilio` en `src/data/sitio.mjs` (obligatorio por LSSI).
- Pon `gtmId` y, si usas Ads, `adsConversion`.
- Sigue `CHECKLIST-LANZAMIENTO.md`.

## Reglas de contenido
- Sin nombres de competidores, sin testimonios ni cifras inventadas. Los rangos de precio son orientativos y lo dicen.
- Plazo: «habitualmente en 48 horas», nunca garantizado.
- Para añadir un gremio o ciudad, añade un objeto al fichero de datos correspondiente y ejecuta `npm run check`.
