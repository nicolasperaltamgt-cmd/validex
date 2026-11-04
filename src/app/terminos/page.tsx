import type { Metadata } from "next";
import { LegalDoc } from "@/components/ui/LegalDoc";

export const metadata: Metadata = { title: "Términos de uso" };

export default function TermsPage() {
  return (
    <LegalDoc
      eyebrow="Legal"
      title="Términos de uso"
      sections={[
        {
          title: "Qué es Validex",
          body: <p>Una herramienta para explorar productos, comparar señales y calcular márgenes con los supuestos que cargás vos. Esta es una versión de prueba.</p>,
        },
        {
          title: "No es asesoramiento",
          body: <p>La información es orientativa. No constituye asesoramiento financiero, fiscal, legal ni aduanero, ni una cotización logística real. Tus decisiones de compra o inversión son tu responsabilidad.</p>,
        },
        {
          title: "Origen de los datos",
          body: <p>Los productos, precios, costos y señales son referencias de fuentes públicas (precios publicados, listados de proveedores y datos públicos de Mercado Libre), con su fuente y fecha, todavía sin verificar con cotizaciones; cada ficha indica qué es estimación nuestra. Validex no está afiliado ni respaldado por Mercado Libre. No garantizamos que reflejen la situación real de mercado ni resultados económicos.</p>,
        },
        {
          title: "Tu cuenta",
          body: <p>Podés usar Validex sin cuenta. Si ingresás, sos responsable de tu acceso. Podés dejar de usar el servicio y pedir el borrado de tus datos cuando quieras.</p>,
        },
        {
          title: "Uso aceptable",
          body: <p>No uses el servicio para actividades ilegales, para intentar acceder a datos de otras personas ni para sobrecargarlo o dañarlo.</p>,
        },
        {
          title: "Disponibilidad y cambios",
          body: <p>Al ser una versión de prueba, puede tener errores, cambiar o interrumpirse sin aviso. Podemos modificar estos términos; los cambios importantes se avisarán en el sitio.</p>,
        },
        {
          title: "Limitación de responsabilidad",
          body: <p>En la medida que la ley lo permita, Validex se ofrece &quot;tal cual&quot;, sin garantías, y no responde por pérdidas derivadas de usar la información del sitio. [Revisar con un abogado].</p>,
        },
        {
          title: "Contacto y ley aplicable",
          body: <p>Operado por Martin Gleiser (CUIT 20-44748879-6). Consultas: <a className="text-radar underline underline-offset-2" href="mailto:infovalidex@gmail.com">infovalidex@gmail.com</a>. Ley y jurisdicción aplicables: [completar con asesoría legal].</p>,
        },
      ]}
    />
  );
}
