# Checklist de lanzamiento — subcontrata.online

## Antes de publicar
- [ ] Rellenar en `src/data/sitio.mjs`: `nif`, `domicilio` (aparecen en aviso legal y privacidad). Sin esto NO publicar: la LSSI exige identificar al titular.
- [ ] Crear contenedor GTM y pegar `gtmId` (`GTM-XXXXXXX`). Dentro de GTM: etiqueta GA4 (config) y etiqueta Google Ads conversión disparada por el evento `form_submit`.
- [ ] Pegar `adsConversion` (`AW-xxxx/yyyy`) si se usa Ads.
- [ ] `npm run check` sin errores.
- [ ] Revisar `seo/palabras-clave.md`: ningún ⚠ en títulos/descripciones que importen.

## Dominio y DNS
- [ ] Cloudflare Pages: proyecto conectado al repo, build `npm run build`, salida `dist`.
- [ ] Dominio personalizado `subcontrata.online` añadido en Pages; `www` también (redirige al apex vía `_redirects`).
- [ ] HTTPS activo y HSTS (ya va en `_headers`).
- [ ] Comprobar `https://www.subcontrata.online/` → 301 → `https://subcontrata.online/`.

## Buscadores
- [ ] Google Search Console: propiedad de dominio verificada (registro TXT en DNS).
- [ ] Enviar `https://subcontrata.online/sitemap.xml`.
- [ ] Bing Webmaster Tools: importar desde Search Console.
- [ ] Inspeccionar la portada y una página de gremio: «la URL está en Google» tras unos días.

## Medición (prueba de extremo a extremo)
- [ ] Abrir la portada en móvil, aceptar cookies, rellenar el formulario y pulsar «Ver presupuestos gratis».
- [ ] Comprobar en GA4 (Tiempo real) los eventos `form_start`, `form_step2`, `form_submit`.
- [ ] Comprobar que la URL de llegada en reformapresupuesto.com lleva `tipo`, `ciudad`, `cp` y `utm_source=subcontrata.online`.
- [ ] Completar una solicitud de prueba y verificar en el panel admin de reformapresupuesto.com que aparece con origen `subcontrata.online` (y borrarla después o marcarla como prueba).
- [ ] Google Ads: conversión `form_submit` marcada como «Verificado» en el gestor de etiquetas.

## Tras el lanzamiento
- [ ] Lighthouse móvil ≥ 90 en rendimiento, accesibilidad y SEO.
- [ ] Revisar a los 15 días en Search Console qué páginas reciben impresiones y reforzar texto en las que estén en posición 8–20.
- [ ] Activar campañas de Ads con `ads/anuncios.md`, una campaña por intención, y `utm_term={keyword}`.
