# Ticket de soporte a Mercado Libre (Developer Partner Program)

Según su página oficial "Soporte para Integradores"
(https://developers.mercadolibre.com.ar/es_ar/soporte-para-integradores), los pedidos se hacen con un **ticket**
en cuatro pasos: Categoría → Aplicación → Descripción → Envío. Antes responde un bot 24/7; la atención personalizada
es de lunes a viernes, 9:00 a 18:00 (GMT-3). Lo mandás vos desde tu cuenta, ya iniciada en el portal de desarrolladores.

Nota: la gestión de IPs de una aplicación es exclusiva de integradores autorizados, así que NO es la causa de nuestro 403.
Las causas posibles que lista Mercado Libre en https://developers.mercadolibre.com.ar/es_ar/error-403 son: aplicación
bloqueada, permisos insuficientes, usuario inactivo, IP no permitida, scopes inválidos, token que no es del dueño de la
información y **datos del usuario sin validar**. Conviene revisar también que tu cuenta de Mercado Libre tenga completa
la validación de datos.

## Qué elegir en el formulario
- **Categoría:** Productos. **Subcategoría:** la más cercana (Publicaciones).
- **Aplicación:** Validex (App ID 4849008269855253), se completa sola.
- **Tipo de ticket:** **Problema**.

## Texto para copiar

**Asunto:** 403 "UNAUTHORIZED" en búsqueda, tendencias e ítems con token de aplicación (App ID 4849008269855253)

**Descripción:**
Soy Martin Gleiser, titular de la aplicación Validex (App ID 4849008269855253), creada con flujo Client Credentials
y permisos mínimos de lectura. Es una herramienta web que muestra información a emprendedores; no publica ni modifica
nada en Mercado Libre.

Comportamiento esperado: poder leer, con el token de aplicación, la búsqueda pública, las tendencias y las
publicaciones de Mercado Libre Argentina (MLA), solo lectura.

Comportamiento actual: el token se obtiene bien (HTTP 200), pero estas consultas devuelven 403
"At least one policy returned UNAUTHORIZED":
- GET /sites/MLA/search?q=botella termica&limit=3
- GET /trends/MLA
- GET /items/{id}
- GET /products/search?status=active&site_id=MLA&q=botella
- GET /highlights/MLA/category/MLA1055
- GET /sites/MLA y /sites/MLA/categories
Sí funcionan: /categories/{id}, /countries/AR, /applications/{id}.

Consulta: ¿qué requisito falta para habilitar estas lecturas (certificar la aplicación, validar datos de la cuenta,
otro)? Los datos se mostrarán con atribución a Mercado Libre y fecha de consulta, respetando los límites y términos.

**Método:** GET
**Recurso:** https://api.mercadolibre.com/sites/MLA/search?q=botella%20termica&limit=3
**Request:** GET con encabezado Authorization: Bearer <token de aplicación>. Sin cuerpo.
**Respuesta:** HTTP 403 — {"message":"At least one policy returned UNAUTHORIZED","error":"forbidden","status":403}
(El texto exacto del cuerpo puede variar; pegá el que obtengas con `npm run meli:check`.)

No incluyas nunca la clave secreta ni el token en el ticket.
