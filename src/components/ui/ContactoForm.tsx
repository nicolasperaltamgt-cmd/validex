"use client";

import { useState } from "react";
import { Input } from "@/components/kit/input";
import { NativeSelect } from "@/components/kit/native-select";
import { buttonClass } from "@/components/ui/button";

/** El mismo correo que ya figura en las páginas de privacidad y términos. */
const CORREO = "infovalidex@gmail.com";
const MAX = 600;

/**
 * Contacto para interesados. El sitio no tiene servidor ni base de datos: al enviar se abre el correo de la persona
 * con el mensaje ya armado, y no se guarda nada en Validex. Solo se arma si la persona marca el consentimiento.
 */
export function ContactoForm() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState("Emprendedor/a");
  const [mensaje, setMensaje] = useState("");
  const [acepta, setAcepta] = useState(false);
  const [intento, setIntento] = useState(false);

  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
  const errores = {
    nombre: nombre.trim().length < 2 ? "Escribí tu nombre." : "",
    correo: correoValido ? "" : "Escribí un correo válido.",
    acepta: acepta ? "" : "Para escribirnos tenés que aceptar que usemos estos datos para responderte.",
  };
  const hayError = Object.values(errores).some(Boolean);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setIntento(true);
    if (hayError) return;
    const cuerpo = [
      `Nombre: ${nombre.trim()}`,
      `Correo: ${correo.trim()}`,
      `Soy: ${rol}`,
      "",
      mensaje.trim() || "(sin mensaje)",
      "",
      "Acepto que Validex use estos datos solo para responderme.",
    ].join("\n");
    window.location.href = `mailto:${CORREO}?subject=${encodeURIComponent("Contacto desde Validex")}&body=${encodeURIComponent(cuerpo)}`;
  }

  const err = (k: keyof typeof errores) => (intento && errores[k] ? errores[k] : "");

  return (
    <form onSubmit={enviar} noValidate aria-labelledby="contacto-titulo" className="rounded-2xl border-2 border-profundo bg-surface p-6">
      <h2 id="contacto-titulo" className="font-display text-xl font-bold">¿Te interesa? Escribinos</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Para conversar sobre Validex: probarla, sumarte como usuario o hablar de inversión. Al enviar se abre tu correo con el mensaje listo; Validex no guarda nada en este sitio.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-nombre" className="mb-1 block text-sm font-medium">Nombre</label>
          <Input id="c-nombre" autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value.slice(0, 80))} aria-invalid={Boolean(err("nombre"))} aria-describedby={err("nombre") ? "c-nombre-e" : undefined} />
          {err("nombre") ? <p id="c-nombre-e" role="alert" className="mt-1 text-sm text-danger">{err("nombre")}</p> : null}
        </div>
        <div>
          <label htmlFor="c-correo" className="mb-1 block text-sm font-medium">Tu correo</label>
          <Input id="c-correo" type="email" autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value.slice(0, 120))} aria-invalid={Boolean(err("correo"))} aria-describedby={err("correo") ? "c-correo-e" : undefined} />
          {err("correo") ? <p id="c-correo-e" role="alert" className="mt-1 text-sm text-danger">{err("correo")}</p> : null}
        </div>
        <div>
          <label htmlFor="c-rol" className="mb-1 block text-sm font-medium">Soy</label>
          <NativeSelect id="c-rol" value={rol} onChange={(e) => setRol(e.target.value)}>
            <option>Emprendedor/a</option>
            <option>Inversor/a</option>
            <option>Vendedor/a de Mercado Libre</option>
            <option>Otro</option>
          </NativeSelect>
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="c-mensaje" className="mb-1 block text-sm font-medium">Mensaje (opcional)</label>
        <textarea
          id="c-mensaje"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value.slice(0, MAX))}
          rows={3}
          className="w-full rounded-xl border border-ink/25 bg-surface px-3 py-2 text-base focus:border-primary"
        />
        <p className="mt-1 text-xs text-muted">{mensaje.length}/{MAX}</p>
      </div>

      <div className="mt-3">
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} className="mt-1 size-5 shrink-0" aria-invalid={Boolean(err("acepta"))} aria-describedby={err("acepta") ? "c-acepta-e" : undefined} />
          <span>Acepto que Validex use estos datos solo para responderme.</span>
        </label>
        {err("acepta") ? <p id="c-acepta-e" role="alert" className="mt-1 text-sm text-danger">{err("acepta")}</p> : null}
      </div>

      <button type="submit" className={`${buttonClass("primary")} mt-5`}>Abrir mi correo con el mensaje</button>
      <p className="mt-3 text-xs text-muted">Si no se abre tu correo, escribinos a {CORREO}.</p>
    </form>
  );
}
