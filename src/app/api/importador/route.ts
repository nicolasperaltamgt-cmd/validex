import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getRealProducts } from "@/data";
import { fetchDolar } from "@/lib/dolar";
import { construirSistema, iaHabilitada, validarEntrada } from "@/lib/importador-ia";
import { crearLimitador, crearTopeDiario } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Importador con IA para preguntas libres. Está APAGADO salvo que existan ANTHROPIC_API_KEY e IMPORTADOR_IA=si
 * en el servidor: la clave nunca llega al navegador. Cada consulta cuesta plata (en Netlify, créditos de la
 * cuenta); los límites de abajo son una defensa extra.
 */
const MODELO = process.env.IMPORTADOR_MODELO || "claude-opus-5-5";
const MAX_POR_DIA = Number(process.env.IMPORTADOR_MAX_DIA) > 0 ? Number(process.env.IMPORTADOR_MAX_DIA) : 200;

const porPersona = crearLimitador({ max: 10, ventanaMs: 60 * 60 * 1000 });
const tope = crearTopeDiario(MAX_POR_DIA);

function mensaje(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: Request) {
  if (!iaHabilitada(process.env)) {
    return NextResponse.json({ modo: "sin-ia" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return mensaje("Consulta inválida.", 400);
  }
  const validada = validarEntrada(body);
  if (!validada.ok) return mensaje(validada.error, 400);
  const { pregunta, historial } = validada.entrada;

  const ip = (request.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim() || "local";
  if (!porPersona.permitir(ip)) {
    return mensaje("Hiciste muchas preguntas seguidas. Probá de nuevo en un rato.", 429);
  }
  if (!tope.permitir()) {
    return mensaje("El Importador con IA llegó a su límite de hoy. Probá mañana o usá las preguntas de ejemplo.", 429);
  }

  const dolar = await fetchDolar();
  const system = construirSistema(getRealProducts(), dolar);
  const messages: Anthropic.MessageParam[] = [
    ...historial.map((t): Anthropic.MessageParam => ({
      role: t.rol === "usuario" ? "user" : "assistant",
      content: t.texto,
    })),
    { role: "user", content: pregunta },
  ];

  try {
    const client = new Anthropic();
    const respuesta = await client.messages.create({
      model: MODELO,
      max_tokens: 4000,
      output_config: { effort: "low" },
      system,
      messages,
    });

    if (respuesta.stop_reason === "refusal") {
      return NextResponse.json({
        modo: "ia",
        texto: "No puedo responder esa consulta. Probá reformularla con una pregunta sobre importar o revender productos.",
      });
    }

    const texto = respuesta.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n\n")
      .trim();
    if (!texto) return mensaje("No pude armar una respuesta. Probá de nuevo.", 502);
    return NextResponse.json({ modo: "ia", texto });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Importador IA: la clave de Anthropic no es válida.");
      return NextResponse.json({ modo: "sin-ia" }, { status: 503 });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return mensaje("Hay mucha demanda ahora. Probá de nuevo en un momento.", 429);
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Importador IA: error ${error.status} de la API.`);
      return mensaje("No pude consultar a la IA ahora. Probá de nuevo en un rato.", 502);
    }
    console.error("Importador IA: error inesperado.");
    return mensaje("No pude consultar a la IA ahora. Probá de nuevo en un rato.", 502);
  }
}
