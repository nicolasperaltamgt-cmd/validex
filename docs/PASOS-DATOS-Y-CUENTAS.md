# Pasos para cuentas y datos reales (en orden)

Hoy la app funciona sin nada de esto. Estos pasos los hacés vos porque implican cuentas tuyas
y claves privadas. Cuando termines cada uno, avisame y sigo yo con el código.

## A. Cuentas y guardados permanentes (Supabase) — HECHO

Ya está creado el proyecto `validex`, la tabla `saved_products` y el ingreso por enlace al email.
Está probado de punta a punta en tu computadora. Para publicar el sitio en internet habrá que agregar
su dirección en Supabase (Authentication → URL Configuration) y elegir cómo enviar los mails.
Los pasos de abajo quedan como referencia.

Costo: el plan gratis alcanza para esta etapa (revisá los límites actuales en supabase.com/pricing;
el proyecto gratis se pausa si pasa una semana sin uso).

1. Entrá a https://supabase.com y creá una cuenta.
2. Creá un proyecto nuevo (guardá la contraseña de la base en un lugar seguro; no me la pases).
3. En el proyecto: **SQL Editor → New query**, pegá el contenido de `supabase/schema.sql` y tocá **Run**.
4. En **Project Settings → API** copiá la **Project URL** y la **publishable key** (la pública).
5. Copiá `.env.example` como `.env.local` y pegá esos dos valores.
6. Avisame. Yo instalo la librería de Supabase (te aviso antes), agrego el ingreso con email
   y conecto los guardados.

NO me pases ni pegues en el chat la clave "secret" / "service_role".

## B. Datos reales (API oficial de Mercado Libre)

Costo: no vi un precio, pero sus términos permiten limitar o cobrar llamadas excedentes.
Los límites y qué endpoints te habilitan se confirman en su portal.

1. Entrá a https://developers.mercadolibre.com.ar con tu cuenta de Mercado Libre.
2. Creá una aplicación y leé qué permisos y límites te da.
3. Guardá el Client ID y el Client Secret en `.env.local` (`MELI_CLIENT_ID`, `MELI_CLIENT_SECRET`).
4. Avisame qué endpoints te habilitaron. Yo armo la conexión del lado del servidor,
   marcando cada dato con su fuente y fecha.

## Antes de mostrarlo a otras personas

- Buscá "Validex" en el INPI y fijate si el dominio y las redes están libres.
- No publiques el sitio hasta que decidas qué datos reales mostrar y cómo se explican.

## C. Ingreso con Google (gratis, lo configurás vos)

El código ya está listo: el botón "Continuar con Google" aparece solo cuando Google queda activado en Supabase.

1. Entrá a https://console.cloud.google.com con tu cuenta de Google y creá un proyecto (nombre: `validex`).
2. Menú **APIs y servicios → Pantalla de consentimiento de OAuth**: elegí "Externos", poné el nombre `Validex` y tu email. Guardá.
3. **APIs y servicios → Credenciales → Crear credenciales → ID de cliente de OAuth**, tipo **Aplicación web**.
4. En **URI de redireccionamiento autorizados** pegá exactamente:
   `https://hszjxbljuscvuxtoxcrt.supabase.co/auth/v1/callback`
5. Al crear, Google te muestra un **ID de cliente** y un **Secreto del cliente**. NO me pases el secreto en el chat.
6. En Supabase: **Authentication → Sign In / Providers → Google**: activalo y pegá ahí el ID y el secreto. Guardá.
7. Recargá http://localhost:3000/ingresar: debería aparecer "Continuar con Google".

Mientras la pantalla de consentimiento esté en modo "Prueba", solo pueden ingresar los emails que agregues como "usuarios de prueba".

### Para que Google no muestre la dirección técnica de Supabase

Validex usa el botón oficial de Google, que no muestra `...supabase.co` en la pantalla de permisos.
Para que funcione hay que autorizar la dirección del sitio en Google Cloud:

1. Auth → Clients → `Validex web` → **Authorized JavaScript origins** → **Add URI**.
2. Agregá `http://localhost:3000` (para probar en tu compu) y, cuando publiques el sitio, su dirección real
   (por ejemplo `https://www.tudominio.com`).
3. Guardá. Puede tardar unos minutos en aplicarse.

El ID de cliente (público) va en `.env.local` como `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
Más adelante, para marca propia completa, se puede usar un dominio propio para las cuentas
(complemento de pago de Supabase, requiere el plan Pro y un dominio tuyo).
