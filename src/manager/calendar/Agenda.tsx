import { useMemo, useState, type MouseEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { run, STATUS_LABEL } from '../api'
import { useWorkspace } from '../context'
import { addDays, formatDay, hhmm, minutesOf, startOfWeek, todayIn, toZoned, weekday, WEEK_ORDER, fromZoned } from '../time'
import type { Appointment, Closure, TimeOff } from '../types'
import { SectionHead } from '../ui'
import { useLoad } from '../useLoad'
import { AppointmentDetail } from './AppointmentDetail'
import { AppointmentForm, type FormPreset } from './AppointmentForm'
import { Waitlist } from './Waitlist'

type Row = Appointment & { clients: { name: string; phone: string | null } | null }
type View = 'day' | 'week' | 'month'

const PX_PER_MIN = 1.1
const CLOSED = ['cancelled', 'rejected', 'expired']

export function Agenda({ params }: { params: URLSearchParams }) {
  const ws = useWorkspace()
  const { center } = ws
  const tz = center.timezone
  const [view, setView] = useState<View>('day')
  const [date, setDate] = useState(params.get('dia') ?? todayIn(tz))
  const [staffFilter, setStaffFilter] = useState(ws.role === 'professional' && ws.me ? ws.me.id : '')
  const [resourceFilter, setResourceFilter] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [showCancelled, setShowCancelled] = useState(false)
  const [preset, setPreset] = useState<FormPreset | null>(params.get('nueva') ? {} : null)
  const [openId, setOpenId] = useState<string | null>(params.get('cita'))
  const [waitlist, setWaitlist] = useState(false)

  const range = useMemo(() => {
    if (view === 'day') return { from: date, to: addDays(date, 1) }
    if (view === 'week') {
      const from = startOfWeek(date)
      return { from, to: addDays(from, 7) }
    }
    const first = `${date.slice(0, 7)}-01`
    const from = startOfWeek(first)
    return { from, to: addDays(from, 42) }
  }, [view, date])

  const { data, reload, loading, error } = useLoad(
    async () => {
      const [appts, off, closures] = await Promise.all([
        run(
          supabase
            .from('appointments')
            .select('*, clients(name, phone)')
            .eq('center_id', center.id)
            .gte('starts_at', fromZoned(range.from, '00:00', tz))
            .lt('starts_at', fromZoned(range.to, '00:00', tz))
            .order('starts_at'),
        ),
        ws.can('owner', 'admin', 'reception') || ws.me
          ? run(
              supabase
                .from('staff_time_off')
                .select('*')
                .eq('center_id', center.id)
                .lt('starts_at', fromZoned(range.to, '00:00', tz))
                .gt('ends_at', fromZoned(range.from, '00:00', tz)),
            )
          : Promise.resolve([]),
        run(supabase.from('center_closures').select('*').eq('center_id', center.id).lte('starts_on', range.to).gte('ends_on', range.from)),
      ])
      return { appts: appts as Row[], off: off as TimeOff[], closures: closures as Closure[] }
    },
    [center.id, range.from, range.to],
    { appts: [] as Row[], off: [] as TimeOff[], closures: [] as Closure[] },
  )

  const visible = data.appts.filter(
    (a) =>
      (showCancelled || !CLOSED.includes(a.status)) &&
      (!staffFilter || a.staff_id === staffFilter) &&
      (!resourceFilter || a.resource_id === resourceFilter) &&
      (!serviceFilter || a.service_id === serviceFilter),
  )
  const columns = ws.staff.filter((s) => s.active && (!staffFilter || s.id === staffFilter))

  function move(step: number) {
    if (view === 'day') setDate(addDays(date, step))
    else if (view === 'week') setDate(addDays(date, step * 7))
    else {
      const [y, m] = date.split('-').map(Number)
      const d = new Date(Date.UTC(y, m - 1 + step, 1))
      setDate(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`)
    }
  }

  const title =
    view === 'day'
      ? formatDay(date)
      : view === 'week'
        ? `Semana del ${formatDay(range.from, { day: 'numeric', month: 'long' })}`
        : formatDay(`${date.slice(0, 7)}-01`, { month: 'long', year: 'numeric' })

  return (
    <section className="mgr-panel mgr-agenda">
      <SectionHead title="Agenda" text={title}>
        {ws.can('owner', 'admin', 'reception') && (
          <button className="mgr-secondary" onClick={() => setWaitlist(true)}>
            Lista de espera
          </button>
        )}
        <button className="mgr-primary" onClick={() => setPreset({ date })}>
          ＋ Nueva cita
        </button>
      </SectionHead>

      <div className="mgr-toolbar">
        <div className="mgr-seg">
          {(['day', 'week', 'month'] as View[]).map((v) => (
            <button key={v} className={view === v ? 'selected' : ''} onClick={() => setView(v)}>
              {v === 'day' ? 'Día' : v === 'week' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
        <div className="mgr-seg">
          <button onClick={() => move(-1)} aria-label="Anterior">
            ‹
          </button>
          <button onClick={() => setDate(todayIn(tz))}>Hoy</button>
          <button onClick={() => move(1)} aria-label="Siguiente">
            ›
          </button>
        </div>
        <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label="Ir a fecha" />
        {ws.role !== 'professional' && (
          <select value={staffFilter} onChange={(e) => setStaffFilter(e.target.value)} aria-label="Filtrar por profesional">
            <option value="">Todo el equipo</option>
            {ws.staff
              .filter((s) => s.active)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.display_name}
                </option>
              ))}
          </select>
        )}
        {ws.resources.length > 0 && (
          <select value={resourceFilter} onChange={(e) => setResourceFilter(e.target.value)} aria-label="Filtrar por cabina">
            <option value="">Todas las cabinas</option>
            {ws.resources.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        )}
        <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} aria-label="Filtrar por servicio">
          <option value="">Todos los servicios</option>
          {ws.services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <label className="mgr-check">
          <input type="checkbox" checked={showCancelled} onChange={(e) => setShowCancelled(e.target.checked)} /> Ver canceladas
        </label>
      </div>

      {error && <p className="mgr-notice mgr-error">{error}</p>}
      {loading && <p className="mgr-muted mgr-loading-inline">Actualizando…</p>}

      {view === 'month' ? (
        <MonthView from={range.from} month={date.slice(0, 7)} appts={visible} closures={data.closures} onPick={(d) => (setDate(d), setView('day'))} />
      ) : (
        <TimeGrid
          days={view === 'day' ? [date] : Array.from({ length: 7 }, (_, i) => addDays(range.from, i))}
          columns={view === 'day' ? columns : []}
          appts={visible}
          off={data.off}
          closures={data.closures}
          onOpen={setOpenId}
          onEmpty={(d, time, staffId) => setPreset({ date: d, time, staffId: staffId ?? (staffFilter || undefined) })}
          onDay={(d) => (setDate(d), setView('day'))}
        />
      )}

      {preset && (
        <AppointmentForm
          preset={preset}
          onClose={() => setPreset(null)}
          onSaved={(id) => {
            setPreset(null)
            reload()
            setOpenId(id)
          }}
        />
      )}
      {openId && <AppointmentDetail id={openId} onClose={() => setOpenId(null)} onChanged={reload} />}
      {waitlist && <Waitlist onClose={() => setWaitlist(false)} onBook={(p) => (setWaitlist(false), setPreset(p))} />}
    </section>
  )
}

function TimeGrid({
  days,
  columns,
  appts,
  off,
  closures,
  onOpen,
  onEmpty,
  onDay,
}: {
  days: string[]
  columns: { id: string; display_name: string; color: string }[]
  appts: Row[]
  off: TimeOff[]
  closures: Closure[]
  onOpen: (id: string) => void
  onEmpty: (date: string, time: string, staffId?: string) => void
  onDay: (date: string) => void
}) {
  const ws = useWorkspace()
  const tz = ws.center.timezone
  const step = ws.center.slot_interval_minutes
  const hours = ws.openingHours
  const startMin = Math.min(9 * 60, ...hours.map((h) => minutesOf(h.opens_at)))
  const endMin = Math.max(20 * 60, ...hours.map((h) => minutesOf(h.closes_at)))
  const height = (endMin - startMin) * PX_PER_MIN
  const today = todayIn(tz)
  const nowMin = toZoned(new Date(), tz).minutes

  // Day view: one column per professional. Week view: one column per day.
  const cols =
    columns.length > 0 && days.length === 1
      ? columns.map((c) => ({ key: c.id, date: days[0], staffId: c.id as string | undefined, label: c.display_name, color: c.color }))
      : days.map((d) => ({ key: d, date: d, staffId: undefined as string | undefined, label: formatDay(d, { weekday: 'short', day: 'numeric' }), color: '' }))

  function clickEmpty(e: MouseEvent<HTMLDivElement>, date: string, staffId?: string) {
    if (e.target !== e.currentTarget) return
    const y = e.nativeEvent.offsetY
    const minute = startMin + Math.floor(y / PX_PER_MIN / step) * step
    onEmpty(date, hhmm(minute), staffId)
  }

  const isOpen = (date: string, minute: number) =>
    hours.length === 0 ||
    hours.some((h) => h.weekday === weekday(date) && minutesOf(h.opens_at) <= minute && minutesOf(h.closes_at) > minute)

  return (
    <div className="mgr-grid-wrap">
      <div className="mgr-grid" style={{ gridTemplateColumns: `56px repeat(${cols.length}, minmax(${days.length > 1 ? 110 : 150}px, 1fr))` }}>
        <div className="mgr-grid-corner" />
        {cols.map((c) => (
          <div key={c.key} className={`mgr-grid-head ${c.date === today && days.length > 1 ? 'today' : ''}`}>
            {days.length > 1 ? (
              <button className="mgr-link" onClick={() => onDay(c.date)}>
                {c.label}
              </button>
            ) : (
              <>
                <i style={{ background: c.color || 'var(--m-pink)' }} />
                {c.label}
              </>
            )}
          </div>
        ))}
        <div className="mgr-grid-times" style={{ height }}>
          {Array.from({ length: Math.ceil((endMin - startMin) / 60) }, (_, i) => (
            <span key={i} style={{ top: i * 60 * PX_PER_MIN }}>
              {hhmm(startMin + i * 60)}
            </span>
          ))}
        </div>
        {cols.map((c) => {
          const closed = closures.find((cl) => cl.starts_on <= c.date && cl.ends_on >= c.date)
          const items = appts.filter((a) => toZoned(a.starts_at, tz).date === c.date && (!c.staffId || a.staff_id === c.staffId))
          const blocks = off.filter((o) => (!c.staffId || o.staff_id === c.staffId) && toZoned(o.starts_at, tz).date <= c.date && toZoned(o.ends_at, tz).date >= c.date)
          return (
            <div
              key={c.key}
              className="mgr-grid-col"
              style={{
                height,
                backgroundSize: `100% ${60 * PX_PER_MIN}px`,
              }}
              onClick={(e) => clickEmpty(e, c.date, c.staffId)}
              title="Haz clic en un hueco para crear una cita"
            >
              {Array.from({ length: Math.ceil((endMin - startMin) / 30) }, (_, i) => startMin + i * 30)
                .filter((m) => !isOpen(c.date, m))
                .map((m) => (
                  <div key={m} className="mgr-grid-closed" style={{ top: (m - startMin) * PX_PER_MIN, height: 30 * PX_PER_MIN }} />
                ))}
              {closed && <div className="mgr-grid-closure">Cerrado{closed.reason ? ` · ${closed.reason}` : ''}</div>}
              {blocks.map((o) => {
                const s = toZoned(o.starts_at, tz)
                const e = toZoned(o.ends_at, tz)
                const from = s.date < c.date ? startMin : Math.max(startMin, s.minutes)
                const to = e.date > c.date ? endMin : Math.min(endMin, e.minutes)
                if (to <= from) return null
                return (
                  <div key={o.id} className="mgr-grid-off" style={{ top: (from - startMin) * PX_PER_MIN, height: (to - from) * PX_PER_MIN }}>
                    {o.reason || 'Bloqueado'}
                    {days.length > 1 && ` · ${ws.staff.find((x) => x.id === o.staff_id)?.display_name ?? ''}`}
                  </div>
                )
              })}
              {c.date === today && nowMin >= startMin && nowMin <= endMin && <div className="mgr-grid-now" style={{ top: (nowMin - startMin) * PX_PER_MIN }} />}
              {items.map((a) => {
                const s = toZoned(a.starts_at, tz).minutes
                const color = ws.staff.find((x) => x.id === a.staff_id)?.color ?? '#b64f78'
                return (
                  <button
                    key={a.id}
                    className={`mgr-appt s-${a.status}`}
                    style={{
                      top: (s - startMin) * PX_PER_MIN,
                      height: Math.max(22, a.duration_snapshot_minutes * PX_PER_MIN - 2),
                      borderLeftColor: color,
                    }}
                    onClick={() => onOpen(a.id)}
                  >
                    <strong>
                      {toZoned(a.starts_at, tz).time} {a.clients?.name ?? 'Cliente'}
                    </strong>
                    <span>
                      {a.service_name_snapshot}
                      {days.length > 1 && ` · ${ws.staff.find((x) => x.id === a.staff_id)?.display_name ?? ''}`}
                    </span>
                    {a.status !== 'confirmed' && <em>{STATUS_LABEL[a.status]}</em>}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
      {cols.length === 0 && <p className="mgr-muted">Añade profesionales en Equipo para ver sus columnas.</p>}
    </div>
  )
}

function MonthView({ from, month, appts, closures, onPick }: { from: string; month: string; appts: Row[]; closures: Closure[]; onPick: (d: string) => void }) {
  const ws = useWorkspace()
  const tz = ws.center.timezone
  const today = todayIn(tz)
  const counts = new Map<string, number>()
  for (const a of appts) {
    const d = toZoned(a.starts_at, tz).date
    counts.set(d, (counts.get(d) ?? 0) + 1)
  }
  return (
    <div className="mgr-month">
      {WEEK_ORDER.map((w) => (
        <div key={w} className="mgr-month-head">
          {['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'][w]}
        </div>
      ))}
      {Array.from({ length: 42 }, (_, i) => addDays(from, i)).map((d) => {
        const n = counts.get(d) ?? 0
        const closed = closures.some((c) => c.starts_on <= d && c.ends_on >= d)
        return (
          <button key={d} className={`mgr-month-day ${d.startsWith(month) ? '' : 'other'} ${d === today ? 'today' : ''} ${closed ? 'closed' : ''}`} onClick={() => onPick(d)}>
            <span>{Number(d.slice(8))}</span>
            {n > 0 && <strong>{n} {n === 1 ? 'cita' : 'citas'}</strong>}
            {closed && <em>Cerrado</em>}
          </button>
        )
      })}
    </div>
  )
}
