# Supabase · Aula Estética Manager

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

## Reglas que garantiza la base de datos
- Toda la información pertenece a un centro y RLS impide ver otro centro.
- Las citas solo se crean o cambian con `create_appointment`, `reschedule_appointment`, `set_appointment_status` y `public_book`. Comprueban horario del centro, festivos, horario y ausencias de la profesional, habilitación para el servicio y cabina libre. Una restricción de exclusión impide dos citas solapadas de la misma profesional o cabina (incluido el tiempo de preparación), también con reservas simultáneas.
- Cada cita guarda nombre, duración y precio del servicio en el momento de reservar.
- Cambios de estado, hora, profesional y notas quedan en `appointment_events`.
- Los cobros no se editan ni borran: las devoluciones son movimientos nuevos (`refund_payment`).
- Los avisos tienen una clave única (`dedupe_key`), así que nunca se duplican.

## Pruebas
`npm run test:db` crea una base temporal en un PostgreSQL 15+ local, aplica `tests/local_stub.sql` (imita `auth.uid()` y los roles de Supabase) y todas las migraciones, y ejecuta `tests/manager_mvp.test.sql`, que cubre los criterios de «MVP terminado»: alta de centro, invitación con permisos limitados, reserva online, doble reserva imposible, cancelación que libera el hueco, recepción cobrando, aislamiento entre centros, precios históricos, avisos sin duplicar, trazabilidad y exportación. Configura `PGHOST`, `PGPORT` y `PGUSER` apuntando a un servidor local, nunca a Supabase.

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
- Webhook de Stripe para la academia (el desbloqueo de cursos sigue en modo demostración).
