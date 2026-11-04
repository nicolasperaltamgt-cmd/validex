# Cómo sumar un país o una moneda

Todo lo que cambia entre países vive en `src/lib/markets.ts` (`MarketConfig`). Hoy solo existe Argentina (`AR`).
El catálogo, el importador y el panel de firmeza leen esos valores; ya no hay tasas repetidas en otros archivos.

## Qué hay que cargar por país (con fuente y fecha)
| Campo | Qué es | Dónde buscarlo |
|---|---|---|
| `vat` | IVA general | Organismo tributario del país |
| `dutyEstimate` y `dutyRange` | Derechos de importación base y rango | Arancel de aduanas del país |
| `statisticsFee` | Tasa o cargos fijos sobre el valor CIF | Aduana |
| `commission` | Comisión de la plataforma de venta (por defecto, mínima, máxima) y su fuente | Página oficial de la plataforma |
| `referenceRate` | Tipo de cambio a USD, fecha y fuente | Banco central o API pública |
| `currency`, `locale` | Para formatear importes | ISO 4217 / BCP 47 |

**Regla:** no se carga ningún valor sin fuente. Si falta un dato, el país no se activa.

## Qué todavía NO es multi-país (trabajo pendiente)
1. `real-products.ts` convierte precios con la constante de Argentina. Para otro país hay que pasar el mercado a `build()` y `netUsd()`.
2. Los textos del Importador, la metodología y la guía de importación están escritos para Argentina (ARCA, despachante, Mercado Libre).
3. No hay selector de país en la interfaz ni catálogo por país.
4. Las reglas de importación (courier, régimen general, percepciones) cambian por país y no están modeladas como datos.

Por eso la arquitectura está **preparada**, pero el producto es **solo para Argentina** hasta que haya datos verificados de otro país.
