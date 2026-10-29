import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { METHOD_LABEL, money, rpc, run, STATUS_LABEL } from '../api'
import { AppointmentDetail } from '../calendar/AppointmentDetail'
import { AppointmentForm } from '../calendar/AppointmentForm'
import { useWorkspace } from '../context'
import { formatDateTime } from '../time'
import type { Appointment, Client, Payment } from '../types'
import { Empty, Modal, Notice, StatusPill } from '../ui'
import { useLoad } from '../useLoad'

type Consent = { id: string; kind: string; granted: boolean; version: string; collected_via: string; created_at: string }
type HealthNote = { id: string; content: string; created_at: string; author: string }

const CONSENT_LABEL: Record<string, string> = {
  privacy: 'Información de privacidad',
  marketing: 'Comunicaciones comerciales',
  health_data: 'Tratamiento de datos de salud',
  treatment: 'Consentimiento del tratamiento',
  image: 'Uso de imágenes',
}

/** Client record: contact data, appointment history, payments, consents and protected health notes. */
export function ClientRecord({ id, onClose }: { id: string; onClose: () => void }) {
  const ws = useWorkspace()
  const { center } = ws
  const tz = center.timezone
  const canEdit = ws.can('owner', 'admin', 'reception')
  const canHealth = ws.can('owner', 'admin', 'professional')
  const [tab, setTab] = useState<'datos' | 'citas' | 'pagos' | 'consentimientos' | 'salud'>('datos')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [booking, setBooking] = useState(false)
  const [openAppt, setOpenAppt] = useState<string | null>(null)

  const { data, reload } = useLoad(
    async () => {
      const [client, appts, payments, consents] = await Promise.all([
        run(supabase.from('clients').select('*').eq('id', id).single()) as Promise<Client>,
        run(supabase.from('appointments').select('*').eq('client_id', id).order('starts_at', { ascending: false })) as Promise<Appointment[]>,
        canEdit ? (run(supabase.from('payments').select('*').eq('client_id', id).order('created_at', { ascending: false })) as Promise<Payment[]>) : Promise.resolve([]),
        run(supabase.from('client_consents').select('*').eq('client_id', id).order('created_at', { ascending: false })) as Promise<Consent[]>,
      ])
      return { client, appts, payments, consents }
    },
    [id],
    null as null | { client: Client; appts: Appointment[]; payments: Payment[]; consents: Consent[] },
  )
  const health = useLoad(
    () => (tab === 'salud' && canHealth ? rpc<HealthNote[]>('get_client_health_notes', { p_client: id }) : Promise.resolve([] as HealthNote[])),
    [tab, id],
    [] as HealthNote[],
  )

  const [form, setForm] = useState<{ name: string; phone: string; email: string; notes: string } | null>(null)
  const [consentKind, setConsentKind] = useState('treatment')
  const [consentGranted, setConsentGranted] = useState(true)
  const [healthText, setHealthText] = useState('')

  if (!data) return <Modal title="Cliente" onClose={onClose}><p className="mgr-muted">Cargando…</p></Modal>
  const { client } = data
  const done = data.appts.filter((a) => a.status === 'completed')
  const spent = data.payments.reduce((s, p) => s + (p.kind === 'refund' ? -p.amount_cents : p.amount_cents), 0)
  const owed = data.appts
    .filter((a) => a.status === 'completed')
    .reduce((s, a) => s + a.price_snapshot_cents, 0) - data.payments.filter((p) => p.appointment_id).reduce((s, p) => s + (p.kind === 'refund' ? -p.amount_cents : p.amount_cents), 0)
  const latestConsent = (kind: string) => data.consents.find((c) => c.kind === kind)

  async function act(fn: () => Promise<unknown>, message: string) {
    setError('')
    try {
      await fn()
      setNotice(message)
      reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  async function saveData(e: FormEvent) {
    e.preventDefault()
    if (!form) return
    await act(
      () =>
        run(
          supabase
            .from('clients')
            .update({ name: form.name.trim(), phone: form.phone.trim() || null, email: form.email.trim().toLowerCase() || null, operational_notes: form.notes.trim() || null })
            .eq('id', id),
        ),
      'Ficha actualizada.',
    )
    setForm(null)
  }

  return (
    <Modal title={client.name} kicker="FICHA DE CLIENTE" onClose={onClose} wide>
      <div className="mgr-record-summary">
        <div>
          <span>Visitas</span>
          <strong>{done.length}</strong>
        </div>
        <div>
          <span>Próxima cita</span>
          <strong>
            {(() => {
              const next = [...data.appts].reverse().find((a) => ['pending', 'confirmed'].includes(a.status) && a.starts_at > new Date().toISOString())
              return next ? formatDateTime(next.starts_at, tz) : '—'
            })()}
          </strong>
        </div>
        {canEdit && (
          <>
            <div>
              <span>Total pagado</span>
              <strong>{money(spent, center.currency)}</strong>
            </div>
            <div>
              <span>Pendiente de pago</span>
              <strong className={owed > 0 ? 'warn' : ''}>{money(Math.max(0, owed), center.currency)}</strong>
            </div>
          </>
        )}
      </div>
      <div className="mgr-tabs small">
        {(['datos', 'citas', ...(canEdit ? ['pagos'] : []), 'consentimientos', ...(canHealth ? ['salud'] : [])] as (typeof tab)[]).map((t) => (
          <button key={t} className={tab === t ? 'selected' : ''} onClick={() => setTab(t)}>
            {{ datos: 'Datos', citas: 'Citas', pagos: 'Pagos', consentimientos: 'Consentimientos', salud: 'Notas de salud' }[t]}
          </button>
        ))}
      </div>
      <Notice text={notice} onClose={() => setNotice('')} />
      <Notice text={error} error />

      {tab === 'datos' &&
        (form ? (
          <form className="mgr-form" onSubmit={saveData}>
            <label>
              Nombre
              <input required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <div className="mgr-form-grid">
              <label>
                Teléfono
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </label>
              <label>
                Correo
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </label>
            </div>
            <label>
              Preferencias y notas internas
              <textarea rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </label>
            <div className="mgr-form-actions">
              <button type="button" className="mgr-secondary" onClick={() => setForm(null)}>
                Cancelar
              </button>
              <button className="mgr-primary">Guardar</button>
            </div>
          </form>
        ) : (
          <div className="mgr-record-data">
            <dl>
              <dt>Teléfono</dt>
              <dd>{client.phone || '—'}</dd>
              <dt>Correo</dt>
              <dd>{client.email || '—'}</dd>
              <dt>Preferencias y notas</dt>
              <dd>{client.operational_notes || '—'}</dd>
              <dt>Promociones</dt>
              <dd>{latestConsent('marketing')?.granted ? 'Acepta' : 'No acepta'}</dd>
              <dt>Cliente desde</dt>
              <dd>{formatDateTime(client.created_at, tz)}</dd>
            </dl>
            <div className="mgr-form-actions">
              {canEdit && (
                <button className="mgr-secondary" onClick={() => setForm({ name: client.name, phone: client.phone ?? '', email: client.email ?? '', notes: client.operational_notes ?? '' })}>
                  Editar datos
                </button>
              )}
              <button className="mgr-primary" onClick={() => setBooking(true)}>
                Dar cita
              </button>
            </div>
            {ws.can('owner', 'admin') && (
              <details className="mgr-danger-zone">
                <summary>Derecho de supresión</summary>
                <p>Borra los datos personales y las notas de salud, cancela sus citas futuras y conserva solo el histórico económico sin nombre. No se puede deshacer.</p>
                <button
                  className="mgr-secondary danger"
                  onClick={() => {
                    if (confirm(`¿Eliminar los datos personales de ${client.name}? No se puede deshacer.`))
                      void act(() => rpc('anonymize_client', { p_client: id }), 'Datos personales eliminados.').then(onClose)
                  }}
                >
                  Eliminar datos personales
                </button>
              </details>
            )}
          </div>
        ))}

      {tab === 'citas' &&
        (data.appts.length === 0 ? (
          <Empty icon="🗓️" title="Sin citas todavía" />
        ) : (
          <div className="mgr-table">
            {data.appts.map((a) => (
              <button key={a.id} className="mgr-table-row mgr-history-cols" onClick={() => setOpenAppt(a.id)}>
                <span>{formatDateTime(a.starts_at, tz)}</span>
                <strong>{a.service_name_snapshot}</strong>
                <span>{ws.staff.find((s) => s.id === a.staff_id)?.display_name}</span>
                <span>{money(a.price_snapshot_cents, center.currency)}</span>
                <StatusPill status={a.status} label={STATUS_LABEL[a.status]} />
              </button>
            ))}
          </div>
        ))}

      {tab === 'pagos' &&
        (data.payments.length === 0 ? (
          <Empty icon="💶" title="Sin cobros registrados" />
        ) : (
          <div className="mgr-table">
            {data.payments.map((p) => (
              <div key={p.id} className="mgr-table-row mgr-pay-cols">
                <span>{formatDateTime(p.created_at, tz)}</span>
                <strong>
                  {p.kind === 'refund' ? '−' : ''}
                  {money(p.amount_cents, p.currency)}
                </strong>
                <span>{METHOD_LABEL[p.method]}</span>
                <span>{p.kind === 'refund' ? 'Devolución' : p.appointment_id ? 'Cita' : 'Venta'}</span>
              </div>
            ))}
          </div>
        ))}

      {tab === 'consentimientos' && (
        <>
          <div className="mgr-table">
            {data.consents.length === 0 && <Empty icon="📝" title="Sin consentimientos registrados" />}
            {data.consents.map((c) => (
              <div key={c.id} className="mgr-table-row mgr-consent-cols">
                <strong>{CONSENT_LABEL[c.kind] ?? c.kind}</strong>
                <span>{c.granted ? '✅ Otorgado' : '❌ No otorgado / retirado'}</span>
                <span>
                  {c.version} · {c.collected_via === 'online' ? 'Online' : 'En el centro'}
                </span>
                <span>{formatDateTime(c.created_at, tz)}</span>
              </div>
            ))}
          </div>
          <form
            className="mgr-inline-form"
            onSubmit={(e) => {
              e.preventDefault()
              void act(
                () =>
                  run(
                    supabase.from('client_consents').insert({
                      center_id: center.id,
                      client_id: id,
                      kind: consentKind,
                      granted: consentGranted,
                      version: 'v1',
                      collected_via: 'in_person',
                      collected_by: ws.userId,
                    }),
                  ),
                'Consentimiento registrado.',
              )
            }}
          >
            <div className="mgr-form-grid three">
              <label>
                Tipo
                <select value={consentKind} onChange={(e) => setConsentKind(e.target.value)}>
                  {Object.entries(CONSENT_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Respuesta
                <select value={consentGranted ? 'yes' : 'no'} onChange={(e) => setConsentGranted(e.target.value === 'yes')}>
                  <option value="yes">Otorga</option>
                  <option value="no">No otorga / retira</option>
                </select>
              </label>
              <button className="mgr-primary">Registrar</button>
            </div>
            <p className="mgr-footnote">Cada registro queda guardado con fecha y versión; no se edita ni se borra. Para retirarlo, registra «No otorga».</p>
          </form>
        </>
      )}

      {tab === 'salud' && canHealth && (
        <>
          <p className="mgr-footnote">
            Datos especialmente protegidos. Solo los ven propietaria, administración y profesionales; cada consulta queda registrada. Usa solo lo necesario para trabajar con
            seguridad (alergias, contraindicaciones).
          </p>
          {health.data.map((n) => (
            <div key={n.id} className="mgr-health-note">
              <p>{n.content}</p>
              <small>
                {n.author} · {formatDateTime(n.created_at, tz)}
              </small>
            </div>
          ))}
          {health.data.length === 0 && !health.loading && <Empty icon="🩺" title="Sin notas de salud" />}
          <form
            className="mgr-inline-form"
            onSubmit={(e) => {
              e.preventDefault()
              void act(
                () => run(supabase.from('client_health_notes').insert({ center_id: center.id, client_id: id, content: healthText.trim(), created_by: ws.userId })),
                'Nota de salud guardada.',
              ).then(() => {
                setHealthText('')
                health.reload()
              })
            }}
          >
            <label>
              Nueva nota
              <textarea rows={2} required value={healthText} onChange={(e) => setHealthText(e.target.value)} maxLength={4000} placeholder="Ej. Alergia al níquel" />
            </label>
            <div className="mgr-form-actions">
              <button className="mgr-primary">Guardar nota</button>
            </div>
          </form>
        </>
      )}

      {booking && <AppointmentForm preset={{ clientId: id }} onClose={() => setBooking(false)} onSaved={() => (setBooking(false), reload(), setNotice('Cita creada.'))} />}
      {openAppt && <AppointmentDetail id={openAppt} onClose={() => setOpenAppt(null)} onChanged={reload} />}
    </Modal>
  )
}
