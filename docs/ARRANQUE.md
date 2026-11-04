# Arranque: de "estimado" a "demostrable"

Meta de 4 semanas: que Validex tenga **datos medidos**, **3 productos verificados con cotización** y **opinión de 10 a 20 importadores reales**.
Hecho el 3/11/2026. Marcá cada casilla a medida que avanzás.

## Paso 1. Datos medidos (semana 1 a 3)

### 1A. Ticket a Mercado Libre (lo mandás vos, 10 minutos)
- [ ] Confirmá que tu cuenta de Mercado Libre tenga **completa la validación de datos** (una de las causas listadas de 403).
- [ ] Abrí `docs/MERCADOLIBRE-SOPORTE.md` y copiá el texto. **Revisá el nombre del titular antes de enviar**: el texto dice "Martin Gleiser".
      Tiene que coincidir con el titular de la cuenta que creó la aplicación; si no, corregilo.
- [ ] Antes de enviar, corré `npm run meli:check` en la carpeta del proyecto y pegá el resultado exacto donde indica el texto. No incluyas claves ni tokens.
- [ ] Enviá el ticket (Productos > Publicaciones > Problema). La atención personalizada es de lunes a viernes de 9 a 18.
- [ ] Anotá la fecha de envío y el número de ticket: ______
- **Cuando respondan:** pegame la respuesta. Si habilitan búsqueda y tendencias, conecto los datos del lado del servidor (con caché, atribución y fecha)
  y la **tendencia y la competencia dejan de ser juicio nuestro** (la cobertura sube en cada ficha).
- **Si dicen que no se puede o piden certificar la app:** lo documento y buscamos otra fuente (el plan B es declarar esos datos como "no medidos").

### 1B. Cotizaciones para verificar 3 productos (lo mandás vos, 30 minutos)
Productos elegidos por mejor score y por tener proveedor concreto (ver `docs/COTIZACIONES.md`, que ya trae los mensajes en inglés):
- [ ] Fuente de agua para gatos (score 74). Ojo: su precio de venta es de una marca, el margen real puede ser menor.
- [ ] Cortina roller blackout 160 × 160 (score 73). Pedí la cortina terminada, no solo la tela.
- [ ] Afeitadora eléctrica USB (score 67).
- [ ] 3 proveedores por producto, mismo mensaje, y pedí **muestra** de 1 o 2 piezas.
- [ ] No pagues ni des datos de tarjeta en esta etapa.
- **Cuando lleguen las cotizaciones:** pegámelas. Cargo precio por cantidad, mínimo de compra y flete; el costo de compra y el flete pasan a
  "confirmado" en la cobertura y el margen se recalcula. Un producto solo pasa a **"Verificado"** si sus siete datos están confirmados
  (los impuestos, con un despachante).
- [ ] Para confirmar impuestos: consultá a un despachante de aduana la posición arancelaria de los 3 productos (suele ser una consulta corta).

## Paso 2. Mostrarlo a 10 o 20 importadores (semana 2 a 4)

Se puede hacer **mientras esperás** las respuestas de los pasos anteriores.

### Dónde encontrarlos
Grupos de importadores y revendedores (Facebook, WhatsApp, Telegram, Discord), comunidades de Mercado Libre, contadores y despachantes que te
puedan presentar clientes. Leé las reglas de cada grupo antes de publicar.

### Demo de 15 minutos (por videollamada o en persona)
1. Preguntales primero: *"¿Cómo decidís hoy qué importar?"* (2 min, no muestres nada todavía).
2. Abrí una ficha con su producto de interés o la de la cortina. Mostrá **el score**, **la cobertura** (qué dato es real y cuál estimado) y **la firmeza**
   (qué pasa con el margen si los impuestos o el flete salen peor). (5 min)
3. Dejalos usar **Tantear** con un producto propio. Observá dónde se traban sin ayudarlos. (5 min)
4. Cerrá con las preguntas de abajo. (3 min)

### Preguntas (anotá las palabras exactas)
1. ¿Qué te faltó para decidir si comprar?
2. ¿Qué dato no te creíste y por qué?
3. ¿Lo usarías la próxima vez que evalúes un producto? ¿Para qué?
4. ¿Pagarías por esto? ¿Cuánto por mes? (Anotá el número que dicen; no sugieras uno.)
5. ¿Qué tendría que tener para que pagaras?
6. ¿A quién más conocés que importe? (para sumar la siguiente conversación)

### Cómo saber si funciona
| Resultado | Qué hacer |
|---|---|
| 7 o más de 10 entienden la cobertura y la firmeza sin explicación | La propuesta se comunica bien |
| Menos de la mitad lo usaría de nuevo | El valor es débil: cambiar de enfoque antes de ampliar |
| 3 o más mencionan un precio | Hay base para un plan de pago |
| Piden algo concreto que no tenemos | Esa es la próxima prioridad |

Registro: `docs/seguimiento-importadores.csv` (una fila por conversación).

## Paso 3. Ampliar (semana 4 en adelante)
Solo si el paso 1 dio datos medidos o verificados **y** el paso 2 mostró interés:
- Ampliar el catálogo con productos que pidan los importadores.
- Cargar un segundo país en `src/lib/markets.ts` (`docs/MERCADOS.md`) con datos y fuentes verificados.
- Definir planes (gratis, profesional) y recién ahí evaluar cobros. No se activa ningún cobro sin tu autorización.

## Lo que hago yo mientras tanto
- Mantengo el sitio y los datos al día y cargo cada respuesta que me pases.
- Si querés, preparo un resumen de una página del producto para mandar a los importadores antes de la demo.
