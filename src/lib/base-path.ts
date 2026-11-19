/**
 * Carpeta base del sitio. Vacía en Netlify y en local; "/validex" cuando se publica en GitHub Pages
 * (la dirección es https://usuario.github.io/validex/). Los archivos de `public/` y las imágenes que se
 * escriben a mano tienen que pasar por `conBase()` para que funcionen en las dos publicaciones.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function conBase(ruta: string): string {
  return `${BASE_PATH}${ruta}`;
}
