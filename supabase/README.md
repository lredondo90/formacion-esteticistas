# Supabase · Belaura Manager

## Migraciones
Aplícalas en orden en el proyecto de Supabase (SQL editor o `supabase db push`):

| Archivo | Contenido |
|---|---|
| `202610290002_manager_auth_tenant.sql` | Centros, miembros y roles, sedes, profesionales, clientes, servicios, citas, eventos y pagos, con RLS |
| `202610290003_business_operations.sql` | Horarios del personal, ausencias, gastos, productos y movimientos de stock |
| `202610290004_center_onboarding.sql` | Alta segura del primer centro |
| `202610290005_booking_status_values.sql` | Estados de cita `rejected` y `expired` |
| `202610290006_manager_mvp.sql` | Perfiles, configuración del centro, horario y festivos, cabinas, reglas servicio/profesional/cabina, invitaciones, reservas atómicas en servidor, reserva online pública, cobros inmutables, cola de avisos, consentimientos, notas de salud, lista de espera, auditoría, supresión y exportación |
| `202610290007_function_hardening.sql` | Ajustes de permisos de funciones que pide el asesor de seguridad de Supabase |
| `202610290008_business_profitability.sql` | Etapa 4: stock solo por movimientos (`record_stock_movement`, coste medio), materiales por servicio que se descuentan al realizar la cita, comisión por profesional, categorías de gasto e informe `business_report` |
| `202610300009_academy_accounts.sql` | Academia: `academy_entitlements` (lo que ha pagado cada alumna; solo lo escribe el webhook de Stripe) y `academy_progress` (progreso y certificados de cada alumna, para seguir en cualquier dispositivo) |
| `202610310010_platform_admin.sql` | Panel de administración `#/admin`: `platform_admins` (dueña / solo cursos / solo gestor), `academy_payments` (ingresos que anota el webhook de Stripe) y funciones `admin_*` que comprueban el rol |

## Reglas que garantiza la base de datos
- Toda la información pertenece a un centro y RLS impide ver otro centro.
- Las citas solo se crean o cambian con `create_appointment`, `reschedule_appointment`, `set_appointment_status` y `public_book`. Comprueban horario del centro, festivos, horario y ausencias de la profesional, habilitación para el servicio y cabina libre. Una restricción de exclusión impide dos citas solapadas de la misma profesional o cabina (incluido el tiempo de preparación), también con reservas simultáneas.
- Cada cita guarda nombre, duración y precio del servicio en el momento de reservar.
- Cambios de estado, hora, profesional y notas quedan en `appointment_events`.
- Los cobros no se editan ni borran: las devoluciones son movimientos nuevos (`refund_payment`).
- Los avisos tienen una clave única (`dedupe_key`), así que nunca se duplican.

## Pruebas
`npm run test:db` crea una base temporal en un PostgreSQL 15+ local, aplica `tests/local_stub.sql` (imita `auth.uid()` y los roles de Supabase) y todas las migraciones, y ejecuta `tests/*.test.sql` (con las utilidades de `tests/helpers.sql`). `manager_mvp.test.sql` cubre los criterios de «MVP terminado»: alta de centro, invitación con permisos limitados, reserva online, doble reserva imposible, cancelación que libera el hueco, recepción cobrando, aislamiento entre centros, precios históricos, avisos sin duplicar, trazabilidad y exportación. `business.test.sql` cubre la Etapa 4: stock que no se puede tocar a mano, coste medio, consumo y devolución de material al realizar o deshacer una cita, comisiones, gastos, informe y que recepción no vea el dinero. Configura `PGHOST`, `PGPORT` y `PGUSER` apuntando a un servidor local, nunca a Supabase.

## Avisos por correo
`api/notifications.ts` envía la cola con [Resend](https://resend.com). Variables en Vercel (solo servidor):
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `NOTIFY_FROM` (remitente verificado, p. ej. `citas@tudominio.com`), `APP_URL` (p. ej. `https://aula-estetica.vercel.app`) y opcionalmente `CRON_SECRET`.
Se ejecuta con el cron de `vercel.json` (dos veces al día) y cada vez que alguien abre el gestor o hace una reserva. Para recordatorios con precisión horaria, programa además una llamada cada hora (por ejemplo con `pg_cron` + `pg_net` en Supabase).

## Configuración de Auth
Activa la confirmación de correo y añade a Authentication → URL Configuration la URL de producción, `http://localhost:5173` y las de preview de Vercel. Nunca pongas la clave `service_role` en variables `VITE_*`.

## Pendiente antes de producción
- Revisión de seguridad externa de las políticas RLS y funciones `security definer`.
- Textos legales: aviso de privacidad del centro, base jurídica, contratos de encargado y retención.
- Copias de seguridad y prueba de restauración (plan de pago de Supabase).

## Entrar con Google
El gestor tiene el botón «Continuar con Google» (Supabase Auth con flujo PKCE). Para activarlo:
1. En [Google Cloud Console](https://console.cloud.google.com/apis/credentials) crea un «ID de cliente de OAuth» de tipo *Aplicación web*. En «URI de redirección autorizados» pon `https://<ref>.supabase.co/auth/v1/callback`.
2. En Supabase → Authentication → Sign In / Providers → Google, actívalo y pega el *Client ID* y el *Client Secret*.
3. En Supabase → Authentication → URL Configuration, pon la web de producción como *Site URL* y añade en *Redirect URLs* `https://<tu-dominio>/**` y, para las vistas previas de Vercel, `https://*-<equipo>.vercel.app/**`.

Las invitaciones funcionan igual: si te invitan con tu Gmail, entra con Google usando esa misma cuenta.

## Cobros de la academia (Stripe)
1. En Stripe crea un producto con precio para cada curso, el pase completo y Belaura Pro mensual y anual. Copia cada *Price id* (`price_…`) en Vercel: `STRIPE_PRICE_COURSE_<ID>`, `STRIPE_PRICE_ALL_ACCESS`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_YEARLY`.
2. En Vercel añade `STRIPE_SECRET_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` y `APP_URL` (la dirección de la web).
3. En Stripe → Developers → Webhooks añade el endpoint `https://<tu-web>/api/stripe-webhook` con los eventos `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted` e `invoice.paid` (este último para que las renovaciones cuenten como ingresos en el panel). Copia el *Signing secret* (`whsec_…`) en `STRIPE_WEBHOOK_SECRET`.
4. Prueba primero con las claves de modo prueba (`sk_test_…`) y la tarjeta `4242 4242 4242 4242`.

## Panel de administración (`#/admin`)
Solo lo ven las cuentas de `platform_admins`. La primera dueña se añade una vez en Supabase → SQL Editor (cambia el correo por el tuyo):

```sql
insert into public.platform_admins(user_id, role)
select id, 'owner' from auth.users where email = 'tu-correo@ejemplo.com';
```

Después, desde el propio panel (apartado *Administradores*) la dueña puede dar acceso a otras personas: *Dueña* (todo), *Solo cursos* o *Solo gestor*.
