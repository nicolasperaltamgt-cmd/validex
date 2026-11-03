import Image from "next/image";
import type { Product } from "@/data/types";

/**
 * Foto del producto. Las imágenes son ilustraciones generadas con IA (no son fotos de la mercadería ni
 * de ninguna tienda), y se aclara siempre. Si el producto no tiene imagen, no muestra nada.
 */
export function ProductImage({
  product,
  className = "",
  sizes = "(min-width: 1024px) 33vw, 100vw",
  priority = false,
}: {
  product: Pick<Product, "name" | "image">;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!product.image) return null;
  return (
    <div className={`relative overflow-hidden bg-panel ${className}`}>
      <Image
        src={product.image}
        alt={`Ilustración de ${product.name}`}
        fill
        sizes={sizes}
        priority={priority}
        className="object-contain"
      />
      <span className="absolute bottom-2 right-2 rounded bg-paper/80 px-1.5 py-0.5 text-[0.65rem] text-muted">
        Imagen ilustrativa
      </span>
    </div>
  );
}
