import type { Product } from "./types";

const DEMO_SOURCE =
  "Dato ficticio de demostración. No proviene de ninguna fuente real ni de proveedores reales.";

/**
 * PRODUCTOS DE DEMOSTRACIÓN — TODOS FICTICIOS.
 * Los nombres, precios, costos y señales fueron inventados solo para probar la interfaz.
 * No representan ventas, tendencias, competidores ni proveedores reales.
 */
export const products: Product[] = [
  {
    id: "demo-botella-termica",
    name: "Botella térmica de acero (modelo demo A)",
    category: "Hogar y cocina",
    market: "Argentina",
    description:
      "Producto ficticio para ilustrar un artículo de consumo cotidiano con competencia amplia.",
    referencePriceUsd: 24,
    trend: "steady",
    competition: "high",
    costs: { purchase: 6.5, shipping: 2.2, taxes: 4.8, commissionPct: 12 },
    updatedAt: "2026-10-12",
    dataStatus: "demo",
    sourceNote: DEMO_SOURCE,
    risks: [
      "Mercado con muchas marcas: diferenciarse puede exigir inversión en marca.",
      "Los costos de envío ilustrativos podrían variar mucho con el volumen.",
    ],
    opportunities: [
      "Packs corporativos o personalizados como nicho posible.",
      "Venta cruzada con otros artículos de cocina.",
    ],
  },
  {
    id: "demo-organizador-cables",
    name: "Organizador de cables de escritorio (modelo demo B)",
    category: "Oficina",
    market: "México",
    description:
      "Producto ficticio de bajo costo unitario, pensado para ilustrar márgenes ajustados.",
    referencePriceUsd: 12,
    trend: "up",
    competition: "medium",
    costs: { purchase: 2.1, shipping: 1.1, taxes: 1.6, commissionPct: 10 },
    updatedAt: "2026-10-18",
    dataStatus: "demo",
    sourceNote: DEMO_SOURCE,
    risks: [
      "Precio unitario bajo: un error de costos afecta mucho el margen.",
      "Fácil de copiar por otros vendedores.",
    ],
    opportunities: [
      "Combinar con kits de home office.",
      "Variantes de color para segmentar públicos.",
    ],
  },
  {
    id: "demo-lampara-solar",
    name: "Lámpara solar para jardín (modelo demo C)",
    category: "Exterior y jardín",
    market: "España",
    description:
      "Producto ficticio estacional, útil para ilustrar el riesgo de demanda irregular.",
    referencePriceUsd: 28,
    trend: "up",
    competition: "medium",
    costs: { purchase: 7, shipping: 3.4, taxes: 3.9, commissionPct: 13 },
    updatedAt: "2026-09-30",
    dataStatus: "demo",
    sourceNote: DEMO_SOURCE,
    risks: [
      "Demanda estacional: el stock puede quedar inmovilizado fuera de temporada.",
      "Posibles requisitos de certificación según el mercado (a verificar por el usuario).",
    ],
    opportunities: [
      "Preventa antes de temporada para reducir riesgo de stock.",
      "Ventas en packs de varias unidades.",
    ],
  },
  {
    id: "demo-soporte-notebook",
    name: "Soporte plegable para notebook (modelo demo D)",
    category: "Oficina",
    market: "Chile",
    description:
      "Producto ficticio de tamaño compacto, con envío relativamente simple.",
    referencePriceUsd: 32,
    trend: "steady",
    competition: "medium",
    costs: { purchase: 8.5, shipping: 2.6, taxes: 4.2, commissionPct: 11 },
    updatedAt: "2026-10-05",
    dataStatus: "demo",
    sourceNote: DEMO_SOURCE,
    risks: [
      "Diferencias de calidad entre lotes podrían generar devoluciones.",
      "Precio sensible a la comparación directa con otras publicaciones.",
    ],
    opportunities: [
      "Segmento de trabajo remoto y estudiantes.",
      "Accesorios complementarios de bajo costo.",
    ],
  },
  {
    id: "demo-set-yoga",
    name: "Set de accesorios de yoga (modelo demo E)",
    category: "Deportes y bienestar",
    market: "Colombia",
    description:
      "Producto ficticio de una categoría con alta rotación de novedades.",
    referencePriceUsd: 38,
    trend: "down",
    competition: "high",
    costs: { purchase: 13, shipping: 4.8, taxes: 6, commissionPct: 14 },
    updatedAt: "2026-08-21",
    dataStatus: "demo",
    sourceNote: DEMO_SOURCE,
    risks: [
      "Señal de interés a la baja en este ejemplo ficticio.",
      "Competencia alta y comisiones elevadas reducen el margen.",
    ],
    opportunities: [
      "Posicionamiento premium con materiales diferenciados.",
      "Alianzas con instructores o estudios (a explorar).",
    ],
  },
  {
    id: "demo-comedero-mascotas",
    name: "Comedero lento para mascotas (modelo demo F)",
    category: "Mascotas",
    market: "Uruguay",
    description:
      "Producto ficticio de nicho con competencia aún limitada en este ejemplo.",
    referencePriceUsd: 18,
    trend: "up",
    competition: "low",
    costs: { purchase: 3.2, shipping: 1.9, taxes: 2.3, commissionPct: 10 },
    updatedAt: "2026-10-22",
    dataStatus: "demo",
    sourceNote: DEMO_SOURCE,
    risks: [
      "Un mercado pequeño limita el volumen posible.",
      "La baja competencia actual puede cambiar si entran otros vendedores.",
    ],
    opportunities: [
      "Contenido educativo para dueños de mascotas.",
      "Ampliar a otros países de la región tras validar.",
    ],
  },
  {
    id: "demo-auriculares-basicos",
    name: "Auriculares inalámbricos básicos (modelo demo G)",
    category: "Electrónica",
    market: "Estados Unidos",
    description:
      "Producto ficticio de electrónica de consumo, con riesgos de garantía y devoluciones.",
    referencePriceUsd: 45,
    trend: "steady",
    competition: "high",
    costs: { purchase: 16, shipping: 3.1, taxes: 5.5, commissionPct: 15 },
    updatedAt: "2026-09-14",
    dataStatus: "demo",
    sourceNote: DEMO_SOURCE,
    risks: [
      "Electrónica: posibles exigencias regulatorias y de garantía (a verificar).",
      "Competencia muy alta y comisiones altas.",
    ],
    opportunities: [
      "Nicho específico (p. ej. deporte o estudio) para evitar la competencia frontal.",
    ],
  },
  {
    id: "demo-kit-cultivo",
    name: "Kit de cultivo de hierbas para interior (modelo demo H)",
    category: "Exterior y jardín",
    market: "Perú",
    description:
      "Producto ficticio de regalo y decoración, con posible demanda en fechas especiales.",
    referencePriceUsd: 22,
    trend: "up",
    competition: "low",
    costs: { purchase: 5.2, shipping: 3.6, taxes: 3.1, commissionPct: 12 },
    updatedAt: "2026-10-27",
    dataStatus: "demo",
    sourceNote: DEMO_SOURCE,
    risks: [
      "Producto con semillas: pueden aplicar restricciones de importación (a verificar).",
      "Empaque frágil: riesgo de daños en tránsito.",
    ],
    opportunities: [
      "Venta como regalo en fechas especiales.",
      "Suscripción de recambios (idea a validar).",
    ],
  },
];
