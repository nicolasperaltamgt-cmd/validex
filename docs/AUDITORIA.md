# Auditoría final: Validex (versión de prueba)

Fecha: 3 de noviembre de 2026. Sitio publicado: https://validex-prueba.netlify.app

## Resultado de lo que sí se pudo comprobar

| Área | Resultado |
|---|---|
| Pruebas automáticas | 35 de 35 pasan (score, drop, calculadora, importador, tokens de diseño, productos con fuentes) |
| Compilación y lint | Sin errores |
| Accesibilidad (axe 4.10) | 0 problemas en 17 pantallas, en 390 px y en 1280 px (34 revisiones) |
| Desborde horizontal | Ninguno en esas 34 revisiones |
| Teclado y lectores | Diálogo atrapa el foco, cierra con Esc y devuelve el foco; tooltip aparece con el foco; menú desplegable con enlaces reales |
| Claves en el código | Ninguna encontrada; `.env.local` está fuera de git, solo se guarda `.env.example` |
| Encabezados de seguridad | Agregados: nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy, HSTS |
| Hidratación de React | Corregido un error (#418) por la fecha del reporte de Tantear |
| Peso de JavaScript compartido | 103 kB, igual que antes de sumar los componentes nuevos (se cargan por pantalla) |

## Pendientes (no los puede resolver el código solo)

1. **Páginas legales.** Privacidad y Términos son borradores con datos de relleno. Necesitan revisión de un abogado antes de lanzar,
   en especial si se enciende Sentry, Google o las cuentas.
2. **Datos de productos.** Todo está "sin verificar". Para marcar un producto como "Verificado" hace falta una cotización real o una compra
   de prueba (ver `docs/COTIZACIONES.md`). La cuenta de Alibaba debe crearla la persona dueña del proyecto.
3. **Dependencias.** `npm audit` informa 2 avisos (1 alto, 1 moderado) por PostCSS dentro de Next 15. Afectan a CSS que controle un atacante,
   que acá no existe. Se resuelven al pasar a Next 16, que es un cambio grande y se debe probar aparte.
4. **Política de contenido (CSP).** No se puso una CSP estricta para no romper el ingreso con Google ni el monitoreo. Se puede sumar en
   modo "solo informar" y endurecer después.
5. **Prueba en celular real.** No se instaló la app en un teléfono ni se probó el modo sin conexión en uno.
6. **Cuentas e ingreso.** Supabase y Google no están configurados en la publicación; el botón de ingreso no aparece. Los guardados quedan en el navegador.
7. **Netlify.** El plan gratuito tiene créditos mensuales. El despliegue directo a producción da "Forbidden": se publica subiendo una versión
   de prueba y promoviéndola con `netlify api restoreSiteDeploy`.
8. **Sentry.** Está preparado y apagado (`docs/SENTRY.md`). Falta la cuenta, la clave y actualizar la Política de Privacidad.
9. **Imágenes.** Las fotos de producto y las ilustraciones son generadas por IA y se rotulan como ilustrativas. Algunas tienen marcas o números
   ilegibles dentro de la imagen.
10. **IA del Importador.** Apagada por defecto. Si se enciende (`IMPORTADOR_IA=si` y una clave), conviene fijar un tope de gasto en el proveedor.

## Decisiones de diseño que conviene recordar

- El score es una fórmula fija; la metodología está publicada en `/metodologia`.
- Nunca se muestra "Verificado" si el dato no se confirmó.
- Los textos de la competencia se usaron solo como referencia de estructura; no se copió texto ni imágenes.
