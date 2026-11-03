"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { getRealProducts } from "@/data";
import type { Dolar } from "@/lib/dolar-parse";
import { responder, SUGERENCIAS, type Respuesta } from "@/lib/importador";
import { MAX_PREGUNTA, type Turno } from "@/lib/importador-ia";

type Mensaje =
  | { id: number; rol: "usuario"; texto: string }
  | { id: number; rol: "importador"; respuesta: Respuesta }
  | { id: number; rol: "importador"; ia: string };

type SinId<T> = T extends unknown ? Omit<T, "id"> : never;

function bienvenida(iaActiva: boolean): Respuesta {
  return {
    tema: "bienvenida",
    parrafos: [
      "Hola. Preguntame lo que quieras sobre importar y revender: te respondo con fuentes.",
      ...(iaActiva ? [] : ["Si no sé algo, te lo digo."]),
    ],
  };
}

function textoDeRespuesta(m: Mensaje): string {
  if (m.rol === "usuario") return m.texto;
  return "ia" in m ? m.ia : m.respuesta.parrafos.join(" ");
}

export function ImportadorChat({ dolar, iaActiva }: { dolar: Dolar | null; iaActiva: boolean }) {
  const productos = useMemo(() => getRealProducts(), []);
  const [mensajes, setMensajes] = useState<Mensaje[]>([{ id: 0, rol: "importador", respuesta: bienvenida(iaActiva) }]);
  const [texto, setTexto] = useState("");
  const [error, setError] = useState("");
  const [pensando, setPensando] = useState(false);
  const fin = useRef<HTMLDivElement>(null);
  const siguienteId = useRef(1);

  // Baja el chat solo cuando hay mensajes nuevos, no al cargar la página.
  useEffect(() => {
    if (mensajes.length > 1) fin.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [mensajes.length, pensando]);

  const agregar = (m: SinId<Mensaje>) =>
    setMensajes((prev) => [...prev, { ...m, id: siguienteId.current++ } as Mensaje]);

  async function enviar(pregunta: string) {
    const limpia = pregunta.trim();
    if (pensando) return;
    if (!limpia) {
      setError("Escribí una pregunta primero.");
      return;
    }
    if (limpia.length > MAX_PREGUNTA) {
      setError(`La pregunta es muy larga (máximo ${MAX_PREGUNTA} caracteres).`);
      return;
    }
    setError("");
    setTexto("");
    const historial: Turno[] = mensajes
      .slice(-4)
      .map((m) => ({ rol: m.rol === "usuario" ? ("usuario" as const) : ("asistente" as const), texto: textoDeRespuesta(m) }));
    agregar({ rol: "usuario", texto: limpia });

    // Las preguntas que las reglas conocen se responden sin costo. Una pausa corta de "escribiendo…"
    // hace la conversación más natural (se omite si la persona prefiere menos movimiento).
    const local = responder(limpia, { productos, dolar });
    if (local.tema !== "ayuda") {
      setPensando(true);
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        await new Promise((r) => window.setTimeout(r, 650));
      }
      agregar({ rol: "importador", respuesta: local });
      setPensando(false);
      return;
    }

    setPensando(true);
    try {
      const res = await fetch("/api/importador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta: limpia, historial }),
      });
      const data = (await res.json().catch(() => ({}))) as { texto?: string; error?: string };
      if (res.ok && data.texto) {
        agregar({ rol: "importador", ia: data.texto });
      } else if (data.error) {
        agregar({ rol: "importador", respuesta: { tema: "limite", parrafos: [data.error] } });
      } else {
        agregar({ rol: "importador", respuesta: local });
      }
    } catch {
      agregar({ rol: "importador", respuesta: local });
    } finally {
      setPensando(false);
    }
  }

  return (
    <section aria-labelledby="chat-titulo" className="flex flex-col overflow-hidden rounded-3xl border-2 border-profundo bg-surface">
      <header className="flex items-center gap-3 border-b border-line px-5 py-4">
        <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-full bg-radar-soft text-xl text-radar">
          ◈
        </span>
        <div>
          <h2 id="chat-titulo" className="font-display text-lg font-bold leading-tight">El Importador</h2>
          <p className="text-xs text-muted">
            Guía de importación
          </p>
        </div>
      </header>

      <div role="log" aria-live="polite" aria-label="Conversación" className="max-h-[34rem] min-h-[22rem] space-y-4 overflow-y-auto px-5 py-5">
        {mensajes.map((m) =>
          m.rol === "usuario" ? (
            <div key={m.id} className="entrada flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-radar px-4 py-2.5 text-sm font-medium text-paper">{m.texto}</p>
            </div>
          ) : "ia" in m ? (
            <div key={m.id} className="entrada max-w-[92%] rounded-2xl rounded-bl-sm border border-radar/40 bg-panel px-4 py-3 text-sm leading-relaxed">
              <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-radar-soft px-2.5 py-1 text-xs font-medium text-radar-dark">
                <span aria-hidden="true">✦</span> Respuesta con IA
              </p>
              <div className="space-y-2 whitespace-pre-line text-ink-soft">
                {m.ia.split(/\n{2,}/).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <p className="mt-3 border-t border-line pt-2 text-xs text-muted">
                La IA puede equivocarse. Confirmá impuestos y trámites con un despachante de aduana o un contador.
              </p>
            </div>
          ) : (
            <div key={m.id} className="entrada max-w-[92%] rounded-2xl rounded-bl-sm border-2 border-profundo bg-panel px-4 py-3 text-sm leading-relaxed">
              <div className="space-y-2 text-ink-soft">
                {m.respuesta.parrafos.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              {m.respuesta.enlaces?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {m.respuesta.enlaces.map((l) => (
                    <Link key={l.href} href={l.href} className="inline-flex min-h-9 items-center rounded-lg border border-radar/40 px-3 text-xs font-semibold text-radar hover:bg-radar-soft">
                      {l.label} →
                    </Link>
                  ))}
                </div>
              ) : null}
              {m.respuesta.fuentes?.length ? (
                <div className="mt-3 border-t border-line pt-2">
                  <p className="text-xs font-semibold text-muted">Fuentes</p>
                  <ul className="mt-1 space-y-1 text-xs">
                    {m.respuesta.fuentes.map((f) => (
                      <li key={f.url}>
                        <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-radar underline underline-offset-2">
                          {f.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ),
        )}
        {pensando ? (
          <div role="status" className="entrada inline-flex items-center gap-1.5 rounded-2xl rounded-bl-sm border-2 border-profundo bg-panel px-4 py-3">
            <span className="sr-only">El Importador está escribiendo</span>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                aria-hidden="true"
                className="punto-escribiendo size-1.5 rounded-full bg-ink-soft"
                style={{ animationDelay: `${i * 160}ms` }}
              />
            ))}
          </div>
        ) : null}
        <div ref={fin} />
      </div>

      <div className="border-t border-line px-5 py-4">
        <p className="mb-2 text-xs font-semibold text-muted">Dudas frecuentes</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {SUGERENCIAS.map((s) => (
            <button
              key={s}
              type="button"
              disabled={pensando}
              onClick={() => enviar(s)}
              className="min-h-10 rounded-full border-2 border-profundo bg-panel px-4 text-left text-xs font-medium text-ink-soft hover:border-radar hover:text-ink disabled:opacity-50"
            >
              <span aria-hidden="true" className="mr-1 text-signal">⚡</span>
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void enviar(texto);
          }}
          className="flex gap-2"
          noValidate
        >
          <label htmlFor="pregunta" className="sr-only">Tu pregunta</label>
          <input
            id="pregunta"
            type="text"
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              if (error) setError("");
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "pregunta-error" : undefined}
            placeholder="Escribí tu duda…"
            autoComplete="off"
            maxLength={MAX_PREGUNTA + 50}
            className="min-h-12 flex-1 rounded-full border border-ink/25 bg-panel px-5 text-base focus:border-radar"
          />
          <button type="submit" disabled={pensando} className="min-h-12 rounded-full bg-ink px-7 text-sm font-bold text-paper hover:opacity-90 disabled:opacity-50">
            Enviar
          </button>
        </form>
        {error ? (
          <p id="pregunta-error" role="alert" className="mt-2 text-sm font-medium text-danger">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
