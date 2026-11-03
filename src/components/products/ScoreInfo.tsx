"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/kit/dialog";
import { SCORE_MAX } from "@/lib/score";

const FACTORES = [
  { clave: "margin", nombre: "Margen", texto: "Cuánto te queda de cada venta después de costos, impuestos y comisión." },
  { clave: "trend", nombre: "Tendencia", texto: "Si la demanda sube, está estable o baja." },
  { clave: "competition", nombre: "Competencia", texto: "Cuántos vendedores ofrecen algo parecido." },
  { clave: "capital", nombre: "Capital por unidad", texto: "Cuánta plata hay que poner por cada unidad: menos es más fácil de probar." },
] as const;

/** Botón que abre una ventana con la explicación del score. Los puntos salen del mismo código que calcula el score. */
export function ScoreInfo() {
  return (
    <Dialog>
      <DialogTrigger className="min-h-11 rounded-full text-sm font-bold text-radar-dark underline underline-offset-4 hover:text-radar">
        ¿Cómo se calcula el score?
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cómo se calcula el score</DialogTitle>
          <DialogDescription>Suma hasta 100 puntos con cuatro factores. Es una regla simple, no una predicción de ventas.</DialogDescription>
        </DialogHeader>
        <ul className="mt-4 space-y-3">
          {FACTORES.map((f) => (
            <li key={f.clave} className="rounded-2xl bg-secondary p-3 text-sm">
              <p className="font-bold">
                {f.nombre} <span className="font-normal text-ink-soft">· hasta {SCORE_MAX[f.clave]} puntos</span>
              </p>
              <p className="mt-1 text-ink-soft">{f.texto}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-ink-soft">
          <strong className="text-ink">70 o más:</strong> alto. <strong className="text-ink">De 45 a 69:</strong> medio.{" "}
          <strong className="text-ink">Menos de 45:</strong> bajo. Si el producto pierde plata por unidad, el score no pasa de 29.
        </p>
      </DialogContent>
    </Dialog>
  );
}
