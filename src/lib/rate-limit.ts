/**
 * Límites de uso simples, en memoria. Sirven como defensa extra para que nadie dispare el gasto de la IA:
 * en un servidor con varias instancias cada una cuenta por separado, así que el límite de gasto real
 * hay que fijarlo también en el panel de Anthropic.
 */

export interface Limitador {
  /** Devuelve true y registra el uso si la clave todavía no llegó al máximo en la ventana. */
  permitir(clave: string): boolean;
}

export function crearLimitador(opciones: { max: number; ventanaMs: number; ahora?: () => number }): Limitador {
  const ahora = opciones.ahora ?? Date.now;
  const usos = new Map<string, number[]>();
  return {
    permitir(clave) {
      const t = ahora();
      const recientes = (usos.get(clave) ?? []).filter((x) => t - x < opciones.ventanaMs);
      if (recientes.length >= opciones.max) {
        usos.set(clave, recientes);
        return false;
      }
      recientes.push(t);
      usos.set(clave, recientes);
      // Evita que el mapa crezca sin límite con muchas claves distintas.
      if (usos.size > 5000) {
        for (const [k, v] of usos) if (v.every((x) => t - x >= opciones.ventanaMs)) usos.delete(k);
      }
      return true;
    },
  };
}

export interface TopeDiario {
  /** Devuelve true y suma 1 si todavía no se llegó al tope de hoy (hora de Argentina). */
  permitir(): boolean;
}

export function crearTopeDiario(max: number, ahora: () => Date = () => new Date()): TopeDiario {
  let dia = "";
  let cuenta = 0;
  return {
    permitir() {
      const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }).format(ahora());
      if (hoy !== dia) {
        dia = hoy;
        cuenta = 0;
      }
      if (cuenta >= max) return false;
      cuenta += 1;
      return true;
    },
  };
}
