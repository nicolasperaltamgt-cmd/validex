import type { Product } from "@/data/types";
import { calculate } from "./calculator";
import { formatMoney, formatPercent } from "./format";
import { scoreProduct } from "./score";

/**
 * "El Importador": responde con reglas fijas, los productos de Validex y fuentes citadas.
 * NO usa IA ni inventa datos: si no sabe, lo dice. No es asesoramiento aduanero ni fiscal.
 */

export interface Fuente {
  label: string;
  url: string;
}

export interface Respuesta {
  tema: string;
  parrafos: string[];
  fuentes?: Fuente[];
  /** Enlaces dentro de Validex. */
  enlaces?: { label: string; href: string }[];
}

export interface Contexto {
  productos: Product[];
  dolar: { blue: number; oficial: number; ccl: number } | null;
}

/** Dudas frecuentes de quien arranca. Son generales a propósito: cada persona escribe después la suya. */
export const SUGERENCIAS = [
  "¿Qué necesito para importar y revender?",
  "¿Cómo se calculan los impuestos?",
  "¿Qué producto me conviene importar?",
  "¿Cuánto cobra Mercado Libre por vender?",
];

const F = {
  courier: {
    label: "ARCA: Régimen de Courier",
    url: "https://servicioscf.afip.gob.ar/publico/sitio/contenido/novedad/ver.aspx?id=5939",
  },
  courierNota: {
    label: "iProfesional: pautas de ARCA para compras con el nuevo régimen postal",
    url: "https://www.iprofesional.com/impuestos/463474-las-pautas-de-arca-para-hacer-compras-con-el-nuevo-regimen-postal",
  },
  importador: {
    label: "Cronista: alta como importador, requisitos y errores a evitar",
    url: "https://www.cronista.com/economia-politica/alta-como-importador-que-requisitos-pide-arca-cuanto-demora-y-que-errores-evitar-en-el-tramite/",
  },
  guiaImportar: {
    label: "Arancely: cómo importar a Argentina, guía 2026",
    url: "https://www.arancely.com/blog/como-importar-argentina-guia-completa-2026",
  },
  percepciones: {
    label: "Contadores en Red: percepciones de Ganancias e IVA para importadores",
    url: "https://contadoresenred.com/importadores-se-extiende-plazo-de-excepcion-para-percepcion-de-ganancias-e-iva/",
  },
  comision: {
    label: "Algoritmo Digital: cuánto cobra Mercado Libre por vender",
    url: "https://algoritmodigital.com.ar/cuanto-es-la-comision-de-mercado-libre-por-vender/",
  },
  tendencias: {
    label: "JaguarSheet: búsquedas en alza en Mercado Libre Argentina (17/8/2026)",
    url: "https://jaguarsheet.com/es/blog/productos-mas-vendidos-mercado-libre-2026",
  },
  dolar: { label: "DolarAPI", url: "https://dolarapi.com" },
} satisfies Record<string, Fuente>;

export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Palabras que identifican cada producto de la lista. */
const PALABRAS_PRODUCTO: Record<string, string[]> = {
  "tws-basicos": ["tws", "auricular", "earbud", "airpod"],
  "pava-electrica": ["pava", "hervidor", "kettle"],
  "fuente-agua-gatos": ["fuente de agua", "bebedero", "fuente para gato", "fuente gato"],
  "cama-gatos": ["cama para gato", "cama de gato", "cama gato", "cama para mascota", "moises"],
  "cortina-roller-blackout": ["cortina", "roller", "blackout"],
  "horno-pizza-portatil": ["horno", "pizza", "pizzero"],
  "afeitadora-usb": ["afeitadora", "afeitar", "shaver", "maquina de afeitar"],
  "power-bank-10000": ["power bank", "powerbank", "bateria externa", "cargador portatil"],
  "smartwatch-generico": ["smartwatch", "reloj inteligente", "reloj smart", "smart watch"],
  "maquina-soda": ["soda", "gasificadora", "sodastream", "maquina de soda"],
};

export function buscarProducto(pregunta: string, productos: Product[]): Product | undefined {
  const q = normalizar(pregunta);
  return productos.find((p) => (PALABRAS_PRODUCTO[p.id] ?? []).some((w) => q.includes(w)));
}

/** Convierte "1.500", "1,500.50" o "500" en número. */
function aNumero(texto: string): number | null {
  let t = texto.trim();
  if (!t) return null;
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) t = t.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)) t = t.replace(/,/g, "");
  else t = t.replace(",", ".");
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/** Busca un monto en dólares: "US$ 500", "500 usd", "u$s 500", "500 dólares". */
export function extraerMontoUsd(pregunta: string): number | null {
  const q = normalizar(pregunta);
  const antes = q.match(/(?:us\s?\$|u\$s|usd|\bu\$d)\s*([\d.,]+)/);
  if (antes) return aNumero(antes[1]);
  const despues = q.match(/([\d.,]+)\s*(?:usd|dolares|dolar|us\s?\$|u\$s)/);
  return despues ? aNumero(despues[1]) : null;
}

/** Cantidad de unidades: el primer entero que no es un monto en dólares. */
export function extraerCantidad(pregunta: string): number {
  const sinMonto = normalizar(pregunta).replace(/(?:us\s?\$|u\$s|usd)\s*[\d.,]+|[\d.,]+\s*(?:usd|dolares|dolar)/g, " ");
  const m = sinMonto.match(/\b(\d{1,6})\b/);
  const n = m ? Number(m[1]) : 1;
  return n >= 1 ? n : 1;
}

export interface EstimacionImportacion {
  cif: number;
  derechos: number;
  tasaEstadistica: number;
  /** IVA que se paga en aduana. Un responsable inscripto lo recupera como crédito fiscal. */
  iva: number;
  /** Impuestos que son costo real: derechos + tasa. */
  costoImpuestos: number;
  /** Total que se paga en aduana: derechos + tasa + IVA. */
  totalEnAduana: number;
}

const DERECHOS = 0.2;
const TASA = 0.005;
const IVA_GENERAL = 0.21;
const redondear = (n: number) => Math.round(n * 100) / 100;

/** Estimación orientativa para un valor CIF (mercadería + flete + seguro) en dólares. */
export function estimarImportacion(cif: number): EstimacionImportacion {
  const derechos = redondear(cif * DERECHOS);
  const tasaEstadistica = redondear(cif * TASA);
  const iva = redondear((cif + derechos + tasaEstadistica) * IVA_GENERAL);
  return {
    cif,
    derechos,
    tasaEstadistica,
    iva,
    costoImpuestos: redondear(derechos + tasaEstadistica),
    totalEnAduana: redondear(derechos + tasaEstadistica + iva),
  };
}

const NOMBRE_BANDA = { high: "alto", medium: "medio", low: "bajo" } as const;
const RANGO_COMP = { low: 0, medium: 1, high: 2 } as const;
const TEXTO_COMP = { low: "baja", medium: "media", high: "alta" } as const;

const AVISO_DATOS =
  "Son referencias sin verificar, relevadas el 1/11/2026. Pedí cotizaciones reales a proveedores y consultá a un contador o despachante antes de comprar.";

function responderProducto(p: Product, cantidad: number): Respuesta {
  const calc = calculate({
    purchase: p.costs.purchase,
    shipping: p.costs.shipping,
    taxes: p.costs.taxes,
    commissionPct: p.costs.commissionPct,
    salePrice: p.referencePriceUsd,
  });
  const s = scoreProduct(p);
  const porUnidadMercaderia = p.costs.purchase + p.costs.shipping + p.costs.taxes;
  const capital = redondear(porUnidadMercaderia * cantidad);
  const resultado = redondear(calc.profit * cantidad);

  const parrafos = [
    `Con nuestra referencia, "${p.name}" tiene un score de ${s.score}/100 (${NOMBRE_BANDA[s.band]}).`,
    `Por unidad: se vende a unos ${formatMoney(p.referencePriceUsd, "USD")} (sin IVA), cuesta ${formatMoney(calc.totalCost, "USD")} entre compra, flete, impuestos y comisión, y deja ${formatMoney(calc.profit, "USD")} (margen de ${formatPercent(calc.marginPct)}).`,
  ];
  if (cantidad > 1) {
    parrafos.push(
      `Para ${cantidad} unidades pondrías unos ${formatMoney(capital, "USD")} en mercadería, flete e impuestos, y ${
        resultado >= 0
          ? `ganarías unos ${formatMoney(resultado, "USD")}`
          : `perderías unos ${formatMoney(-resultado, "USD")}`
      } si lo vendés todo al precio de referencia.`,
    );
  }
  if (calc.profit < 0) {
    parrafos.push("Veredicto: con estos números no te conviene. El precio de venta no cubre los costos.");
  } else if (s.band === "high") {
    parrafos.push("Veredicto: las señales son favorables, pero dependen de estimaciones. Probá con una compra chica antes de un pedido grande.");
  } else if (s.band === "medium") {
    parrafos.push("Veredicto: señales mixtas. Puede servir si conseguís mejor precio de compra o una forma de diferenciarte.");
  } else {
    parrafos.push("Veredicto: el margen o las señales son flojos. Conviene buscar otro producto o negociar el costo.");
  }
  parrafos.push(AVISO_DATOS);
  return {
    tema: "producto",
    parrafos,
    fuentes: (p.sources ?? []).slice(0, 4),
    enlaces: [
      { label: "Ver el análisis", href: `/analisis/${p.id}` },
      { label: "Probar tus números", href: `/calculadora?producto=${p.id}` },
    ],
  };
}

function responderImpuestos(monto: number): Respuesta {
  const e = estimarImportacion(monto);
  const usd = (n: number) => formatMoney(n, "USD");
  return {
    tema: "impuestos",
    parrafos: [
      `Estimación orientativa para una importación de ${usd(monto)} (valor CIF: mercadería + flete + seguro) por régimen general:`,
      `• Derechos de importación: ${usd(e.derechos)} (usamos 20 %; el real va de 0 % a 35 % según el producto).`,
      `• Tasa de estadística: ${usd(e.tasaEstadistica)} (0,5 %).`,
      `• IVA: ${usd(e.iva)} (21 % sobre CIF + derechos + tasa). Un responsable inscripto lo recupera como crédito fiscal.`,
      `Costo real de impuestos: ${usd(e.costoImpuestos)}. Lo que se paga en aduana en total: ${usd(e.totalEnAduana)}.`,
      "No incluye las percepciones de IVA y Ganancias, que dependen de tu situación, ni honorarios del despachante. El porcentaje exacto depende de la posición arancelaria del producto: pedíle a un despachante o contador que la confirme.",
      monto > 400
        ? "Además, si el envío supera US$ 400 no entra en la franquicia courier."
        : "La franquicia courier de US$ 400 es solo para uso personal, no para revender.",
    ],
    fuentes: [F.guiaImportar, F.percepciones, F.courier],
  };
}

function responderMenosCompetencia(productos: Product[]): Respuesta {
  const enAlza = productos.filter((p) => p.trend === "up");
  const pool = enAlza.length > 0 ? enAlza : productos;
  const ranking = [...pool].sort(
    (a, b) =>
      RANGO_COMP[a.competition] - RANGO_COMP[b.competition] ||
      scoreProduct(b).score - scoreProduct(a).score,
  );
  const top = ranking.slice(0, 3);
  const mejor = top[0];
  const hayBaja = productos.some((p) => p.competition === "low");
  return {
    tema: "competencia",
    parrafos: [
      `Entre los productos con demanda en alza en nuestra lista, el de menor competencia estimada es "${mejor.name}" (competencia ${TEXTO_COMP[mejor.competition]}, score ${scoreProduct(mejor).score}/100).`,
      `Ranking: ${top
        .map((p, i) => `${i + 1}. ${p.name} (competencia ${TEXTO_COMP[p.competition]}, score ${scoreProduct(p).score})`)
        .join("; ")}.`,
      hayBaja
        ? "Ojo: la competencia es una estimación nuestra, no una medición."
        : "Ninguno tiene competencia baja: son productos con muchos vendedores. Y ojo: la competencia es una estimación nuestra según cuántas marcas y modelos vimos, no una medición.",
      "La tendencia sale de búsquedas en alza en Mercado Libre (agosto de 2026): una búsqueda no es una venta.",
    ],
    fuentes: [F.tendencias],
    enlaces: [{ label: "Ver el drop del día", href: "/hoy" }],
  };
}

function responderMejores(productos: Product[]): Respuesta {
  const top = [...productos]
    .map((p) => ({ p, s: scoreProduct(p).score }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 3);
  return {
    tema: "ranking",
    parrafos: [
      `Los de mayor score en nuestra lista: ${top.map(({ p, s }, i) => `${i + 1}. ${p.name} (${s}/100)`).join("; ")}.`,
      "El score combina margen (40), tendencia (25), competencia (20) y plata en juego (15). Es una regla simple, no una predicción de ventas.",
      AVISO_DATOS,
    ],
    enlaces: [{ label: "Ver el drop del día", href: "/hoy" }],
  };
}

const AYUDA: Respuesta = {
  tema: "ayuda",
  parrafos: [
    "No tengo una respuesta segura para eso. Respondo con los productos de Validex y con fuentes que cito, y si no lo sé, prefiero decírtelo.",
    "Probá con preguntas como: “¿Me conviene traer 50 smartwatches?”, “Calculá impuestos para importar US$ 800”, “¿Qué producto tiene menos competencia?”, “¿Puedo usar la franquicia de US$ 400 para revender?”, “¿Cuánto cobra Mercado Libre?” o “¿Cómo se calcula el score?”.",
  ],
};

export function responder(pregunta: string, ctx: Contexto): Respuesta {
  const q = normalizar(pregunta);
  const productos = ctx.productos;

  if (/courier|franquicia|puerta a puerta|\b400\b/.test(q) && !/impuesto|calcul/.test(q)) {
    return {
      tema: "courier",
      parrafos: [
        "Según las fuentes que consultamos, el régimen courier permite importar con franquicia (sin derechos de importación) envíos de hasta US$ 400, con un máximo de 5 envíos por año por persona. El IVA se paga igual.",
        "Es para consumo personal: para revender tenés que importar por el régimen general. Verificá los límites vigentes en el sitio de ARCA, porque cambian.",
      ],
      fuentes: [F.courier, F.courierNota],
    };
  }

  if (/revender|reventa|vender lo que importo|importar para vender|regimen general|inscripcion|alta como importador|responsable inscripto/.test(q)) {
    return {
      tema: "reventa",
      parrafos: [
        "Para revender no sirve la franquicia courier: se importa por el régimen general. Eso exige estar inscripto como importador ante ARCA y ser Responsable Inscripto.",
        "Los impuestos de aduana (derechos, tasa de estadística, IVA y percepciones) dependen de la posición arancelaria del producto y de tu situación fiscal. Consultá con un despachante de aduana y un contador antes de la primera compra.",
      ],
      fuentes: [F.importador, F.guiaImportar],
    };
  }

  if (/impuesto|arancel|aduana|derechos|calcul.*import|import.*calcul/.test(q)) {
    const monto = extraerMontoUsd(pregunta);
    if (monto && monto > 0) return responderImpuestos(monto);
    return {
      tema: "impuestos",
      parrafos: [
        "Para estimar los impuestos necesito el valor de la importación en dólares. Por ejemplo: “Calculá impuestos para importar US$ 500 en electrónica”.",
        "Mientras tanto: derechos de importación entre 0 % y 35 % según el producto, tasa de estadística de 0,5 % e IVA de 21 % (o 10,5 %) sobre el valor CIF más los derechos. Las percepciones dependen de tu situación.",
      ],
      fuentes: [F.guiaImportar],
    };
  }

  if (/comision|cuanto cobra|mercado libre cobra|cargo por vender/.test(q)) {
    return {
      tema: "comision",
      parrafos: [
        "Las fuentes que consultamos ubican la comisión de Mercado Libre Argentina entre 11,8 % y 17,1 % del precio de venta, según la categoría y el tipo de publicación. En Validex usamos 14 %.",
        "A eso se suman costos fijos en publicaciones de menor precio y el costo de ofrecer cuotas, y todo lleva IVA. Para tu categoría exacta mirá la Central de Vendedores.",
      ],
      fuentes: [F.comision],
    };
  }

  if (/score|puntaje|como se calcula|formula/.test(q)) {
    return {
      tema: "score",
      parrafos: [
        "El score de Validex va de 0 a 100: margen (hasta 40 puntos), tendencia (25), competencia (20) y plata en juego por unidad (15). Si perdés plata en cada unidad, el máximo es 29.",
        "Es una regla simple y abierta, no una predicción de ventas. Los pesos son una decisión de diseño y se pueden discutir.",
      ],
      enlaces: [{ label: "Tantear tu propio producto", href: "/tantear" }],
    };
  }

  if (/\b(dolar|blue|oficial|ccl)\b|cotizacion del/.test(q)) {
    if (!ctx.dolar) {
      return { tema: "dolar", parrafos: ["No pude traer la cotización del dólar en este momento. Probá de nuevo en un rato."], fuentes: [F.dolar] };
    }
    const n = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });
    return {
      tema: "dolar",
      parrafos: [`Precio de venta hoy: blue $ ${n.format(ctx.dolar.blue)}, oficial $ ${n.format(ctx.dolar.oficial)} y CCL $ ${n.format(ctx.dolar.ccl)}.`],
      fuentes: [F.dolar],
    };
  }

  if (/menos competencia|poca competencia|baja competencia|menor competencia|competencia baja/.test(q)) {
    return responderMenosCompetencia(productos);
  }

  if (/mejor producto|mejores productos|que producto|que me recomiendas|que importo|que traigo|ranking|tendencia/.test(q) && !buscarProducto(pregunta, productos)) {
    return responderMejores(productos);
  }

  const producto = buscarProducto(pregunta, productos);
  if (producto) return responderProducto(producto, extraerCantidad(pregunta));

  return AYUDA;
}
