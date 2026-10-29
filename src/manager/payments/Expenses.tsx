import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { EXPENSE_LABEL, money, run, toCents } from '../api'
import { useWorkspace } from '../context'
import { addDays, formatDay, todayIn } from '../time'
import type { Expense } from '../types'
import { Empty, Modal, Notice, SectionHead } from '../ui'
import { useLoad } from '../useLoad'

function monthBounds(month: string): [string, string] {
  const [y, m] = month.split('-').map(Number)
  const next = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`
  return [`${month}-01`, addDays(next, -1)]
}

/** Center expenses by month (rent, supplies, product…). Only owner and admin see them. */
export function Expenses() {
  const { center } = useWorkspace()
  const [month, setMonth] = useState(todayIn(center.timezone).slice(0, 7))
  const [editing, setEditing] = useState<Expense | 'new' | null>(null)
  const [notice, setNotice] = useState('')
  const [first, last] = monthBounds(month)
  const m = (c: number) => money(c, center.currency)

  const { data, reload, error } = useLoad(
    () =>
      run(supabase.from('expenses').select('*').eq('center_id', center.id).gte('incurred_on', first).lte('incurred_on', last).order('incurred_on', { ascending: false })) as Promise<
        Expense[]
      >,
    [center.id, month],
    [] as Expense[],
  )
  const total = data.reduce((s, e) => s + e.amount_cents, 0)

  return (
    <section className="mgr-panel">
      <SectionHead title="Gastos" text={`${formatDay(first, { month: 'long', year: 'numeric' })} · total ${m(total)}`}>
        <input type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} aria-label="Mes" />
        <button className="mgr-secondary" onClick={() => setEditing('new')}>
          ＋ Apuntar gasto
        </button>
      </SectionHead>
      <Notice text={notice} onClose={() => setNotice('')} />
      <Notice text={error} error />
      {data.length === 0 ? (
        <Empty icon="🧾" title="Sin gastos este mes" text="Apunta alquiler, luz, producto, nóminas… y en Informes verás el beneficio real del centro." />
      ) : (
        <div className="mgr-table">
          <div className="mgr-table-head mgr-expense-cols">
            <span>Fecha</span>
            <span>Concepto</span>
            <span>Categoría</span>
            <span>Importe</span>
          </div>
          {data.map((e) => (
            <button key={e.id} className="mgr-table-row mgr-expense-cols" onClick={() => setEditing(e)}>
              <span>{formatDay(e.incurred_on, { day: 'numeric', month: 'short' })}</span>
              <div>
                <strong>{e.description}</strong>
                {(e.notes || e.recurring) && <small>{[e.recurring ? 'Gasto fijo' : '', e.notes ?? ''].filter(Boolean).join(' · ')}</small>}
              </div>
              <span>{EXPENSE_LABEL[e.category] ?? e.category}</span>
              <strong>{m(e.amount_cents)}</strong>
            </button>
          ))}
        </div>
      )}
      {editing && (
        <ExpenseForm
          expense={editing === 'new' ? null : editing}
          defaultDate={month === todayIn(center.timezone).slice(0, 7) ? todayIn(center.timezone) : first}
          onClose={() => setEditing(null)}
          onSaved={(msg) => {
            setEditing(null)
            setNotice(msg)
            reload()
          }}
        />
      )}
    </section>
  )
}

function ExpenseForm({ expense, defaultDate, onClose, onSaved }: { expense: Expense | null; defaultDate: string; onClose: () => void; onSaved: (message: string) => void }) {
  const { center } = useWorkspace()
  const [description, setDescription] = useState(expense?.description ?? '')
  const [category, setCategory] = useState(expense?.category ?? 'otros')
  const [amount, setAmount] = useState(expense ? (expense.amount_cents / 100).toFixed(2) : '')
  const [date, setDate] = useState(expense?.incurred_on ?? defaultDate)
  const [recurring, setRecurring] = useState(expense?.recurring ?? false)
  const [notes, setNotes] = useState(expense?.notes ?? '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function save(e: FormEvent) {
    e.preventDefault()
    const cents = toCents(amount)
    if (!Number.isFinite(cents) || cents <= 0) return setError('Revisa el importe.')
    setBusy(true)
    setError('')
    try {
      const values = { description: description.trim(), category, amount_cents: cents, incurred_on: date, recurring, notes: notes.trim() || null }
      await run(expense ? supabase.from('expenses').update(values).eq('id', expense.id) : supabase.from('expenses').insert({ ...values, center_id: center.id }))
      onSaved(expense ? 'Gasto actualizado.' : 'Gasto apuntado.')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!expense || !confirm('¿Borrar este gasto? Quedará constancia en el registro de cambios.')) return
    try {
      await run(supabase.from('expenses').delete().eq('id', expense.id))
      onSaved('Gasto borrado.')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <Modal title={expense ? 'Editar gasto' : 'Apuntar gasto'} kicker="GASTOS" onClose={onClose}>
      <form className="mgr-form" onSubmit={save}>
        <label>
          Concepto
          <input required minLength={2} maxLength={180} autoFocus value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Alquiler del local, factura de luz…" />
        </label>
        <div className="mgr-form-grid">
          <label>
            Importe ({center.currency})
            <input inputMode="decimal" required value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          <label>
            Fecha
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label>
            Categoría
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {Object.entries(EXPENSE_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="mgr-check">
            <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} /> Gasto fijo (todos los meses)
          </label>
        </div>
        <label>
          Nota
          <input value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} placeholder="Proveedor, nº de factura…" />
        </label>
        <Notice text={error} error />
        <div className="mgr-form-actions">
          {expense && (
            <button type="button" className="mgr-link muted" onClick={() => void remove()}>
              Borrar
            </button>
          )}
          <button type="button" className="mgr-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="mgr-primary" disabled={busy}>
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  )
}
