# El Importador con IA (preguntas libres)

Estado: el código está listo pero **apagado**. No gasta nada hasta que pongas una clave. No se probó contra la API real
(no hay clave en este equipo): se probó la validación, los límites y las instrucciones, y que sin clave la app responde
con reglas fijas.

## Cómo funciona
1. La persona escribe una pregunta.
2. Si las reglas fijas la conocen (productos, impuestos, courier, comisión, score, dólar, ranking), responde en el acto,
   sin costo y con fuentes.
3. Si no la conocen y hay clave, la pregunta va a un servidor propio (`/api/importador`), que consulta a Claude con los
   datos de Validex como contexto. La clave vive solo en el servidor.
4. La respuesta de la IA se marca "Respuesta con IA" y avisa que puede equivocarse.

## Qué cuesta
Cada pregunta libre se cobra en TU cuenta de Anthropic. Con los precios publicados al 6/10/2026 (por millón de tokens):
- `claude-opus-5-5` (por defecto): US$ 4 de entrada y US$ 20 de salida. Una consulta típica de este chat cuesta del orden de
  un par de centavos de dólar.
- `claude-haiku-5-5`: US$ 0,10 y US$ 0,50, unas 40 veces menos. Se elige con `IMPORTADOR_MODELO=claude-haiku-5-5`.
Son estimaciones mías, no una medición: mirá el consumo real en el panel de Anthropic.

## Límites que ya trae
- 10 preguntas por hora por persona y 200 por día en todo el sitio (se cambia con `IMPORTADOR_MAX_DIA`).
- Máximo 300 caracteres por pregunta y 4 mensajes de contexto.
- Esos límites viven en la memoria del servidor: sirven de defensa extra, pero **el tope de gasto real** tenés que fijarlo
  en el panel de Anthropic.

## Ojo con Netlify
Netlify inyecta por su cuenta una `ANTHROPIC_API_KEY` en los sitios que publica (AI Gateway) y cobra ese uso de los
créditos de tu cuenta de Netlify (el plan gratis trae 300 por mes, compartidos con todo lo demás). Por eso la IA de
Validex **no se enciende solo por haber una clave**: hace falta además la variable `IMPORTADOR_IA=si`. Si no la definís,
la IA queda apagada aunque Netlify inyecte su clave.

## Cómo activarla (lo hacés vos: la clave es secreta)
1. Entrá a https://console.anthropic.com e iniciá sesión.
2. Cargá crédito o un método de pago y **fijá un límite de gasto mensual bajo** para empezar.
3. Creá una clave de API (API keys > Create key) y copiala. No me la pases ni la pegues en el chat.
4. En el servidor donde corra Validex, definí `IMPORTADOR_IA=si` y `ANTHROPIC_API_KEY` (y opcionalmente `IMPORTADOR_MODELO` e
   `IMPORTADOR_MAX_DIA`). En Netlify podés usar su clave inyectada (cuesta créditos de Netlify) o la tuya propia. En tu PC, ponelas en un archivo `.env.local` (ver `.env.example`).
5. Reiniciá el sitio. La página `/importador` pasa a decir que la IA está activa.

## Límites del enfoque
- La IA solo ve nuestros 10 productos sin verificar. Si le preguntan por otro producto, debería decir que no tiene datos.
- No es asesoramiento fiscal ni aduanero, y las respuestas pueden equivocarse. La pantalla lo aclara cada vez.
- Antes de abrirlo a público conviene revisar las respuestas con preguntas reales y, de ser posible, con un despachante.
