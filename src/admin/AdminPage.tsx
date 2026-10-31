// Panel de administración de Belaura (#/admin), only for platform admins (public.platform_admins).
// Two areas, each behind its own role: Cursos (academy income, students, course access) and Gestor
// (centers, their teams and member roles). The owner also manages who else is an admin.
// All data comes from security-definer functions that check the role (migration 202610310010).
import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { COURSES } from '../courses'
import { tr } from '../i18n'
import { ROLE_LABEL } from '../manager/api'
import { Empty, Modal, Notice, SectionHead } from '../manager/ui'
import { useLoad } from '../manager/useLoad'
import '../manager/manager.css'
import './admin.css'

export type PlatformRole = 'owner' | 'courses' | 'manager'

const PLATFORM_ROLE_LABEL: Record<PlatformRole, string> = {
  owner: 'Dueña (todo)',
  courses: 'Solo cursos',
  manager: 'Solo gestor',
}

const ERRORS: Record<string, string> = {
  forbidden: 'No tienes permiso para esto.',
  user_not_found: 'No hay ninguna cuenta con ese correo. Pídele que se registre primero en la app.',
  invalid_product: 'Elige un curso o plan válido.',
  invalid_role: 'Elige un rol válido.',
  last_owner: 'Tiene que quedar al menos una dueña.',
  member_not_found: 'Esa persona ya no está en el centro.',
  not_found: 'No se encontró el registro.',
}

async function call<T>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.rpc(fn, args)
  if (error) {
    const code = Object.keys(ERRORS).find((c) => error.message.includes(c))
    throw new Error(code ? ERRORS[code] : error.message)
  }
  return data as T
}

const eur = (cents: number, currency = 'EUR') =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency, maximumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100)
const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '—')
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

// Product ids as the student sees them.
const PRODUCTS: { id: string; label: string }[] = [
  { id: 'all', label: 'Pase todos los cursos' },
  { id: 'monthly', label: 'Belaura Pro mensual' },
  { id: 'yearly', label: 'Belaura Pro anual' },
  ...COURSES.filter((c) => c.premium).map((c) => ({ id: c.id, label: `${c.emoji} ${tr(c.title, 'es-ES')}` })),
]
const productLabel = (id: string) => PRODUCTS.find((p) => p.id === id)?.label ?? id

export function AdminPage({ role, area, email }: { role: PlatformRole; area: string; email: string }) {
  const tabs = [
    role !== 'manager' && { id: 'cursos', icon: '🎓', label: 'Cursos' },
    role !== 'courses' && { id: 'gestor', icon: '🗓️', label: 'Gestor' },
    role === 'owner' && { id: 'permisos', icon: '🔐', label: 'Administradores' },
  ].filter(Boolean) as { id: string; icon: string; label: string }[]
  const active = tabs.find((t) => t.id === area)?.id ?? tabs[0].id

  return (
    <div className="mgr adm">
      <div className="adm-head">
        <div>
          <span className="mgr-kicker">BELAURA · ADMINISTRACIÓN</span>
          <h1>Panel de control</h1>
          <p className="mgr-muted">
            {PLATFORM_ROLE_LABEL[role]} · {email}
          </p>
        </div>
        <nav className="adm-tabs" aria-label="Apartados">
          {tabs.map((t) => (
            <a key={t.id} href={`#/admin/${t.id}`} className={active === t.id ? 'active' : ''}>
              <span>{t.icon}</span> {t.label}
            </a>
          ))}
        </nav>
      </div>
      {active === 'cursos' ? <CoursesArea isOwner={role === 'owner'} /> : active === 'gestor' ? <ManagerArea /> : <AdminsArea />}
    </div>
  )
}

// ───────────────────────── Cursos ─────────────────────────

type AcademyOverview = {
  students: number
  new_students_30d: number
  active_7d: number
  paying_students: number
  active_subscriptions: number
  revenue_total_cents: number
  revenue_30d_cents: number
  revenue_today_cents: number
  sales_total: number
  by_month: { month: string; cents: number; sales: number }[]
  by_product: { product: string; cents: number; sales: number }[]
  recent: { at: string; email: string | null; product: string; kind: string; cents: number; currency: string }[]
}

type UserRow = {
  user_id: string
  email: string
  full_name: string | null
  created_at: string
  last_sign_in_at: string | null
  products: string[]
  points: number
  courses_started: number
  courses_done: number
  spent_cents: number
  platform_role: PlatformRole | null
  centers: string[]
}

function CoursesArea({ isOwner }: { isOwner: boolean }) {
  const overview = useLoad(() => call<AcademyOverview>('admin_academy_overview'), [], null as AcademyOverview | null)
  const o = overview.data
  const maxMonth = Math.max(1, ...(o?.by_month.map((m) => m.cents) ?? [0]))

  return (
    <>
      <Notice text={overview.error} error />
      {!o ? (
        <p className="mgr-loading">{overview.loading ? 'Cargando…' : ''}</p>
      ) : (
        <>
          <div className="mgr-metrics">
            <article>
              <span>Ingresos hoy</span>
              <strong>{eur(o.revenue_today_cents)}</strong>
            </article>
            <article>
              <span>Últimos 30 días</span>
              <strong className="good">{eur(o.revenue_30d_cents)}</strong>
            </article>
            <article>
              <span>Total facturado</span>
              <strong>{eur(o.revenue_total_cents)}</strong>
              <small>{o.sales_total} cobros</small>
            </article>
            <article>
              <span>Usuarias</span>
              <strong>{o.students}</strong>
              <small>+{o.new_students_30d} en 30 días</small>
            </article>
            <article>
              <span>De pago</span>
              <strong>{o.paying_students}</strong>
              <small>{o.active_subscriptions} suscripciones Pro</small>
            </article>
            <article>
              <span>Activas esta semana</span>
              <strong>{o.active_7d}</strong>
            </article>
          </div>

          <div className="mgr-report-grid">
            <section className="mgr-panel">
              <SectionHead title="Ingresos por mes" text="Últimos 6 meses, compras y renovaciones." />
              <div className="adm-months">
                {o.by_month.map((m) => (
                  <div key={m.month} className="adm-month" title={`${m.sales} cobros`}>
                    <strong>{m.cents ? eur(m.cents) : ''}</strong>
                    <div className="adm-month-bar" style={{ height: `${Math.max(3, (m.cents / maxMonth) * 100)}%` }} />
                    <span>{MONTHS[Number(m.month.slice(5)) - 1]}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="mgr-panel">
              <SectionHead title="Lo que más se vende" />
              {o.by_product.length === 0 ? (
                <Empty icon="🛍️" title="Todavía no hay ventas" text="Aparecerán aquí en cuanto Stripe confirme el primer pago." />
              ) : (
                <div className="mgr-bars">
                  {o.by_product.map((p) => (
                    <div key={p.product} className="mgr-bar-row">
                      <span>{productLabel(p.product)}</span>
                      <div className="mgr-bar-track">
                        <div className="mgr-bar" style={{ width: `${Math.max(2, (p.cents / Math.max(1, o.by_product[0].cents)) * 100)}%` }} />
                      </div>
                      <strong>
                        {eur(p.cents)} <small className="mgr-muted">· {p.sales}</small>
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {o.recent.length > 0 && (
            <section className="mgr-panel">
              <SectionHead title="Últimos cobros" />
              <div className="mgr-table">
                <div className="mgr-table-head adm-sale-cols">
                  <span>Fecha</span>
                  <span>Usuaria</span>
                  <span>Producto</span>
                  <span>Importe</span>
                </div>
                {o.recent.map((s, i) => (
                  <div key={i} className="mgr-table-row adm-sale-cols">
                    <span>{day(s.at)}</span>
                    <div>{s.email ?? '—'}</div>
                    <div>
                      {productLabel(s.product)}
                      <small>{s.kind === 'renewal' ? 'Renovación' : 'Compra'}</small>
                    </div>
                    <strong>{eur(s.cents, s.currency)}</strong>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
      <UsersPanel isOwner={isOwner} />
    </>
  )
}

function UsersPanel({ isOwner }: { isOwner: boolean }) {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<UserRow | null>(null)
  const [creating, setCreating] = useState(false)
  const users = useLoad(() => call<UserRow[]>('admin_list_users', { p_search: query || null, p_limit: 200 }), [query], [] as UserRow[])

  return (
    <section className="mgr-panel">
      <SectionHead title="Usuarias" text="Toca una para ver y cambiar a qué cursos tiene acceso.">
        <button className="mgr-primary" onClick={() => setCreating(true)}>
          + Dar de alta
        </button>
      </SectionHead>
      <form
        className="adm-search"
        onSubmit={(e) => {
          e.preventDefault()
          setQuery(search.trim())
        }}
      >
        <input type="search" placeholder="Buscar por correo o nombre" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="mgr-secondary">Buscar</button>
      </form>
      <Notice text={users.error} error />
      {users.data.length === 0 && !users.loading ? (
        <Empty icon="👤" title="Sin resultados" />
      ) : (
        <div className="mgr-table">
          <div className="mgr-table-head adm-user-cols">
            <span>Usuaria</span>
            <span>Alta / último acceso</span>
            <span>Acceso</span>
            <span>Progreso</span>
            <span>Gastado</span>
          </div>
          {users.data.map((u) => (
            <button key={u.user_id} className="mgr-table-row adm-user-cols" onClick={() => setOpen(u)}>
              <div>
                <strong>
                  {u.full_name || u.email.split('@')[0]}
                  {u.platform_role && <em className="adm-tag">{PLATFORM_ROLE_LABEL[u.platform_role]}</em>}
                </strong>
                <small>{u.email}</small>
              </div>
              <div>
                <span>{day(u.created_at)}</span>
                <small>{u.last_sign_in_at ? `Entró ${day(u.last_sign_in_at)}` : 'Nunca ha entrado'}</small>
              </div>
              <div>
                <span>{u.products.length ? u.products.map(productLabel).join(', ') : 'Solo cursos gratis'}</span>
                {u.centers.length > 0 && <small>Gestor: {u.centers.join(', ')}</small>}
              </div>
              <div>
                <span>⭐ {u.points}</span>
                <small>
                  {u.courses_done} terminados de {u.courses_started}
                </small>
              </div>
              <strong>{eur(u.spent_cents)}</strong>
            </button>
          ))}
        </div>
      )}
      {creating && <NewUser onClose={() => setCreating(false)} onCreated={() => users.reload()} />}
      {open && (
        <UserDetail
          user={open}
          isOwner={isOwner}
          onClose={() => setOpen(null)}
          onChanged={() => users.reload()}
        />
      )}
    </section>
  )
}

const CREATE_ERRORS: Record<string, string> = {
  invalid_email: 'Revisa el correo electrónico.',
  weak_password: 'La contraseña debe tener al menos 8 caracteres.',
  user_exists: 'Ya existe una cuenta con ese correo. Búscala en la lista para darle acceso.',
  forbidden: 'Tu rol no permite dar de alta usuarias.',
  login_required: 'Tu sesión ha caducado. Vuelve a entrar.',
  not_configured: 'Falta configurar SUPABASE_SERVICE_ROLE_KEY en Vercel.',
}

function NewUser({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [product, setProduct] = useState('')
  const [duration, setDuration] = useState('forever')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState<{ email: string; password?: string } | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { data } = await supabase.auth.getSession()
      const res = await fetch('/api/admin-users', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${data.session?.access_token ?? ''}` },
        body: JSON.stringify({
          email,
          full_name: name,
          password: password || undefined,
          product: product || null,
          days: duration === 'month' ? 31 : duration === 'year' ? 365 : 0,
        }),
      })
      const out = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; password?: string; warning?: string }
      if (!res.ok || !out.ok) throw new Error(CREATE_ERRORS[out.error ?? ''] ?? 'No se pudo crear la cuenta.')
      setDone({ email: email.trim().toLowerCase(), password: out.password })
      if (out.warning) setError('La cuenta se creó, pero no se pudo dar el acceso. Dáselo desde su ficha.')
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title="Dar de alta una usuaria" kicker="NUEVA CUENTA" onClose={onClose}>
      <Notice text={error} error />
      {done ? (
        <div className="adm-done">
          <p>
            ✓ Cuenta creada para <strong>{done.email}</strong>.
          </p>
          {done.password ? (
            <>
              <p>Contraseña temporal (cópiala ahora, no se volverá a mostrar):</p>
              <p className="mgr-share adm-password">{done.password}</p>
            </>
          ) : (
            <p>Ya puede entrar con la contraseña que has elegido.</p>
          )}
          <p className="mgr-footnote">Si su correo es de Gmail, también puede entrar con «Continuar con Google». Puede cambiar la contraseña con «He olvidado mi contraseña».</p>
          <div className="mgr-form-actions">
            <button className="mgr-primary" onClick={onClose}>
              Listo
            </button>
          </div>
        </div>
      ) : (
        <form className="mgr-form" onSubmit={(e) => void submit(e)}>
          <label>
            Correo electrónico
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nombre@ejemplo.com" />
          </label>
          <label>
            Nombre
            <input value={name} maxLength={140} onChange={(e) => setName(e.target.value)} placeholder="Opcional" />
          </label>
          <label>
            Contraseña
            <input value={password} minLength={8} onChange={(e) => setPassword(e.target.value)} placeholder="Déjala vacía y se genera una temporal" />
          </label>
          <label>
            Acceso inicial
            <select value={product} onChange={(e) => setProduct(e.target.value)}>
              <option value="">Solo cursos gratis</option>
              {PRODUCTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          {product && (
            <label>
              Duración del acceso
              <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                <option value="forever">Para siempre</option>
                <option value="month">1 mes</option>
                <option value="year">1 año</option>
              </select>
            </label>
          )}
          <div className="mgr-form-actions">
            <button type="button" className="mgr-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button className="mgr-primary" disabled={busy}>
              {busy ? 'Creando…' : 'Crear cuenta'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}

type Entitlement = { id: string; product: string; active: boolean; expires_at: string | null; source: 'stripe' | 'manual'; note: string | null; created_at: string }

function UserDetail({ user, isOwner, onClose, onChanged }: { user: UserRow; isOwner: boolean; onClose: () => void; onChanged: () => void }) {
  const list = useLoad(() => call<Entitlement[]>('admin_user_entitlements', { p_user: user.user_id }), [user.user_id], [] as Entitlement[])
  const [product, setProduct] = useState('all')
  const [duration, setDuration] = useState('forever')
  const [note, setNote] = useState('')
  const [role, setRole] = useState<string>(user.platform_role ?? '')
  const [msg, setMsg] = useState({ text: '', error: false })
  const [busy, setBusy] = useState(false)

  const act = async (fn: () => Promise<unknown>, ok: string) => {
    setBusy(true)
    try {
      await fn()
      setMsg({ text: ok, error: false })
      list.reload()
      onChanged()
    } catch (e) {
      setMsg({ text: e instanceof Error ? e.message : String(e), error: true })
    } finally {
      setBusy(false)
    }
  }

  const grant = (e: FormEvent) => {
    e.preventDefault()
    const days = duration === 'month' ? 31 : duration === 'year' ? 365 : 0
    const expires = days ? new Date(Date.now() + days * 86400000).toISOString() : null
    void act(() => call('admin_grant_product', { p_user: user.user_id, p_product: product, p_expires_at: expires, p_note: note || null }), `Acceso dado: ${productLabel(product)}.`)
    setNote('')
  }

  return (
    <Modal title={user.full_name || user.email} kicker={user.email} onClose={onClose} wide>
      <Notice text={msg.text} error={msg.error} onClose={() => setMsg({ text: '', error: false })} />
      <h3 className="mgr-subhead">Cursos y planes</h3>
      {list.data.length === 0 ? (
        <p className="mgr-muted">No tiene ningún curso de pago.</p>
      ) : (
        <div className="mgr-table">
          {list.data.map((e) => {
            const expired = e.expires_at !== null && new Date(e.expires_at).getTime() < Date.now()
            return (
              <div key={e.id} className={`mgr-table-row adm-ent-cols ${e.active && !expired ? '' : 'inactive'}`}>
                <div>
                  <strong>{productLabel(e.product)}</strong>
                  <small>
                    {e.source === 'stripe' ? 'Pagado con Stripe' : `Dado a mano${e.note ? ` · ${e.note}` : ''}`} · {day(e.created_at)}
                  </small>
                </div>
                <span>{e.expires_at ? `${expired ? 'Caducó' : 'Hasta'} ${day(e.expires_at)}` : 'Para siempre'}</span>
                <button
                  className={`mgr-secondary small ${e.active ? 'danger' : ''}`}
                  disabled={busy}
                  onClick={() => void act(() => call('admin_set_entitlement_active', { p_id: e.id, p_active: !e.active }), e.active ? 'Acceso quitado.' : 'Acceso devuelto.')}
                >
                  {e.active ? 'Quitar acceso' : 'Devolver acceso'}
                </button>
              </div>
            )
          })}
        </div>
      )}
      <p className="mgr-footnote">Quitar el acceso aquí no devuelve el dinero: los reembolsos se hacen en Stripe.</p>

      <h3 className="mgr-subhead">Dar acceso gratis</h3>
      <form className="adm-grant" onSubmit={grant}>
        <select value={product} onChange={(e) => setProduct(e.target.value)} aria-label="Curso o plan">
          {PRODUCTS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <select value={duration} onChange={(e) => setDuration(e.target.value)} aria-label="Duración">
          <option value="forever">Para siempre</option>
          <option value="month">1 mes</option>
          <option value="year">1 año</option>
        </select>
        <input placeholder="Motivo (opcional)" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
        <button className="mgr-primary" disabled={busy}>
          Dar acceso
        </button>
      </form>

      {isOwner && (
        <>
          <h3 className="mgr-subhead">Permisos de administración</h3>
          <div className="adm-grant">
            <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Rol de administración">
              <option value="">Sin acceso al panel</option>
              {(Object.keys(PLATFORM_ROLE_LABEL) as PlatformRole[]).map((r) => (
                <option key={r} value={r}>
                  {PLATFORM_ROLE_LABEL[r]}
                </option>
              ))}
            </select>
            <button
              className="mgr-secondary"
              disabled={busy || role === (user.platform_role ?? '')}
              onClick={() => void act(() => call('admin_set_platform_role', { p_email: user.email, p_role: role || null }), 'Permisos guardados.')}
            >
              Guardar permisos
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}

// ───────────────────────── Gestor ─────────────────────────

type CenterRow = {
  id: string
  name: string
  slug: string | null
  currency: string
  created_at: string
  owner_email: string | null
  members: number
  clients: number
  appointments_30d: number
  last_activity: string | null
  takings_30d_cents: number
}
type ManagerOverview = { centers: number; new_centers_30d: number; members: number; clients: number; appointments_30d: number; list: CenterRow[] }

function ManagerArea() {
  const overview = useLoad(() => call<ManagerOverview>('admin_manager_overview'), [], null as ManagerOverview | null)
  const [open, setOpen] = useState<CenterRow | null>(null)
  const o = overview.data

  return (
    <>
      <Notice text={overview.error} error />
      {!o ? (
        <p className="mgr-loading">{overview.loading ? 'Cargando…' : ''}</p>
      ) : (
        <>
          <div className="mgr-metrics">
            <article>
              <span>Centros</span>
              <strong>{o.centers}</strong>
              <small>+{o.new_centers_30d} en 30 días</small>
            </article>
            <article>
              <span>Personas en equipos</span>
              <strong>{o.members}</strong>
            </article>
            <article>
              <span>Clientas registradas</span>
              <strong>{o.clients}</strong>
            </article>
            <article>
              <span>Citas (30 días)</span>
              <strong>{o.appointments_30d}</strong>
            </article>
            <article>
              <span>Ingresos del gestor</span>
              <strong>{eur(0)}</strong>
              <small>El gestor aún no se cobra a los centros</small>
            </article>
          </div>
          <section className="mgr-panel">
            <SectionHead title="Centros" text="Toca un centro para ver su equipo y cambiar roles." />
            {o.list.length === 0 ? (
              <Empty icon="🏪" title="Aún no hay centros" />
            ) : (
              <div className="mgr-table">
                <div className="mgr-table-head adm-center-cols">
                  <span>Centro</span>
                  <span>Equipo</span>
                  <span>Clientas</span>
                  <span>Citas 30 d</span>
                  <span>Caja 30 d</span>
                  <span>Alta</span>
                </div>
                {o.list.map((c) => (
                  <button key={c.id} className="mgr-table-row adm-center-cols" onClick={() => setOpen(c)}>
                    <div>
                      <strong>{c.name}</strong>
                      <small>{c.owner_email ?? 'Sin propietaria'}</small>
                    </div>
                    <span>{c.members}</span>
                    <span>{c.clients}</span>
                    <span>{c.appointments_30d}</span>
                    <strong>{eur(c.takings_30d_cents, c.currency)}</strong>
                    <div>
                      <span>{day(c.created_at)}</span>
                      <small>{c.last_activity ? `Última cita creada ${day(c.last_activity)}` : 'Sin actividad'}</small>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <p className="mgr-footnote">"Caja" es lo que cobra cada centro a sus clientas, no dinero de Belaura.</p>
          </section>
        </>
      )}
      {open && <CenterDetail center={open} onClose={() => setOpen(null)} onChanged={() => overview.reload()} />}
    </>
  )
}

type MemberRow = { user_id: string; email: string; full_name: string | null; role: string; active: boolean; joined_at: string }

function CenterDetail({ center, onClose, onChanged }: { center: CenterRow; onClose: () => void; onChanged: () => void }) {
  const members = useLoad(() => call<MemberRow[]>('admin_center_members', { p_center: center.id }), [center.id], [] as MemberRow[])
  const [msg, setMsg] = useState({ text: '', error: false })

  const save = async (m: MemberRow, role: string, active: boolean) => {
    try {
      await call('admin_set_member', { p_center: center.id, p_user: m.user_id, p_role: role, p_active: active })
      setMsg({ text: 'Cambios guardados.', error: false })
      members.reload()
      onChanged()
    } catch (e) {
      setMsg({ text: e instanceof Error ? e.message : String(e), error: true })
    }
  }

  return (
    <Modal title={center.name} kicker="EQUIPO DEL CENTRO" onClose={onClose} wide>
      <Notice text={msg.text} error={msg.error} onClose={() => setMsg({ text: '', error: false })} />
      <div className="mgr-table">
        <div className="mgr-table-head adm-member-cols">
          <span>Persona</span>
          <span>Rol</span>
          <span>Acceso</span>
        </div>
        {members.data.map((m) => (
          <div key={m.user_id} className={`mgr-table-row adm-member-cols ${m.active ? '' : 'inactive'}`}>
            <div>
              <strong>{m.full_name || m.email}</strong>
              <small>
                {m.email} · desde {day(m.joined_at)}
              </small>
            </div>
            <select value={m.role} onChange={(e) => void save(m, e.target.value, m.active)} aria-label="Rol">
              {Object.entries(ROLE_LABEL).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
            <button className={`mgr-secondary small ${m.active ? 'danger' : ''}`} onClick={() => void save(m, m.role, !m.active)}>
              {m.active ? 'Quitar acceso' : 'Devolver acceso'}
            </button>
          </div>
        ))}
      </div>
      {center.slug && (
        <p className="mgr-footnote">
          Página de reservas: <a href={`#/reservar/${center.slug}`}>#/reservar/{center.slug}</a>
        </p>
      )}
    </Modal>
  )
}

// ───────────────────────── Administradores ─────────────────────────

type AdminRow = { user_id: string; email: string; role: PlatformRole; created_at: string }

function AdminsArea() {
  const admins = useLoad(() => call<AdminRow[]>('admin_list_admins'), [], [] as AdminRow[])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<PlatformRole>('courses')
  const [msg, setMsg] = useState({ text: '', error: false })

  const setAdmin = async (target: string, next: PlatformRole | null, ok: string) => {
    try {
      await call('admin_set_platform_role', { p_email: target, p_role: next })
      setMsg({ text: ok, error: false })
      admins.reload()
    } catch (e) {
      setMsg({ text: e instanceof Error ? e.message : String(e), error: true })
    }
  }

  return (
    <section className="mgr-panel">
      <SectionHead title="Administradores" text="Quién puede entrar a este panel y a qué apartado." />
      <Notice text={msg.text || admins.error} error={msg.error || !!admins.error} onClose={() => setMsg({ text: '', error: false })} />
      <div className="mgr-table">
        {admins.data.map((a) => (
          <div key={a.user_id} className="mgr-table-row adm-admin-cols">
            <div>
              <strong>{a.email}</strong>
              <small>Desde {day(a.created_at)}</small>
            </div>
            <select value={a.role} onChange={(e) => void setAdmin(a.email, e.target.value as PlatformRole, 'Rol cambiado.')} aria-label="Rol">
              {(Object.keys(PLATFORM_ROLE_LABEL) as PlatformRole[]).map((r) => (
                <option key={r} value={r}>
                  {PLATFORM_ROLE_LABEL[r]}
                </option>
              ))}
            </select>
            <button className="mgr-secondary small danger" onClick={() => void setAdmin(a.email, null, 'Acceso al panel quitado.')}>
              Quitar
            </button>
          </div>
        ))}
      </div>
      <h3 className="mgr-subhead">Añadir a alguien</h3>
      <form
        className="adm-grant"
        onSubmit={(e) => {
          e.preventDefault()
          void setAdmin(email, role, `${email} ya puede entrar al panel.`)
          setEmail('')
        }}
      >
        <input type="email" required placeholder="correo@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <select value={role} onChange={(e) => setRole(e.target.value as PlatformRole)} aria-label="Rol">
          {(Object.keys(PLATFORM_ROLE_LABEL) as PlatformRole[]).map((r) => (
            <option key={r} value={r}>
              {PLATFORM_ROLE_LABEL[r]}
            </option>
          ))}
        </select>
        <button className="mgr-primary">Añadir</button>
      </form>
      <p className="mgr-footnote">La persona tiene que haberse registrado antes en la app con ese correo.</p>
    </section>
  )
}
