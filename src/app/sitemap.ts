import type { MetadataRoute } from "next";
import { getProducts } from "@/data";

// Necesario para publicar el sitio como archivos estáticos (GitHub Pages); en Netlify no cambia nada.
export const dynamic = "force-static";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const RUTAS = ["/", "/hoy", "/tantear", "/importador", "/evitar", "/oportunidades", "/catalogo", "/buscar", "/demo", "/presentacion", "/calculadora", "/comparar", "/categorias", "/metodologia", "/ayuda", "/privacidad", "/terminos"];

export default function sitemap(): MetadataRoute.Sitemap {
  const productos = getProducts().flatMap((p) => [`/analisis/${p.id}`, `/catalogo/${p.id}`]);
  return [...RUTAS, ...productos].map((ruta) => ({ url: `${BASE}${ruta}` }));
}
