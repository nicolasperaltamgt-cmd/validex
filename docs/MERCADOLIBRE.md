# Datos reales: Mercado Libre (API oficial)

Objetivo: reemplazar los datos ficticios por datos reales de Mercado Libre Argentina, cada uno con su
fuente y fecha. Solo consultas de lectura. Sin scraping: solo la API oficial y con tu autorización.

## Lo que sé y lo que NO sé todavía

Confirmado en la documentación pública de Mercado Libre:
- Para crear una aplicación la cuenta debe estar verificada y los datos deben coincidir con los de la cuenta.
- Al crearla recibís un **App ID** (público) y una **Clave secreta** (privada).
- La **Redirect URI** debe ser **HTTPS**.
- Si la aplicación solo consulta información, alcanza con el permiso de **lectura**.

Sin confirmar (lo vamos a probar con datos reales, no a ciegas):
- Qué consultas permiten hacer a una aplicación nueva: categorías, tendencias, búsqueda de productos.
- Los límites de uso y si hay costo por superarlos (sus términos dicen que pueden limitarlo o cobrarlo).

## Paso a paso (lo hacés vos: es tu cuenta)

1. Ingresá a https://developers.mercadolibre.com.ar con tu cuenta de Mercado Libre (verificada).
2. Entrá a **Mis aplicaciones** y creá una aplicación nueva.
3. Completá:
   - **Nombre:** `Validex` (tiene que ser único; si está tomado, probá `Validex Research`).
   - **Descripción corta** (hasta 150 caracteres): "Herramienta para evaluar productos y calcular márgenes."
   - **Redirect URI:** tiene que ser HTTPS. Si todavía no tenés dominio, no inventes uno que no sea tuyo:
     lo ideal es registrar primero `validex.ar` y usar `https://validex.ar/api/meli/callback`.
   - **Permisos (scopes):** solo **lectura**.
   - **Notificaciones (webhooks):** dejalas vacías por ahora.
4. Guardá. Copiá el **App ID** y la **Clave secreta**.
5. Pegalos vos en `.env.local` (no me los pases por el chat):
   ```
   MELI_CLIENT_ID=tu_app_id
   MELI_CLIENT_SECRET=tu_clave_secreta
   ```
6. En la carpeta del proyecto corré: `npm run meli:check`
7. Pegame el resultado completo. No incluye claves. Con eso sé exactamente qué datos podés usar.

## Después de la prueba

- Si la API permite búsqueda y tendencias: conecto `src/data/` a Mercado Libre del lado del servidor
  (las claves nunca llegan al navegador), con caché para respetar los límites, y cada dato con su fuente y fecha.
- Si no permite alguna consulta: se muestra solo lo permitido y se explica el límite, sin inventar nada.
- Actualizo Privacidad y Términos con la nueva fuente.

## Resultado de la prueba real (31/10/2026)

App `validex` creada y probada con el flujo Client Credentials (token de aplicación, sin usuario).

| Consulta | Resultado |
|---|---|
| Token de la aplicación | OK (200), dura 6 horas |
| País (`/countries/AR`) | OK |
| Una categoría (`/categories/{id}`) | OK: nombre, subcategorías y **total de publicaciones de la categoría** |
| Aplicación propia (`/applications/{id}`) | OK |
| Categorías del sitio completo (`/sites/MLA/categories`) | **403** |
| Información del sitio (`/sites/MLA`) | **403** |
| Búsqueda de productos (`/sites/MLA/search`) | **403** |
| Tendencias de búsqueda (`/trends/MLA`) | **403** |
| Ítems / publicaciones (`/items/{id}`) | **403** |
| Catálogo de productos (`/products/search`) | **403** |
| Más vendidos por categoría (`/highlights/...`) | **403** |

Motivo del 403: "At least one policy returned UNAUTHORIZED". Una aplicación nueva y no certificada
no puede leer búsqueda, publicaciones ni tendencias solo con el token de aplicación.

### Caminos posibles
1. **Datos que sí se pueden usar hoy:** categorías con su cantidad de publicaciones (oferta por categoría).
2. **Probar con token de usuario** (Authorization Code con tu cuenta): puede abrir más consultas. Requiere activar ese flujo en la aplicación.
3. **Pedir el desbloqueo a Mercado Libre:** soporte de Desarrolladores, sección "Accesos > Desbloqueo / Forbidden", y/o certificar la aplicación.
4. Otras fuentes de datos con permiso explícito.

## Segunda prueba (3/11/2026): después de activar los permisos funcionales

Se activaron en el DevCenter, en "Solo lectura", los permisos **Métricas del negocio** y **Publicación y sincronización**.
Resultado con el token de aplicación (Client Credentials), medido con `npm run meli:check` y un sondeo de lectura:

| Consulta | Antes | Ahora |
|---|---|---|
| Tendencias de búsqueda (`/trends/MLA`) | 403 | **OK: 50 palabras** (sin volumen, solo el ranking) |
| Tendencias por categoría (`/trends/MLA/{categoría}`) | sin probar | **OK: 50** |
| Más vendidos por categoría (`/highlights/MLA/category/{id}`) | 403 | **OK: top 20 con posición** (ids de producto de catálogo) |
| Categorías del sitio y detalle (con total de publicaciones) | 403 | **OK** |
| Información del sitio (`/sites/MLA`) | 403 | **OK** |
| Búsqueda en catálogo (`/products/search`) | 403 | **OK** (nombre, atributos, fotos; **sin precio**) |
| Búsqueda de publicaciones (`/sites/MLA/search`) | 403 | **403 "forbidden"** |
| Publicaciones por id (`/items?ids=`) | 403 | 200, pero **404** con los ids de producto de catálogo |
| Precio del producto (`buy_box_winner`) | — | **null** con el token de aplicación |

**Qué se puede usar ya:** una señal de demanda real (tendencias y más vendidos) y el tamaño de la oferta por categoría.
**Qué sigue sin poder obtenerse:** precios de venta y cantidad de vendedores por producto (la competencia). La búsqueda de publicaciones sigue cerrada
con "forbidden", un mensaje distinto del de permisos: probablemente requiera un token de usuario (que el dueño autorice la app una vez) o la
certificación de la app, hoy "no certificada". Es lo que se le preguntaría al soporte.

## Cómo se usan hoy las señales (3/11/2026)
- `npm run meli:signals` guarda una foto con fecha en `src/data/meli-signals.json`: las 50 tendencias, y por cada producto su categoría
  (la sugiere Mercado Libre según el nombre; puede ser imprecisa), la cantidad de publicaciones y los más vendidos de esa categoría.
  No muestra ni guarda el token ni la clave. Conviene correrlo cada pocos días y volver a publicar.
- Cada ficha de análisis muestra el panel "Qué dice Mercado Libre". Si el producto aparece en las tendencias, su **tendencia** pasa a figurar
  como "publicada" en la cobertura. **El score no cambia**: esta señal no modifica la metodología.
- Las palabras con las que se busca cada producto dentro de las tendencias son nuestras (están en `scripts/meli-signals.mjs`). El cruce es por
  palabra completa: "termo" coincide con "termo stanley" pero no con "termotanque".
- Pendiente legal: Privacidad y Términos deben mencionar a Mercado Libre como fuente (hoy el panel ya la cita con fecha).

## Actualizar a mano (decisión del 3/11/2026)
No se cargaron las claves en Netlify: las actualizaciones las hace la persona dueña desde su computadora, con un solo comando.
- `npm run actualizar` actualiza los datos de Mercado Libre, corre las pruebas, compila, sube una versión, la publica y verifica seis páginas.
  Se detiene sin publicar si algo falla.
- `npm run actualizar -- --solo-datos` solo actualiza `src/data/meli-signals.json`, sin publicar.
- Las claves de Mercado Libre quedan solo en `.env.local` de esa computadora. Ningún visitante puede disparar una actualización.
- Sin las variables en Netlify, el código que consulta en vivo no se usa: el sitio muestra la última foto guardada, con su fecha.
