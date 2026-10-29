# Aula Estética Manager

Gestor de centros dentro de la misma app (`#/gestor`). Todo se guarda en Supabase y cada centro solo ve sus datos (RLS). Las operaciones delicadas (citas, cobros, invitaciones) las hace el servidor mediante funciones de la base de datos; el navegador no puede escribir citas ni cobros directamente.

## Pantallas
- **Inicio**: citas de hoy, cobrado, ocupación, cancelaciones y reservas online pendientes.
- **Agenda**: vista día (columna por profesional), semana y mes; filtros por profesional, cabina y servicio; crear cita con huecos libres reales, mover, confirmar, marcar realizada o «no vino», cancelar con motivo, cobrar e historial de cambios. Lista de espera.
- **Clientes**: buscador, ficha con historial, pagos, consentimientos (registro inmutable) y notas de salud separadas (recepción no las ve; cada consulta queda registrada). Derecho de supresión.
- **Servicios**: duración, preparación/limpieza, precio, profesionales habilitadas, cabinas necesarias, reservable online.
- **Equipo**: fichas de profesionales (no necesitan cuenta), horario por tramos, vacaciones y bloqueos, invitaciones por correo y roles.
- **Caja**: cobros del día por forma de pago, ventas sueltas, devoluciones y citas pendientes de cobrar.
- **Configuración**: datos del centro, reserva online, política de cancelación, horario, festivos, cabinas, avisos enviados y exportación de datos.
- **Reserva online** pública en `#/reservar/<dirección>` y página de la clienta en `#/cita/<código>` para ver o cancelar.

## Roles
| | Propietaria | Administración | Recepción | Profesional |
|---|---|---|---|---|
| Agenda | todo | todo | todo | solo la suya |
| Clientes | todo | todo | todo salvo notas de salud | las suyas, notas de salud |
| Servicios, equipo, configuración | sí | sí | ver servicios | ver servicios |
| Caja | sí, con devoluciones | sí, con devoluciones | sí, sin devoluciones | no |
| Exportar datos | sí | no | no | no |

## Desarrollo
1. Copia `.env.example` a `.env.local` con la URL y la clave publishable de Supabase.
2. Aplica las migraciones de `supabase/migrations` en orden.
3. `npm run dev` y entra en `http://localhost:5173/#/gestor`.
4. `npm run test:db` ejecuta las pruebas de aceptación de la base de datos en un PostgreSQL local (ver `supabase/README.md`).
