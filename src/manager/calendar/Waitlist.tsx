import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { run } from '../api'
import { useWorkspace } from '../context'
import { formatDateTime } from '../time'
import type { Client } from '../types'
import { Empty, Modal, Notice } from '../ui'
import { useLoad } from '../useLoad'
import type { FormPreset } from './AppointmentForm'

type Entry = {
  id: string
  client_id: string
  service_id: string | null
  staff_id: string | null
  preference: string | null
  status: 'waiting' | 'contacted' | 'booked' | 'dropped'
  created_at: string
  clients: { name: string; phone: string | null } | null
}

const STATUS = { waiting: 'Esperando', contacted: 'Contactada', booked: 'Con cita', dropped: 'Descartada' }

/** Clients waiting for a gap: reception calls them when a slot frees up. */
export function Waitlist({ onClose, onBook }: { onClose: () => void; onBook: (preset: FormPreset) => void }) {
  const ws = useWorkspace()
  const { center } = ws
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [client, setClient] = useState<Client | null>(null)
  const [serviceId, setServiceId] = useState('')
  const [preference, setPreference] = useState('')

  const list = useLoad(
    () =>
      run(
        supabase.from('waitlist_entries').select('*, clients(name, phone)').eq('center_id', center.id).in('status', ['waiting', 'contacted']).order('created_at'),
      ) as Promise<Entry[]>,
    [center.id],
    [] as Entry[],
  )
  const matches = useLoad(
    () =>
      query.trim().length < 2
        ? Promise.resolve([] as Client[])
        : (run(
            supabase
              .from('clients')
              .select('*')
              .eq('center_id', center.id)
              .is('anonymized_at', null)
              .ilike('name', `%${query.trim().replace(/[%,()]/g, '')}%`)
              .limit(6),
          ) as Promise<Client[]>),
    [query, center.id],
    [] as Client[],
  )

  async function add(e: FormEvent) {
    e.preventDefault()
    if (!client) return
    try {
      await run(
        supabase.from('waitlist_entries').insert({
          center_id: center.id,
          client_id: client.id,
          service_id: serviceId || null,
          preference: preference.trim() || null,
          created_by: ws.userId,
        }),
      )
      setClient(null)
      setQuery('')
      setPreference('')
      list.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  async function setStatus(id: string, status: Entry['status']) {
    try {
      await run(supabase.from('waitlist_entries').update({ status }).eq('id', id))
      list.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <Modal title="Lista de espera" kicker="AGENDA" onClose={onClose} wide>
      <form className="mgr-inline-form" onSubmit={add}>
        <div className="mgr-form-grid three">
          <label>
            Cliente
            {client ? (
              <span className="mgr-picked-inline">
                {client.name}{' '}
                <button type="button" className="mgr-link" onClick={() => setClient(null)}>
                  Cambiar
                </button>
              </span>
            ) : (
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar cliente…" />
            )}
          </label>
          <label>
            Servicio
            <select value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
              <option value="">Cualquiera</option>
              {ws.services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Preferencia
            <input value={preference} onChange={(e) => setPreference(e.target.value)} placeholder="Ej. martes por la tarde" maxLength={300} />
          </label>
        </div>
        {!client && matches.data.length > 0 && (
          <div className="mgr-pick-list">
            {matches.data.map((c) => (
              <button type="button" key={c.id} onClick={() => setClient(c)}>
                <strong>{c.name}</strong> <span>{c.phone ?? ''}</span>
              </button>
            ))}
          </div>
        )}
        <div className="mgr-form-actions">
          <button className="mgr-primary" disabled={!client}>
            Añadir a la lista
          </button>
        </div>
      </form>
      <Notice text={error || list.error} error />
      {list.data.length === 0 ? (
        <Empty icon="⏳" title="Nadie en lista de espera" text="Cuando una clienta quiera un hueco que no hay, apúntala aquí." />
      ) : (
        <div className="mgr-table">
          {list.data.map((e) => (
            <div key={e.id} className="mgr-table-row mgr-wait-cols">
              <div>
                <strong>{e.clients?.name}</strong>
                <small>{e.clients?.phone}</small>
              </div>
              <span>{ws.services.find((s) => s.id === e.service_id)?.name ?? 'Cualquier servicio'}</span>
              <span>{e.preference ?? '—'}</span>
              <span>
                {STATUS[e.status]} · {formatDateTime(e.created_at, center.timezone)}
              </span>
              <div className="mgr-row-actions">
                {e.status === 'waiting' && (
                  <button className="mgr-link" onClick={() => void setStatus(e.id, 'contacted')}>
                    Contactada
                  </button>
                )}
                <button
                  className="mgr-link"
                  onClick={() => {
                    void setStatus(e.id, 'booked')
                    onBook({ clientId: e.client_id, serviceId: e.service_id ?? undefined })
                  }}
                >
                  Dar cita
                </button>
                <button className="mgr-link muted" onClick={() => void setStatus(e.id, 'dropped')}>
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
