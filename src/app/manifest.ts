import type { MetadataRoute } from "next";

/** Permite instalar Validex desde Chrome como una app (PWA). Más adelante se empaqueta para las tiendas. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Validex",
    short_name: "Validex",
    description: "Encontrá, analizá e invertí mejor: score de productos, drop diario y guía de importación.",
    lang: "es-AR",
    start_url: "/hoy",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#2b1a8f",
    categories: ["business", "finance", "shopping"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Drop del día", url: "/hoy" },
      { name: "Tantear un producto", url: "/tantear" },
      { name: "El Importador", url: "/importador" },
    ],
  };
}
