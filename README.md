# Validex — versión de prueba

Plataforma de inteligencia comercial (Next.js 15 + TypeScript + Tailwind v4, App Router).
**Todos los productos y cifras son datos de demostración ficticios.**

## Cómo ejecutarla

```bash
npm install     # solo la primera vez
npm run dev     # abrir http://localhost:3000
```

Comprobaciones: `npx tsc --noEmit`, `npm run lint`, `npm test` (6 pruebas de la lógica de cálculo), `npm run build`.

## Estructura

- `src/app/` — páginas (inicio, oportunidades, catalogo, analisis, calculadora, guardados, configuracion, ayuda)
- `src/components/` — componentes reutilizables (ui, layout, products, calculator, home)
- `src/data/` — datos ficticios y capa de acceso (`getProducts`, `getProduct`): único lugar a cambiar para conectar Supabase u otra fuente
- `src/lib/` — cálculo de margen, lectura de oportunidad, formatos
- `src/i18n/` — textos en español; estructura lista para sumar idiomas
- `src/state/` — guardados y moneda, guardados en el navegador (localStorage)

## Qué es real y qué no

- **Ficticio:** los 8 productos, sus precios, costos, tendencias y competencia (`src/data/products.ts`).
- **Funciona de verdad:** búsqueda y filtros, calculadora de margen, lectura de oportunidad (reglas en `src/lib/assessment.ts`) y lista de guardados (en el navegador, o en tu cuenta si ingresás con email).
- **Cuentas:** ingreso por enlace al email (Supabase). Requiere `.env.local` con la URL y la clave pública; sin eso la app funciona igual, sin cuentas.
- **Datos reales:** solo la sección Oferta por categoría (`/categorias`), de la API oficial de Mercado Libre, consultada desde el servidor (`src/lib/meli.ts`).
- **No hay:** pagos ni IA. Búsqueda, tendencias y ventas de Mercado Libre no están habilitadas todavía (ver `docs/MERCADOLIBRE.md`).

## Próximos pasos técnicos

1. Elegir una fuente de datos real (con autorización y documentación) y conectarla en `src/data/index.ts`.
2. (Hecho) Cuentas y guardados permanentes con Supabase.
3. Sumar inglés creando `src/i18n/en.ts`.

## Cuentas y datos reales

Ver `docs/PASOS-DATOS-Y-CUENTAS.md` (guía paso a paso), `supabase/schema.sql` y `.env.example`.

Plan para llegar a producción: `docs/PLAN-DE-LANZAMIENTO.md`.
