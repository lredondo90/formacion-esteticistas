import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { money, run, STATUS_LABEL } from '../api'
import { AppointmentDetail } from '../calendar/AppointmentDetail'
import { AppointmentForm } from '../calendar/AppointmentForm'
import { useWorkspace } from '../context'
import { addDays, formatDay, formatTime, fromZoned, minutesOf, todayIn, toZoned, weekday } from '../time'
import type { Appointment, Payment } from '../types'
import { Empty, SectionHead, StatusPill } from '../ui'
import { useLoad } from '../useLoad'

type Row = Appointment & { clients: { name: string } | null }

export function Dashboard() {
  const ws = useWorkspace()
  const { center } = ws
  const tz = center.timezone
  const today = todayIn(tz)
  const [openId, setOpenId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const money_ = (c: number) => money(c, center.currency)
  const canCash = ws.can('owner', 'admin', 'reception')

  const { data, reload } = useLoad(
    async () => {
      const weekAgo = fromZoned(addDays(today, -6), '00:00', tz)
      const [todayRows, pending, week, payments] = await Promise.all([
        run(
          supabase
            .from('appointments')
            .select('*, clients(name)')
            .eq('center_id', center.id)
            .gte('starts_at', fromZoned(today, '00:00', tz))
            .lt('starts_at', fromZoned(addDays(today, 1), '00:00', tz))
            .order('starts_at'),
        ),
        run(
          supabase
            .from('appointments')
            .select('*, clients(name)')
            .eq('center_id', center.id)
            .eq('status', 'pending')
            .gte('starts_at', new Date().toISOString())
            .order('starts_at')
            .limit(10),
        ),
        run(supabase.from('appointments').select('status').eq('center_id', center.id).gte('starts_at', weekAgo).lt('starts_at', new Date().toISOString())),
        canCash
          ? run(supabase.from('payments').select('amount_cents, kind').eq('center_id', center.id).gte('created_at', fromZoned(today, '00:00', tz)))
          : Promise.resolve([]),
      ])
      return {
        today: todayRows as Row[],
        pending: pending as Row[],
        week: week as { status: string }[],
        payments: payments as Pick<Payment, 'amount_cents' | 'kind'>[],
      }
    },
    [center.id, today],
    { today: [] as Row[], pending: [] as Row[], week: [] as { status: string }[], payments: [] as Pick<Payment, 'amount_cents' | 'kind'>[] },
  )

  const active = data.today.filter((a) => !['cancelled', 'rejected', 'expired'].includes(a.status))
  const collected = data.payments.reduce((s, p) => s + (p.kind === 'refund' ? -p.amount_cents : p.amount_cents), 0)
  const expected = active.reduce((s, a) => s + a.price_snapshot_cents, 0)
  // Occupancy: booked minutes over the minutes the bookable team could work today.
  const openMinutes = ws.openingHours.filter((h) => h.weekday === weekday(today)).reduce((s, h) => s + minutesOf(h.closes_at) - minutesOf(h.opens_at), 0)
  const team = ws.staff.filter((s) => s.active && s.bookable).length
  const booked = active.reduce((s, a) => s + a.duration_snapshot_minutes, 0)
  const occupancy = openMinutes && team ? Math.min(100, Math.round((booked / (openMinutes * team)) * 100)) : 0
  const lost = data.week.filter((a) => a.status === 'cancelled' || a.status === 'no_show').length
  const nowMin = toZoned(new Date(), tz).minutes
  const next = active.filter((a) => toZoned(a.starts_at, tz).minutes >= nowMin - 30)

  return (
    <>
      <div className="mgr-welcome">
        <div>
          <span>{formatDay(today).toUpperCase()}</span>
          <h2>Hola{ws.me ? `, ${ws.me.display_name.split(' ')[0]}` : ''} ✨</h2>
          <p>{active.length ? `Hoy tenéis ${active.length} ${active.length === 1 ? 'cita' : 'citas'}.` : 'Hoy no hay citas todavía.'}</p>
        </div>
        <div className="mgr-actions">
          <button className="mgr-primary" onClick={() => setCreating(true)}>
            ＋ Nueva cita
          </button>
          {ws.can('owner', 'admin', 'reception') && (
            <>
              <button className="mgr-secondary" onClick={() => ws.go('clientes', { nuevo: '1' })}>
                Nuevo cliente
              </button>
              <button className="mgr-secondary" onClick={() => ws.go('caja', { cobrar: '1' })}>
                Cobrar
              </button>
            </>
          )}
        </div>
      </div>

      {ws.can('owner', 'admin') && ws.services.length === 0 && (
        <div className="mgr-setup">
          <strong>Primeros pasos</strong>
          <ol>
            <li>
              <a href="#/gestor/servicios">Crea tus servicios</a> (o carga los de ejemplo).
            </li>
            <li>
              <a href="#/gestor/equipo">Añade a tu equipo</a> y sus horarios.
            </li>
            <li>
              <a href="#/gestor/configuracion">Revisa horario, cabinas y reserva online</a>.
            </li>
          </ol>
        </div>
      )}

      <div className="mgr-metrics">
        <article>
          <span>Citas de hoy</span>
          <strong>{active.length}</strong>
          <small>{data.today.length - active.length} canceladas</small>
        </article>
        {canCash && (
          <article>
            <span>Cobrado hoy</span>
            <strong>{money_(collected)}</strong>
            <small>Previsto {money_(expected)}</small>
          </article>
        )}
        <article>
          <span>Ocupación</span>
          <strong>{occupancy}%</strong>
          <div className="mgr-meter" aria-hidden>
            <div style={{ width: `${occupancy}%` }} />
          </div>
        </article>
        <article>
          <span>Cancelaciones y ausencias</span>
          <strong>{lost}</strong>
          <small>Últimos 7 días</small>
        </article>
      </div>

      <div className="mgr-two">
        <section className="mgr-panel">
          <SectionHead title="Próximas citas de hoy">
            <a className="mgr-link" href="#/gestor/agenda">
              Ver agenda →
            </a>
          </SectionHead>
          {next.length === 0 ? (
            <Empty icon="☀️" title="No quedan citas hoy" text="Un buen momento para organizarte o abrir la reserva online." />
          ) : (
            <div className="mgr-bookings">
              {next.map((a) => (
                <button key={a.id} className="mgr-booking" onClick={() => setOpenId(a.id)}>
                  <div className="mgr-time">{formatTime(a.starts_at, tz)}</div>
                  <div className="mgr-booking-info">
                    <strong>{a.clients?.name}</strong>
                    <span>
                      {a.service_name_snapshot} · {ws.staff.find((s) => s.id === a.staff_id)?.display_name}
                    </span>
                  </div>
                  <StatusPill status={a.status} label={STATUS_LABEL[a.status]} />
                </button>
              ))}
            </div>
          )}
        </section>
        <section className="mgr-panel">
          <SectionHead title="Pendientes de confirmar" text="Reservas online que esperan respuesta" />
          {data.pending.length === 0 ? (
            <Empty icon="✅" title="Todo al día" />
          ) : (
            <div className="mgr-bookings">
              {data.pending.map((a) => (
                <button key={a.id} className="mgr-booking" onClick={() => setOpenId(a.id)}>
                  <div className="mgr-time small">{formatDay(toZoned(a.starts_at, tz).date, { day: 'numeric', month: 'short' })}</div>
                  <div className="mgr-booking-info">
                    <strong>{a.clients?.name}</strong>
                    <span>
                      {formatTime(a.starts_at, tz)} · {a.service_name_snapshot}
                    </span>
                  </div>
                  <StatusPill status="pending" label="Revisar" />
                </button>
              ))}
            </div>
          )}
          <div className="mgr-ai-teaser">
            <strong>💬 Avisos del asistente de WhatsApp</strong>
            <p>Aquí verás las conversaciones que el asistente deriva al equipo cuando lo activemos (Etapa 3).</p>
          </div>
        </section>
      </div>

      {creating && (
        <AppointmentForm
          onClose={() => setCreating(false)}
          onSaved={(id) => {
            setCreating(false)
            reload()
            setOpenId(id)
          }}
        />
      )}
      {openId && <AppointmentDetail id={openId} onClose={() => setOpenId(null)} onChanged={reload} />}
    </>
  )
}
