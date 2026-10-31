import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { rpc, run } from '../api'
import { useWorkspace } from '../context'
import { formatDateTime, todayIn, WEEK_ORDER, WEEKDAYS } from '../time'
import type { Center, Closure } from '../types'
import { Empty, Notice, SectionHead } from '../ui'
import { useLoad } from '../useLoad'

type NotificationRow = { id: string; kind: string; recipient: string; status: string; scheduled_for: string; sent_at: string | null; last_error: string | null }

const KIND_LABEL: Record<string, string> = {
  confirmation: 'Confirmación',
  pending: 'Solicitud recibida',
  reminder: 'Recordatorio',
  cancellation: 'Cancelación',
  rescheduled: 'Cambio de hora',
  invitation: 'Invitación al equipo',
}
const SEND_LABEL: Record<string, string> = { queued: 'En cola', sending: 'Enviando', sent: 'Enviado', failed: 'Error', skipped: 'No necesario' }

export function Settings() {
  const ws = useWorkspace()
  const { center } = ws
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  async function act(fn: () => Promise<unknown>, message: string) {
    setError('')
    try {
      await fn()
      setNotice(message)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <>
      <Notice text={notice} onClose={() => setNotice('')} />
      <Notice text={error} error />
      <CenterForm onAct={act} />
      <OpeningHours onAct={act} />
      <Closures onAct={act} />
      <Resources onAct={act} />
      <Notifications />
      {ws.role === 'owner' && (
        <section className="mgr-panel">
          <SectionHead title="Tus datos" text="Descarga todo lo que el centro tiene guardado (clientes, citas, cobros, consentimientos…) en un archivo JSON." />
          <button
            className="mgr-secondary"
            onClick={() =>
              void act(async () => {
                const data = await rpc('export_center_data', { p_center: center.id })
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                const a = document.createElement('a')
                a.href = URL.createObjectURL(blob)
                a.download = `belaura-${center.slug}-${todayIn(center.timezone)}.json`
                a.click()
                URL.revokeObjectURL(a.href)
              }, 'Exportación descargada. Queda registrada en el historial del centro.')
            }
          >
            Exportar datos del centro
          </button>
        </section>
      )}
    </>
  )
}

type Act = (fn: () => Promise<unknown>, message: string) => Promise<void>

function CenterForm({ onAct }: { onAct: Act }) {
  const ws = useWorkspace()
  const [c, setC] = useState<Center>(ws.center)
  const link = `${location.origin}/#/reservar/${c.slug}`
  const set = <K extends keyof Center>(key: K, value: Center[K]) => setC({ ...c, [key]: value })

  function save(e: FormEvent) {
    e.preventDefault()
    void onAct(async () => {
      const saved = (await run(
        supabase
          .from('centers')
          .update({
            name: c.name.trim(),
            slug: c.slug.trim().toLowerCase(),
            phone: c.phone?.trim() || null,
            email: c.email?.trim() || null,
            address: c.address?.trim() || null,
            timezone: c.timezone,
            locale: c.locale,
            slot_interval_minutes: Number(c.slot_interval_minutes),
            min_notice_minutes: Number(c.min_notice_minutes),
            max_advance_days: Number(c.max_advance_days),
            cancellation_hours: Number(c.cancellation_hours),
            cancellation_policy: c.cancellation_policy?.trim() || null,
            online_booking_enabled: c.online_booking_enabled,
            online_requires_approval: c.online_requires_approval,
          })
          .eq('id', c.id)
          .select('*')
          .single(),
      )) as Center
      ws.setCenter(saved)
      setC(saved)
    }, 'Configuración guardada.')
  }

  return (
    <form onSubmit={save}>
      <section className="mgr-panel">
        <SectionHead title="Datos del centro" />
        <div className="mgr-form">
          <div className="mgr-form-grid">
            <label>
              Nombre comercial
              <input required minLength={2} value={c.name} onChange={(e) => set('name', e.target.value)} />
            </label>
            <label>
              Teléfono
              <input type="tel" value={c.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
            </label>
            <label>
              Correo
              <input type="email" value={c.email ?? ''} onChange={(e) => set('email', e.target.value)} />
            </label>
            <label>
              Dirección
              <input value={c.address ?? ''} onChange={(e) => set('address', e.target.value)} />
            </label>
            <label>
              Zona horaria
              <select value={c.timezone} onChange={(e) => set('timezone', e.target.value)}>
                {['Europe/Madrid', 'Atlantic/Canary', 'America/Mexico_City', 'America/Bogota', 'America/Lima', 'America/Santiago', 'America/Argentina/Buenos_Aires', 'America/New_York', 'Europe/London'].map((z) => (
                  <option key={z}>{z}</option>
                ))}
              </select>
            </label>
            <label>
              Idioma de los mensajes a clientes
              <select value={c.locale} onChange={(e) => set('locale', e.target.value)}>
                <option value="es-ES">Español (España)</option>
                <option value="es-419">Español (Latinoamérica)</option>
                <option value="en">English</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="mgr-panel">
        <SectionHead title="Reserva online" text="Una página pública donde tus clientas eligen servicio y hueco libre" />
        <div className="mgr-form">
          <label className="mgr-check big">
            <input type="checkbox" checked={c.online_booking_enabled} onChange={(e) => set('online_booking_enabled', e.target.checked)} /> Activar reservas online
          </label>
          <div className="mgr-form-grid">
            <label>
              Dirección de tu página
              <div className="mgr-prefix">
                <span>/reservar/</span>
                <input required pattern="[a-z0-9]+(-[a-z0-9]+)*" minLength={3} maxLength={60} value={c.slug} onChange={(e) => set('slug', e.target.value.toLowerCase())} />
              </div>
            </label>
            <label className="mgr-check">
              <input type="checkbox" checked={c.online_requires_approval} onChange={(e) => set('online_requires_approval', e.target.checked)} /> Revisar cada reserva antes de confirmarla
            </label>
            <label>
              Intervalo entre horas ofrecidas
              <select value={c.slot_interval_minutes} onChange={(e) => set('slot_interval_minutes', Number(e.target.value))}>
                {[10, 15, 20, 30, 60].map((n) => (
                  <option key={n} value={n}>
                    Cada {n} min
                  </option>
                ))}
              </select>
            </label>
            <label>
              Antelación mínima
              <select value={c.min_notice_minutes} onChange={(e) => set('min_notice_minutes', Number(e.target.value))}>
                {[0, 60, 120, 240, 720, 1440].map((n) => (
                  <option key={n} value={n}>
                    {n === 0 ? 'Sin mínimo' : n < 1440 ? `${n / 60} h` : '1 día'}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Se puede reservar hasta
              <select value={c.max_advance_days} onChange={(e) => set('max_advance_days', Number(e.target.value))}>
                {[14, 30, 60, 90, 180].map((n) => (
                  <option key={n} value={n}>
                    {n} días vista
                  </option>
                ))}
              </select>
            </label>
          </div>
          {ws.center.online_booking_enabled && (
            <p className="mgr-share">
              Tu página: <a href={link} target="_blank" rel="noreferrer">{link}</a>{' '}
              <button type="button" className="mgr-link" onClick={() => void navigator.clipboard?.writeText(link)}>
                Copiar
              </button>
            </p>
          )}
        </div>
      </section>

      <section className="mgr-panel">
        <SectionHead title="Política de cancelación" />
        <div className="mgr-form">
          <label>
            Las clientas pueden cancelar online hasta
            <select value={c.cancellation_hours} onChange={(e) => set('cancellation_hours', Number(e.target.value))}>
              {[0, 2, 6, 12, 24, 48, 72].map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? 'Hasta la hora de la cita' : `${n} h antes`}
                </option>
              ))}
            </select>
          </label>
          <label>
            Texto de la política (se muestra al reservar)
            <textarea rows={3} maxLength={1000} value={c.cancellation_policy ?? ''} onChange={(e) => set('cancellation_policy', e.target.value)} placeholder="Ej. Si no puedes venir, avísanos con 24 h de antelación para dar el hueco a otra persona." />
          </label>
          <div className="mgr-form-actions">
            <button className="mgr-primary">Guardar configuración</button>
          </div>
        </div>
      </section>
    </form>
  )
}

function OpeningHours({ onAct }: { onAct: Act }) {
  const ws = useWorkspace()
  const [row, setRow] = useState({ weekday: 1, from: '09:30', to: '20:00' })
  return (
    <section className="mgr-panel">
      <SectionHead title="Horario del centro" text="Las reservas solo se ofrecen dentro de este horario. Puedes partir el día en dos tramos." />
      <div className="mgr-hours">
        {WEEK_ORDER.map((d) => {
          const rows = ws.openingHours.filter((h) => h.weekday === d)
          return (
            <div key={d}>
              <strong>{WEEKDAYS[d]}</strong>
              {rows.length === 0 ? (
                <span className="mgr-muted">Cerrado</span>
              ) : (
                rows.map((h) => (
                  <span key={h.id} className="mgr-hour-chip">
                    {h.opens_at.slice(0, 5)}–{h.closes_at.slice(0, 5)}
                    <button
                      aria-label="Quitar tramo"
                      onClick={() =>
                        void onAct(async () => {
                          await run(supabase.from('center_opening_hours').delete().eq('id', h.id))
                          await ws.reloadCatalog()
                        }, 'Horario actualizado.')
                      }
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          )
        })}
      </div>
      <form
        className="mgr-inline-form mgr-form-grid four"
        onSubmit={(e) => {
          e.preventDefault()
          void onAct(async () => {
            await run(supabase.from('center_opening_hours').insert({ center_id: ws.center.id, weekday: row.weekday, opens_at: row.from, closes_at: row.to }))
            await ws.reloadCatalog()
          }, 'Horario actualizado.')
        }}
      >
        <label>
          Día
          <select value={row.weekday} onChange={(e) => setRow({ ...row, weekday: Number(e.target.value) })}>
            {WEEK_ORDER.map((d) => (
              <option key={d} value={d}>
                {WEEKDAYS[d]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Abre
          <input type="time" value={row.from} onChange={(e) => setRow({ ...row, from: e.target.value })} />
        </label>
        <label>
          Cierra
          <input type="time" value={row.to} onChange={(e) => setRow({ ...row, to: e.target.value })} />
        </label>
        <button className="mgr-secondary">Añadir tramo</button>
      </form>
    </section>
  )
}

function Closures({ onAct }: { onAct: Act }) {
  const ws = useWorkspace()
  const today = todayIn(ws.center.timezone)
  const list = useLoad(
    () => run(supabase.from('center_closures').select('*').eq('center_id', ws.center.id).gte('ends_on', today).order('starts_on')) as Promise<Closure[]>,
    [ws.center.id],
    [] as Closure[],
  )
  const [row, setRow] = useState({ from: today, to: today, reason: '' })
  return (
    <section className="mgr-panel">
      <SectionHead title="Festivos y cierres" text="Días en que el centro no abre (festivos, vacaciones del centro…)" />
      {list.data.length === 0 ? (
        <Empty icon="📅" title="Sin cierres previstos" />
      ) : (
        <div className="mgr-table">
          {list.data.map((c) => (
            <div key={c.id} className="mgr-table-row mgr-off-cols">
              <span>{c.starts_on === c.ends_on ? c.starts_on : `${c.starts_on} → ${c.ends_on}`}</span>
              <span>{c.reason || 'Cerrado'}</span>
              <button
                className="mgr-link muted"
                onClick={() =>
                  void onAct(async () => {
                    await run(supabase.from('center_closures').delete().eq('id', c.id))
                    list.reload()
                  }, 'Cierre eliminado.')
                }
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      )}
      <form
        className="mgr-inline-form mgr-form-grid four"
        onSubmit={(e) => {
          e.preventDefault()
          void onAct(async () => {
            await run(supabase.from('center_closures').insert({ center_id: ws.center.id, starts_on: row.from, ends_on: row.to < row.from ? row.from : row.to, reason: row.reason.trim() || null }))
            list.reload()
          }, 'Cierre añadido.')
        }}
      >
        <label>
          Desde
          <input type="date" value={row.from} onChange={(e) => setRow({ ...row, from: e.target.value, to: e.target.value > row.to ? e.target.value : row.to })} />
        </label>
        <label>
          Hasta
          <input type="date" value={row.to} onChange={(e) => setRow({ ...row, to: e.target.value })} />
        </label>
        <label>
          Motivo
          <input value={row.reason} onChange={(e) => setRow({ ...row, reason: e.target.value })} placeholder="Festivo local" />
        </label>
        <button className="mgr-secondary">Añadir cierre</button>
      </form>
    </section>
  )
}

function Resources({ onAct }: { onAct: Act }) {
  const ws = useWorkspace()
  const [name, setName] = useState('')
  const [kind, setKind] = useState('cabina')
  return (
    <section className="mgr-panel">
      <SectionHead title="Cabinas y equipos" text="Recursos que no se pueden usar en dos citas a la vez. Asígnalos a los servicios que los necesitan." />
      <div className="mgr-chips">
        {ws.resources.map((r) => (
          <span key={r.id} className={`mgr-chip on ${r.active ? '' : 'inactive'}`}>
            {r.kind === 'equipo' ? '🔌' : '🚪'} {r.name}
            <button
              className="mgr-link muted"
              onClick={() =>
                void onAct(async () => {
                  await run(supabase.from('resources').update({ active: !r.active }).eq('id', r.id))
                  await ws.reloadCatalog()
                }, r.active ? 'Recurso desactivado.' : 'Recurso activado.')
              }
            >
              {r.active ? 'Desactivar' : 'Activar'}
            </button>
          </span>
        ))}
        {ws.resources.length === 0 && <span className="mgr-muted">Aún no hay cabinas.</span>}
      </div>
      <form
        className="mgr-inline-form mgr-form-grid three"
        onSubmit={(e) => {
          e.preventDefault()
          void onAct(async () => {
            await run(supabase.from('resources').insert({ center_id: ws.center.id, name: name.trim(), kind }))
            setName('')
            await ws.reloadCatalog()
          }, 'Recurso añadido.')
        }}
      >
        <label>
          Nombre
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Cabina 1, Láser diodo…" />
        </label>
        <label>
          Tipo
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="cabina">Cabina</option>
            <option value="sala">Sala</option>
            <option value="equipo">Equipo</option>
            <option value="otro">Otro</option>
          </select>
        </label>
        <button className="mgr-secondary">Añadir</button>
      </form>
    </section>
  )
}

function Notifications() {
  const ws = useWorkspace()
  const list = useLoad(
    () =>
      run(
        supabase.from('notifications').select('id, kind, recipient, status, scheduled_for, sent_at, last_error').eq('center_id', ws.center.id).order('created_at', { ascending: false }).limit(15),
      ) as Promise<NotificationRow[]>,
    [ws.center.id],
    [] as NotificationRow[],
  )
  return (
    <section className="mgr-panel">
      <SectionHead title="Avisos a clientes" text="Confirmaciones, recordatorios (el día antes a las 10:00) y cancelaciones por correo. Cada aviso se envía una sola vez." />
      {list.data.length === 0 ? (
        <Empty icon="✉️" title="Aún no se ha enviado ningún aviso" text="Se generan solos cuando una cita con correo se crea, cambia o se cancela." />
      ) : (
        <div className="mgr-table">
          {list.data.map((n) => (
            <div key={n.id} className="mgr-table-row mgr-notif-cols">
              <strong>{KIND_LABEL[n.kind] ?? n.kind}</strong>
              <span>{n.recipient}</span>
              <span title={n.last_error ?? ''}>{SEND_LABEL[n.status] ?? n.status}</span>
              <span>{formatDateTime(n.sent_at ?? n.scheduled_for, ws.center.timezone)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
