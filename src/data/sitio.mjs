// Datos del sitio. Lo que está entre corchetes hay que rellenarlo antes de publicar.
export const SITIO = {
  dominio: "subcontrata.online",
  url: "https://subcontrata.online",
  nombre: "Subcontrata.online",
  lema: "Publica tu obra. Profesionales verificados te llaman con presupuesto en 48 horas. Gratis.",
  destino: "https://reformapresupuesto.com/solicitar",
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

// Valores exactos que admite reformapresupuesto.com/solicitar (URGENCIES y QUALITY_LEVELS).
export const URGENCIAS = [
  { v: "Urgente (menos de 2 semanas)", t: "Cuanto antes (menos de 2 semanas)" },
  { v: "Este mes", t: "Este mes" },
  { v: "Flexible", t: "Sin prisa, estoy comparando" },
];
export const CALIDADES = ["Básica", "Media", "Alta"];
