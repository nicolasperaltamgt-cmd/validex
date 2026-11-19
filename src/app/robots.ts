import type { MetadataRoute } from "next";

// Necesario para publicar el sitio como archivos estáticos (GitHub Pages); en Netlify no cambia nada.
export const dynamic = "force-static";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Por defecto el sitio NO se ofrece a los buscadores: es una versión de prueba (datos sin verificar, textos
 * legales en borrador). Para abrirlo, definí NEXT_PUBLIC_INDEXAR=si al publicar.
 */
export default function robots(): MetadataRoute.Robots {
  if (process.env.NEXT_PUBLIC_INDEXAR !== "si") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
