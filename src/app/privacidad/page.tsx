import type { Metadata } from "next";
import { LegalDoc } from "@/components/ui/LegalDoc";

export const metadata: Metadata = { title: "Política de privacidad" };

export default function PrivacyPage() {
  return (
    <LegalDoc
      eyebrow="Legal"
      title="Política de privacidad"
      sections={[
        {
          title: "Quién es responsable",
          body: <p>Validex es operado por Martin Gleiser (CUIT 20-44748879-6). Contacto: <a className="text-radar underline underline-offset-2" href="mailto:infovalidex@gmail.com">infovalidex@gmail.com</a>.</p>,
        },
        {
          title: "Qué datos usamos",
          body: (
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong>Si no ingresás:</strong> tus productos guardados y tu preferencia de moneda quedan en tu
                navegador. No los recibimos.
              </li>
              <li>
                <strong>Si ingresás:</strong> tu email (y, si usás Google, el nombre y la foto que Google comparte) y la
                lista de productos que guardás en tu cuenta.
              </li>
              <li>
                <strong>Lo que escribís en la calculadora</strong> se procesa en tu navegador y no se envía a ningún servidor.
              </li>
            </ul>
          ),
        },
        {
          title: "Para qué los usamos",
          body: <p>Solo para que puedas ingresar y conservar tu lista de productos. No vendemos tus datos ni mostramos publicidad.</p>,
        },
        {
          title: "Servicios de terceros",
          body: (
            <ul className="list-disc space-y-1 pl-5">
              <li>Supabase: guarda las cuentas y la lista de guardados (base de datos alojada en Estados Unidos).</li>
              <li>Google: solo si elegís ingresar con Google.</li>
              <li>Mercado Libre (API oficial): consultamos desde nuestro servidor datos públicos de categorías. No enviamos datos tuyos.</li>
            </ul>
          ),
        },
        {
          title: "Cookies y almacenamiento",
          body: <p>No usamos cookies de publicidad ni de medición. Usamos el almacenamiento del navegador para recordar tu sesión y tus preferencias.</p>,
        },
        {
          title: "Tus derechos",
          body: <p>Podés pedir ver, corregir o borrar tus datos escribiendo a <a className="text-radar underline underline-offset-2" href="mailto:infovalidex@gmail.com">infovalidex@gmail.com</a>. Para borrar tu cuenta, indicá el email con el que ingresaste.</p>,
        },
        {
          title: "Origen de los datos",
          body: <p>Los productos, precios y señales que ves en esta versión de prueba son referencias reales de fuentes públicas (precios publicados, listados de proveedores y datos públicos de Mercado Libre), con su fuente y fecha, todavía sin verificar con cotizaciones. Cada ficha indica cuáles son estimaciones nuestras.</p>,
        },
        {
          title: "Cambios",
          body: <p>Si agregamos fuentes de datos, analítica u otros servicios, actualizaremos esta política antes. Última actualización: 31 de octubre de 2026.</p>,
        },
      ]}
    />
  );
}
