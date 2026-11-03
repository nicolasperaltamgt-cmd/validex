import type { Metadata } from "next";
import { GuiaImportacion } from "@/components/importador/GuiaImportacion";
import { ImportadorChat } from "@/components/importador/ImportadorChat";
import { fetchDolar } from "@/lib/dolar";
import { iaHabilitada } from "@/lib/importador-ia";

export const metadata: Metadata = { title: "El Importador" };

// La cotización del dólar se vuelve a pedir como máximo cada 10 minutos.
export const revalidate = 600;

import { FondoApp } from "@/components/layout/FondoApp";

export default async function ImporterPage() {
  const dolar = await fetchDolar();
  const iaActiva = iaHabilitada(process.env);
  return (
    <>
      <FondoApp />
      <div className="mx-auto max-w-3xl">
      <header className="mb-5">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">El Importador</h1>
        <p className="mt-2 text-ink-soft">Tus dudas sobre importar y revender, con las fuentes a la vista.</p>
      </header>
      <ImportadorChat dolar={dolar} iaActiva={iaActiva} />
      <p className="mt-4 text-xs leading-relaxed text-muted">
        Guía orientativa con datos sin verificar. No reemplaza a un despachante de aduana ni a un contador.
        {iaActiva ? " Las preguntas libres las contesta una IA y puede equivocarse." : ""}
      </p>
      <GuiaImportacion />
    </div>
    </>
  );
}
