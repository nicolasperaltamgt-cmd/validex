import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Imágenes opcionales que se copian a `public/images/`. Si el archivo existe, la página lo muestra;
 * si no existe, la página usa su versión sin imagen. Se comprueba al compilar o al iniciar el sitio.
 */
export function publicImage(file: string): string | null {
  const full = path.join(process.cwd(), "public", "images", file);
  return existsSync(full) ? `/images/${file}` : null;
}
