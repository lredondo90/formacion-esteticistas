import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { dispatchNotifications, METHOD_LABEL, money, rpc, run, STATUS_LABEL, toCents } from '../api'
import { useWorkspace } from '../context'
import { formatDateTime, fromZoned, toZoned } from '../time'
import type { Appointment, BookingStatus, Client, Payment } from '../types'
import { Modal, Notice, StatusPill } from '../ui'
import { useLoad } from '../useLoad'

type Event = { id: string; event_type: string; details: Record<string, unknown>; created_at: string }

const EVENT_LABEL: Record<string, string> = {
  created: 'Cita creada',
  status_changed: 'Cambio de estado',
  rescheduled: 'Cambio de hora o profesional',
  notes_changed: 'Notas actualizadas',
}

/** Everything about one appointment: status changes, moving it, charging it and its history. */
export function AppointmentDetail({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged: () => void }) {
  const ws = useWorkspace()
  const { center } = ws
  const tz = center.timezone
  const [mode, setMode] = useState<'view' | 'move' | 'charge' | 'cancel'>('view')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const { data, reload, loading } = useLoad(
    async () => {
      const appt = (await run(supabase.from('appointments').select('*').eq('id', id).single())) as Appointment
      const [client, payments, events] = await Promise.all([
        run(supabase.from('clients').select('*').eq('id', appt.client_id).single()) as Promise<Client>,
        ws.can('owner', 'admin', 'reception')
          ? (run(supabase.from('payments').select('*').eq('appointment_id', id).order('created_at')) as Promise<Payment[]>)
          : Promise.resolve([] as Payment[]),
        run(supabase.from('appointment_events').select('*').eq('appointment_id', id).order('created_at')) as Promise<Event[]>,
      ])
      return { appt, client, payments, events }
    },
    [id],
    null as null | { appt: Appointment; client: Client; payments: Payment[]; events: Event[] },
  )

  const appt = data?.appt
  const local = appt ? toZoned(appt.starts_at, tz) : null
  const [moveDate, setMoveDate] = useState('')
  const [moveTime, setMoveTime] = useState('')
  const [moveStaff, setMoveStaff] = useState('')
  const [force, setForce] = useState(false)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<Payment['method']>('card')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState<string | null>(null)

  if (loading && !data) return <Modal title="Cita" onClose={onClose}><p className="mgr-muted">Cargando…</p></Modal>
  if (!data || !appt || !local) return <Modal title="Cita" onClose={onClose}><Notice text="No se pudo cargar la cita." error /></Modal>

  const paid = data.payments.reduce((sum, p) => sum + (p.kind === 'charge' ? p.amount_cents : -p.amount_cents), 0)
  const due = Math.max(0, appt.price_snapshot_cents - paid)
  const staffName = ws.staff.find((s) => s.id === appt.staff_id)?.display_name ?? '—'
  const resourceName = ws.resources.find((r) => r.id === appt.resource_id)?.name
  const open = appt.status === 'pending' || appt.status === 'confirmed'

  async function act(fn: () => Promise<unknown>, after?: () => void) {
    setBusy(true)
    setError('')
    try {
      await fn()
      dispatchNotifications()
      after?.()
      setMode('view')
      reload()
      onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }
  const setStatus = (status: BookingStatus, why?: string) =>
    act(() => rpc('set_appointment_status', { p_appointment: appt.id, p_status: status, p_reason: why ?? null }))

  return (
    <Modal title={`${appt.service_name_snapshot} · ${data.client.name}`} kicker="CITA" onClose={onClose} wide>
      <div className="mgr-detail">
        <div className="mgr-detail-grid">
          <div>
            <span>Cuándo</span>
            <strong>{formatDateTime(appt.starts_at, tz)}</strong>
            <small>
              {appt.duration_snapshot_minutes} min{appt.buffer_snapshot_minutes ? ` + ${appt.buffer_snapshot_minutes} min preparación` : ''}
            </small>
          </div>
          <div>
            <span>Profesional</span>
            <strong>{staffName}</strong>
            {resourceName && <small>{resourceName}</small>}
          </div>
          <div>
            <span>Estado</span>
            <StatusPill status={appt.status} label={STATUS_LABEL[appt.status]} />
            <small>{appt.source === 'online' ? 'Reserva online' : appt.source === 'whatsapp' ? 'Por WhatsApp' : 'Creada por el centro'}</small>
          </div>
          <div>
            <span>Importe</span>
            <strong>{money(appt.price_snapshot_cents, center.currency)}</strong>
            {ws.can('owner', 'admin', 'reception') && <small>{due === 0 && paid > 0 ? 'Pagada' : paid > 0 ? `Pendiente ${money(due, center.currency)}` : 'Sin cobrar'}</small>}
          </div>
        </div>

        <div className="mgr-detail-client">
          <strong>{data.client.name}</strong>
          <span>{[data.client.phone, data.client.email].filter(Boolean).join(' · ') || 'Sin datos de contacto'}</span>
          {ws.can('owner', 'admin', 'reception') && (
            <a className="mgr-link" href={`#/gestor/clientes?id=${data.client.id}`}>
              Ver ficha →
            </a>
          )}
        </div>
        {appt.cancel_reason && <p className="mgr-muted">Motivo: {appt.cancel_reason}</p>}

        {mode === 'view' && (
          <div className="mgr-detail-actions">
            {appt.status === 'pending' && (
              <>
                <button className="mgr-primary" disabled={busy} onClick={() => void setStatus('confirmed')}>
                  Confirmar
                </button>
                <button className="mgr-secondary" disabled={busy} onClick={() => void setStatus('rejected', 'Rechazada por el centro')}>
                  Rechazar
                </button>
              </>
            )}
            {appt.status === 'confirmed' && (
              <>
                <button className="mgr-primary" disabled={busy} onClick={() => void setStatus('completed')}>
                  Marcar como realizada
                </button>
                <button className="mgr-secondary" disabled={busy} onClick={() => void setStatus('no_show', 'No se presentó')}>
                  No vino
                </button>
              </>
            )}
            {open && (
              <>
                <button
                  className="mgr-secondary"
                  onClick={() => {
                    setMoveDate(local.date)
                    setMoveTime(local.time)
                    setMoveStaff(appt.staff_id)
                    setMode('move')
                  }}
                >
                  Cambiar hora
                </button>
                <button className="mgr-secondary danger" onClick={() => setMode('cancel')}>
                  Cancelar cita
                </button>
              </>
            )}
            {ws.can('owner', 'admin', 'reception') && appt.status !== 'cancelled' && appt.status !== 'rejected' && due > 0 && (
              <button
                className="mgr-secondary"
                onClick={() => {
                  setAmount((due / 100).toFixed(2))
                  setMode('charge')
                }}
              >
                Cobrar {money(due, center.currency)}
              </button>
            )}
          </div>
        )}

        {mode === 'move' && (
          <form
            className="mgr-inline-form"
            onSubmit={(e) => {
              e.preventDefault()
              void act(() =>
                rpc('reschedule_appointment', {
                  p_appointment: appt.id,
                  p_starts_at: fromZoned(moveDate, moveTime, tz),
                  p_staff: moveStaff,
                  p_force: force,
                }),
              )
            }}
          >
            <div className="mgr-form-grid three">
              <label>
                Día
                <input type="date" required value={moveDate} onChange={(e) => setMoveDate(e.target.value)} />
              </label>
              <label>
                Hora
                <input type="time" required step={300} value={moveTime} onChange={(e) => setMoveTime(e.target.value)} />
              </label>
              <label>
                Profesional
                <select value={moveStaff} onChange={(e) => setMoveStaff(e.target.value)} disabled={ws.role === 'professional'}>
                  {ws.staff
                    .filter((s) => s.active)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.display_name}
                      </option>
                    ))}
                </select>
              </label>
            </div>
            {ws.can('owner', 'admin', 'reception') && (
              <label className="mgr-check">
                <input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} /> Permitir fuera de horario
              </label>
            )}
            <div className="mgr-form-actions">
              <button type="button" className="mgr-secondary" onClick={() => setMode('view')}>
                Volver
              </button>
              <button className="mgr-primary" disabled={busy}>
                Mover cita
              </button>
            </div>
          </form>
        )}

        {mode === 'cancel' && (
          <form
            className="mgr-inline-form"
            onSubmit={(e) => {
              e.preventDefault()
              void setStatus('cancelled', reason || 'Cancelada por el centro')
            }}
          >
            <label>
              Motivo (opcional)
              <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} placeholder="Ej. La clienta avisó por teléfono" />
            </label>
            <div className="mgr-form-actions">
              <button type="button" className="mgr-secondary" onClick={() => setMode('view')}>
                Volver
              </button>
              <button className="mgr-primary danger" disabled={busy}>
                Cancelar la cita
              </button>
            </div>
          </form>
        )}

        {mode === 'charge' && (
          <form
            className="mgr-inline-form"
            onSubmit={(e) => {
              e.preventDefault()
              const cents = toCents(amount)
              void act(() => rpc('record_payment', { p_center: center.id, p_amount_cents: cents, p_method: method, p_appointment: appt.id }))
            }}
          >
            <div className="mgr-form-grid">
              <label>
                Importe ({center.currency})
                <input inputMode="decimal" required value={amount} onChange={(e) => setAmount(e.target.value)} />
              </label>
              <label>
                Forma de pago
                <select value={method} onChange={(e) => setMethod(e.target.value as Payment['method'])}>
                  {Object.entries(METHOD_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mgr-form-actions">
              <button type="button" className="mgr-secondary" onClick={() => setMode('view')}>
                Volver
              </button>
              <button className="mgr-primary" disabled={busy}>
                Registrar cobro
              </button>
            </div>
          </form>
        )}

        <Notice text={error} error />

        <div className="mgr-detail-notes">
          <span>Notas de la cita</span>
          {notes === null ? (
            <p>
              {appt.notes || <em className="mgr-muted">Sin notas</em>}{' '}
              <button className="mgr-link" onClick={() => setNotes(appt.notes ?? '')}>
                Editar
              </button>
            </p>
          ) : (
            <form
              className="mgr-inline-form"
              onSubmit={(e) => {
                e.preventDefault()
                void act(() => rpc('update_appointment_notes', { p_appointment: appt.id, p_notes: notes }), () => setNotes(null))
              }}
            >
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} />
              <div className="mgr-form-actions">
                <button type="button" className="mgr-secondary" onClick={() => setNotes(null)}>
                  Cancelar
                </button>
                <button className="mgr-primary" disabled={busy}>
                  Guardar notas
                </button>
              </div>
            </form>
          )}
        </div>

        {data.payments.length > 0 && (
          <div className="mgr-detail-list">
            <span>Cobros</span>
            {data.payments.map((p) => (
              <div key={p.id}>
                <strong>{p.kind === 'refund' ? '−' : ''}{money(p.amount_cents, p.currency)}</strong> {METHOD_LABEL[p.method]} ·{' '}
                {formatDateTime(p.created_at, tz)}
                {p.kind === 'refund' && ' · Devolución'}
              </div>
            ))}
          </div>
        )}

        <div className="mgr-detail-list">
          <span>Historial</span>
          {data.events.map((ev) => (
            <div key={ev.id}>
              {formatDateTime(ev.created_at, tz)} · {EVENT_LABEL[ev.event_type] ?? ev.event_type}
              {ev.event_type === 'status_changed' && ` → ${STATUS_LABEL[String(ev.details.to)] ?? ev.details.to}`}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}
