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
import { estimarImportacion, extraerCantidad, extraerMontoUsd, responder, SUGERENCIAS } from "./importador";
import { construirSistema, iaHabilitada, MAX_PREGUNTA, validarEntrada } from "./importador-ia";
import { crearLimitador, crearTopeDiario } from "./rate-limit";
import { coverageOf, EVIDENCE_KEYS } from "./coverage";
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

test("real-products: conversión a dólares netos de IVA e impuestos de importación", () => {
  // 12.999 / 1,21 / 1.560 = 6,8865 => 6,89
  assert.equal(netUsd(12999), 6.89);
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
