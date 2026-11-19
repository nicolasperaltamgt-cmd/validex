/**
 * Cuántas unidades alcanzan con un capital. Usa el costo total por unidad (compra + flete + impuestos).
 * "Primer pedido": como todavía no hay datos confirmados, se recomienda arriesgar solo una parte del capital.
 */
export const PARTE_PRIMER_PEDIDO = 0.3;

export interface PlanCapital {
  unidades: number;
  gasto: number;
  sobrante: number;
  /** Unidades del primer pedido chico (30 % del capital, mínimo 1 si alcanza). */
  primerPedido: number;
  primerPedidoGasto: number;
  /** Ganancia si se vende todo el pedido completo con los números cargados (no es una promesa). */
  gananciaSiVendeTodo: number;
}

export function planCapital(capital: number, costoUnidad: number, gananciaUnidad: number): PlanCapital | null {
  if (!Number.isFinite(capital) || !Number.isFinite(costoUnidad) || capital <= 0 || costoUnidad <= 0) return null;
  const unidades = Math.floor(capital / costoUnidad);
  const chico = Math.floor((capital * PARTE_PRIMER_PEDIDO) / costoUnidad);
  const primerPedido = unidades >= 1 ? Math.max(1, chico) : 0;
  return {
    unidades,
    gasto: unidades * costoUnidad,
    sobrante: capital - unidades * costoUnidad,
    primerPedido,
    primerPedidoGasto: primerPedido * costoUnidad,
    gananciaSiVendeTodo: unidades * gananciaUnidad,
  };
}
