# Plan técnico: incorporar shadcn/ui en Validex

Estado: **propuesta, sin implementar. Espera aprobación.**

## 1. Compatibilidad (verificada en el proyecto)

| Tema | Estado hoy | Resultado |
|---|---|---|
| Next.js / React | 15.5.28 / 19.1.0 | Compatible |
| Tailwind | v4 (`@theme` en `globals.css`) | Compatible (shadcn tiene soporte v4) |
| TypeScript | strict, alias `@/*` → `src/*` | Compatible |
| `components.json` | no existe | Se crea |
| Carpeta `src/components/ui` | ya existe con piezas propias (Badges, Faq, Logo…) | **Conflicto de nombres** |
| `ui/button.ts` (propio) vs `button.tsx` de shadcn | mismo nombre de módulo | **Conflicto** |
| Git | el proyecto no es un repositorio | **Riesgo: sin forma de volver atrás** |
| Dependencias de UI actuales | ninguna (ni Radix, ni lucide, ni cva) | Hay que sumar las mínimas |

Conclusión: se puede integrar sin romper nada si se evitan dos choques (carpeta y `button`) y se mapean los tokens de shadcn a los de Validex.

## 2. Decisiones de arquitectura

1. **Carpeta propia para los componentes de shadcn:** `src/components/kit` (alias `@/components/kit`). Así no se mezclan con `ui/` ni choca `button`.
2. **Un solo sistema de tokens.** shadcn usa variables como `--primary` o `--border`. Se mapean a los tokens de Validex en `globals.css`; no se usa la paleta neutra por defecto de shadcn. El origen de verdad sigue siendo `src/design/tokens.ts` y Figma.

| shadcn | Validex |
|---|---|
| `--background` | paper `#ffffff` |
| `--foreground` | ink `#1a1033` |
| `--card` | surface `#ffffff` |
| `--primary` / `--primary-foreground` | violet-brand `#5b3df5` / blanco |
| `--secondary`, `--muted` | panel `#ece6ff` |
| `--muted-foreground` | muted `#6b6488` |
| `--accent` | violet-light `#d9ceff` |
| `--destructive` | danger `#c62828` |
| `--border` | line `#cbbff0` (borde fuerte de tarjeta: violet-deep `#2b1a8f`) |
| `--ring` | violet-brand |
| `--radius` | 12 px (campo), 24 px (tarjeta), pill 999 |

3. **Sin big-bang.** `buttonClass()` sigue funcionando y pasa a apoyarse en el Button nuevo; los 36 usos se migran de a poco.
4. **Radix solo donde aporta accesibilidad real** (Dialog, Dropdown, Tooltip). Button, Card, Input, Table y la navegación no necesitan Radix.

## 3. Inventario real hoy

| Componente | Cómo está hoy | Cantidad |
|---|---|---|
| Buttons | `buttonClass()` + clases sueltas | 36 usos |
| Inputs | `<input>` con clases | 10 |
| Selects | `<select>` nativo | 6 |
| Dialogs | no hay | 0 |
| Dropdowns | no hay (menú "Más" propio en móvil) | 0 |
| Tables | `<table>` en Comparar | 1 |
| Cards | clase `.tarjeta` y `border-profundo` | 72 |
| Navigation | `SiteHeader` + `MobileTabBar` propios | 2 |
| Toasts | `SyncNotice` (aviso fijo) | 1 |
| Tooltips | no hay | 0 |

## 4. Dependencias propuestas (mínimas)

| Paquete | Para qué | Cuándo |
|---|---|---|
| `class-variance-authority`, `clsx`, `tailwind-merge` | variantes y función `cn()` | Fase 1 |
| `radix-ui` (paquete unificado) | Dialog, Dropdown, Tooltip | Fase 3 |
| `sonner` | Toasts | Fase 4 |
| `tw-animate-css` | animaciones de entrada/salida de Dialog, Dropdown y Tooltip | Fase 3 |

Se descartan: `lucide-react` (ya hay `Icons.tsx` propio) y el resto de Radix. El peso en el navegador no está medido: se mide con `next build` al terminar cada fase.

## 5. Fases (cada una se verifica antes de pasar a la siguiente)

**Fase 0. Preparación.** `git init` y primer commit; línea base: 35 tests, axe en 0, capturas de las 5 pantallas principales. Crear `components.json` y `cn()`. Mapear los tokens.

**Fase 1. Button, Card, Input/Label.** Sin Radix. Card reemplaza `.tarjeta`; Input en los 10 inputs; Button detrás de `buttonClass()`.

**Fase 2. Select.** Se propone el **select nativo con estilo de shadcn** (NativeSelect): en celular el selector del sistema es más rápido y accesible que uno personalizado. Radix Select solo si más adelante hace falta buscar dentro de la lista.

**Fase 3. Dialog, Tooltip, Table, Navigation.** Dialog para detalle de fuentes y confirmaciones. Tooltip para explicar el score. Table para Comparar. Navegación: se mantienen los componentes propios, solo se estilizan con tokens; el menú "Más" del celular pasa a Sheet (Dialog) para que atrape el foco.

**Fase 4. Dropdown y Toasts.** Dropdown para el menú de cuenta. Sonner reemplaza `SyncNotice` y suma avisos ("Guardado", "Enlace copiado").

**Fase 5. Limpieza.** Borrar `button.ts` y `.tarjeta` cuando no quede ningún uso; actualizar la documentación y el Figma.

## 6. Criterios de aceptación por fase

- Los 35 tests pasan, más los que se agreguen.
- Axe en 0 violaciones en las 7 pantallas principales.
- Sin desborde horizontal en 390 px.
- Teclado completo: Tab, Enter, Esc y foco visible.
- `next build` sin errores y peso de JS comparado antes/después.
- Sin cambio visual no pedido (capturas antes/después).

## 7. Riesgos

| Riesgo | Mitigación |
|---|---|
| Sin git, no hay vuelta atrás | Fase 0: `git init` y commit; además queda el zip del código |
| Choque de nombres (`ui/`, `button`) | Carpeta `kit` |
| Dos sistemas de color a la vez | Mapeo de tokens y test que compare con `tokens.ts` |
| Más JavaScript en el navegador | Radix solo en Fase 3; medir cada fase |
| Regresión en móvil | Select nativo; pruebas a 390 px |
| Que `shadcn add` pise archivos | Se corre con `--dry-run` y se revisa antes de escribir |

## 8. Decisiones que necesito de vos

1. ¿Carpeta `src/components/kit` en vez de `ui`?
2. ¿Select nativo con estilo, en vez de Radix Select?
3. ¿Sonner para los toasts?
4. ¿Hago `git init` en `radar-global` antes de empezar?
