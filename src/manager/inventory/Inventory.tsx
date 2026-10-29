import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { MOVEMENT_LABEL, money, qty, rpc, run, toCents } from '../api'
import { useWorkspace } from '../context'
import { formatDateTime } from '../time'
import type { MovementType, Product, StockMovement } from '../types'
import { Empty, Modal, Notice, SectionHead } from '../ui'
import { useLoad } from '../useLoad'

const UNITS = ['unidad', 'ml', 'g', 'caja', 'sesión']

/** Products, stock levels and their movements. Stock only changes through movements. */
export function Inventory() {
  const ws = useWorkspace()
  const { center } = ws
  const [editing, setEditing] = useState<Product | 'new' | null>(null)
  const [moving, setMoving] = useState<Product | null>(null)
  const [history, setHistory] = useState<Product | null>(null)
  const [onlyLow, setOnlyLow] = useState(false)
  const [showInactive, setShowInactive] = useState(false)
  const [notice, setNotice] = useState('')
  const m = (c: number) => money(c, center.currency)

  const { data: products, reload, error } = useLoad(
    () => run(supabase.from('inventory_products').select('*').eq('center_id', center.id).order('name')) as Promise<Product[]>,
    [center.id],
    [] as Product[],
  )

  const isLow = (p: Product) => Number(p.quantity) <= Number(p.low_stock_threshold)
  const active = products.filter((p) => p.active)
  const low = active.filter(isLow)
  const value = active.reduce((s, p) => s + Number(p.quantity) * p.cost_per_unit_cents, 0)
  const list = products.filter((p) => (showInactive || p.active) && (!onlyLow || isLow(p)))

  return (
    <section className="mgr-panel">
      <SectionHead title="Inventario" text="Producto de cabina y de venta. El stock cambia con compras, consumos de tratamientos, mermas y ajustes.">
        <button className="mgr-primary" onClick={() => setEditing('new')}>
          ＋ Nuevo producto
        </button>
      </SectionHead>
      <Notice text={notice} onClose={() => setNotice('')} />
      <Notice text={error} error />
      <div className="mgr-metrics">
        <article>
          <span>Productos activos</span>
          <strong>{active.length}</strong>
        </article>
        <article>
          <span>Stock bajo</span>
          <strong className={low.length ? 'warn' : ''}>{low.length}</strong>
          <small>{low.length ? 'Toca reponer' : 'Todo en orden'}</small>
        </article>
        <article>
          <span>Valor del stock</span>
          <strong>{m(Math.round(value))}</strong>
          <small>A coste medio de compra</small>
        </article>
      </div>
      {products.length === 0 ? (
        <Empty icon="📦" title="Aún no hay productos" text="Añade los productos que usas en cabina (mascarillas, cera, ampollas…) y los de venta. Después indica en cada servicio cuánto gasta y el coste saldrá solo." />
      ) : (
        <>
          <div className="mgr-filters">
            <label className="mgr-check">
              <input type="checkbox" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} /> Solo stock bajo
            </label>
            <label className="mgr-check">
              <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} /> Ver desactivados
            </label>
          </div>
          <div className="mgr-table">
            <div className="mgr-table-head mgr-stock-cols">
              <span>Producto</span>
              <span>Stock</span>
              <span>Coste / unidad</span>
              <span>Valor</span>
              <span />
            </div>
            {list.map((p) => (
              <div key={p.id} className={`mgr-table-row mgr-stock-cols ${p.active ? '' : 'inactive'}`}>
                <div>
                  <strong>{p.name}</strong>
                  <small>
                    {p.sku ? `Ref. ${p.sku} · ` : ''}Mínimo {qty(p.low_stock_threshold)} {p.unit}
                    {!p.active && ' · Desactivado'}
                  </small>
                </div>
                <strong className={isLow(p) && p.active ? 'warn' : ''}>
                  {qty(p.quantity)} {p.unit}
                </strong>
                <span>{m(p.cost_per_unit_cents)}</span>
                <span>{m(Math.round(Number(p.quantity) * p.cost_per_unit_cents))}</span>
                <div className="mgr-row-actions">
                  <button className="mgr-secondary small" onClick={() => setMoving(p)}>
                    Movimiento
                  </button>
                  <button className="mgr-link" onClick={() => setHistory(p)}>
                    Historial
                  </button>
                  <button className="mgr-link muted" onClick={() => setEditing(p)}>
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <p className="mgr-footnote">
        Para que un tratamiento descuente producto al marcarlo como realizado, indica sus materiales en <a href="#/gestor/servicios">Servicios</a>.
      </p>

      {editing && (
        <ProductForm
          product={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(msg) => {
            setEditing(null)
            setNotice(msg)
            reload()
          }}
        />
      )}
      {moving && (
        <MovementForm
          product={moving}
          onClose={() => setMoving(null)}
          onSaved={() => {
            setMoving(null)
            setNotice('Movimiento registrado.')
            reload()
          }}
        />
      )}
      {history && <MovementHistory product={history} onClose={() => setHistory(null)} />}
    </section>
  )
}

function ProductForm({ product, onClose, onSaved }: { product: Product | null; onClose: () => void; onSaved: (message: string) => void }) {
  const ws = useWorkspace()
  const { center } = ws
  const [name, setName] = useState(product?.name ?? '')
  const [sku, setSku] = useState(product?.sku ?? '')
  const [unit, setUnit] = useState(product?.unit ?? 'unidad')
  const [threshold, setThreshold] = useState(String(product?.low_stock_threshold ?? 0))
  const [cost, setCost] = useState(product ? (product.cost_per_unit_cents / 100).toFixed(2) : '')
  const [initial, setInitial] = useState('')
  const [active, setActive] = useState(product?.active ?? true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function save(e: FormEvent) {
    e.preventDefault()
    const cents = cost ? toCents(cost) : 0
    if (!Number.isFinite(cents) || cents < 0) return setError('Revisa el coste.')
    setBusy(true)
    setError('')
    try {
      const values = {
        name: name.trim(),
        sku: sku.trim() || null,
        unit: unit.trim() || 'unidad',
        low_stock_threshold: Number(threshold.replace(',', '.')) || 0,
        cost_per_unit_cents: cents,
        active,
      }
      if (product) {
        await run(supabase.from('inventory_products').update(values).eq('id', product.id))
        onSaved('Producto actualizado.')
      } else {
        const saved = (await run(supabase.from('inventory_products').insert({ ...values, center_id: center.id }).select('id').single())) as { id: string }
        const start = Number(initial.replace(',', '.'))
        if (start > 0) await rpc('record_stock_movement', { p_product: saved.id, p_type: 'adjustment', p_quantity: start, p_note: 'Stock inicial' })
        onSaved('Producto creado.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={product ? product.name : 'Nuevo producto'} kicker="INVENTARIO" onClose={onClose}>
      <form className="mgr-form" onSubmit={save}>
        <div className="mgr-form-grid">
          <label>
            Nombre
            <input required minLength={2} maxLength={140} autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Mascarilla hidratante" />
          </label>
          <label>
            Referencia (opcional)
            <input value={sku} onChange={(e) => setSku(e.target.value)} maxLength={60} />
          </label>
          <label>
            Unidad de medida
            <input list="mgr-units" required value={unit} onChange={(e) => setUnit(e.target.value)} />
            <datalist id="mgr-units">
              {UNITS.map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>
          </label>
          <label>
            Coste por {unit || 'unidad'} ({center.currency})
            <input inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0,05" />
          </label>
          <label>
            Avisar cuando queden menos de
            <input inputMode="decimal" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
          </label>
          {product ? (
            <label className="mgr-check">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Activo
            </label>
          ) : (
            <label>
              Stock inicial ({unit || 'unidad'})
              <input inputMode="decimal" value={initial} onChange={(e) => setInitial(e.target.value)} placeholder="0" />
            </label>
          )}
        </div>
        {product && <p className="mgr-footnote">El stock no se edita aquí: usa «Movimiento» para compras, mermas o ajustes, así queda todo registrado.</p>}
        <Notice text={error} error />
        <div className="mgr-form-actions">
          <button type="button" className="mgr-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="mgr-primary" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

const MOVEMENT_HELP: Record<string, string> = {
  purchase: 'Entra producto. Si indicas el precio, el coste medio se recalcula solo.',
  waste: 'Sale producto que se ha estropeado, caducado o roto.',
  use: 'Consumo manual (los tratamientos con materiales descuentan solos).',
  return: 'Vuelve producto al almacén.',
  adjustment: 'Corrige el stock tras contar: usa negativo para restar.',
}

function MovementForm({ product, onClose, onSaved }: { product: Product; onClose: () => void; onSaved: () => void }) {
  const ws = useWorkspace()
  const [type, setType] = useState<MovementType>('purchase')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function save(e: FormEvent) {
    e.preventDefault()
    const q = Number(quantity.replace(',', '.'))
    if (!Number.isFinite(q) || q === 0) return setError('Indica la cantidad.')
    // The form asks for the total price of a purchase; the database stores the price per unit.
    const total = price ? toCents(price) : null
    if (total !== null && (!Number.isFinite(total) || total < 0)) return setError('Revisa el precio.')
    setBusy(true)
    setError('')
    try {
      await rpc('record_stock_movement', {
        p_product: product.id,
        p_type: type,
        p_quantity: q,
        p_unit_cost_cents: type === 'purchase' && total !== null ? Math.round(total / Math.abs(q)) : null,
        p_note: note || null,
      })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={product.name} kicker="MOVIMIENTO DE STOCK" onClose={onClose}>
      <form className="mgr-form" onSubmit={save}>
        <p>
          Stock actual: <strong>{qty(product.quantity)} {product.unit}</strong>
        </p>
        <div className="mgr-chips">
          {(['purchase', 'waste', 'use', 'return', 'adjustment'] as MovementType[]).map((t) => (
            <label key={t} className={`mgr-chip ${type === t ? 'on' : ''}`}>
              <input type="radio" name="movement" checked={type === t} onChange={() => setType(t)} />
              {MOVEMENT_LABEL[t]}
            </label>
          ))}
        </div>
        <p className="mgr-footnote">{MOVEMENT_HELP[type]}</p>
        <div className="mgr-form-grid">
          <label>
            Cantidad ({product.unit})
            <input inputMode="decimal" required autoFocus value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </label>
          {type === 'purchase' && (
            <label>
              Precio total de la compra ({ws.center.currency})
              <input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Opcional" />
            </label>
          )}
        </div>
        <label>
          Nota
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="Proveedor, nº de albarán, motivo…" />
        </label>
        <Notice text={error} error />
        <div className="mgr-form-actions">
          <button type="button" className="mgr-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="mgr-primary" disabled={busy}>
            Registrar
          </button>
        </div>
      </form>
    </Modal>
  )
}

function MovementHistory({ product, onClose }: { product: Product; onClose: () => void }) {
  const ws = useWorkspace()
  const { data, error, loading } = useLoad(
    () => run(supabase.from('inventory_movements').select('*').eq('product_id', product.id).order('created_at', { ascending: false }).limit(100)) as Promise<StockMovement[]>,
    [product.id],
    [] as StockMovement[],
  )
  return (
    <Modal title={product.name} kicker="HISTORIAL DE STOCK" onClose={onClose} wide>
      <Notice text={error} error />
      {!loading && data.length === 0 ? (
        <Empty icon="📦" title="Sin movimientos todavía" />
      ) : (
        <div className="mgr-table">
          <div className="mgr-table-head mgr-move-cols">
            <span>Fecha</span>
            <span>Movimiento</span>
            <span>Cantidad</span>
            <span>Coste / unidad</span>
          </div>
          {data.map((mv) => (
            <div key={mv.id} className="mgr-table-row mgr-move-cols">
              <span>{formatDateTime(mv.created_at, ws.center.timezone)}</span>
              <div>
                <strong>{MOVEMENT_LABEL[mv.movement_type]}</strong>
                {mv.notes && <small>{mv.notes}</small>}
              </div>
              <strong className={Number(mv.quantity_delta) < 0 ? 'warn' : ''}>
                {Number(mv.quantity_delta) > 0 ? '+' : ''}
                {qty(mv.quantity_delta)} {product.unit}
              </strong>
              <span>{mv.unit_cost_cents !== null ? money(mv.unit_cost_cents, ws.center.currency) : '—'}</span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
