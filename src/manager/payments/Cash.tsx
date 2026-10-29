import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { METHOD_LABEL, money, rpc, run, toCents } from '../api'
import { AppointmentDetail } from '../calendar/AppointmentDetail'
import { useWorkspace } from '../context'
import { addDays, formatDay, formatTime, fromZoned, todayIn } from '../time'
import type { Appointment, Client, Payment } from '../types'
import { Empty, Modal, Notice, SectionHead } from '../ui'
import { useLoad } from '../useLoad'

type PayRow = Payment & { clients: { name: string } | null; appointments: { service_name_snapshot: string } | null }
type ApptRow = Appointment & { clients: { name: string } | null }

/** Daily cash desk: what was charged, by method, refunds and appointments still to collect. */
export function Cash() {
  const ws = useWorkspace()
  const { center } = ws
  const tz = center.timezone
  const [day, setDay] = useState(todayIn(tz))
  const [selling, setSelling] = useState(new URLSearchParams(location.hash.split('?')[1] ?? '').get('cobrar') === '1')
  const [refunding, setRefunding] = useState<PayRow | null>(null)
  const [openAppt, setOpenAppt] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const m = (c: number) => money(c, center.currency)

  const { data, reload, error } = useLoad(
    async () => {
      const from = fromZoned(day, '00:00', tz)
      const to = fromZoned(addDays(day, 1), '00:00', tz)
      const [payments, appts] = await Promise.all([
        run(
          supabase
            .from('payments')
            .select('*, clients(name), appointments(service_name_snapshot)')
            .eq('center_id', center.id)
            .gte('created_at', from)
            .lt('created_at', to)
            .order('created_at', { ascending: false }),
        ),
        run(supabase.from('appointments').select('*, clients(name)').eq('center_id', center.id).eq('status', 'completed').gte('starts_at', from).lt('starts_at', to).order('starts_at')),
      ])
      const ids = (appts as ApptRow[]).map((a) => a.id)
      const balances = ids.length
        ? ((await run(supabase.from('appointment_balances').select('appointment_id, paid_cents').in('appointment_id', ids))) as { appointment_id: string; paid_cents: number }[])
        : []
      const paid = new Map(balances.map((b) => [b.appointment_id, b.paid_cents]))
      const unpaid = (appts as ApptRow[]).filter((a) => (paid.get(a.id) ?? 0) < a.price_snapshot_cents).map((a) => ({ ...a, due: a.price_snapshot_cents - (paid.get(a.id) ?? 0) }))
      return { payments: payments as PayRow[], unpaid }
    },
    [center.id, day],
    { payments: [] as PayRow[], unpaid: [] as (ApptRow & { due: number })[] },
  )

  const byMethod = new Map<string, number>()
  let total = 0
  for (const p of data.payments) {
    const v = p.kind === 'refund' ? -p.amount_cents : p.amount_cents
    byMethod.set(p.method, (byMethod.get(p.method) ?? 0) + v)
    total += v
  }
  const refunded = data.payments.filter((p) => p.kind === 'refund').reduce((s, p) => s + p.amount_cents, 0)

  return (
    <>
      <section className="mgr-panel">
        <SectionHead title="Caja" text={formatDay(day)}>
          <input type="date" value={day} onChange={(e) => e.target.value && setDay(e.target.value)} aria-label="Día" />
          <button className="mgr-primary" onClick={() => setSelling(true)}>
            ＋ Registrar cobro
          </button>
        </SectionHead>
        <Notice text={notice} onClose={() => setNotice('')} />
        <Notice text={error} error />
        <div className="mgr-metrics">
          <article>
            <span>Total neto del día</span>
            <strong>{m(total)}</strong>
            <small>{refunded ? `Incluye ${m(refunded)} en devoluciones` : 'Sin devoluciones'}</small>
          </article>
          {['cash', 'card', 'transfer', 'online'].map((k) => (
            <article key={k}>
              <span>{METHOD_LABEL[k]}</span>
              <strong>{m(byMethod.get(k) ?? 0)}</strong>
            </article>
          ))}
        </div>
        {data.payments.length === 0 ? (
          <Empty icon="💶" title="Sin cobros este día" />
        ) : (
          <div className="mgr-table">
            <div className="mgr-table-head mgr-cash-cols">
              <span>Hora</span>
              <span>Concepto</span>
              <span>Forma</span>
              <span>Importe</span>
              <span />
            </div>
            {data.payments.map((p) => (
              <div key={p.id} className={`mgr-table-row mgr-cash-cols ${p.kind === 'refund' ? 'refund' : ''}`}>
                <span>{formatTime(p.created_at, tz)}</span>
                <div>
                  <strong>{p.clients?.name ?? 'Venta sin cliente'}</strong>
                  <small>
                    {p.kind === 'refund' ? 'Devolución' : (p.appointments?.service_name_snapshot ?? 'Venta / otros')}
                    {p.note ? ` · ${p.note}` : ''}
                  </small>
                </div>
                <span>{METHOD_LABEL[p.method]}</span>
                <strong>
                  {p.kind === 'refund' ? '−' : ''}
                  {m(p.amount_cents)}
                </strong>
                {p.kind === 'charge' && ws.can('owner', 'admin') ? (
                  <button className="mgr-link muted" onClick={() => setRefunding(p)}>
                    Devolver
                  </button>
                ) : (
                  <span />
                )}
              </div>
            ))}
          </div>
        )}
        <p className="mgr-footnote">Los cobros no se editan ni se borran: un error se corrige con una devolución, y todo queda registrado.</p>
      </section>

      <section className="mgr-panel">
        <SectionHead title="Pendiente de cobrar" text="Citas realizadas este día sin cobrar del todo" />
        {data.unpaid.length === 0 ? (
          <Empty icon="✅" title="Todo cobrado" />
        ) : (
          <div className="mgr-bookings">
            {data.unpaid.map((a) => (
              <button key={a.id} className="mgr-booking" onClick={() => setOpenAppt(a.id)}>
                <div className="mgr-time">{formatTime(a.starts_at, tz)}</div>
                <div className="mgr-booking-info">
                  <strong>{a.clients?.name}</strong>
                  <span>{a.service_name_snapshot}</span>
                </div>
                <strong>{m(a.due)}</strong>
              </button>
            ))}
          </div>
        )}
      </section>

      {selling && (
        <SaleForm
          onClose={() => setSelling(false)}
          onSaved={() => {
            setSelling(false)
            setNotice('Cobro registrado.')
            reload()
          }}
        />
      )}
      {refunding && (
        <RefundForm
          payment={refunding}
          onClose={() => setRefunding(null)}
          onSaved={() => {
            setRefunding(null)
            setNotice('Devolución registrada.')
            reload()
          }}
        />
      )}
      {openAppt && <AppointmentDetail id={openAppt} onClose={() => setOpenAppt(null)} onChanged={reload} />}
    </>
  )
}

function SaleForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const ws = useWorkspace()
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<Payment['method']>('card')
  const [note, setNote] = useState('')
  const [query, setQuery] = useState('')
  const [client, setClient] = useState<Client | null>(null)
  const [error, setError] = useState('')
  const matches = useLoad(
    () =>
      query.trim().length < 2
        ? Promise.resolve([] as Client[])
        : (run(supabase.from('clients').select('*').eq('center_id', ws.center.id).is('anonymized_at', null).ilike('name', `%${query.trim().replace(/[%,()]/g, '')}%`).limit(6)) as Promise<Client[]>),
    [query],
    [] as Client[],
  )

  async function save(e: FormEvent) {
    e.preventDefault()
    try {
      await rpc('record_payment', { p_center: ws.center.id, p_amount_cents: toCents(amount), p_method: method, p_client: client?.id ?? null, p_note: note || null })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <Modal title="Registrar cobro" kicker="CAJA" onClose={onClose}>
      <form className="mgr-form" onSubmit={save}>
        <p className="mgr-footnote">Para cobrar una cita, ábrela desde la agenda o desde «Pendiente de cobrar». Aquí: productos, bonos u otros conceptos.</p>
        <div className="mgr-form-grid">
          <label>
            Importe ({ws.center.currency})
            <input inputMode="decimal" required autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          <label>
            Forma de pago
            <select value={method} onChange={(e) => setMethod(e.target.value as Payment['method'])}>
              {Object.entries(METHOD_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Concepto
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ej. Crema hidratante, bono 5 sesiones" maxLength={300} />
        </label>
        <label>
          Cliente (opcional)
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
        {!client && matches.data.length > 0 && (
          <div className="mgr-pick-list">
            {matches.data.map((c) => (
              <button type="button" key={c.id} onClick={() => setClient(c)}>
                <strong>{c.name}</strong> <span>{c.phone ?? ''}</span>
              </button>
            ))}
          </div>
        )}
        <Notice text={error} error />
        <div className="mgr-form-actions">
          <button type="button" className="mgr-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="mgr-primary">Registrar</button>
        </div>
      </form>
    </Modal>
  )
}

function RefundForm({ payment, onClose, onSaved }: { payment: Payment; onClose: () => void; onSaved: () => void }) {
  const ws = useWorkspace()
  const [amount, setAmount] = useState((payment.amount_cents / 100).toFixed(2))
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  return (
    <Modal title="Devolver cobro" kicker="CAJA" onClose={onClose}>
      <form
        className="mgr-form"
        onSubmit={(e) => {
          e.preventDefault()
          rpc('refund_payment', { p_payment: payment.id, p_amount_cents: toCents(amount), p_note: note || null })
            .then(onSaved)
            .catch((err: Error) => setError(err.message))
        }}
      >
        <p>
          Cobro original: <strong>{money(payment.amount_cents, ws.center.currency)}</strong> ({METHOD_LABEL[payment.method]})
        </p>
        <label>
          Importe a devolver
          <input inputMode="decimal" required value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
        <label>
          Motivo
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />
        </label>
        <Notice text={error} error />
        <div className="mgr-form-actions">
          <button type="button" className="mgr-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="mgr-primary danger">Registrar devolución</button>
        </div>
      </form>
    </Modal>
  )
}
