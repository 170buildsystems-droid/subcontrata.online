# Anuncios de Google Ads por intención

Reglas: titulares ≤ 30 caracteres, descripciones ≤ 90, sin marcas ajenas, sin «el más barato», plazo siempre «habitualmente». URL final con `utm_term={keyword}` para que la palabra clave llegue a reformapresupuesto.com.

URL final recomendada por grupo: `https://subcontrata.online/<página>?utm_source=google&utm_medium=cpc&utm_campaign=<campaña>&utm_term={keyword}` (la landing reenvía `utm_term` al formulario).

## 1. Subcontratar (genérico) → `/subcontratar/`

| # | Titular 1 | Titular 2 | Titular 3 | Descripción 1 | Descripción 2 |
|---|---|---|---|---|---|
| 1 | Subcontrata gremios para tu obra | Presupuesto en 48 horas | Gratis para quien pide | Publica la obra en 2 minutos y empresas verificadas de tu provincia te llaman con precio. | Sin comisión ni cuota. Comparas hasta 4 presupuestos y decides tú. |
| 2 | ¿Te falta un gremio en obra? | Cuadrillas verificadas | Habitualmente en 48 h | Albañilería, pladur, electricidad, fontanería, pintura. Publica gratis y te llaman. | NIF, teléfono y nombre comprobados. Sin registro para pedir. |
| 3 | Subcontratas con capacidad | Publica tu obra gratis | Hasta 4 presupuestos | Empresas que trabajan en tu provincia te llaman con presupuesto. Tú comparas. | Para constructoras, reformistas, administradores e inmobiliarias. |
| 4 | Mano de obra para tu reforma | Te llaman en 48 horas | Sin comisión | Describe el trabajo y recibe presupuestos de subcontratas verificadas. Gratis. | Decide con varios presupuestos del mismo alcance delante. |
| 5 | Buscar gremios para obra | Rápido y gratis | Profesionales verificados | Publica qué necesitas y dónde. Empresas de tu zona te llaman con precio cerrado. | Sin cuotas. Los profesionales pagan la plataforma, tú no. |

## 2. Subcontratar un gremio concreto → `/subcontratar/<gremio>` (ejemplo albañilería; replicar por gremio)

| # | Titular 1 | Titular 2 | Titular 3 | Descripción 1 | Descripción 2 |
|---|---|---|---|---|---|
| 1 | Subcontratar albañiles | Cuadrilla en 48 horas | Gratis para quien pide | Publica tu obra y empresas de albañilería verificadas te llaman con presupuesto. | Por m², por unidad o por jornada: tú marcas el alcance. |
| 2 | Albañiles para tu obra | Empresas con RC y alta | Hasta 4 presupuestos | Tabiques, alicatados, demoliciones, recrecidos. Te llaman profesionales de tu provincia. | Sin comisión. Comparas y decides. |
| 3 | ¿Te falta albañilería? | Presupuesto en 48 h | Verificados con NIF | Describe el trabajo en 2 minutos. Cuadrillas de tu zona te llaman con precio. | Sin registro ni tarjeta para pedir. |
| 4 | Cuadrilla de albañiles | Publica gratis la obra | Te llaman ellos | Empresas de albañilería verificadas con capacidad para entrar en fecha. | Pide el desglose por partidas antes de cerrar. |
| 5 | Subcontrata de albañilería | Rápido, gratis, verificado | Decide tú | Recibe hasta 4 presupuestos con el mismo alcance y compara. | Para empresas y autónomos con obra en marcha. |

## 3. Particulares: presupuesto de reforma → `/presupuesto/<tipo>`

| # | Titular 1 | Titular 2 | Titular 3 | Descripción 1 | Descripción 2 |
|---|---|---|---|---|---|
| 1 | Presupuesto reforma gratis | Te llaman en 48 horas | Profesionales verificados | Publica tu reforma en 2 minutos y recibe hasta 4 presupuestos de tu zona. | Sin compromiso. Comparas y eliges, o no eliges a nadie. |
| 2 | ¿Cuánto cuesta tu reforma? | Compara 4 presupuestos | Sin comisión | Baño, cocina, integral, pintura, suelos, ventanas. Rangos orientativos y presupuesto real. | Profesionales con NIF y teléfono comprobados. |
| 3 | Reforma de baño o cocina | Presupuesto en 48 h | Gratis y sin tarjeta | Describe qué quieres cambiar y empresas de tu provincia te llaman con precio. | Comparas con el mismo alcance. Decides tú. |
| 4 | Empresa de reformas cerca | Verificadas, te llaman | Habitualmente en 48 h | Publica tu reforma y recibe presupuestos de empresas de tu ciudad. Gratis. | Sin cuotas ni intermediarios que cobren al cliente. |
| 5 | Compara presupuestos reforma | Hasta 4, gratis | Profesionales verificados | No te quedes con el primero. Publica tu obra y compara varios con calma. | Los profesionales pagan la plataforma, tú no. |

## 4. Ciudad → `/subcontratar-en/<ciudad>` (ejemplo Madrid; replicar por ciudad)

| # | Titular 1 | Titular 2 | Titular 3 | Descripción 1 | Descripción 2 |
|---|---|---|---|---|---|
| 1 | Reformas en Madrid | Presupuesto en 48 horas | Gratis y verificado | Publica tu obra en Madrid y profesionales verificados te llaman con presupuesto. | Hasta 4 presupuestos. Sin comisión. |
| 2 | Subcontratar gremios Madrid | Cuadrillas verificadas | Publica gratis | Albañiles, pladur, electricistas y fontaneros de Madrid te llaman con precio. | Para empresas y particulares. |
| 3 | Empresa de reformas Madrid | Te llaman ellos | Sin compromiso | Describe la reforma en 2 minutos y compara presupuestos de empresas de Madrid. | Profesionales con NIF y teléfono comprobados. |
| 4 | Reforma piso Madrid | Hasta 4 presupuestos | En 48 h habitualmente | Baño, cocina o integral: publica gratis y recibe presupuestos comparables. | Tú eliges, o no eliges a nadie. |
| 5 | Presupuesto reforma Madrid | Gratis para quien pide | Verificados | Sin registro ni tarjeta. Publica y te llaman profesionales de tu zona. | Sin comisión sobre la obra. |

## Palabras clave negativas (todas las campañas)

`gratis` (para ofertas de empleo), `empleo`, `trabajo`, `curso`, `sueldo`, `ofertas de trabajo`, `autónomo darse de alta`, nombres de portales de la competencia (no pujar por marca ajena), `diy`, `tutorial`, `manual`.

## Conversión

Etiqueta de Google Ads en el evento `form_submit` (GTM). El evento lleva `send_to` con el valor de `SITIO.adsConversion` si está configurado en `src/data/sitio.mjs`.
