"use client";

/**
 * Compartir un producto. En el celular abre el menú de compartir del sistema (con WhatsApp incluido);
 * en la PC abre WhatsApp Web con el texto listo. No se manda nada sin que la persona lo confirme ahí.
 */
export function ShareButton({ texto, ruta, className = "" }: { texto: string; ruta: string; className?: string }) {
  async function compartir() {
    const url = `${window.location.origin}${ruta}`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Validex", text: texto, url });
        return;
      } catch {
        // Si la persona cancela o falla, se prueba con WhatsApp.
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${texto} ${url}`)}`, "_blank", "noopener,noreferrer");
  }
  return (
    <button type="button" onClick={compartir} aria-label={`Compartir: ${texto}`} className={className}>
      Compartir
    </button>
  );
}
