import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { dispatchNotifications, money, rpc, run } from '../api'
import { useWorkspace } from '../context'
import { formatDay, fromZoned, todayIn, toZoned } from '../time'
import type { Client } from '../types'
import { Modal, Notice } from '../ui'

type Slot = { slot_start: string; slot_staff: string; slot_resource: string | null }

export type FormPreset = { date?: string; time?: string; staffId?: string; clientId?: string; serviceId?: string }

/** Create an appointment: pick client, service and professional, then a free slot (or a manual time). */
export function AppointmentForm({ preset, onClose, onSaved }: { preset?: FormPreset; onClose: () => void; onSaved: (id: string) => void }) {
  const ws = useWorkspace()
  const { center } = ws
  const tz = center.timezone
  const activeServices = ws.services.filter((s) => s.active)
  const bookableStaff = ws.staff.filter((s) => s.active)
  const ownOnly = ws.role === 'professional'

  const [clientQuery, setClientQuery] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [client, setClient] = useState<Client | null>(null)
  const [newClient, setNewClient] = useState<{ name: string; phone: string; email: string } | null>(null)
  const [serviceId, setServiceId] = useState(preset?.serviceId ?? activeServices[0]?.id ?? '')
  const [staffId, setStaffId] = useState(preset?.staffId ?? (ownOnly ? (ws.me?.id ?? '') : ''))
  const [date, setDate] = useState(preset?.date ?? todayIn(tz))
  const [slots, setSlots] = useState<Slot[] | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [time, setTime] = useState(preset?.time ?? '')
  const [force, setForce] = useState(false)
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'confirmed' | 'pending'>('confirmed')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const service = ws.services.find((s) => s.id === serviceId)
  const qualified = useMemo(() => {
    const links = ws.staffServices.filter((l) => l.service_id === serviceId)
    return bookableStaff.filter((s) => !links.length || links.some((l) => l.staff_id === s.id))
  }, [ws.staffServices, serviceId, bookableStaff])

  // Preset client (from a client record).
  useEffect(() => {
    if (!preset?.clientId) return
    run(supabase.from('clients').select('*').eq('id', preset.clientId).single())
      .then((c) => setClient(c as Client))
      .catch(() => undefined)
  }, [preset?.clientId])

  // Client search.
  useEffect(() => {
    if (client) return
    const q = clientQuery.trim()
    const handle = setTimeout(() => {
      let query = supabase.from('clients').select('*').eq('center_id', center.id).is('anonymized_at', null).order('name').limit(8)
      if (q) query = query.or(`name.ilike.%${q.replace(/[%,()]/g, '')}%,phone.ilike.%${q.replace(/[%,()]/g, '')}%`)
      run(query)
        .then((rows) => setClients(rows as Client[]))
        .catch(() => setClients([]))
    }, 200)
    return () => clearTimeout(handle)
  }, [clientQuery, client, center.id])

  // Free slots for the chosen service, professional and day.
  useEffect(() => {
    if (!serviceId || !date) return
    let active = true
    setLoadingSlots(true)
    rpc<Slot[]>('get_availability', { p_center: center.id, p_service: serviceId, p_date: date, p_staff: staffId || null })
      .then((rows) => active && setSlots(rows))
      .catch(() => active && setSlots([]))
      .finally(() => active && setLoadingSlots(false))
    return () => {
      active = false
    }
  }, [center.id, serviceId, staffId, date])

  const grouped = useMemo(() => {
    const map = new Map<string, Slot[]>()
    for (const s of slots ?? []) {
      const t = toZoned(s.slot_start, tz).time
      map.set(t, [...(map.get(t) ?? []), s])
    }
    return [...map.entries()]
  }, [slots, tz])

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!service) return setError('Elige un servicio.')
    if (!time) return setError('Elige una hora.')
    let staffForBooking = staffId
    if (!staffForBooking) {
      const match = grouped.find(([t]) => t === time)?.[1][0]
      if (!match) return setError('Elige una profesional o una hora de la lista de huecos libres.')
      staffForBooking = match.slot_staff
    }
    setBusy(true)
    try {
      let clientId = client?.id
      if (!clientId && newClient) {
        if (newClient.name.trim().length < 2) throw new Error('Escribe el nombre del cliente.')
        const created = await run(
          supabase
            .from('clients')
            .insert({ center_id: center.id, name: newClient.name.trim(), phone: newClient.phone.trim() || null, email: newClient.email.trim().toLowerCase() || null })
            .select('*')
            .single(),
        )
        clientId = (created as Client).id
        setClient(created as Client)
        setNewClient(null)
      }
      if (!clientId) throw new Error('Elige o crea un cliente.')
      const id = await rpc<string>('create_appointment', {
        p_center: center.id,
        p_client: clientId,
        p_service: service.id,
        p_staff: staffForBooking,
        p_starts_at: fromZoned(date, time, tz),
        p_notes: notes || null,
        p_status: status,
        p_force: force,
      })
      dispatchNotifications()
      onSaved(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title="Nueva cita" kicker="AGENDA" onClose={onClose} wide>
      <form className="mgr-form" onSubmit={submit}>
        <fieldset>
          <legend>Cliente</legend>
          {client ? (
            <div className="mgr-picked">
              <div>
                <strong>{client.name}</strong>
                <span>{[client.phone, client.email].filter(Boolean).join(' · ') || 'Sin datos de contacto'}</span>
              </div>
              {!preset?.clientId && (
                <button type="button" className="mgr-link" onClick={() => setClient(null)}>
                  Cambiar
                </button>
              )}
            </div>
          ) : newClient ? (
            <div className="mgr-form-grid three">
              <label>
                Nombre
                <input autoFocus required value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} />
              </label>
              <label>
                Teléfono
                <input type="tel" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} />
              </label>
              <label>
                Correo (para confirmaciones)
                <input type="email" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} />
              </label>
              <button type="button" className="mgr-link" onClick={() => setNewClient(null)}>
                Buscar cliente existente
              </button>
            </div>
          ) : (
            <>
              <input type="search" placeholder="Buscar por nombre o teléfono…" value={clientQuery} onChange={(e) => setClientQuery(e.target.value)} aria-label="Buscar cliente" />
              <div className="mgr-pick-list">
                {clients.map((c) => (
                  <button type="button" key={c.id} onClick={() => setClient(c)}>
                    <strong>{c.name}</strong> <span>{c.phone ?? ''}</span>
                  </button>
                ))}
                {ws.can('owner', 'admin', 'reception') && (
                  <button type="button" className="mgr-pick-new" onClick={() => setNewClient({ name: clientQuery, phone: '', email: '' })}>
                    ＋ Nuevo cliente{clientQuery ? `: ${clientQuery}` : ''}
                  </button>
                )}
              </div>
            </>
          )}
        </fieldset>

        <div className="mgr-form-grid three">
          <label>
            Servicio
            <select value={serviceId} onChange={(e) => (setServiceId(e.target.value), setTime(''))}>
              {activeServices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.duration_minutes} min · {money(s.price_cents, center.currency)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Profesional
            <select value={staffId} onChange={(e) => (setStaffId(e.target.value), setTime(''))} disabled={ownOnly}>
              {!ownOnly && <option value="">Cualquiera disponible</option>}
              {(ownOnly ? bookableStaff.filter((s) => s.id === ws.me?.id) : qualified).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.display_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Día
            <input type="date" required value={date} onChange={(e) => (setDate(e.target.value), setTime(''))} />
          </label>
        </div>

        <fieldset>
          <legend>
            Huecos libres · {formatDay(date)}
            {service && <small> · {service.duration_minutes} min{service.buffer_minutes ? ` + ${service.buffer_minutes} min de preparación` : ''}</small>}
          </legend>
          {loadingSlots ? (
            <p className="mgr-muted">Buscando huecos…</p>
          ) : grouped.length ? (
            <div className="mgr-slots">
              {grouped.map(([t, list]) => (
                <button type="button" key={t} className={time === t ? 'selected' : ''} onClick={() => (setTime(t), setForce(false))} title={list.map((s) => ws.staff.find((x) => x.id === s.slot_staff)?.display_name).join(', ')}>
                  {t}
                </button>
              ))}
            </div>
          ) : (
            <p className="mgr-muted">No hay huecos libres ese día con estos criterios.</p>
          )}
          {ws.can('owner', 'admin', 'reception') && (
            <div className="mgr-form-grid">
              <label>
                O escribe una hora
                <input type="time" step={300} value={time} onChange={(e) => setTime(e.target.value)} />
              </label>
              <label className="mgr-check">
                <input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} />
                Permitir fuera del horario del centro o de la profesional
              </label>
            </div>
          )}
        </fieldset>

        <div className="mgr-form-grid">
          <label>
            Notas de la cita
            <input value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} placeholder="Solo información operativa" />
          </label>
          <label>
            Estado
            <select value={status} onChange={(e) => setStatus(e.target.value as 'confirmed' | 'pending')}>
              <option value="confirmed">Confirmada</option>
              <option value="pending">Pendiente de confirmar</option>
            </select>
          </label>
        </div>

        <Notice text={error} error />
        <div className="mgr-form-actions">
          <button type="button" className="mgr-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="mgr-primary" type="submit" disabled={busy || (!client && !newClient)}>
            {busy ? 'Guardando…' : 'Guardar cita'}
          </button>
        </div>
        <p className="mgr-footnote">El servidor vuelve a comprobar el hueco al guardar: si alguien lo ha ocupado mientras tanto, te avisaremos.</p>
      </form>
    </Modal>
  )
}
