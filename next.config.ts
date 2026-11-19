import type { NextConfig } from "next";

/**
 * Encabezados de seguridad básicos. No se pone una política CSP estricta todavía: podría romper el ingreso con Google
 * y el monitoreo opcional. Es un pendiente de la auditoría (ver docs/AUDITORIA.md).
 */
const encabezadosSeguridad = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

/**
 * GitHub Pages (GITHUB_PAGES=true): el sitio se exporta como archivos estáticos y vive en una subcarpeta (/validex).
 * Sin servidor no hay encabezados propios ni la ruta /api/importador (el chat sigue funcionando con sus reglas locales).
 * En Netlify y en local no cambia nada.
 */
const paraGithubPages = process.env.GITHUB_PAGES === "true";
const carpetaBase = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Las fotos ya vienen chicas (800 px): se sirven directo, sin el optimizador, que fallaba al cargar varias juntas.
  images: { unoptimized: true },
  ...(paraGithubPages
    ? { output: "export", trailingSlash: true, basePath: carpetaBase, assetPrefix: carpetaBase }
    : {
        async headers() {
          return [{ source: "/:path*", headers: encabezadosSeguridad }];
        },
      }),
};

export default nextConfig;
