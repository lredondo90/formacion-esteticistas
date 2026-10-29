import { supabase } from '../lib/supabase'

// Error codes raised by the database functions, in the words the team will see.
const MESSAGES: Record<string, string> = {
  forbidden: 'Tu rol no permite hacer esta operación.',
  authentication_required: 'Tu sesión ha caducado. Vuelve a iniciar sesión.',
  slot_taken: 'Ese hueco se acaba de ocupar. Elige otra hora.',
  staff_busy: 'La profesional ya tiene una cita a esa hora (incluido el tiempo de preparación).',
  staff_time_off: 'La profesional tiene una ausencia o bloqueo a esa hora.',
  staff_not_working: 'La profesional no trabaja en ese horario.',
  staff_not_qualified: 'Esa profesional no está habilitada para este servicio.',
  staff_unavailable: 'La profesional no está disponible.',
  outside_opening_hours: 'La cita queda fuera del horario del centro.',
  center_closed: 'El centro está cerrado ese día (festivo o cierre).',
  no_resource_available: 'No queda ninguna cabina libre para este servicio a esa hora.',
  resource_busy: 'La cabina está ocupada a esa hora.',
  resource_not_suitable: 'Esa cabina no sirve para este servicio.',
  service_unavailable: 'El servicio no está disponible.',
  client_not_found: 'No se encontró el cliente.',
  appointment_not_found: 'No se encontró la cita.',
  appointment_closed: 'La cita ya está cerrada y no se puede cambiar.',
  invalid_transition: 'Ese cambio de estado no es posible.',
  invalid_amount: 'El importe no es válido.',
  payment_not_found: 'No se encontró el cobro.',
  invitation_invalid: 'La invitación ha caducado, ya se usó o fue anulada.',
  invitation_email_mismatch: 'La invitación es para otro correo. Inicia sesión con el correo invitado.',
  staff_not_available: 'Esa ficha de profesional ya tiene una cuenta asociada.',
  last_owner: 'El centro necesita al menos una propietaria activa.',
  member_not_found: 'No se encontró a esa persona en el equipo.',
  user_already_belongs_to_a_center: 'Tu cuenta ya pertenece a un centro.',
  invalid_center_name: 'El nombre del centro debe tener entre 2 y 140 caracteres.',
  booking_disabled: 'Este centro no tiene activadas las reservas online.',
  privacy_required: 'Debes aceptar la política de privacidad.',
  invalid_name: 'Escribe tu nombre.',
  invalid_email: 'Revisa el correo electrónico.',
  invalid_phone: 'Revisa el teléfono.',
  outside_booking_window: 'Esa fecha ya no se puede reservar online.',
  too_many_bookings: 'Ya tienes varias reservas pendientes en este centro. Llámanos para cualquier cambio.',
  too_late_to_cancel: 'Ya no se puede cancelar online. Llama al centro, por favor.',
}

export function errorText(error: unknown): string {
  const message =
    error && typeof error === 'object' && 'message' in error ? String((error as { message: unknown }).message) : String(error ?? '')
  for (const [code, text] of Object.entries(MESSAGES)) if (message.includes(code)) return text
  if (message.includes('duplicate key') && message.includes('slug')) return 'Esa dirección de reservas ya está en uso. Prueba otra.'
  if (message.includes('row-level security') || message.includes('permission denied')) return MESSAGES.forbidden
  if (message.includes('Failed to fetch')) return 'Sin conexión con el servidor. Revisa tu conexión.'
  return message || 'No se pudo completar la operación.'
}

/** Runs a Supabase query and throws a readable error. */
export async function run<T>(query: PromiseLike<{ data: T; error: unknown }>): Promise<T> {
  const { data, error } = await query
  if (error) throw new Error(errorText(error))
  return data
}

export function rpc<T = unknown>(fn: string, args: Record<string, unknown> = {}) {
  return run<T>(supabase.rpc(fn, args) as unknown as PromiseLike<{ data: T; error: unknown }>)
}

export function money(cents: number, currency = 'EUR') {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(cents / 100)
}

export function toCents(value: string) {
  const n = Number(value.replace(',', '.'))
  return Number.isFinite(n) ? Math.round(n * 100) : NaN
}

/** Ask the server to send due emails right away (confirmations, invitations). Safe to call often. */
export function dispatchNotifications() {
  void fetch('/api/notifications', { method: 'POST' }).catch(() => undefined)
}

export const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Realizada',
  cancelled: 'Cancelada',
  no_show: 'No vino',
  rejected: 'Rechazada',
  expired: 'Caducada',
}

export const ROLE_LABEL: Record<string, string> = {
  owner: 'Propietaria',
  admin: 'Administración',
  reception: 'Recepción',
  professional: 'Profesional',
}

export const METHOD_LABEL: Record<string, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  online: 'Online',
  other: 'Otro',
}
