import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Las fotos ya vienen chicas (800 px): se sirven directo, sin el optimizador, que fallaba al cargar varias juntas.
  images: { unoptimized: true },
};

export default nextConfig;
