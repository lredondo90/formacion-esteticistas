# Aula Estética Manager · Primera integración

## Estado
Módulo inicial de gestión conectado a la navegación de la aplicación existente. Incluye resumen, agenda, clientes y catálogo ilustrativo de servicios.

## Importante: prototipo local
Esta entrega es una **demo funcional de interfaz**, no un SaaS listo para clientes. Los datos de CRM y citas se almacenan en localStorage del navegador y no se comparten ni tienen respaldo. Se muestran tres citas y tres clientes ficticios. No introducir datos reales personales en esta demo.

## Qué se incluye
- Vistas Resumen, Agenda, Clientes y Servicios.
- Alta local de clientes.
- Alta local de citas con detección básica de coincidencia de hora/profesional dentro de este navegador.
- Cancelación local y suma ilustrativa de importes.
- Responsive para móvil.

## Próxima fase obligatoria
1. Autenticación real y alta/selección de centro.
2. PostgreSQL/Supabase con aislamiento por tenant y políticas RLS revisadas.
3. Reserva transaccional en servidor con protección frente a concurrencia, duración del servicio, recursos y zona horaria.
4. Gestión de empleados/horarios y servicios configurables.
5. Tests automáticos, privacidad RGPD, consentimientos y retención.

La comprobación de solapamientos actual es solo una ayuda de demo: no protege contra reservas simultáneas ni dispositivos distintos.
