import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { calculate, parseDecimal, precioParaMargen, validateField } from "./calculator";
import { assess } from "./assessment";
import { scoreInput, scoreProduct } from "./score";
import { dateKeyArg, pickDrop } from "./drop";
import { primitivos, semanticos } from "../design/tokens";
import { parseDolar } from "./dolar-parse";
import { importTaxes, netUsd, realProducts } from "../data/real-products";
import { getProducts } from "../data";
import { estimarImportacion, extraerCantidad, extraerMontoUsd, responder, SUGERENCIAS } from "./importador";
import { construirSistema, iaHabilitada, MAX_PREGUNTA, validarEntrada } from "./importador-ia";
import { crearLimitador, crearTopeDiario } from "./rate-limit";
import { coverageOf, EVIDENCE_KEYS } from "./coverage";
import { sensitivityOf } from "./sensitivity";
import { avoidList, AVOID_BELOW } from "./avoid";
import { avisoDeLink, ES_ALIBABA, ES_MELI } from "./links";
import { matchTrends, normalizar, withMeliEvidence, type MeliSignals } from "./meli-signals";
import { DEFAULT_MARKET, importTaxRate, MARKETS } from "./markets";
import type { Product } from "../data/types";

const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);

test("calculate: ejemplo de la portada (25 de venta)", () => {
  const r = calculate({ purchase: 10, shipping: 3, taxes: 2, commissionPct: 10, salePrice: 25 });
  close(r.commission, 2.5);
  close(r.totalCost, 17.5);
  close(r.profit, 7.5);
  close(r.marginPct, 30);
  close(r.markupPct, (7.5 / 17.5) * 100);
});

test("calculate: pérdida cuando el precio no cubre los costos", () => {
  const r = calculate({ purchase: 10, shipping: 3, taxes: 2, commissionPct: 10, salePrice: 12 });
  close(r.profit, -4.2);
  assert.ok(r.marginPct < 0);
});

test("calculate: precio 0 no produce NaN", () => {
  const r = calculate({ purchase: 0, shipping: 0, taxes: 0, commissionPct: 0, salePrice: 0 });
  assert.equal(r.marginPct, 0);
  assert.equal(r.markupPct, 0);
});

test("parseDecimal: acepta coma y punto, rechaza lo demás", () => {
  assert.equal(parseDecimal("12,5"), 12.5);
  assert.equal(parseDecimal(" 12.5 "), 12.5);
  assert.equal(parseDecimal("0"), 0);
  assert.equal(parseDecimal(".5"), 0.5);
  for (const bad of ["", "abc", "-3", "1,2,3", "1e5", "12a"]) {
    assert.equal(parseDecimal(bad), null, `debería rechazar "${bad}"`);
  }
});

test("validateField: vacío, inválido, máximos y precio 0", () => {
  assert.ok(validateField("purchase", ""));
  assert.ok(validateField("purchase", "abc"));
  assert.equal(validateField("purchase", "0"), null);
  assert.ok(validateField("commissionPct", "101"));
  assert.equal(validateField("commissionPct", "100"), null);
  assert.ok(validateField("salePrice", "0"));
  assert.equal(validateField("salePrice", "0,01"), null);
});

const base: Product = {
  id: "t",
  name: "t",
  category: "c",
  market: "m",
  description: "d",
  referencePriceUsd: 100,
  trend: "steady",
  competition: "medium",
  costs: { purchase: 40, shipping: 5, taxes: 5, commissionPct: 10 },
  updatedAt: "2026-01-01",
  dataStatus: "demo",
  sourceNote: "n",
  risks: [],
  opportunities: [],
};

test("assess: el nivel sale del score", () => {
  // score 82 (alto) => favorable
  assert.equal(assess({ ...base, trend: "up", competition: "low" }).level, "favorable");
  // score 62 (medio) => mixto
  assert.equal(assess(base).level, "moderate");
  // score 19 (bajo) => cautela
  const bad = assess({
    ...base,
    trend: "down",
    competition: "high",
    costs: { purchase: 70, shipping: 5, taxes: 5, commissionPct: 10 },
  });
  assert.equal(bad.level, "cautious");
  assert.equal(bad.reasons.length, 4);
});

test("score: suma máxima 100 y bandas", () => {
  const best = scoreInput({ marginPct: 60, unitCostUsd: 5, trend: "up", competition: "low" });
  assert.equal(best.score, 100);
  assert.equal(best.band, "high");
  const mid = scoreInput({ marginPct: 25, unitCostUsd: 20, trend: "steady", competition: "medium" });
  // margen 20 + tendencia 14 + competencia 11 + capital 10
  assert.equal(mid.score, 55);
  assert.equal(mid.band, "medium");
  const worst = scoreInput({ marginPct: 0, unitCostUsd: 500, trend: "down", competition: "high" });
  assert.equal(worst.score, 8);
  assert.equal(worst.band, "low");
});

test("score: si pierde plata por unidad, el puntaje se limita a 29", () => {
  const r = scoreInput({ marginPct: -10, unitCostUsd: 5, trend: "up", competition: "low" });
  assert.ok(r.score <= 29);
  assert.equal(r.capped, true);
  assert.equal(r.band, "low");
});

test("score: las partes suman el total (sin límite por pérdida)", () => {
  const r = scoreInput({ marginPct: 33, unitCostUsd: 40, trend: "steady", competition: "low" });
  assert.equal(r.parts.reduce((s, p) => s + p.points, 0), r.score);
  assert.equal(r.parts.reduce((s, p) => s + p.max, 0), 100);
});

test("scoreProduct usa los costos del producto", () => {
  // margen 40 % => 32 + tendencia estable 14 + competencia media 11 + costo total 60 USD => 5 = 62
  assert.equal(scoreProduct(base).score, 62);
});

test("drop: determinista, de tamaño 3 y sin repetidos", () => {
  const items = Array.from({ length: 8 }, (_, i) => ({ item: { id: `p${i}` }, score: 90 - i * 5 }));
  const a = pickDrop(items, "2026-11-01");
  const b = pickDrop([...items].reverse(), "2026-11-01");
  assert.equal(a.length, 3);
  assert.deepEqual(a.map((r) => r.item.id), b.map((r) => r.item.id));
  assert.equal(new Set(a.map((r) => r.item.id)).size, 3);
});

test("drop: descarta los flojos si hay suficientes buenos y rota por fecha", () => {
  const items = [
    ...Array.from({ length: 5 }, (_, i) => ({ item: { id: `bueno${i}` }, score: 80 - i })),
    { item: { id: "flojo" }, score: 20 },
  ];
  const seen = new Set<string>();
  for (let d = 1; d <= 28; d++) {
    const drop = pickDrop(items, `2026-11-${String(d).padStart(2, "0")}`);
    for (const r of drop) {
      assert.notEqual(r.item.id, "flojo");
      seen.add(r.item.id);
    }
  }
  assert.equal(seen.size, 5);
});

test("drop: con menos de 3 productos devuelve lo que hay", () => {
  const items = [{ item: { id: "a" }, score: 10 }];
  assert.equal(pickDrop(items, "2026-11-01").length, 1);
});

test("dateKeyArg: usa la fecha de Argentina", () => {
  // 02:30 UTC del 2 de noviembre es todavía 1 de noviembre a las 23:30 en Argentina (UTC-3).
  assert.equal(dateKeyArg(new Date("2026-11-02T02:30:00Z")), "2026-11-01");
  assert.equal(dateKeyArg(new Date("2026-11-02T03:30:00Z")), "2026-11-02");
});

test("parseDolar: toma blue, oficial y CCL (venta) de la respuesta", () => {
  const r = parseDolar([
    { casa: "oficial", venta: 1560, fechaActualizacion: "2026-10-30T18:55:00.000Z" },
    { casa: "blue", venta: 1565, fechaActualizacion: "2026-11-01T17:57:00.000Z" },
    { casa: "contadoconliqui", venta: 1658.5, fechaActualizacion: "2026-11-01T17:57:00.000Z" },
    { casa: "cripto", venta: 1641 },
  ]);
  assert.deepEqual(r, { blue: 1565, oficial: 1560, ccl: 1658.5, updatedAt: "2026-11-01T17:57:00.000Z" });
});

test("parseDolar: devuelve null si falta algo o el formato no es el esperado", () => {
  assert.equal(parseDolar(null), null);
  assert.equal(parseDolar({}), null);
  assert.equal(parseDolar([{ casa: "blue", venta: 1565 }]), null);
  assert.equal(parseDolar([{ casa: "blue", venta: "x" }, { casa: "oficial", venta: 1 }, { casa: "contadoconliqui", venta: 1 }]), null);
});

test("real-products: 15 productos con fuentes, fecha y estado sin verificar", () => {
  assert.equal(realProducts.length, 15);
  assert.equal(new Set(realProducts.map((p) => p.id)).size, 15);
  for (const p of realProducts) {
    assert.equal(p.dataStatus, "unverified", p.id);
    assert.match(p.updatedAt, /^\d{4}-\d{2}-\d{2}$/, p.id);
    assert.ok((p.sources?.length ?? 0) >= 3, `${p.id}: faltan fuentes`);
    assert.ok((p.assumptions?.length ?? 0) >= 3, `${p.id}: faltan supuestos`);
    for (const s of p.sources ?? []) assert.match(s.url, /^https:\/\//, `${p.id}: ${s.url}`);
    assert.ok(p.referencePriceUsd > 0 && p.costs.purchase > 0 && p.costs.shipping > 0 && p.costs.taxes > 0, p.id);
    assert.ok(p.sourceNote.length > 20, p.id);
  }
});

test("cobertura: ningún producto real figura como completo sin cotizaciones confirmadas", () => {
  for (const p of realProducts) {
    const c = coverageOf(p);
    assert.equal(c.total, EVIDENCE_KEYS.length, p.id);
    assert.equal(c.confirmed, 0, `${p.id}: nada está confirmado con un proveedor`);
    assert.equal(c.status, "incompleto", p.id);
    assert.ok(c.backed >= 3 && c.backed <= 4, `${p.id}: ${c.backed}`);
  }
});

test("cobertura: solo es completo con los siete datos confirmados y estado verificado", () => {
  const confirmado = Object.fromEntries(EVIDENCE_KEYS.map((k) => [k, "confirmado"])) as never;
  assert.equal(coverageOf({ evidence: confirmado, dataStatus: "verified" }).status, "completo");
  // Todo confirmado pero el estado del producto sigue sin verificar: no alcanza.
  assert.notEqual(coverageOf({ evidence: confirmado, dataStatus: "unverified" }).status, "completo");
  // Sin evidencia declarada, todo cuenta como estimado.
  const vacio = coverageOf({ dataStatus: "demo" });
  assert.equal(vacio.backed, 0);
  assert.equal(vacio.status, "incompleto");
});

test("mercados: Argentina conserva los valores que usaba el sitio y todo sale de una sola fuente", () => {
  assert.equal(DEFAULT_MARKET.id, "AR");
  assert.equal(MARKETS.AR, DEFAULT_MARKET);
  // El dólar de referencia se actualiza con la fecha; lo que importa es que tenga valor, fecha y fuente.
  assert.ok(DEFAULT_MARKET.referenceRate.value > 0);
  assert.match(DEFAULT_MARKET.referenceRate.date, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(DEFAULT_MARKET.referenceRate.source.length > 5);
  assert.equal(DEFAULT_MARKET.vat, 0.21);
  assert.equal(importTaxRate(DEFAULT_MARKET), 0.205);
  assert.equal(DEFAULT_MARKET.commission.defaultPct, 14);
  // Los derivados del catálogo usan esos mismos valores.
  assert.equal(netUsd(12999), Math.round((12999 / 1.21 / DEFAULT_MARKET.referenceRate.value) * 100) / 100);
  assert.equal(importTaxes(4, 0.8), 0.98);
  // El importador estima con los mismos derechos y tasa: CIF 100 => 20 + 0,5 + IVA sobre 120,5.
  const e = estimarImportacion(100);
  assert.equal(e.derechos, 20);
  assert.equal(e.tasaEstadistica, 0.5);
  assert.equal(e.iva, 25.31);
});

test("sensibilidad: el caso base coincide con la ficha y el abanico está ordenado", () => {
  for (const p of realProducts) {
    const s = sensitivityOf(p);
    const base = s.scenarios.find((x) => x.key === "base")!;
    const mejor = s.scenarios.find((x) => x.key === "mejor")!;
    const peor = s.scenarios.find((x) => x.key === "peor")!;
    const flete = s.scenarios.find((x) => x.key === "flete")!;
    const calc = assess(p).calc;
    close(base.marginPct, calc.marginPct);
    close(base.profit, calc.profit);
    assert.equal(base.score, scoreProduct(p).score, p.id);
    assert.ok(mejor.marginPct >= base.marginPct - 1e-9, `${p.id}: el mejor caso no mejora`);
    assert.ok(peor.marginPct <= base.marginPct + 1e-9, `${p.id}: el peor caso no empeora`);
    assert.ok(flete.marginPct <= base.marginPct + 0.05, `${p.id}: más flete no puede subir el margen`);
  }
});

test("evitá estos: solo scores bajos, del peor al menos malo, siempre con motivo", () => {
  const lista = avoidList(realProducts);
  assert.ok(lista.length >= 3, "debería haber al menos 3 productos para evitar");
  for (let i = 0; i < lista.length; i++) {
    const x = lista[i];
    assert.ok(x.score < AVOID_BELOW, x.product.id);
    assert.equal(x.score, scoreProduct(x.product).score, x.product.id);
    assert.ok(x.reasons.length >= 1 && x.reasons.length <= 3, `${x.product.id}: ${x.reasons.length} motivos`);
    if (i > 0) assert.ok(lista[i - 1].score <= x.score, "orden ascendente");
  }
  // El smartwatch pierde plata y lo dice.
  const sw = lista.find((x) => x.product.id === "smartwatch-generico");
  assert.ok(sw?.reasons.includes("Pierde plata en cada unidad"));
  // Un producto con buen score nunca aparece.
  assert.ok(!lista.some((x) => x.product.id === "ventilador-mano-recargable"));
  assert.equal(avoidList(realProducts, 2).length, 2);
});

test("señales de Mercado Libre: el cruce es por palabra completa y no confunde productos parecidos", () => {
  const trends = [
    { position: 1, keyword: "termotanque electrico" },
    { position: 2, keyword: "termo stanley" },
    { position: 3, keyword: "Termos de Acero" },
    { position: 4, keyword: "cortinas blackout" },
    { position: 5, keyword: "auriculares inalámbricos" },
  ];
  const termo = matchTrends(["termo"], trends).map((t) => t.keyword);
  assert.deepEqual(termo, ["termo stanley", "Termos de Acero"]);
  assert.equal(matchTrends(["termo"], [{ position: 1, keyword: "termotanque electrico" }]).length, 0);
  assert.equal(matchTrends(["cortina"], trends).length, 1);
  assert.equal(matchTrends(["auricular", "tws"], trends).length, 1);
  assert.equal(matchTrends(["freidora"], trends).length, 0);
  assert.equal(matchTrends([], trends).length, 0);
  assert.equal(normalizar("  Auriculares Inalámbricos! "), "auriculares inalambricos");
  // Caracteres especiales de expresiones regulares en las palabras no rompen nada.
  assert.equal(matchTrends(["a+b(c"], trends).length, 0);
});

test("señales de Mercado Libre: la tendencia solo pasa a publicada si hay coincidencia", () => {
  const p = realProducts.find((x) => x.id === "termo-acero-1l")!;
  assert.equal(withMeliEvidence(p, []), p);
  const con = withMeliEvidence(p, [{ position: 2, keyword: "termo stanley" }]);
  assert.equal(con.evidence?.trend, "publicado");
  assert.equal(con.evidence?.shipping, "estimado");
  // El score no cambia: esta señal no toca la metodología.
  assert.equal(scoreProduct(con).score, scoreProduct(p).score);
});

test("señales de Mercado Libre: la foto guardada cubre los 15 productos y tiene fecha", () => {
  const raw = JSON.parse(readFileSync(join(process.cwd(), "src/data/meli-signals.json"), "utf8")) as MeliSignals;
  assert.match(raw.fetchedAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(raw.site, "MLA");
  assert.ok(raw.trends.length >= 20, "pocas tendencias");
  for (const p of realProducts) {
    const s = raw.products[p.id];
    assert.ok(s, `${p.id}: falta en meli-signals.json`);
    assert.ok(s.trendWords.length >= 1, p.id);
    assert.ok(s.categoryId && s.categoryName, `${p.id}: sin categoría`);
    assert.ok((s.totalItems ?? 0) > 0, `${p.id}: sin cantidad de publicaciones`);
    assert.ok(s.categoryMatch === "exacta" || s.categoryMatch === "aproximada", `${p.id}: falta indicar si la categoría es exacta`);
  }
  // Errores que ya pasaron y no deben volver: la fuente de agua para gatos NO es una fuente decorativa del hogar.
  const fuente = raw.products["fuente-agua-gatos"];
  assert.match(fuente.categoryPath ?? "", /Mascotas > Gatos/);
  assert.doesNotMatch(fuente.categoryPath ?? "", /Decoraci/);
  // Las categorías aproximadas están declaradas, así la ficha las avisa.
  assert.equal(raw.products["horno-pizza-portatil"].categoryMatch, "aproximada");
  assert.equal(raw.products["power-bank-10000"].categoryMatch, "aproximada");
});

test("links: acepta Alibaba y Mercado Libre, rechaza dominios parecidos y otros protocolos", () => {
  assert.equal(avisoDeLink("", ES_ALIBABA, "Alibaba"), null);
  assert.equal(avisoDeLink("https://www.alibaba.com/product-detail/x_123.html", ES_ALIBABA, "Alibaba"), null);
  assert.equal(avisoDeLink("https://spanish.alibaba.com/product-detail/x", ES_ALIBABA, "Alibaba"), null);
  assert.equal(avisoDeLink("https://articulo.mercadolibre.com.ar/MLA-123-termo", ES_MELI, "Mercado Libre"), null);
  // Dominios que solo se parecen.
  assert.match(avisoDeLink("https://alibaba.com.sitio-malo.com/x", ES_ALIBABA, "Alibaba") ?? "", /No parece un link de Alibaba/);
  assert.match(avisoDeLink("https://notalibaba.com/x", ES_ALIBABA, "Alibaba") ?? "", /No parece/);
  assert.match(avisoDeLink("https://mercadolibre.com.ar.evil.io/x", ES_MELI, "Mercado Libre") ?? "", /No parece/);
  // Protocolo y formato.
  assert.match(avisoDeLink("http://www.alibaba.com/x", ES_ALIBABA, "Alibaba") ?? "", /https/);
  assert.match(avisoDeLink("javascript:alert(1)", ES_ALIBABA, "Alibaba") ?? "", /https/);
  assert.match(avisoDeLink("alibaba punto com", ES_ALIBABA, "Alibaba") ?? "", /No parece un link/);
});

test("sitio: no hay productos ficticios y todos tienen fuentes y estado sin verificar o verificado", () => {
  const todos = getProducts();
  assert.equal(todos.length, 15);
  for (const p of todos) {
    assert.notEqual(p.dataStatus, "demo", p.id);
    assert.ok(p.dataStatus === "unverified" || p.dataStatus === "verified", p.id);
    assert.ok((p.sources?.length ?? 0) >= 3, `${p.id}: sin fuentes`);
  }
});

test("sensibilidad: precio de equilibrio y firmeza", () => {
  const watch = realProducts.find((p) => p.id === "smartwatch-generico")!;
  const sw = sensitivityOf(watch);
  assert.equal(sw.firmness, "no-cierra");
  assert.ok(sw.priceCushionPct < 0);
  for (const p of realProducts) {
    const s = sensitivityOf(p);
    if (s.breakEvenPrice === null) continue;
    // Vendiendo al precio de equilibrio, la ganancia es cero.
    const c = calculate({ ...p.costs, salePrice: s.breakEvenPrice });
    assert.ok(Math.abs(c.profit) < 1e-6, `${p.id}: ${c.profit}`);
  }
});

test("real-products: conversión a dólares netos de IVA e impuestos de importación", () => {
  // Precio publicado en pesos con IVA / 1,21 / dólar de referencia, redondeado a centavos.
  assert.equal(netUsd(12999), Math.round((12999 / 1.21 / DEFAULT_MARKET.referenceRate.value) * 100) / 100);
  // (4 + 0,8) * 0,205 = 0,984 => 0,98
  assert.equal(importTaxes(4, 0.8), 0.98);
});

test("real-products: el smartwatch figura con margen negativo, como dice su ficha", () => {
  const watch = realProducts.find((p) => p.id === "smartwatch-generico");
  assert.ok(watch);
  assert.ok(assess(watch).calc.marginPct < 0);
  assert.ok(watch.risks.some((r) => r.includes("margen es negativo")));
});

test("real-products: cada producto tiene su imagen ilustrativa en public/", () => {
  for (const p of realProducts) {
    assert.equal(p.image, `/images/productos/${p.id}.jpg`);
    assert.ok(existsSync(join(process.cwd(), "public", p.image)), `falta la imagen de ${p.id}`);
  }
});

const ctxImp = { productos: realProducts, dolar: { blue: 1565, oficial: 1560, ccl: 1658.5 } };

test("importador: extrae montos en dólares y cantidades", () => {
  assert.equal(extraerMontoUsd("Calculá impuestos para importar US$ 500 en electrónica"), 500);
  assert.equal(extraerMontoUsd("importo 1.500 usd de mercadería"), 1500);
  assert.equal(extraerMontoUsd("u$s 2,500.50"), 2500.5);
  assert.equal(extraerMontoUsd("no hay monto"), null);
  assert.equal(extraerCantidad("¿Me conviene traer 50 smartwatches tipo Pro?"), 50);
  assert.equal(extraerCantidad("importar US$ 500 de auriculares"), 1);
});

test("importador: estimación de impuestos para US$ 500", () => {
  const e = estimarImportacion(500);
  assert.equal(e.derechos, 100);
  assert.equal(e.tasaEstadistica, 2.5);
  assert.equal(e.iva, 126.53); // (500 + 100 + 2,5) * 21 %
  assert.equal(e.costoImpuestos, 102.5);
  assert.equal(e.totalEnAduana, 229.03);
});

const EJEMPLOS_PERSONALES = [
  "¿Me conviene traer 50 smartwatches tipo Pro?",
  "Calculá impuestos para importar US$ 500 en electrónica",
  "¿Qué producto en tendencia tiene menos competencia?",
];

test("importador: las preguntas personales de ejemplo tienen respuesta específica", () => {
  const sw = responder(EJEMPLOS_PERSONALES[0], ctxImp);
  assert.equal(sw.tema, "producto");
  const textoSw = sw.parrafos.join(" ");
  assert.match(textoSw, /Smartwatch/);
  assert.match(textoSw, /50 unidades/);
  assert.match(textoSw, /no te conviene/); // el smartwatch tiene margen negativo
  assert.ok((sw.fuentes?.length ?? 0) >= 1);

  const imp = responder(EJEMPLOS_PERSONALES[1], ctxImp);
  assert.equal(imp.tema, "impuestos");
  assert.match(imp.parrafos.join(" "), /126,53/);

  const comp = responder(EJEMPLOS_PERSONALES[2], ctxImp);
  assert.equal(comp.tema, "competencia");
  assert.match(comp.parrafos[0], /Fuente de agua/); // el de menor competencia con demanda en alza
});

test("importador: courier, reventa, comisión, score, dólar y fallback", () => {
  assert.equal(responder("¿Puedo usar la franquicia de US$ 400 para revender?", ctxImp).tema, "courier");
  assert.equal(responder("¿Qué necesito para importar para revender?", ctxImp).tema, "reventa");
  assert.equal(responder("¿Cuánto cobra Mercado Libre?", ctxImp).tema, "comision");
  assert.equal(responder("¿Cómo se calcula el score?", ctxImp).tema, "score");
  const d = responder("¿A cuánto está el blue?", ctxImp);
  assert.equal(d.tema, "dolar");
  assert.match(d.parrafos[0], /1\.565/);
  assert.equal(responder("¿A cuánto está el blue?", { ...ctxImp, dolar: null }).tema, "dolar");
  assert.equal(responder("blablabla", ctxImp).tema, "ayuda");
  assert.equal(responder("calculá impuestos", ctxImp).tema, "impuestos");
});

test("importador: las sugerencias son generales y todas tienen respuesta con fuente o enlace", () => {
  assert.ok(SUGERENCIAS.length >= 3 && SUGERENCIAS.length <= 5);
  for (const q of SUGERENCIAS) {
    const r = responder(q, ctxImp);
    assert.notEqual(r.tema, "ayuda", q);
    assert.ok((r.fuentes?.length ?? 0) + (r.enlaces?.length ?? 0) > 0, `${q}: sin fuente ni enlace`);
    assert.ok(!/\d+ (smartwatches|unidades)/i.test(q), `${q}: es demasiado personal`);
  }
  assert.deepEqual(
    SUGERENCIAS.map((q) => responder(q, ctxImp).tema),
    ["reventa", "impuestos", "ranking", "comision"],
  );
});

test("importador: las respuestas con números advierten que son estimaciones o datos sin verificar", () => {
  for (const q of EJEMPLOS_PERSONALES) {
    const r = responder(q, ctxImp);
    const texto = r.parrafos.join(" ").toLowerCase();
    assert.ok(/sin verificar|estimaci|orientativ|estimad/.test(texto), q);
  }
});

test("rate-limit: máximo por ventana y se libera con el tiempo", () => {
  let t = 0;
  const l = crearLimitador({ max: 2, ventanaMs: 1000, ahora: () => t });
  assert.equal(l.permitir("a"), true);
  assert.equal(l.permitir("a"), true);
  assert.equal(l.permitir("a"), false);
  assert.equal(l.permitir("b"), true); // otra persona no se ve afectada
  t = 1500;
  assert.equal(l.permitir("a"), true);
});

test("rate-limit: tope diario se reinicia al día siguiente (hora de Argentina)", () => {
  let ahora = new Date("2026-11-01T15:00:00Z");
  const tope = crearTopeDiario(2, () => ahora);
  assert.equal(tope.permitir(), true);
  assert.equal(tope.permitir(), true);
  assert.equal(tope.permitir(), false);
  ahora = new Date("2026-11-02T02:59:00Z"); // todavía 1/11 en Argentina
  assert.equal(tope.permitir(), false);
  ahora = new Date("2026-11-02T03:01:00Z"); // ya es 2/11
  assert.equal(tope.permitir(), true);
});

test("importador-ia: valida la entrada y descarta lo raro", () => {
  assert.equal(validarEntrada(null).ok, false);
  assert.equal(validarEntrada({}).ok, false);
  assert.equal(validarEntrada({ pregunta: "   " }).ok, false);
  assert.equal(validarEntrada({ pregunta: "x".repeat(MAX_PREGUNTA + 1) }).ok, false);
  assert.equal(validarEntrada({ pregunta: 5 }).ok, false);
  assert.equal(validarEntrada({ pregunta: "hola", historial: "no" }).ok, false);
  assert.equal(validarEntrada({ pregunta: "hola", historial: [{ rol: "admin", texto: "x" }] }).ok, false);
  const ok = validarEntrada({
    pregunta: "  ¿Cuánto tarda importar?  ",
    historial: [
      { rol: "asistente", texto: "Hola" }, // no puede abrir la conversación: se descarta
      { rol: "usuario", texto: "uno" },
      { rol: "asistente", texto: "dos" },
    ],
  });
  assert.ok(ok.ok);
  if (ok.ok) {
    assert.equal(ok.entrada.pregunta, "¿Cuánto tarda importar?");
    assert.deepEqual(ok.entrada.historial.map((t) => t.rol), ["usuario", "asistente"]);
  }
});

test("importador-ia: las instrucciones incluyen productos, reglas y no inventan el dólar", () => {
  const con = construirSistema(realProducts, { blue: 1565, oficial: 1560, ccl: 1658.5 });
  for (const p of realProducts) assert.ok(con.includes(p.name), p.name);
  assert.match(con, /blue \$1565/);
  assert.match(con, /sin verificar/);
  assert.match(con, /despachante/);
  assert.match(con, /no es una orden|no una orden/i);
  const sin = construirSistema(realProducts, null);
  assert.match(sin, /No hay cotización del dólar disponible/);
  assert.ok(!/blue \$\d/.test(sin));
});

test("importador-ia: la clave sola no enciende la IA, hace falta IMPORTADOR_IA=si", () => {
  assert.equal(iaHabilitada({}), false);
  assert.equal(iaHabilitada({ ANTHROPIC_API_KEY: "sk-ant-x" }), false); // clave inyectada por la plataforma
  assert.equal(iaHabilitada({ IMPORTADOR_IA: "si" }), false); // falta la clave
  assert.equal(iaHabilitada({ IMPORTADOR_IA: "no", ANTHROPIC_API_KEY: "sk-ant-x" }), false);
  assert.equal(iaHabilitada({ IMPORTADOR_IA: " SI ", ANTHROPIC_API_KEY: "sk-ant-x" }), true);
});

test("precioParaMargen: el precio calculado da justo el margen pedido", () => {
  const precio = precioParaMargen(20, 14, 30);
  assert.ok(precio !== null);
  const r = calculate({ purchase: 20, shipping: 0, taxes: 0, commissionPct: 14, salePrice: precio });
  assert.ok(Math.abs(r.marginPct - 30) < 1e-9);
});

test("precioParaMargen: sin precio posible devuelve null", () => {
  assert.equal(precioParaMargen(20, 60, 40), null);
});

test("tokens de diseño: los colores coinciden con globals.css", () => {
  const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
  const enCss: Record<string, string> = {
    ink: "ink", "ink-soft": "ink-soft", muted: "muted", paper: "paper", panel: "panel", line: "line",
    "violet-brand": "radar", "violet-dark": "radar-dark", "violet-deep": "profundo", "violet-light": "lima", danger: "danger",
  };
  for (const [nombre, hex] of Object.entries(primitivos.color)) {
    assert.match(css, new RegExp(`--color-${enCss[nombre]}:\\s*${hex};`, "i"), `${nombre} (${hex}) no coincide con globals.css`);
  }
});

test("tokens de diseño: los semánticos apuntan a primitivos que existen", () => {
  const valores = new Set<string>(Object.values(primitivos.color));
  for (const grupo of Object.values(semanticos)) {
    for (const hex of Object.values(grupo)) assert.ok(valores.has(hex), `${hex} no es un primitivo`);
  }
});

import { buscar, puntuar } from "./busqueda";

test("buscar: acentos, plurales, sinónimos y todas las palabras", () => {
  const fuentes = {
    productos: [
      { id: "termo", nombre: "Termo de acero 1 L", categoria: "Hogar", descripcion: "Para mate", score: 70 },
      { id: "aud", nombre: "Auriculares TWS básicos", categoria: "Electrónica", descripcion: "Bluetooth", score: 50 },
    ],
    tendencias: [
      { position: 1, keyword: "termo stanley" },
      { position: 2, keyword: "termotanque electrico" },
    ],
    categorias: [{ categoryId: "x", categoryName: "Celulares", bestSellers: [{ position: 1, name: "Auriculares Xiaomi Redmi Buds" }] }],
  };
  assert.equal(buscar("TERMOS", fuentes).analizados[0]?.id, "termo");
  assert.equal(buscar("termo", fuentes).tendencias.length, 1); // no coincide con termotanque
  assert.equal(buscar("audífonos", fuentes).analizados[0]?.id, "aud"); // sinónimo con acento
  assert.equal(buscar("auricular xiaomi", fuentes).vendidos.length, 1);
  assert.equal(buscar("auricular heladera", fuentes).total, 0); // todas las palabras tienen que aparecer
  assert.equal(buscar("   ", fuentes).total, 0);
  assert.ok(puntuar("termo", { campos: [{ texto: "termo", peso: 3 }] }) > puntuar("term", { campos: [{ texto: "termo", peso: 3 }] }));
});
