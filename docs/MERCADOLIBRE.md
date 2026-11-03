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
