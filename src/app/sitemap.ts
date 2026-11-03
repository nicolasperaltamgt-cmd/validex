import type { MetadataRoute } from "next";
import { getProducts } from "@/data";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const RUTAS = ["/", "/hoy", "/tantear", "/importador", "/oportunidades", "/catalogo", "/calculadora", "/comparar", "/categorias", "/ayuda", "/privacidad", "/terminos"];

export default function sitemap(): MetadataRoute.Sitemap {
  const productos = getProducts().flatMap((p) => [`/analisis/${p.id}`, `/catalogo/${p.id}`]);
  return [...RUTAS, ...productos].map((ruta) => ({ url: `${BASE}${ruta}` }));
}
