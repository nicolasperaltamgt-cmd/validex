# Validex: estado del proyecto

Última actualización: 3 de noviembre de 2026. Sitio de prueba: https://validex-prueba.netlify.app

> Regla del proyecto: nada se presenta como confirmado si no lo está. Hoy **ningún dato de producto está confirmado con una cotización**.

## Qué es hoy
Plataforma para evaluar un producto antes de importarlo y revenderlo en Argentina: costos completos (compra, flete, impuestos, comisión),
margen, y un Score Validex de 0 a 100 con metodología pública (`/metodologia`). Incluye el Drop diario (3 productos), Tantear (calculadora
con cantidad, precio mínimo y reporte PDF), Importador (guía y chat con reglas) y Guardados.

## Terminado y probado
- Score con pesos fijos y reproducible (margen 40, tendencia 25, competencia 20, capital 15; tope 29 si hay pérdida). Tests automáticos.
- 15 productos con fuentes abiertas, fecha y supuestos por escrito. Todos en estado "sin verificar".
- **Cobertura del análisis** (nuevo, 3/11/2026): cada ficha muestra cuántos de los 7 datos del score tienen fuente y cuáles son
  estimaciones, y qué falta para confirmar cada uno. Hoy todos los productos figuran como "análisis incompleto" (3 o 4 de 7 con fuente, 0 confirmados).
- **Firmeza del margen** (nuevo, 3/11/2026): cada ficha muestra el margen y el score en caso base, mejor caso, peor caso (rangos publicados de
  impuestos 0 a 35 % y comisión 11,8 a 17,1 %) y con el flete al doble, más el precio de equilibrio. Etiqueta: firme, sensible o no cierra
  (`src/lib/sensitivity.ts`). Con los datos actuales: 7 firmes, 5 sensibles, 3 que no cierran (smartwatch, cámara Wi-Fi, freidora).
- **Configuración por mercado** (nuevo, 3/11/2026): `src/lib/markets.ts` concentra IVA, derechos, comisión y tipo de cambio de Argentina, que antes
  estaban repetidos en 3 archivos. Es la base para sumar países (`docs/MERCADOS.md`), pero hoy el producto sigue siendo solo para Argentina.
- Interfaz violeta, kit de componentes (shadcn adaptado), accesibilidad revisada con axe (0 problemas en 34 revisiones), encabezados de seguridad.
- 37 pruebas automáticas pasan; tipos y lint sin errores.

## Hallazgos de investigación (con su grado de confianza)
- **Courier (ARCA, novedad del 6/10/2026, página oficial):** franquicia de US$ 400 por envío, hasta 5 envíos al año, menos de 50 kg,
  hasta 3 unidades iguales, **sin fin comercial**. No sirve para revender. El sitio ya lo dice así. Las alícuotas de derechos no figuran en esa página.
- **Alibaba y 1688:** las fuentes consultadas indican que la API oficial de 1688 exige cuenta de desarrollador aprobada y, según un
  proveedor, una entidad legal china (no confirmado en documentación oficial). Existen intermediarios pagos que venden acceso. Esto es un
  **bloqueo y un costo**: hoy los costos de compra salen de listados que se miran a mano.
- **Mercado de apps de "armar partidos" y portales de empleo:** analizado aparte en la conversación; no forma parte de Validex.

## Pendiente
| Prioridad | Tarea | Depende de |
|---|---|---|
| Alta | Confirmar al menos 1 producto con cotización real de proveedor y marcarlo "Verificado" | Cuenta de Alibaba (hecha) y respuesta de proveedores |
| Alta | Validar con 10 a 20 personas que quieran importar (`docs/VALIDACION.md`) | Fundador |
| Alta | Tendencia y competencia con datos medidos (hoy son juicio nuestro) | Fuente de datos (Mercado Libre API, Google Trends) |
| Media | Preparar el motor para varios países y monedas (tasas por país, sin inventarlas) | Datos impositivos verificados por país |
| Media | Historial de análisis por usuario y cuentas | Supabase y Google configurados (hoy apagados) |
| Media | Planes gratis y premium | Decisión de precios (no se activa ningún cobro sin autorización) |
| Baja | Actualizar a Next 16 por avisos de PostCSS | Tiempo de prueba aparte |
| Baja | Política de contenido (CSP) | Prueba con Google y Sentry encendidos |

## Decisiones técnicas
- Next 15 (App Router), Tailwind v4, TypeScript estricto. Datos en archivos locales; Supabase previsto pero apagado.
- El score no suma puntos por "riesgo" ni por cobertura: la cobertura se muestra aparte para no mezclar rentabilidad con confianza en el dato.
- La evidencia de cada dato vive en el producto (`evidence`); si falta, cuenta como "estimado".

## Costos potenciales (nada contratado)
- Acceso a datos de 1688/Alibaba por intermediario o API oficial: varía, a confirmar con el proveedor.
- Supabase, dominio propio, Sentry, correo: planes gratis alcanzan para una prueba; hay que revisar límites.
- Cuenta de pago de Netlify si se superan los créditos gratis.

## Bloqueos que necesitan al fundador
1. Autorizar publicar los cambios en producción (no se publicó nada desde el 1/11/2026 salvo este documento en git).
2. Respuestas de proveedores para las cotizaciones (`docs/COTIZACIONES.md`).
3. Decidir si se paga acceso a datos de proveedores.
4. Revisión legal de Privacidad y Términos.

## Registro de cambios
- **2026-11-03 (5)**: plan de arranque de 4 semanas (`docs/ARRANQUE.md`): ticket a Mercado Libre, 3 cotizaciones, demo con importadores, planilla de seguimiento.
- **2026-11-03 (4)**: revisión de accesibilidad de los paneles nuevos (axe, 390 px, 15 fichas): se corrigió una tabla con desplazamiento que no era accesible por teclado; resultado final 0 problemas y sin desborde. Pendiente de publicar.
- **2026-11-03 (3)**: configuración por mercado (`markets.ts`), `docs/MERCADOS.md`, 1 prueba nueva (40 en total). Sin cambios visibles. Sin publicar.
- **2026-11-03 (2)**: firmeza del margen (`sensitivity.ts`, `SensitivityPanel`), 2 pruebas nuevas (39 en total). Sin publicar todavía.
- **2026-11-03**: cobertura del análisis (`src/lib/coverage.ts`, `CoveragePanel`), 2 pruebas nuevas, este archivo, plan de validación.
- **2026-11-02**: metodología pública, Sentry apagado, encabezados de seguridad, auditoría (`docs/AUDITORIA.md`).
- **2026-11-01 y antes**: 15 productos con fuentes, portada nueva, shadcn en 5 fases, Drop, Tantear, Importador.
