# Plan de lanzamiento de Validex

Estado hoy: versión de prueba que corre solo en tu computadora, con datos ficticios.
Nada de esto se publica ni se paga sin tu OK. Los precios cambian: verificalos en cada sitio antes de decidir.

## Fase 0 — Hecho
- [x] Sitio con 11 páginas: inicio, oportunidades, catálogo, ficha, análisis, comparar, calculadora, guardados, configuración, ayuda y legales.
- [x] Diseño responsive, textos en español, estructura lista para otros idiomas.
- [x] Pruebas automáticas de la lógica de cálculo.
- [x] Cuentas con email y guardados permanentes (Supabase, plan gratis).
- [x] Borradores de Términos y Privacidad.

## Fase 1 — Antes de mostrarlo a otras personas (sin gastar)
- [ ] Buscar "Validex" en el INPI (https://portaltramites.inpi.gob.ar) y en Google. Si está tomado, cambiar el nombre ahora: cuesta un minuto, después cuesta mucho.
- [ ] Dominio. Revisado el 31/10/2026:
  - validex.ar: **disponible** en NIC Argentina (https://nic.ar). Falta registrarlo.
  - validex.com: ocupado y a la venta. validex.net, .org, .app, .ai, .io, .co: ocupados.
  - validex.dev: libre. usevalidex.com, tryvalidex.com, validexhq.com: libres.
  - Registrar un dominio no protege la marca: sigue pendiente el INPI.
  - Falta ver usuarios libres en redes.
- [ ] Arreglar el ingreso con Google (volver a cargar el secreto en Supabase). Es opcional; el ingreso por email ya funciona.
- [ ] Completar los datos pendientes de Términos y Privacidad y que un abogado los revise.
- [ ] Mostrarlo en tu compu a 3 o 5 personas del público objetivo y anotar qué no entienden.

## Fase 2 — Datos reales (puede tener costo)
- [ ] Registrar la aplicación en el portal de desarrolladores de Mercado Libre (https://developers.mercadolibre.com.ar) y confirmar qué datos y límites te habilitan. Guía: `docs/MERCADOLIBRE.md`. Prueba de conexión: `npm run meli:check`.
- [ ] Decidir qué mostrar: precios, vendedores, tendencias. Cada dato con su fuente y fecha.
- [ ] Reemplazar los datos ficticios en `src/data/index.ts` y quitar los carteles de "ficticio" solo de lo que sea real.
- [ ] Actualizar Privacidad y Términos con las fuentes nuevas.

## Fase 3 — Publicar (probablemente con costo)
- [ ] Elegir dónde alojar el sitio (por ejemplo Vercel u otro proveedor de Next.js). Revisar si el plan gratis permite uso comercial.
- [ ] Comprar el dominio y conectarlo.
- [ ] En Supabase: agregar la dirección pública en Authentication → URL Configuration.
- [ ] En Google Cloud: agregar la dirección pública en "Authorized JavaScript origins" y publicar la pantalla de consentimiento.
- [ ] Configurar un servicio de mail propio en Supabase (el básico limita cuántos mails manda por hora).
- [ ] Revisar que las claves privadas nunca estén en el código ni en el navegador.

## Fase 4 — Después de lanzar
- [ ] Medir uso con una herramienta que respete la privacidad, y avisarlo en la política.
- [ ] Decidir si habrá planes pagos. Hasta que se definan, el sitio no muestra precios.
- [ ] Agregar inglés.

## Regla de oro
Nada se presenta como real si no lo es. Cada dato muestra su estado (demostración, sin verificar, verificado) y su fecha.
