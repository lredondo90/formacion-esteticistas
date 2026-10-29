# Aula Estética Manager

## Estado
- Supabase Auth para registro, inicio de sesión, confirmación por correo, recuperación y cambio de contraseña.
- Onboarding del primer centro mediante la RPC `create_my_first_center`; la base de datos asigna el rol de propietaria.
- El directorio de clientes se lee y escribe en `public.clients`, siempre filtrado por el centro autenticado y protegido por RLS.
- La agenda, las citas y los servicios siguen siendo datos ilustrativos locales; no representan información compartida.

## Configuración de desarrollo
1. Copia `.env.example` a `.env.local` y usa la URL y la clave publishable de un proyecto Supabase de desarrollo.
2. Aplica las migraciones `202610290002_manager_auth_tenant.sql` y `202610290004_center_onboarding.sql`.
3. Habilita la confirmación de correo y autoriza `http://localhost:5173` y las URL de preview en Authentication → URL Configuration.
4. Registra una cuenta desde `#/gestor`, confirma el correo e inicia sesión para crear el primer centro.

No introduzcas diagnósticos ni datos de salud en las notas. No pongas claves `service_role` en variables `VITE_*`. La base SQL y las políticas RLS requieren revisión antes de usar datos de producción.

## Pendiente antes de producción
- RLS probada para aislamiento entre centros y matriz de roles.
- Citas y cambios de estado en operaciones transaccionales con auditoría.
- Servicios configurables, personal, permisos, privacidad, retención y eliminación de datos.
- Entitlements de cursos confirmados por servidor; pagos y webhooks fuera de esta integración.
