# Validex (versión de prueba)

**Antes de comprar, mirá los números.** Validex es una herramienta para evaluar un producto antes de importarlo y revenderlo en Argentina:
costo completo (compra, flete, impuestos y comisión), margen, un **score de 0 a 100 con metodología pública** y qué tan firme es ese margen.

Sitio de prueba: https://nicolasperaltamgt-cmd.github.io/validex/

> **Estado:** versión de prueba. Los productos son **referencias reales con fuente y fecha, todavía sin verificar** con cotizaciones de proveedores.
> Cada ficha muestra qué dato tiene fuente y cuál es una estimación. Nada se presenta como "verificado" si no lo está.

## Qué hace

- **Drop del día:** tres productos con su score.
- **Tantear:** pegás un link de Alibaba y uno de Mercado Libre, escribís los dos precios y la cuenta sale sola (flete, impuestos y comisión estimados).
- **Ficha de análisis:** cobertura del análisis (qué dato tiene fuente), firmeza del margen (mejor y peor caso, flete al doble) y señales de Mercado Libre.
- **Evitá estos:** los productos de menor score y por qué.
- **Importador:** guía y respuestas con reglas fijas, con las fuentes a la vista. No usa IA por defecto.
- **Metodología:** la fórmula del score es fija y está en `/metodologia` y en `src/lib/score.ts`.

## Cómo ejecutarla

```bash
npm install     # solo la primera vez
npm run dev     # abrir http://localhost:3000
```

Comprobaciones: `npx tsc --noEmit`, `npm run lint`, `npm test` (pruebas de la lógica), `npm run build`.

## Estructura

- `src/app/`: páginas (portada, hoy, tantear, importador, evitar, catálogo, análisis, metodología, etc.).
- `src/components/`: componentes (`kit/` con la base de interfaz, `products/`, `calculator/`, `layout/`).
- `src/data/`: productos reales con fuentes (`real-products.ts`) y la foto de señales de Mercado Libre (`meli-signals.json`).
- `src/lib/`: score, cálculo de costos, cobertura, sensibilidad, configuración por mercado (`markets.ts`), validación de links, etc.
- `src/design/tokens.ts`: colores y medidas de la marca.
- `docs/`: documentación de trabajo (auditoría, metodología de datos, plan de lanzamiento, notas de Mercado Libre).

## Datos y fuentes

- **Precios de venta:** publicados en Argentina (Frávega y rastreadores de precios), relevados el 1/11/2026. No se leen solos: cambian todos los días.
- **Costos de compra:** listados de proveedores (Alibaba, Made-in-China). No son cotizaciones.
- **Dólar de referencia:** dólar oficial de DolarAPI, con su fecha en `src/lib/markets.ts`.
- **Mercado Libre:** tendencias, categorías y más vendidos por la API oficial, con atribución y fecha. Los precios y la cantidad de vendedores todavía no se pueden leer.
- **Flete, impuestos, tendencia y competencia:** estimaciones propias, marcadas como tales en cada ficha.

## Actualizar los datos de Mercado Libre

Necesita un archivo `.env.local` con `MELI_CLIENT_ID` y `MELI_CLIENT_SECRET` (ver `.env.example`; **nunca** se guardan en el repositorio).

```bash
npm run actualizar -- --solo-datos   # solo actualiza src/data/meli-signals.json
```

## Aviso

Las páginas de Privacidad y Términos son **borradores** y necesitan revisión legal antes de un lanzamiento real. Validex no está afiliado ni
respaldado por Mercado Libre. Nada de lo que muestra es asesoramiento aduanero, fiscal ni una predicción de ventas.

Todos los derechos reservados salvo que se indique otra licencia.
