/**
 * Textos de la interfaz en español.
 * Para agregar otro idioma: crear `en.ts` con la misma forma (el tipo `Messages`
 * obliga a completar todas las claves) y elegirlo en `src/i18n/index.ts`.
 * Nota: los textos largos de algunas páginas todavía están dentro de cada página
 * y se moverán aquí cuando se agregue el segundo idioma.
 */
export const es = {
  brand: "Validex",
  brandTagline: "Encontrá. Analizá. Invertí mejor.",
  nav: {
    home: "Inicio",
    today: "Hoy",
    tantear: "Tantear",
    importer: "Importador",
    opportunities: "Oportunidades",
    catalog: "Catálogo",
    calculator: "Calculadora",
    compare: "Comparar",
    saved: "Guardados",
    settings: "Configuración",
    help: "Ayuda",
    menu: "Menú",
    closeMenu: "Cerrar menú",
    main: "Navegación principal",
  },
  demo: {
    banner:
      "Versión de prueba: hay productos con referencias reales sin verificar y otros ficticios, cada uno marcado. “Oferta por categoría” usa datos reales.",
    badge: "Datos de demostración",
    badgeLong: "Dato ficticio de demostración",
  },
  trend: { up: "Al alza", steady: "Estable", down: "A la baja" },
  competition: { low: "Baja", medium: "Media", high: "Alta" },
  level: {
    favorable: "Señales favorables",
    moderate: "Señales mixtas",
    cautious: "Requiere cautela",
  },
  dataStatus: {
    demo: "Demostración (ficticio)",
    unverified: "Sin verificar",
    verified: "Verificado",
  },
  actions: {
    save: "Guardar",
    saved: "Guardado",
    saveAria: "Guardar en mi lista",
    unsaveAria: "Quitar de mi lista",
    viewProduct: "Ver ficha",
    viewAnalysis: "Ver análisis",
    openCalculator: "Abrir en la calculadora",
    clearFilters: "Quitar filtros",
    retry: "Reintentar",
    backHome: "Volver al inicio",
  },
  states: {
    loading: "Cargando…",
    errorTitle: "Algo salió mal",
    errorBody: "No pudimos mostrar esta página. Podés reintentar o volver al inicio.",
    notFoundTitle: "No encontramos lo que buscabas",
    notFoundBody: "El producto o la página no existe en los datos de demostración.",
  },
  disclaimerShort:
    "Estimaciones ilustrativas, sin garantía de resultados. No es asesoramiento financiero, fiscal ni aduanero.",
  disclaimer:
    "Las estimaciones dependen de los supuestos usados y no garantizan resultados. No constituyen asesoramiento financiero, fiscal, legal ni aduanero, ni una cotización logística real.",
} as const;

type Widen<T> = T extends string ? string : { [K in keyof T]: Widen<T[K]> };
export type Messages = Widen<typeof es>;
