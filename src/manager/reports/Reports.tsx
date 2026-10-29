import { useState, type CSSProperties } from 'react'
import { EXPENSE_LABEL, money, qty, rpc } from '../api'
import { useWorkspace } from '../context'
import { addDays, formatDay, minutesOf, todayIn, WEEK_ORDER, WEEKDAYS } from '../time'
import type { BusinessReport } from '../types'
import { Empty, Notice, SectionHead } from '../ui'
import { useLoad } from '../useLoad'

type Preset = 'month' | 'last_month' | '30d' | 'year' | 'custom'

function range(preset: Preset, today: string): [string, string] {
  const [y, mo] = today.split('-').map(Number)
  const first = (year: number, month: number) => `${year}-${String(month).padStart(2, '0')}-01`
  switch (preset) {
    case 'last_month': {
      const start = mo === 1 ? first(y - 1, 12) : first(y, mo - 1)
      return [start, addDays(first(y, mo), -1)]
    }
    case '30d':
      return [addDays(today, -29), today]
    case 'year':
      return [`${y}-01-01`, today]
    default:
      return [first(y, mo), today]
  }
}

const pct = (part: number, total: number) => (total > 0 ? `${Math.round((part / total) * 100)} %` : '—')

/** Profitability of the center for a period: income, costs, margin per treatment and per professional, occupancy. */
export function Reports() {
  const { center } = useWorkspace()
  const today = todayIn(center.timezone)
  const [preset, setPreset] = useState<Preset>('month')
  const [custom, setCustom] = useState(() => range('month', today))
  const [from, to] = preset === 'custom' ? custom : range(preset, today)
  const m = (c: number) => money(c, center.currency)

  const { data: r, loading, error } = useLoad(
    () => rpc<BusinessReport>('business_report', { p_center: center.id, p_from: from, p_to: to }),
    [center.id, from, to],
    null as BusinessReport | null,
  )

  const costs = r ? r.material_cost_cents + r.commission_cents + r.expenses_cents : 0
  const profit = r ? r.billed_cents - costs : 0
  const totalAppts = r ? r.appointments.completed + r.appointments.no_show + r.appointments.cancelled : 0

  return (
    <>
      <section className="mgr-panel">
        <SectionHead title="Informes" text={`${formatDay(from, { day: 'numeric', month: 'short', year: 'numeric' })} – ${formatDay(to, { day: 'numeric', month: 'short', year: 'numeric' })}`}>
          <div className="mgr-seg" role="group" aria-label="Periodo">
            {(
              [
                ['month', 'Este mes'],
                ['last_month', 'Mes pasado'],
                ['30d', '30 días'],
                ['year', 'Este año'],
                ['custom', 'Fechas'],
              ] as [Preset, string][]
            ).map(([id, label]) => (
              <button key={id} className={preset === id ? 'selected' : ''} onClick={() => setPreset(id)}>
                {label}
              </button>
            ))}
          </div>
          {preset === 'custom' && (
            <>
              <input type="date" value={custom[0]} max={custom[1]} onChange={(e) => e.target.value && setCustom([e.target.value, custom[1]])} aria-label="Desde" />
              <input type="date" value={custom[1]} min={custom[0]} onChange={(e) => e.target.value && setCustom([custom[0], e.target.value])} aria-label="Hasta" />
            </>
          )}
        </SectionHead>
        <Notice text={error} error />
        {loading && !r && <p className="mgr-loading">Calculando…</p>}
        {r && (
          <>
            <div className="mgr-metrics">
              <article>
                <span>Facturado</span>
                <strong>{m(r.billed_cents)}</strong>
                <small>Citas realizadas · cobrado {m(r.collected_cents)}</small>
              </article>
              <article>
                <span>Costes</span>
                <strong>{m(costs)}</strong>
                <small>Material, comisiones y gastos</small>
              </article>
              <article>
                <span>Beneficio estimado</span>
                <strong className={profit < 0 ? 'warn' : 'good'}>{m(profit)}</strong>
                <small>Margen {pct(profit, r.billed_cents)}</small>
              </article>
              <article>
                <span>Ocupación</span>
                <strong>{pct(r.booked_minutes, r.capacity_minutes)}</strong>
                <small>
                  {Math.round(r.booked_minutes / 60)} h reservadas de {Math.round(r.capacity_minutes / 60)} h
                </small>
              </article>
              <article>
                <span>No presentadas</span>
                <strong className={r.appointments.no_show ? 'warn' : ''}>{r.appointments.no_show}</strong>
                <small>{pct(r.appointments.no_show, totalAppts)} de las citas</small>
              </article>
            </div>
            <div className="mgr-breakdown">
              <Line label="Facturado por tratamientos" value={m(r.billed_cents)} />
              <Line label="− Coste de material (escandallos)" value={m(r.material_cost_cents)} />
              <Line label="− Comisiones del equipo" value={m(r.commission_cents)} />
              <Line label="− Gastos del centro" value={m(r.expenses_cents)} />
              <Line label="= Beneficio estimado" value={m(profit)} strong />
              {r.refunds_cents > 0 && <Line label="Devoluciones en el periodo" value={m(r.refunds_cents)} />}
            </div>
            <p className="mgr-footnote">
              {r.appointments.completed} citas realizadas · {r.appointments.upcoming} por venir · {r.appointments.cancelled} canceladas · {r.appointments.online} reservadas online. El
              coste de material y la comisión se fijan al marcar la cita como realizada.
            </p>
          </>
        )}
      </section>

      {r && (
        <>
          <section className="mgr-panel">
            <SectionHead title="Rentabilidad por tratamiento" text="Lo que deja cada servicio después de material y comisiones" />
            {r.by_service.length === 0 ? (
              <Empty icon="✨" title="Sin citas realizadas en este periodo" />
            ) : (
              <div className="mgr-table">
                <div className="mgr-table-head mgr-report-cols">
                  <span>Tratamiento</span>
                  <span>Citas</span>
                  <span>Facturado</span>
                  <span>Material</span>
                  <span>Comisión</span>
                  <span>Margen</span>
                  <span>Margen / hora</span>
                </div>
                {r.by_service.map((s) => {
                  const margin = s.revenue - s.materials - s.commissions
                  return (
                    <div key={s.service_id} className="mgr-table-row mgr-report-cols">
                      <strong>{s.name}</strong>
                      <span>{s.count}</span>
                      <span>{m(s.revenue)}</span>
                      <span>{m(s.materials)}</span>
                      <span>{m(s.commissions)}</span>
                      <strong className={margin < 0 ? 'warn' : ''}>
                        {m(margin)} <small>({pct(margin, s.revenue)})</small>
                      </strong>
                      <span>{s.minutes ? m(Math.round(margin / (s.minutes / 60))) : '—'}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <section className="mgr-panel">
            <SectionHead title="Equipo" text="Producción, comisiones y ocupación de cada profesional" />
            {r.by_staff.length === 0 ? (
              <Empty icon="👥" title="Sin datos" />
            ) : (
              <div className="mgr-table">
                <div className="mgr-table-head mgr-report-staff-cols">
                  <span>Profesional</span>
                  <span>Citas</span>
                  <span>Facturado</span>
                  <span>Comisión</span>
                  <span>Horas</span>
                  <span>No vinieron</span>
                </div>
                {r.by_staff.map((s) => (
                  <div key={s.staff_id} className="mgr-table-row mgr-report-staff-cols">
                    <strong>{s.name}</strong>
                    <span>{s.count}</span>
                    <span>{m(s.revenue)}</span>
                    <span>{m(s.commissions)}</span>
                    <span>{qty(Math.round(s.minutes / 6) / 10)} h</span>
                    <span>{s.no_show}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="mgr-report-grid">
            <section className="mgr-panel">
              <SectionHead title="Horas punta" text="Minutos reservados por día y hora: detecta huecos para promociones" />
              <Heatmap report={r} />
            </section>
            <section className="mgr-panel">
              <SectionHead title="Gastos por categoría" text={`Total ${m(r.expenses_cents)}`}>
                <a className="mgr-secondary" href="#/gestor/caja">
                  Apuntar gastos
                </a>
              </SectionHead>
              <Bars data={Object.entries(r.expenses_by_category).map(([k, v]) => ({ label: EXPENSE_LABEL[k] ?? k, value: v, text: m(v) }))} empty="Sin gastos apuntados en este periodo" />
              {r.low_stock.length > 0 && (
                <>
                  <h3 className="mgr-subhead">Stock bajo</h3>
                  <ul className="mgr-plain-list">
                    {r.low_stock.map((p) => (
                      <li key={p.name}>
                        <strong>{p.name}</strong>: quedan {qty(p.quantity)} {p.unit} (mínimo {qty(p.threshold)})
                      </li>
                    ))}
                  </ul>
                  <a href="#/gestor/inventario">Ir al inventario</a>
                </>
              )}
            </section>
          </div>
        </>
      )}
    </>
  )
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`mgr-breakdown-line ${strong ? 'total' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function Bars({ data, empty }: { data: { label: string; value: number; text: string }[]; empty: string }) {
  if (data.length === 0) return <Empty icon="🧾" title={empty} />
  const max = Math.max(...data.map((d) => d.value))
  return (
    <div className="mgr-bars">
      {[...data]
        .sort((a, b) => b.value - a.value)
        .map((d) => (
          <div key={d.label} className="mgr-bar-row" title={`${d.label}: ${d.text}`}>
            <span>{d.label}</span>
            <div className="mgr-bar-track">
              <div className="mgr-bar" style={{ width: `${Math.max(2, (d.value / max) * 100)}%` }} />
            </div>
            <strong>{d.text}</strong>
          </div>
        ))}
    </div>
  )
}

function Heatmap({ report }: { report: BusinessReport }) {
  const { openingHours } = useWorkspace()
  const cells = new Map(report.heatmap.map((c) => [`${c.dow}-${c.hour}`, c.minutes]))
  const openDays = new Set(openingHours.map((h) => h.weekday))
  const days = WEEK_ORDER.filter((d) => openDays.has(d) || report.heatmap.some((c) => c.dow === d))
  const hoursFromSchedule = openingHours.flatMap((h) => [Math.floor(minutesOf(h.opens_at) / 60), Math.ceil(minutesOf(h.closes_at) / 60) - 1])
  const all = [...hoursFromSchedule, ...report.heatmap.map((c) => c.hour)]
  if (days.length === 0 || all.length === 0) return <Empty icon="🕒" title="Configura el horario del centro para ver las horas punta" />
  const hours = Array.from({ length: Math.max(...all) - Math.min(...all) + 1 }, (_, i) => Math.min(...all) + i)
  const max = Math.max(1, ...report.heatmap.map((c) => c.minutes))
  return (
    <div className="mgr-heatmap" style={{ gridTemplateColumns: `44px repeat(${hours.length}, minmax(22px, 1fr))` }} role="table" aria-label="Minutos reservados por día y hora">
      <span />
      {hours.map((h) => (
        <span key={h} className="mgr-heat-hour">
          {h}
        </span>
      ))}
      {days.map((d) => (
        <div key={d} className="mgr-heat-row" role="row">
          <span className="mgr-heat-day">{WEEKDAYS[d].slice(0, 3)}</span>
          {hours.map((h) => {
            const v = cells.get(`${d}-${h}`) ?? 0
            return (
              <span
                key={h}
                className="mgr-heat-cell"
                role="cell"
                title={`${WEEKDAYS[d]} ${h}:00 · ${v} min reservados`}
                style={{ '--heat': v ? 0.15 + 0.85 * (v / max) : 0 } as CSSProperties}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
