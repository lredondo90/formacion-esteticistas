import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { dispatchNotifications, ROLE_LABEL, rpc, run } from '../api'
import { useWorkspace } from '../context'
import { formatDateTime, fromZoned, todayIn, WEEK_ORDER, WEEKDAYS } from '../time'
import type { Role, Staff, TimeOff, WorkingHour } from '../types'
import { Empty, Modal, Notice, SectionHead } from '../ui'
import { useLoad } from '../useLoad'

type Member = { user_id: string; role: Role; active: boolean; full_name: string | null; email: string; staff_id: string | null; joined_at: string }
type Invitation = { id: string; email: string; role: Role; token: string; created_at: string; expires_at: string; accepted_at: string | null; revoked_at: string | null }

const COLORS = ['#b64f78', '#7c5cbf', '#c9853a', '#3a8fc9', '#3aa57a', '#d0567a', '#5f6b7a']

export function Team() {
  const ws = useWorkspace()
  const { center } = ws
  const [editing, setEditing] = useState<Staff | 'new' | null>(null)
  const [inviting, setInviting] = useState<{ staffId?: string; email?: string } | null>(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const members = useLoad(() => rpc<Member[]>('list_center_members', { p_center: center.id }), [center.id], [] as Member[])
  const invites = useLoad(
    () =>
      run(
        supabase.from('center_invitations').select('*').eq('center_id', center.id).is('accepted_at', null).is('revoked_at', null).gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }),
      ) as Promise<Invitation[]>,
    [center.id],
    [] as Invitation[],
  )

  async function act(fn: () => Promise<unknown>, message: string) {
    setError('')
    try {
      await fn()
      setNotice(message)
      members.reload()
      invites.reload()
      await ws.reloadCatalog()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  const inviteLink = (token: string) => `${location.origin}/#/gestor?invitacion=${token}`

  return (
    <>
      <section className="mgr-panel">
        <SectionHead title="Profesionales" text="Fichas del equipo para la agenda. No necesitan cuenta para aparecer en ella.">
          <button className="mgr-primary" onClick={() => setEditing('new')}>
            ＋ Añadir profesional
          </button>
        </SectionHead>
        <Notice text={notice} onClose={() => setNotice('')} />
        <Notice text={error} error />
        <div className="mgr-staff-grid">
          {ws.staff.map((s) => (
            <article key={s.id} className={`mgr-staff-card ${s.active ? '' : 'inactive'}`}>
              <i style={{ background: s.color }}>{s.display_name.slice(0, 1).toUpperCase()}</i>
              <div>
                <strong>{s.display_name}</strong>
                <span>{s.role_title || 'Profesional'}</span>
                <small>
                  {s.user_id ? '✓ Con acceso a la app' : 'Sin acceso a la app'}
                  {!s.bookable && ' · No recibe reservas online'}
                  {!s.active && ' · Inactiva'}
                </small>
              </div>
              <div className="mgr-row-actions">
                <button className="mgr-link" onClick={() => setEditing(s)}>
                  Editar y horario
                </button>
                {!s.user_id && s.active && (
                  <button className="mgr-link" onClick={() => setInviting({ staffId: s.id, email: s.email ?? '' })}>
                    Dar acceso
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mgr-panel">
        <SectionHead title="Accesos y permisos" text="Quién puede entrar al gestor y qué puede hacer">
          <button className="mgr-secondary" onClick={() => setInviting({})}>
            Invitar por correo
          </button>
        </SectionHead>
        <div className="mgr-roles-help">
          <p>
            <strong>Propietaria</strong> todo, incluida la exportación de datos · <strong>Administración</strong> todo salvo exportar · <strong>Recepción</strong> agenda, clientes y
            caja (sin notas de salud ni devoluciones) · <strong>Profesional</strong> su agenda y las fichas de sus clientas.
          </p>
        </div>
        <Notice text={members.error} error />
        <div className="mgr-table">
          {members.data.map((m) => (
            <div key={m.user_id} className="mgr-table-row mgr-member-cols">
              <div>
                <strong>{m.full_name || m.email}</strong>
                <small>{m.email}</small>
              </div>
              <select
                value={m.role}
                disabled={m.user_id === ws.userId}
                onChange={(e) => void act(() => rpc('set_member_role', { p_center: center.id, p_user: m.user_id, p_role: e.target.value, p_active: m.active }), 'Rol actualizado.')}
                aria-label="Rol"
              >
                {Object.entries(ROLE_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <span>{m.active ? 'Activa' : 'Sin acceso'}</span>
              {m.user_id !== ws.userId ? (
                <button
                  className="mgr-link"
                  onClick={() => void act(() => rpc('set_member_role', { p_center: center.id, p_user: m.user_id, p_role: m.role, p_active: !m.active }), m.active ? 'Acceso retirado.' : 'Acceso restablecido.')}
                >
                  {m.active ? 'Quitar acceso' : 'Devolver acceso'}
                </button>
              ) : (
                <span className="mgr-muted">Tú</span>
              )}
            </div>
          ))}
        </div>
        {invites.data.length > 0 && (
          <>
            <h3 className="mgr-subtitle">Invitaciones pendientes</h3>
            <div className="mgr-table">
              {invites.data.map((i) => (
                <div key={i.id} className="mgr-table-row mgr-member-cols">
                  <div>
                    <strong>{i.email}</strong>
                    <small>Caduca {formatDateTime(i.expires_at, center.timezone)}</small>
                  </div>
                  <span>{ROLE_LABEL[i.role]}</span>
                  <button className="mgr-link" onClick={() => void navigator.clipboard?.writeText(inviteLink(i.token)).then(() => setNotice('Enlace copiado.'))}>
                    Copiar enlace
                  </button>
                  <button className="mgr-link muted" onClick={() => void act(() => rpc('revoke_invitation', { p_invitation: i.id }), 'Invitación anulada.')}>
                    Anular
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {editing && <StaffForm staff={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={(msg) => (setEditing(null), setNotice(msg))} />}
      {inviting && (
        <InviteForm
          preset={inviting}
          onClose={() => setInviting(null)}
          onSent={(token, email) => {
            setInviting(null)
            dispatchNotifications()
            invites.reload()
            setNotice(`Invitación enviada a ${email}. También puedes compartir este enlace: ${inviteLink(token)}`)
          }}
        />
      )}
    </>
  )
}

function InviteForm({ preset, onClose, onSent }: { preset: { staffId?: string; email?: string }; onClose: () => void; onSent: (token: string, email: string) => void }) {
  const ws = useWorkspace()
  const [email, setEmail] = useState(preset.email ?? '')
  const [role, setRole] = useState<Role>(preset.staffId ? 'professional' : 'reception')
  const [staffId, setStaffId] = useState(preset.staffId ?? '')
  const [error, setError] = useState('')

  async function send(e: FormEvent) {
    e.preventDefault()
    try {
      const token = await rpc<string>('invite_member', { p_center: ws.center.id, p_email: email.trim(), p_role: role, p_staff: staffId || null })
      onSent(token, email.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <Modal title="Invitar al equipo" kicker="EQUIPO" onClose={onClose}>
      <form className="mgr-form" onSubmit={send}>
        <label>
          Correo de la persona
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Rol
          <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
            {Object.entries(ROLE_LABEL)
              .filter(([k]) => k !== 'owner' || ws.role === 'owner')
              .map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
          </select>
        </label>
        <label>
          Vincular con la ficha de profesional
          <select value={staffId} onChange={(e) => setStaffId(e.target.value)}>
            <option value="">{role === 'professional' ? 'Crear una ficha nueva al aceptar' : 'Sin ficha (no atiende citas)'}</option>
            {ws.staff
              .filter((s) => !s.user_id && s.active)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.display_name}
                </option>
              ))}
          </select>
        </label>
        <p className="mgr-footnote">La invitación caduca en 7 días. Debe entrar o registrarse con este mismo correo.</p>
        <Notice text={error} error />
        <div className="mgr-form-actions">
          <button type="button" className="mgr-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="mgr-primary">Enviar invitación</button>
        </div>
      </form>
    </Modal>
  )
}

function StaffForm({ staff, onClose, onSaved }: { staff: Staff | null; onClose: () => void; onSaved: (message: string) => void }) {
  const ws = useWorkspace()
  const { center } = ws
  const tz = center.timezone
  const [name, setName] = useState(staff?.display_name ?? '')
  const [title, setTitle] = useState(staff?.role_title ?? '')
  const [email, setEmail] = useState(staff?.email ?? '')
  const [phone, setPhone] = useState(staff?.phone ?? '')
  const [color, setColor] = useState(staff?.color ?? COLORS[ws.staff.length % COLORS.length])
  const [bookable, setBookable] = useState(staff?.bookable ?? true)
  const [commission, setCommission] = useState(String(staff?.commission_percent ?? 0))
  const [active, setActive] = useState(staff?.active ?? true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const hours = useLoad(
    () => (staff ? (run(supabase.from('staff_working_hours').select('*').eq('staff_id', staff.id).order('weekday').order('starts_at')) as Promise<WorkingHour[]>) : Promise.resolve([])),
    [staff?.id],
    [] as WorkingHour[],
  )
  const off = useLoad(
    () =>
      staff
        ? (run(supabase.from('staff_time_off').select('*').eq('staff_id', staff.id).gte('ends_at', new Date().toISOString()).order('starts_at')) as Promise<TimeOff[]>)
        : Promise.resolve([]),
    [staff?.id],
    [] as TimeOff[],
  )
  const [newHour, setNewHour] = useState({ weekday: 1, from: '09:30', to: '14:00' })
  const [newOff, setNewOff] = useState({ fromDate: todayIn(tz), fromTime: '09:00', toDate: todayIn(tz), toTime: '20:00', reason: 'Vacaciones' })

  async function save(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const values = {
        center_id: center.id,
        display_name: name.trim(),
        role_title: title.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        color,
        bookable,
        commission_percent: Math.min(100, Math.max(0, Number(commission.replace(',', '.')) || 0)),
        active,
      }
      await run(staff ? supabase.from('staff').update(values).eq('id', staff.id) : supabase.from('staff').insert(values))
      await ws.reloadCatalog()
      onSaved(staff ? 'Ficha actualizada.' : 'Profesional añadida. Ya aparece en la agenda.')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  async function mutate(fn: () => Promise<unknown>, reload: () => void) {
    setError('')
    try {
      await fn()
      reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <Modal title={staff ? staff.display_name : 'Nueva profesional'} kicker="EQUIPO" onClose={onClose} wide>
      <form className="mgr-form" onSubmit={save}>
        <div className="mgr-form-grid">
          <label>
            Nombre que se verá en la agenda
            <input required minLength={1} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Puesto o especialidad
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Esteticista, masajista…" maxLength={80} />
          </label>
          <label>
            Correo
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Teléfono
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label>
            Comisión sobre tratamientos (%)
            <input inputMode="decimal" value={commission} onChange={(e) => setCommission(e.target.value)} placeholder="0" />
            <small className="mgr-muted">Se calcula al marcar cada cita como realizada y sale en Informes.</small>
          </label>
        </div>
        <div className="mgr-form-grid three">
          <label>
            Color
            <div className="mgr-colors">
              {COLORS.map((c) => (
                <button type="button" key={c} className={color === c ? 'on' : ''} style={{ background: c }} onClick={() => setColor(c)} aria-label={c} />
              ))}
            </div>
          </label>
          <label className="mgr-check">
            <input type="checkbox" checked={bookable} onChange={(e) => setBookable(e.target.checked)} /> Recibe reservas online
          </label>
          <label className="mgr-check">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Activa
          </label>
        </div>
        <Notice text={error} error />
        <div className="mgr-form-actions">
          <button type="button" className="mgr-secondary" onClick={onClose}>
            Cerrar
          </button>
          <button className="mgr-primary" disabled={busy}>
            Guardar ficha
          </button>
        </div>
      </form>

      {staff && (
        <>
          <h3 className="mgr-subtitle">Horario de trabajo</h3>
          <p className="mgr-footnote">Sin horario propio, se usa el horario del centro. Puedes añadir dos tramos el mismo día (mañana y tarde).</p>
          <div className="mgr-hours">
            {WEEK_ORDER.map((d) => {
              const rows = hours.data.filter((h) => h.weekday === d)
              return (
                <div key={d}>
                  <strong>{WEEKDAYS[d]}</strong>
                  {rows.length === 0 ? (
                    <span className="mgr-muted">{hours.data.length ? 'Libre' : 'Horario del centro'}</span>
                  ) : (
                    rows.map((h) => (
                      <span key={h.id} className="mgr-hour-chip">
                        {h.starts_at.slice(0, 5)}–{h.ends_at.slice(0, 5)}
                        <button type="button" aria-label="Quitar tramo" onClick={() => void mutate(() => run(supabase.from('staff_working_hours').delete().eq('id', h.id)), hours.reload)}>
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
              void mutate(
                () =>
                  run(
                    supabase.from('staff_working_hours').insert({ center_id: center.id, staff_id: staff.id, weekday: newHour.weekday, starts_at: newHour.from, ends_at: newHour.to }),
                  ),
                hours.reload,
              )
            }}
          >
            <label>
              Día
              <select value={newHour.weekday} onChange={(e) => setNewHour({ ...newHour, weekday: Number(e.target.value) })}>
                {WEEK_ORDER.map((d) => (
                  <option key={d} value={d}>
                    {WEEKDAYS[d]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Desde
              <input type="time" value={newHour.from} onChange={(e) => setNewHour({ ...newHour, from: e.target.value })} />
            </label>
            <label>
              Hasta
              <input type="time" value={newHour.to} onChange={(e) => setNewHour({ ...newHour, to: e.target.value })} />
            </label>
            <button className="mgr-secondary">Añadir tramo</button>
          </form>

          <h3 className="mgr-subtitle">Vacaciones, descansos y bloqueos</h3>
          {off.data.length === 0 ? (
            <Empty icon="🌴" title="Sin ausencias próximas" />
          ) : (
            <div className="mgr-table">
              {off.data.map((o) => (
                <div key={o.id} className="mgr-table-row mgr-off-cols">
                  <span>
                    {formatDateTime(o.starts_at, tz)} → {formatDateTime(o.ends_at, tz)}
                  </span>
                  <span>{o.reason || 'Bloqueo'}</span>
                  <button className="mgr-link muted" onClick={() => void mutate(() => run(supabase.from('staff_time_off').delete().eq('id', o.id)), off.reload)}>
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}
          <form
            className="mgr-inline-form"
            onSubmit={(e) => {
              e.preventDefault()
              void mutate(
                () =>
                  run(
                    supabase.from('staff_time_off').insert({
                      center_id: center.id,
                      staff_id: staff.id,
                      starts_at: fromZoned(newOff.fromDate, newOff.fromTime, tz),
                      ends_at: fromZoned(newOff.toDate, newOff.toTime, tz),
                      reason: newOff.reason.trim() || null,
                      created_by: ws.userId,
                    }),
                  ),
                off.reload,
              )
            }}
          >
            <div className="mgr-form-grid four">
              <label>
                Desde
                <input type="date" value={newOff.fromDate} onChange={(e) => setNewOff({ ...newOff, fromDate: e.target.value, toDate: e.target.value > newOff.toDate ? e.target.value : newOff.toDate })} />
              </label>
              <label>
                Hora
                <input type="time" value={newOff.fromTime} onChange={(e) => setNewOff({ ...newOff, fromTime: e.target.value })} />
              </label>
              <label>
                Hasta
                <input type="date" value={newOff.toDate} onChange={(e) => setNewOff({ ...newOff, toDate: e.target.value })} />
              </label>
              <label>
                Hora
                <input type="time" value={newOff.toTime} onChange={(e) => setNewOff({ ...newOff, toTime: e.target.value })} />
              </label>
            </div>
            <div className="mgr-form-grid">
              <label>
                Motivo
                <input value={newOff.reason} onChange={(e) => setNewOff({ ...newOff, reason: e.target.value })} placeholder="Vacaciones, formación, descanso…" />
              </label>
              <button className="mgr-secondary">Añadir bloqueo</button>
            </div>
          </form>
        </>
      )}
    </Modal>
  )
}
