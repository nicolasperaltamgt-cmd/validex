import { DEFAULT_MARKET, importTaxRate } from "../lib/markets";
import { conBase } from "../lib/base-path";
import type { Product, ProductSource } from "./types";

/**
 * PRODUCTOS CON REFERENCIAS REALES, SIN VERIFICAR (relevados el 2026-11-01).
 *
 * Qué es real: los precios de venta publicados en Argentina (Frávega y el rastreador MejoresCompras,
 * que sigue precios de Mercado Libre), los precios de listados de Alibaba / Made-in-China y las señales
 * de búsqueda en alza que informa JaguarSheet con la API de Mercado Libre al 17/8/2026.
 *
 * Qué NO es real: el flete, los impuestos, la competencia y la tendencia de los productos que solo
 * aparecen en listas editoriales. Son estimaciones nuestras y cada ficha las marca como tales.
 * Los precios salen de resultados de búsqueda; no se abrió cada página, y cambian todos los días.
 */

const MARKET = DEFAULT_MARKET;
/** Dólar oficial (venta) de la fecha que figura en `lib/markets.ts` (DolarAPI), para pasar los precios en pesos a dólares. */
export const REFERENCE_RATE_ARS = MARKET.referenceRate.value;
/** IVA general. Los precios publicados lo incluyen; acá se usan sin IVA (neto). */
export const IVA = 1 + MARKET.vat;
/** Derechos de importación + tasa de estadística estimados: 20 % + 0,5 % sobre costo + flete. */
export const DUTY_RATE = importTaxRate(MARKET);
/** Comisión de Mercado Libre usada: 14 % (las fuentes dan 11,8 % a 17,1 % según categoría). */
export const COMMISSION_PCT = MARKET.commission.defaultPct;

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Precio publicado en pesos (con IVA) → dólares netos de IVA. */
export function netUsd(retailArs: number): number {
  return round2(retailArs / IVA / REFERENCE_RATE_ARS);
}

/** Impuestos de importación estimados por unidad (el IVA no se suma: es crédito fiscal para un responsable inscripto). */
export function importTaxes(purchase: number, shipping: number): number {
  return round2((purchase + shipping) * DUTY_RATE);
}

const UPDATED = "2026-11-01";
/** "2026-11-19" → "19/11/2026". */
const fechaCorta = (iso: string) => iso.split("-").reverse().join("/");

const S = {
  trends: {
    label: "JaguarSheet: búsquedas en alza en Mercado Libre Argentina (API oficial, 17/8/2026)",
    url: "https://jaguarsheet.com/es/blog/productos-mas-vendidos-mercado-libre-2026",
  },
  tiendanube: {
    label: "Tiendanube: productos en tendencia 2026 (lista editorial, sin datos)",
    url: "https://www.tiendanube.com/blog/productos-en-tendencia/",
  },
  cyber: {
    label: "ITSitio: CyberMonday 2026, del 2 al 4 de noviembre (nota del 2/11/2026)",
    url: "https://www.itsitio.com/ar/dispositivos/cyber-monday-2026-las-mejores-ofertas-en-tecnologia-celulares-notebooks-y-electrodomesticos/",
  },
  commission: {
    label: "Comisiones de Mercado Libre Argentina: 11,8 % a 17,1 % según categoría",
    url: "https://algoritmodigital.com.ar/cuanto-es-la-comision-de-mercado-libre-por-vender/",
  },
  importer: {
    label: "Para revender hay que importar por régimen general y ser Responsable Inscripto (Cronista)",
    url: "https://www.cronista.com/economia-politica/alta-como-importador-que-requisitos-pide-arca-cuanto-demora-y-que-errores-evitar-en-el-tramite/",
  },
} satisfies Record<string, ProductSource>;

const sharedAssumptions = (fechaPrecio: string) => [
  `El precio de venta es el más bajo que verificamos en las fuentes del producto (el que habría que igualar para vender), publicado en pesos (relevado el ${fechaCorta(fechaPrecio)}), sin IVA y pasado a dólares oficiales de $${REFERENCE_RATE_ARS.toLocaleString("es-AR")} (${MARKET.referenceRate.source}, ${fechaCorta(MARKET.referenceRate.date)}).`,
  "Impuestos de importación: estimamos 20,5 % sobre costo + flete. El real depende de la posición arancelaria (0 % a 35 %) y de tu situación fiscal.",
  "Comisión: 14 %. No incluye el costo fijo por unidad que Mercado Libre cobra en publicaciones de menor precio ni el costo de cuotas.",
  "El flete por unidad es una estimación nuestra, sin cotización de ningún transportista.",
  "Si sos monotributista y no podés computar el IVA de la importación, el cálculo cambia: consultalo con un contador.",
];

const COMMON_RISK =
  "Para revender hay que importar por el régimen general (no sirve la franquicia courier de US$ 400, que es para uso personal).";

interface Seed {
  id: string;
  name: string;
  category: string;
  description: string;
  retailArs: number;
  purchase: number;
  shipping: number;
  trend: Product["trend"];
  competition: Product["competition"];
  sourceNote: string;
  priceSources: ProductSource[];
  supplierSources: ProductSource[];
  assumptions: string[];
  risks: string[];
  opportunities: string[];
  /** Fecha del relevamiento, si es distinta de la general. */
  updatedAt?: string;
}

function build(s: Seed): Product {
  return {
    id: s.id,
    name: s.name,
    category: s.category,
    market: "Argentina",
    description: s.description,
    referencePriceUsd: netUsd(s.retailArs),
    trend: s.trend,
    competition: s.competition,
    costs: {
      purchase: s.purchase,
      shipping: s.shipping,
      taxes: importTaxes(s.purchase, s.shipping),
      commissionPct: COMMISSION_PCT,
    },
    image: conBase(`/images/productos/${s.id}.jpg`),
    updatedAt: s.updatedAt ?? UPDATED,
    dataStatus: "unverified",
    sourceNote: s.sourceNote,
    risks: [...s.risks, COMMON_RISK],
    opportunities: s.opportunities,
    sources: [...s.priceSources, ...s.supplierSources, S.commission, S.importer],
    assumptions: [...s.assumptions, ...sharedAssumptions(s.updatedAt ?? UPDATED)],
    // Precio de venta, listado del proveedor y comisión salen de fuentes abiertas; nada está confirmado con una cotización.
    evidence: {
      salePrice: "publicado",
      purchase: "publicado",
      commission: "publicado",
      trend: s.assumptions.includes(TREND_UP_BASIS) ? "publicado" : "estimado",
      shipping: "estimado",
      taxes: "estimado",
      competition: "estimado",
    },
  };
}

const TREND_UP_BASIS = "Tendencia al alza: figura entre las búsquedas en alza de Mercado Libre Argentina en agosto de 2026. Una búsqueda no es una venta.";
const TREND_STEADY_BASIS = "Tendencia estable por defecto: solo aparece en una lista editorial, sin datos que muestren suba o baja.";
const COMPETITION_BASIS = "Competencia: estimación nuestra según la cantidad de marcas y modelos que vimos publicados. No es una medición.";

export const realProducts: Product[] = [
  build({
    id: "tws-basicos",
    name: "Auriculares inalámbricos TWS básicos",
    category: "Tecnología",
    description: "Auriculares Bluetooth económicos tipo A6s o E6s, muy buscados y con muchísimos vendedores.",
    retailArs: 8500,
    updatedAt: "2026-11-19",
    purchase: 4,
    shipping: 0.8,
    trend: "up",
    competition: "high",
    sourceNote: "Precio ganador (el más bajo verificado el 19/11/2026): A6s en Mercado Libre a $8.500, según MejoresCompras. En Frávega ya no está disponible. Costo: listados de Alibaba ($2,85 a $4,89 por unidad).",
    priceSources: [
      { label: "Frávega: Auriculares Bluetooth A6s TWS (no disponible el 19/11/2026)", url: "https://www.fravega.com/p/auriculares-bluetooth-a6s-tws-rosa-21923518/" },
      { label: "MejoresCompras: A6s en Mercado Libre ($8.500 al 19/11/2026)", url: "https://mejorescompras.com.ar/precio/MLA24217750--auricular-bluetooth-inalambrico-a6s" },
    ],
    supplierSources: [{ label: "Alibaba: listados de TWS (US$ 2,85 a 4,89)", url: "https://electronics.alibaba.com/product/tws-k1" }, S.trends],
    assumptions: [TREND_UP_BASIS, COMPETITION_BASIS, "Costo de compra: US$ 4 por unidad, dentro del rango visto para pedidos de 1 a 100 unidades."],
    risks: ["El margen es mínimo: casi todos los vendedores compiten por precio.", "Los equipos con Bluetooth necesitan homologación para venderse legalmente: verificala antes de importar."],
    opportunities: ["Packs o accesorios (fundas, estuches) con mejor margen que el auricular solo."],
  }),
  build({
    id: "pava-electrica",
    name: "Pava eléctrica de acero inoxidable 1,7 L",
    category: "Hogar y cocina",
    description: "Pava eléctrica 1,7 L, un clásico del mate y el café, con mucha demanda y muchas marcas.",
    retailArs: 36999,
    updatedAt: "2026-11-19",
    purchase: 10,
    shipping: 1.8,
    trend: "up",
    competition: "high",
    sourceNote: "Precio ganador (el más bajo verificado el 19/11/2026): pava Liliana AP150 en Mercado Libre a $36.999, según MejoresCompras. La Ultracomb PE-4916 de Frávega no está disponible hoy. Costo: listados de Alibaba (US$ 5,55 a 15 según pedido mínimo).",
    priceSources: [
      { label: "Frávega: Pava Ultracomb PE-4916 1,7 L (no disponible el 19/11/2026)", url: "https://www.fravega.com/p/pava-electrica-pe-4916-ultracomb-1-7l-2200w-acero-inoxidable-21198231/" },
      { label: "MejoresCompras: Pava Liliana AP150 ($36.999 al 19/11/2026)", url: "https://mejorescompras.com.ar/precio/MLA59803726--pava-electrica-liliana-ap150-acero-inoxidable-1-7l-plateado" },
    ],
    supplierSources: [{ label: "Alibaba: pavas 1,7 L de acero (US$ 5,55 a 15)", url: "https://www.alibaba.com/product-detail/1-7L-Stainless-Steel-Electric-Tea_60801205676.html" }, S.trends, S.tiendanube],
    assumptions: [TREND_UP_BASIS, COMPETITION_BASIS, "Costo de compra: US$ 10 por unidad. Los pedidos mínimos van de 500 a 3.700 unidades."],
    risks: ["Pedido mínimo alto (cientos de unidades): mucha plata inmovilizada.", "Los artefactos eléctricos requieren certificación de seguridad para venderse: verificala antes de importar."],
    opportunities: ["Modelos con control de temperatura para mate, que se publican a mejor precio."],
  }),
  build({
    id: "fuente-agua-gatos",
    name: "Fuente de agua eléctrica para gatos",
    category: "Mascotas",
    description: "Bebedero con circulación de agua para gatos. Las búsquedas de productos para gatos van en alza.",
    retailArs: 55350,
    purchase: 10.5,
    shipping: 2,
    trend: "up",
    competition: "medium",
    sourceNote: "Precio: la fuente de marca Catit más barata que vimos en Mercado Libre ($55.350); un genérico se venderá por menos, sin precio verificado. Costo: listados de 2 L (US$ 10,3 a 10,83).",
    priceSources: [{ label: "Mercado Libre: fuentes Catit (listado)", url: "https://listado.mercadolibre.com.ar/fuente-catit" }],
    supplierSources: [
      { label: "Global Sources: fuente de 2 L (US$ 10,3 a 10,83)", url: "https://m.globalsources.com/Pet-waterer/pet-supplies-1233629135p.htm" },
      S.trends,
    ],
    assumptions: [
      TREND_UP_BASIS,
      "Competencia media: estimación nuestra; la marca Catit domina lo que vimos, y los genéricos eran pocos.",
      "ATENCIÓN: el precio de venta es el de una marca reconocida. Un genérico probablemente se venda más barato y el margen real sea menor.",
    ],
    risks: ["Compararte con una marca conocida te obliga a vender más barato.", "Es un artefacto eléctrico: requiere certificación de seguridad."],
    opportunities: ["Filtros de repuesto vendidos aparte, con recompra."],
  }),
  build({
    id: "cama-gatos",
    name: "Cama para gatos tipo moisés",
    category: "Mascotas",
    description: "Cama acolchada y lavable para gatos o perros chicos.",
    retailArs: 29691,
    updatedAt: "2026-11-19",
    purchase: 6.8,
    shipping: 2.5,
    trend: "up",
    competition: "high",
    sourceNote: "Precio ganador (el más bajo verificado el 19/11/2026): cama moisés Lola Pets Alaska en Mercado Libre ($29.691, según MejoresCompras). Costo: listados de Alibaba (US$ 6,2 a 7,44).",
    priceSources: [{ label: "MejoresCompras: Cama moisés Lola Pets Alaska", url: "https://mejorescompras.com.ar/precio/MLA37799865--cama-moises-para-gato-lola-pets-alaska-mediano" }],
    supplierSources: [{ label: "Alibaba y Global Sources: camas para gatos (US$ 6,2 a 12)", url: "https://www.globalsources.com/category/cat-beds-for-sale-price_32933/" }, S.trends],
    assumptions: [TREND_UP_BASIS, COMPETITION_BASIS, "Es un producto voluminoso: el flete real puede ser bastante mayor al estimado."],
    risks: ["Producto grande y liviano: el flete por volumen pesa mucho.", "Hay camas locales a buen precio."],
    opportunities: ["Camas antiansiedad de tela sintética, que se publican bastante más caras."],
  }),
  build({
    id: "cortina-roller-blackout",
    name: "Cortina roller blackout 160 × 160 cm",
    category: "Hogar",
    description: "Cortina enrollable que bloquea la luz, una de las búsquedas de hogar en alza.",
    retailArs: 59805,
    updatedAt: "2026-11-19",
    purchase: 8.4,
    shipping: 2.2,
    trend: "up",
    competition: "high",
    sourceNote: "Precio ganador (el más bajo verificado el 18/11/2026): cortina Roller Pro 160×160 en Mercado Libre ($59.805, sin descuento real, según MejoresCompras). Costo: tela US$ 2,50 por m² (Alibaba) más un estimado nuestro de herrajes.",
    priceSources: [{ label: "MejoresCompras: cortina roller blackout 160×160", url: "https://mejorescompras.com.ar/precio/MLA40554271--cortina-roller-blackout-160x160cm-blanco-roller-pro-black-out-100-bloqueante-solar-facil-instalacion-tela-pvc-resistente-aislante-termico-y-acustico-soportes-metalicos-160-ancho-x-160-alto" }],
    supplierSources: [{ label: "Alibaba: tela roller blackout (US$ 2,50 por m²)", url: "https://xrblinds.en.alibaba.com/product/60742355210-938741524/Free_sample_blackout_or_sunscreen_roller_blinds_fabric.html" }, S.trends],
    assumptions: [
      TREND_UP_BASIS,
      COMPETITION_BASIS,
      "Costo de compra: 2,56 m² de tela a US$ 2,50 = US$ 6,40, más US$ 2 de tubo y soportes que son una estimación nuestra, sin fuente.",
    ],
    risks: ["Se vende por medidas: muchas variantes de stock.", "No encontramos precio de cortina terminada por unidad, solo de la tela."],
    opportunities: ["Fabricar a medida en el país con tela importada, que evita la logística de producto terminado."],
  }),
  build({
    id: "horno-pizza-portatil",
    name: "Horno de pizza portátil para exterior (12 pulgadas)",
    category: "Cocina y exterior",
    description: "Horno a leña o pellets para el jardín. Producto de ticket alto con poca competencia visible.",
    retailArs: 795057,
    updatedAt: "2026-11-19",
    purchase: 70,
    shipping: 25,
    trend: "steady",
    competition: "medium",
    sourceNote: "Precio ganador (el más bajo verificado el 19/11/2026): Costway 4 en 1 en Frávega a $795.057 (tachado $911.999). Costo: Made-in-China (US$ 49 a 86, pedido mínimo 100 a 500). Aparece en una lista editorial de tendencias.",
    priceSources: [{ label: "Frávega: Horno de pizza Costway 4 en 1", url: "https://www.fravega.com/p/horno-de-pizza-costway-4-1-para-aire-libre-con-piedra-pa-22807082/" }],
    supplierSources: [{ label: "Made-in-China: horno 4 en 1 con piedra de 12 pulgadas", url: "https://www.madeinchina.com/mall/show-4-in-1-Outdoor-Portable-Pizza-Oven-with-12-Inch-Pizza-Stone_1194805.html" }, S.tiendanube],
    assumptions: [TREND_STEADY_BASIS, "Competencia media: estimación nuestra, había varios modelos pero pocos vendedores grandes.", "Costo de compra: US$ 70, entre los dos precios vistos. Es un producto pesado: el flete real puede ser mayor."],
    risks: ["Ticket alto: mucho capital en juego por unidad.", "Solo vimos precios de Frávega; falta confirmar a cuánto se vende en Mercado Libre."],
    opportunities: ["Es estacional: las ventas suben antes del verano."],
  }),
  build({
    id: "afeitadora-usb",
    name: "Afeitadora eléctrica recargable USB para hombre",
    category: "Cuidado personal",
    description: "Afeitadora rotativa recargable por USB, de las que se venden por cientos en Mercado Libre.",
    retailArs: 42790,
    purchase: 5.5,
    shipping: 1,
    trend: "steady",
    competition: "high",
    sourceNote: "Precio: afeitadora VGR V-325 en MejoresCompras ($42.790; rango $40.000 a $85.000). Costo: Alibaba, modelos Kemei (US$ 5,53 a 8,41).",
    priceSources: [{ label: "MejoresCompras: afeitadoras eléctricas en Mercado Libre", url: "https://mejorescompras.com.ar/salud-y-equipamiento-medico/mejor-afeitadora-electrica-argentina-2026" }],
    supplierSources: [{ label: "Alibaba: afeitadoras USB (US$ 2,99 a 10,50)", url: "https://pritech10.en.alibaba.com/product/1600081683478-903067628/PRITECH_Men_Grooming_Set_3_in_1_multifunction_waterproof_Razor_USB_Rechargeable_Electric_Shaver.html" }, S.tiendanube],
    assumptions: [TREND_STEADY_BASIS, COMPETITION_BASIS, "Costo de compra: US$ 5,5 por unidad, el de un modelo Kemei."],
    risks: ["Marcas locales conocidas (VGR, Westinghouse) ya dominan.", "Tiene batería de litio: el envío aéreo tiene restricciones, consultá al transportista."],
    opportunities: ["Combos con recortadora de barba."],
  }),
  build({
    id: "power-bank-10000",
    name: "Batería externa (power bank) 10.000 mAh",
    category: "Accesorios de celular",
    description: "Cargador portátil de 10.000 mAh, producto de consumo masivo con mucha oferta de marcas.",
    retailArs: 38500,
    updatedAt: "2026-11-19",
    purchase: 7.5,
    shipping: 1.5,
    trend: "steady",
    competition: "high",
    sourceNote: "Precio ganador (el más bajo verificado el 17/11/2026): Alpina 10.000 mAh en Mercado Libre ($38.500, antes $42.990, según MejoresCompras). Costo: Global Sources y blog de Alibaba (US$ 5,30 a 12).",
    priceSources: [{ label: "MejoresCompras: Power bank Alpina 10.000 mAh", url: "https://mejorescompras.com.ar/precio/MLA50054649--powerbank-alpina-cargador-portatil-10000mah-c-cables-rapido-color-blanco" }],
    supplierSources: [{ label: "Alibaba: guía de power banks de 10.000 mAh", url: "https://seller.alibaba.com/blogs/2026/southeast-asia/consumer-electronics/10000mah-power-bank-capacity-guide-alibaba-b2b" }, S.tiendanube],
    assumptions: [TREND_STEADY_BASIS, COMPETITION_BASIS, "Costo de compra: US$ 7,5. Los precios son de un blog y un agregador, no de una cotización."],
    risks: ["Baterías de litio: restricciones de envío y requisitos de seguridad.", "Marcas conocidas (Xiaomi, Energizer) fijan el precio."],
    opportunities: ["Modelos con carga magnética inalámbrica, con mejor precio."],
  }),
  build({
    id: "smartwatch-generico",
    name: "Smartwatch genérico con llamadas Bluetooth",
    category: "Tecnología",
    description: "Reloj inteligente económico con pantalla táctil y llamadas, de los que se venden sin marca.",
    retailArs: 34000,
    updatedAt: "2026-11-19",
    purchase: 14,
    shipping: 0.8,
    trend: "steady",
    competition: "high",
    sourceNote: "Precio ganador (el más bajo verificado el 19/11/2026): un genérico en Mercado Libre a $34.000, según MejoresCompras. Costo: Alibaba (US$ 5,95 a 29).",
    priceSources: [{ label: "MejoresCompras: smartwatch genérico", url: "https://mejorescompras.com.ar/precio/MLA28570964--smartwatch-generica-reloj-inteligente-con-correa-de-silicona-con-caja-color-negro" }],
    supplierSources: [{ label: "Alibaba: smartwatches con llamadas (US$ 5,95 a 29)", url: "https://electronics.alibaba.com/product/hw28-smartwatch" }, S.tiendanube],
    assumptions: [TREND_STEADY_BASIS, COMPETITION_BASIS, "Costo de compra: US$ 14, de un modelo con llamadas y pantalla AMOLED. Los más baratos (US$ 6) suelen ser de peor calidad."],
    risks: ["El margen es negativo con los números de hoy: el precio de venta apenas cubre el costo.", "Tiene batería de litio y radio: requiere homologación."],
    opportunities: ["Correas y accesorios, con mejor margen que el reloj."],
  }),
  build({
    id: "maquina-soda",
    name: "Máquina de soda hogareña",
    category: "Hogar y cocina",
    description: "Gasificadora de agua para el hogar. SodaStream domina; existen alternativas genéricas.",
    retailArs: 89102,
    purchase: 17.1,
    shipping: 4,
    trend: "steady",
    competition: "high",
    sourceNote: "Precio: SodaStream Terra en Mercado Libre ($89.102; rango $89.000 a $334.000). Costo: Alibaba, gasificadoras de US$ 11 a 18,7 (pedido mínimo 500 a 1.000).",
    priceSources: [{ label: "MejoresCompras: máquinas de soda en Mercado Libre", url: "https://mejorescompras.com.ar/precio/categoria/maquinas-para-hacer-soda-y-sifones" }],
    supplierSources: [{ label: "Alibaba: gasificadora con infusión (US$ 16,6 a 18,7)", url: "https://www.alibaba.com/product-introduction/Sparkling-Water-Maker-and-Soda-Streaming_1600629750871.html" }, S.tiendanube],
    assumptions: [TREND_STEADY_BASIS, COMPETITION_BASIS, "El precio de venta es el de una marca líder. Un genérico sin marca probablemente deba venderse más barato."],
    risks: ["La marca líder define el precio y las recargas de CO2.", "Equipo con gas a presión: requiere cumplir normas de seguridad."],
    opportunities: ["Vender cilindros y botellas compatibles, con recompra."],
  }),

  // Productos sumados el 3/11/2026, durante el CyberMonday (2 al 4 de noviembre). Los precios son referencias
  // publicadas, no confirmadas como oferta del evento: en esa semana los precios cambian por hora.
  build({
    id: "robot-aspirador-wifi",
    name: "Robot aspirador con WiFi y app",
    category: "Hogar",
    description: "Aspirador robot con sensor anticaídas y control desde el celular. Aparece en las promociones del CyberMonday 2026.",
    retailArs: 155000,
    purchase: 47,
    shipping: 6,
    trend: "steady",
    competition: "high",
    updatedAt: "2026-11-19",
    sourceNote: "Precio ganador (el más bajo verificado el 19/11/2026): Gadnic en Frávega ($155.000; tachado $201.500). En el CyberMonday 2025 el modelo básico llegó a $127.149. Costo: listado de robot WiFi 118HW (US$ 43 a 50).",
    priceSources: [
      { label: "Frávega: Aspiradora robot Gadnic (lista $155.000 al 19/11/2026)", url: "https://www.fravega.com/p/aspiradora-robot-gadnic-potente-succion-sensor-anti-caidas-filtro-hepa-lavable-deposito-extraible-990256555/" },
      { label: "Río Negro: precios de robots aspiradores en el CyberMonday 2025 (5/11/2025)", url: "https://www.rionegro.com.ar/?p=4361368" },
    ],
    supplierSources: [{ label: "Robot aspirador WiFi 118HW (US$ 43 a 50)", url: "https://china.org.ru/product/1600865704196" }, S.cyber],
    assumptions: [
      TREND_STEADY_BASIS,
      COMPETITION_BASIS,
      "Costo de compra: US$ 47, a mitad del rango del listado. El precio real depende del pedido y del proveedor.",
      "Flete: US$ 6 por unidad, estimación nuestra para un equipo de unos 3 kg.",
      "El precio de venta es el publicado en Frávega: no confirmamos que sea una oferta del CyberMonday 2026.",
    ],
    risks: [
      "Con el precio publicado el margen es muy ajustado: hay marcas locales (Gadnic, Ultracomb, Cecotec) que ya compiten por precio.",
      "Tiene batería de litio: el envío aéreo tiene restricciones, consultá al transportista.",
      "Requiere certificación eléctrica y de compatibilidad para venderse en Argentina.",
    ],
    opportunities: ["Vender repuestos (cepillos, filtros) con recompra."],
  }),
  build({
    id: "camara-wifi-ptz",
    name: "Cámara de seguridad WiFi interior con giro",
    category: "Seguridad del hogar",
    description: "Cámara interior con visión nocturna y giro remoto, usada para el hogar, bebés y mascotas.",
    retailArs: 32999,
    purchase: 12.74,
    shipping: 1,
    trend: "steady",
    competition: "high",
    updatedAt: "2026-11-19",
    sourceNote: "Precio ganador (el más bajo verificado el 19/11/2026): Noax PTZ A7 en Mercado Libre ($32.999, según MejoresCompras; en la semana del CyberMonday estaba en $22.999). Costo: Alibaba, cámara WiFi 2MP (US$ 11,50 a 12,74); los modelos PTZ de 1080p llegan a US$ 20,69.",
    priceSources: [{ label: "MejoresCompras: Noax PTZ A7 interior", url: "https://mejorescompras.com.ar/precio/MLA42978997" }],
    supplierSources: [
      { label: "Alibaba: cámara WiFi 2MP con visión nocturna (US$ 11,50 a 12,74)", url: "https://www.alibaba.com/product-introduction/2MP-Wireless-Mini-Camera-Night-Vision_1600905425254.html" },
      { label: "Alibaba: cámara PTZ WiFi 1080p (US$ 15,13 a 20,69)", url: "https://www.alibaba.com/product-introduction/Good-export-quality-Security-monitoring-equipment_1600082097282.html" },
      S.cyber,
    ],
    assumptions: [
      TREND_STEADY_BASIS,
      COMPETITION_BASIS,
      "Costo de compra: US$ 12,74, el del modelo de 2 MP. Un modelo con giro (PTZ) de 1080p cuesta más y empeora la cuenta.",
      "El precio de venta es el de un modelo de marca local de entrada; las marcas conocidas (Tapo, Ezviz, Imou) se venden bastante más caras.",
    ],
    risks: [
      "Con este precio de venta el costo de importar no deja margen: solo cierra si se vende como marca propia a un precio mayor.",
      "Los equipos con WiFi necesitan homologación para venderse legalmente: verificala antes de importar.",
      "Es un producto sensible en privacidad: cuidado con la seguridad de la app y las claves de fábrica.",
    ],
    opportunities: ["Venderla en packs de 2 o con tarjeta de memoria incluida."],
  }),
  build({
    id: "freidora-aire-4l",
    name: "Freidora de aire digital de 4 litros",
    category: "Cocina",
    description: "Freidora de aire con panel táctil. Es uno de los electrodomésticos más buscados en las promociones del CyberMonday.",
    retailArs: 52799,
    purchase: 28.5,
    shipping: 5,
    trend: "steady",
    competition: "high",
    updatedAt: "2026-11-03",
    sourceNote: "Precio: PowerXL de 3,8 L en Mercado Libre ($52.799, según MejoresCompras; hay 64 modelos en su rastreador). Costo: Alibaba, freidora de 4 L táctil (US$ 28,50, pedido mínimo de 1.000 unidades).",
    priceSources: [{ label: "MejoresCompras: mejores freidoras de aire 2026", url: "https://mejorescompras.com.ar/pequenos-electrodomesticos/mejores-freidoras-aire-argentina-2026" }],
    supplierSources: [{ label: "Alibaba: freidora de aire 4 L con panel táctil (US$ 28,50 por 1.000 o más)", url: "https://www.alibaba.com/product-introduction/Hot-Sale-Power-off-Memory-Function_1601058582491.html" }, S.cyber],
    assumptions: [
      TREND_STEADY_BASIS,
      COMPETITION_BASIS,
      "Costo de compra: US$ 28,50 por unidad, pero con un pedido mínimo de 1.000 unidades (unos US$ 28.500 solo en mercadería). Para pedidos chicos el precio es mayor.",
      "Flete: US$ 5 por unidad, estimación nuestra para un equipo voluminoso.",
    ],
    risks: [
      "Con este precio de venta el margen es negativo: importar una marca sin nombre no compite con las que ya se venden a este precio.",
      "El pedido mínimo exige mucho capital de entrada.",
      "Requiere certificación eléctrica para venderse en Argentina.",
    ],
    opportunities: ["Vender accesorios (papel para freidora, moldes) con recompra."],
  }),

  // Sumados el 3/11/2026 buscando mejor margen: la temporada de calor empieza y el costo de compra es bajo frente al precio de venta.
  build({
    id: "ventilador-mano-recargable",
    name: "Ventilador de mano recargable por USB",
    category: "Hogar",
    description: "Ventilador portátil de mano con batería recargable y varias velocidades. Se vende mucho al empezar el calor.",
    retailArs: 14520,
    purchase: 2.96,
    shipping: 0.6,
    trend: "steady",
    competition: "high",
    updatedAt: "2026-11-19",
    sourceNote: "Precio ganador (el más bajo verificado el 19/11/2026): ventilador de mano de 4 velocidades en Mercado Libre ($14.520, según MejoresCompras). Costo: Alibaba, ventilador de mano turbo de 1.800 mAh (US$ 2,96 por 10 a 499 unidades).",
    priceSources: [{ label: "MejoresCompras: ventilador portátil de 4 velocidades USB", url: "https://mejorescompras.com.ar/precio/MLA2069262668--ventilador-de-po-portatil-de-4-velocidades-usb-recarregavel" }],
    supplierSources: [{ label: "Alibaba: ventilador de mano turbo USB recargable (US$ 2,65 a 2,96)", url: "https://www.alibaba.fr/product-detail/199-Speed-USB-Rechargeable-Handheld-Turbo_1601727917568.html" }],
    assumptions: [
      "Tendencia estable por defecto. La demanda de ventiladores sube con el calor (noviembre a febrero en Argentina), pero no tenemos datos propios que lo midan.",
      COMPETITION_BASIS,
      "Costo de compra: US$ 2,96 por unidad, para pedidos de 10 a 499 unidades. Los precios de Alibaba cambian con la cantidad y hay que confirmarlos con el proveedor.",
      "Flete: US$ 0,60 por unidad, estimación nuestra para un equipo de unos 200 g.",
      "El precio de venta es de un solo listado con 3 días de historial: puede no ser el precio habitual.",
    ],
    risks: [
      "Tiene batería de litio: el envío aéreo tiene restricciones y puede encarecer el flete. Consultá al transportista.",
      "Los equipos con batería y cargador necesitan certificación eléctrica para venderse en Argentina: verificala antes de importar.",
      "Hay muchísimos vendedores con productos parecidos: es difícil diferenciarse por precio.",
      "Es estacional: fuera del verano la demanda baja.",
    ],
    opportunities: ["Vender combos (ventilador de mano más de cuello) para las olas de calor.", "Pedir packs con colores y logo propio."],
  }),
  build({
    id: "termo-acero-1l",
    name: "Termo de acero inoxidable de 1 litro",
    category: "Hogar",
    description: "Termo de doble pared para mate y agua caliente o fría, de uso diario en Argentina.",
    retailArs: 25249,
    purchase: 5.8,
    shipping: 1.8,
    trend: "steady",
    competition: "high",
    updatedAt: "2026-11-19",
    sourceNote: "Precio ganador (el más bajo verificado el 19/11/2026): termo Philco de 1 L en Frávega ($25.249; tachado $34.999). En Mercado Libre, el Sumate de 1 L está a $27.999, según MejoresCompras. Costo: Alibaba, termo de acero 18/8 (US$ 5,80 por 20 a 499 unidades).",
    priceSources: [
      { label: "MejoresCompras: termos en Mercado Libre (Sumate 1 L, $27.999 al 19/11/2026)", url: "https://mejorescompras.com.ar/precio/categoria/termos" },
      { label: "Frávega: termo Philco de 1 L (lista $25.249 al 19/11/2026; tachado $34.999)", url: "https://www.fravega.com/termo-philco-acero-inoxidable-1-litro-negro-562736/p" },
    ],
    supplierSources: [{ label: "Alibaba: termo de acero inoxidable 18/8 de 1 L (US$ 4,20 a 5,80)", url: "https://www.alibaba.com/product-introduction/1-9L-1-4L-1L-Classic_1600839245217.html" }],
    assumptions: [
      "Tendencia estable por defecto: es un producto de uso todo el año, sin datos que muestren suba o baja.",
      COMPETITION_BASIS,
      "Costo de compra: US$ 5,80 por unidad. El listado reúne varios tamaños (1 L, 1,4 L y 1,9 L): hay que confirmar con el proveedor el precio del de 1 L.",
      "Flete: US$ 1,80 por unidad, estimación nuestra para un termo de unos 600 g.",
      "Un listado de Alibaba muestra US$ 1,33 por un termo de 1 L, pero no confirma el material: no lo usamos para el cálculo.",
    ],
    risks: [
      "Las marcas conocidas (Stanley, Lumilagro, Alpina) se venden mucho más caras: un termo sin marca compite por precio y confianza.",
      "Si la competencia baja de $25.249, el margen se achica.",
      "La calidad del aislamiento varía mucho: pedí una muestra y probala antes de comprar en cantidad.",
    ],
    opportunities: ["Pack termo más mate y bombilla.", "Personalizar con grabado o colores."],
  }),
];
