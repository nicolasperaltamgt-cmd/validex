# Sentry: monitoreo de errores

Estado: **apagado**. El código está listo (`src/lib/monitoring.ts` y `src/app/error.tsx`), pero no se carga ni se envía nada hasta que haya una clave.

## Cómo encenderlo (lo hace la persona dueña del proyecto)

1. Crear una cuenta en https://sentry.io (hay un plan gratuito que alcanza para una versión de prueba). **No se puede hacer por otra persona.**
2. Crear un proyecto de tipo "Browser JavaScript" (o "Next.js") y copiar la clave **DSN**.
3. En Netlify: Project configuration, Environment variables, agregar `NEXT_PUBLIC_SENTRY_DSN` con esa clave.
4. Volver a publicar el sitio. La clave se incorpora al compilar.
5. **Antes de encenderlo, actualizar la Política de Privacidad** (`src/app/privacidad/page.tsx`): decir que los errores técnicos
   se envían a Sentry (empresa de EE. UU.), qué datos incluyen y por cuánto tiempo se guardan. La política actual es un borrador y
   necesita revisión de un abogado.

## Qué envía y qué no

- Envía: el mensaje y la traza del error, el navegador y el sistema, y la dirección de la página sin lo que sigue al `?`.
- No envía: datos personales (`sendDefaultPii` apagado), grabaciones de pantalla ni mediciones de rendimiento.

## Cómo verificar que funciona

Con la clave puesta, abrí el sitio, forzá un error y mirá que aparezca en el panel de Sentry. Sin clave no pasa nada, y eso es lo esperado.
