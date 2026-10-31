# Belaura

Aplicación web de formación interactiva para esteticistas, en tres versiones de idioma:

- **España** (`es-ES`)
- **Latinoamérica** (`es-419`), con el vocabulario local (gabinete, humectación, barros…)
- **English** (`en`)

Cada curso combina lecciones cortas, tarjetas para girar, quizzes, ejercicios de unir parejas, ordenar pasos y casos reales, además de:

- **Prácticas guiadas**: cada curso empieza con una práctica sobre un dibujo animado (aprendes y luego lo haces tú: arrastrar, trazar con el dedo, ajustar parámetros, ordenar pasos y decidir). El motor está en `src/labs/engine.tsx` y cada práctica en `src/labs/<curso>.tsx`.
- **Zonas para tocar** sobre ilustraciones (rostro, ojo, uña, cuerpo).
- **Simulaciones con decisiones**: conversaciones con clientas en las que cada respuesta lleva a un final distinto.

Hay 10 cursos premium con las primeras lecciones gratis, compra por curso o pase completo (en modo demostración, sin cobro real) y certificado de finalización imprimible. El progreso, los puntos y las compras se guardan en el navegador.

## Desarrollo

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # genera dist/
```

## Añadir o editar cursos

Los cursos gratuitos están en `src/courses.ts` y los premium en `src/premium/` (un archivo por curso, con su precio en `premium` y las lecciones gratuitas en `freeSteps`).

Para usar un vídeo real en una lección `video`, añade `src: '/videos/archivo.mp4'` y las preguntas en `cues` (con el segundo en que aparece cada una); las escenas animadas se usan mientras no haya vídeo. Cada texto tiene (o `tx(es, en, la?)`) `es`, `en` y, opcionalmente, `la` (si en Latinoamérica se dice distinto que en España). Los textos de la interfaz están en `src/i18n.ts`.

## Despliegue

El proyecto está preparado para Vercel (`vercel.json`): importa el repositorio en https://vercel.com/new y Vercel detecta Vite automáticamente.

## Funciones premium y servicios externos

La app funciona entera en modo demostración. Para activar cada servicio real, añade estas variables en Vercel (Project → Settings → Environment Variables) y vuelve a desplegar:

| Función | Variables | Qué hace |
|---|---|---|
| Analizador de piel, pre-revisión de prácticas y tutor con IA | `ANTHROPIC_API_KEY` (opcional `ANTHROPIC_MODEL`) | `api/ai.ts` llama a Claude. Sin clave, la app muestra resultados de ejemplo. |
| Cobros con Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_YEARLY`, `STRIPE_PRICE_ALL_ACCESS` y `STRIPE_PRICE_COURSE_<ID>` (p. ej. `STRIPE_PRICE_COURSE_MICROBLADING`), más `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` y `APP_URL` | `api/checkout.ts` crea el pago para la alumna con sesión iniciada; `api/stripe-webhook.ts` recibe el aviso de Stripe y desbloquea el curso en su cuenta (`academy_entitlements`). Sin claves de Stripe, la web dice que los pagos aún no están activos. |
| Cuentas de alumna y progreso en la nube | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | Entrar con Google o correo en `#/entrar`. Los cursos de pago solo se ven con sesión iniciada. El progreso y los certificados se guardan en `academy_progress`. Sin Supabase (desarrollo local) la academia funciona en modo demostración. |
| Clases en directo | `VITE_LIVE_URL` | Enlace de Zoom, Meet o YouTube Live que aparece 15 minutos antes. |
| Plan academias | `VITE_CONTACT_EMAIL` | Email que recibe las peticiones de presupuesto. |
| Gestor de centros (`#/gestor`) y reserva online | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | Agenda, clientes, equipo, caja y reservas en Supabase. Ver `src/manager/README.md` y `supabase/README.md`. |
| Confirmaciones y recordatorios por correo | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `NOTIFY_FROM`, `APP_URL` (opcional `CRON_SECRET`) | `api/notifications.ts` envía la cola de avisos. Sin claves, los avisos se quedan en cola. |

Pendiente para producción: cuentas de usuario y base de datos (por ejemplo Supabase) para que el foro, la bolsa de empleo, el ranking, las correcciones de expertas y los certificados se compartan entre dispositivos, y un webhook de Stripe que confirme los pagos en el servidor.
