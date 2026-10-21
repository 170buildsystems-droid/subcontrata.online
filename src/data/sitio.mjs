// Datos del sitio. Lo que está entre corchetes hay que rellenarlo antes de publicar.
export const SITIO = {
  dominio: "subcontrata.online",
  url: "https://subcontrata.online",
  nombre: "Subcontrata.online",
  lema: "Publica tu obra. Profesionales verificados te llaman con presupuesto en 48 horas. Gratis.",
  // La solicitud se envía por API a la plataforma del grupo; el visitante no sale de esta web.
  api: "https://reformapresupuesto.com/api/public/leads/subcontrata",
  destinoNombre: "reformapresupuesto.com",
  titular: "170 Build&Systems",
  nombreComercial: "reformapresupuesto170",
  nif: "X2741455Q",
  domicilio: "Calle Luis Vives, 7 — 12580 (Castellón)",
  email: "legal@170buildsystems.com",
  telefono: "964 95 94 17",
  gtmId: "GTM-WRQTGQ9P", // contenedor "subcontrata.online" en la cuenta GTM reformapresupuesto.com (vacío = no se carga nada)
  adsConversion: "", // p. ej. "AW-18327428753/XXXXXXXXXXXX"
  anio: new Date().getFullYear(),
};

export const TIPOS = [
  "Reforma integral", "Cocina", "Baño", "Pintura", "Electricidad", "Fontanería",
  "Albañilería", "Carpintería", "Suelos", "Ventanas", "Pladur", "Climatización",
];

// Valores que entiende la API de leads de reformapresupuesto.com (validarLeadExterno).
export const URGENCIAS = [
  { v: "esta semana", t: "Cuanto antes (menos de 2 semanas)" },
  { v: "este mes", t: "Este mes" },
  { v: "sin prisa", t: "Sin prisa, estoy comparando" },
];
export const CALIDADES = ["básica", "media", "alta"];
