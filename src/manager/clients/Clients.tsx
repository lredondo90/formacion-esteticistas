import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { run } from '../api'
import { useWorkspace } from '../context'
import type { Client } from '../types'
import { Empty, Modal, Notice, SectionHead } from '../ui'
import { useLoad } from '../useLoad'
import { ClientRecord } from './ClientRecord'

type Row = Client & { appointments: { count: number }[] }

export function Clients({ params }: { params: URLSearchParams }) {
  const ws = useWorkspace()
  const { center } = ws
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(params.get('id'))
  const [creating, setCreating] = useState(params.get('nuevo') === '1')

  const { data, loading, error, reload } = useLoad(
    () => {
      let q = supabase.from('clients').select('*, appointments(count)').eq('center_id', center.id).is('anonymized_at', null).order('name').limit(200)
      const term = query.trim().replace(/[%,()]/g, '')
      if (term) q = q.or(`name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%`)
      return run(q) as Promise<Row[]>
    },
    [center.id, query],
    [] as Row[],
  )

  return (
    <section className="mgr-panel">
      <SectionHead title="Clientes" text={`Fichas de ${center.name}`}>
        {ws.can('owner', 'admin', 'reception') && (
          <button className="mgr-primary" onClick={() => setCreating(true)}>
            ＋ Añadir cliente
          </button>
        )}
      </SectionHead>
      <label className="mgr-client-search">
        Buscar
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nombre, teléfono o correo…" />
      </label>
      <Notice text={error} error />
      {loading && !data.length ? (
        <p className="mgr-muted">Cargando clientes…</p>
      ) : data.length === 0 ? (
        <Empty icon="👩" title={query ? 'No hay coincidencias' : 'Aún no tienes clientes'} text={query ? undefined : 'Se crean al añadirlos aquí, al dar una cita o cuando reservan online.'} />
      ) : (
        <div className="mgr-table">
          <div className="mgr-table-head mgr-client-cols">
            <span>Cliente</span>
            <span>Teléfono</span>
            <span>Correo</span>
            <span>Citas</span>
          </div>
          {data.map((c) => (
            <button className="mgr-table-row mgr-client-cols" key={c.id} onClick={() => setOpenId(c.id)}>
              <strong>{c.name}</strong>
              <span>{c.phone || '—'}</span>
              <span>{c.email || '—'}</span>
              <span>{c.appointments?.[0]?.count ?? 0}</span>
            </button>
          ))}
        </div>
      )}
      {creating && (
        <NewClient
          onClose={() => setCreating(false)}
          onSaved={(id) => {
            setCreating(false)
            reload()
            setOpenId(id)
          }}
        />
      )}
      {openId && <ClientRecord id={openId} onClose={() => (setOpenId(null), reload())} />}
    </section>
  )
}

function NewClient({ onClose, onSaved }: { onClose: () => void; onSaved: (id: string) => void }) {
  const ws = useWorkspace()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [privacy, setPrivacy] = useState(true)
  const [marketing, setMarketing] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function save(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const client = (await run(
        supabase
          .from('clients')
          .insert({
            center_id: ws.center.id,
            name: name.trim(),
            phone: phone.trim() || null,
            email: email.trim().toLowerCase() || null,
            operational_notes: notes.trim() || null,
            marketing_consent_at: marketing ? new Date().toISOString() : null,
          })
          .select('*')
          .single(),
      )) as Client
      const consents = [
        privacy && { kind: 'privacy', granted: true },
        { kind: 'marketing', granted: marketing },
      ].filter(Boolean) as { kind: string; granted: boolean }[]
      await run(
        supabase.from('client_consents').insert(
          consents.map((c) => ({ ...c, center_id: ws.center.id, client_id: client.id, collected_by: ws.userId, collected_via: 'in_person', version: 'v1' })),
        ),
      )
      onSaved(client.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title="Nuevo cliente" kicker={`CLIENTES · ${ws.center.name}`} onClose={onClose}>
      <form className="mgr-form" onSubmit={save}>
        <label>
          Nombre completo
          <input required minLength={2} autoFocus value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <div className="mgr-form-grid">
          <label>
            Teléfono
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+34 600 000 000" />
          </label>
          <label>
            Correo
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
        </div>
        <label>
          Preferencias y notas internas
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej. prefiere tardes, le gusta la música suave" />
        </label>
        <label className="mgr-check">
          <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} /> Ha recibido la información de privacidad del centro
        </label>
        <label className="mgr-check">
          <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} /> Acepta recibir promociones
        </label>
        <p className="mgr-footnote">Las alergias o contraindicaciones van en «Notas de salud» de la ficha, que recepción no ve.</p>
        <Notice text={error} error />
        <div className="mgr-form-actions">
          <button type="button" className="mgr-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="mgr-primary" disabled={busy}>
            Guardar cliente
          </button>
        </div>
      </form>
    </Modal>
  )
}
