import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { money, rpc, run, toCents } from '../api'
import { useWorkspace } from '../context'
import type { Product, Service, ServiceMaterial } from '../types'
import { Empty, Modal, Notice, SectionHead } from '../ui'
import { useLoad } from '../useLoad'

const COLORS = ['#b64f78', '#7c5cbf', '#c9853a', '#3a8fc9', '#3aa57a', '#d0567a', '#5f6b7a']

export function Services() {
  const ws = useWorkspace()
  const { center } = ws
  const canEdit = ws.can('owner', 'admin')
  const [editing, setEditing] = useState<Service | 'new' | null>(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const groups = new Map<string, Service[]>()
  for (const s of ws.services) groups.set(s.category || 'Otros', [...(groups.get(s.category || 'Otros') ?? []), s])

  async function seed() {
    try {
      const n = await rpc<number>('seed_example_services', { p_center: center.id })
      await ws.reloadCatalog()
      setNotice(`${n} servicios de ejemplo añadidos. Ajusta precios y duraciones a tu centro.`)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <section className="mgr-panel">
      <SectionHead title="Servicios y precios" text="Tratamientos, duración, preparación, cabinas y profesionales habilitadas">
        {canEdit && (
          <button className="mgr-primary" onClick={() => setEditing('new')}>
            ＋ Nuevo servicio
          </button>
        )}
      </SectionHead>
      <Notice text={notice} onClose={() => setNotice('')} />
      <Notice text={error} error />
      {ws.services.length === 0 ? (
        <Empty icon="✨" title="Aún no hay servicios" text="Crea tu carta de tratamientos o empieza con unos de ejemplo.">
          {canEdit && (
            <button className="mgr-secondary" onClick={() => void seed()}>
              Cargar servicios de ejemplo
            </button>
          )}
        </Empty>
      ) : (
        [...groups.entries()].map(([group, list]) => (
          <div key={group} className="mgr-service-group">
            <h3>{group}</h3>
            <div className="mgr-service-grid">
              {list.map((s) => {
                const staff = ws.staffServices.filter((l) => l.service_id === s.id).length
                const cabins = ws.serviceResources.filter((l) => l.service_id === s.id).length
                return (
                  <button key={s.id} className={`mgr-service-card ${s.active ? '' : 'inactive'}`} style={{ borderTopColor: s.color }} onClick={() => canEdit && setEditing(s)} disabled={!canEdit}>
                    <h4>{s.name}</h4>
                    <p>
                      {s.duration_minutes} min{s.buffer_minutes ? ` + ${s.buffer_minutes} prep.` : ''}
                    </p>
                    <strong>{money(s.price_cents, center.currency)}</strong>
                    <small>
                      {staff ? `${staff} profesionales` : 'Todo el equipo'}
                      {cabins ? ` · ${cabins} cabinas` : ''}
                      {!s.online_bookable && ' · Solo en el centro'}
                      {!s.active && ' · Desactivado'}
                    </small>
                  </button>
                )
              })}
            </div>
          </div>
        ))
      )}
      {editing && (
        <ServiceForm
          service={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            setNotice('Servicio guardado. Las citas ya reservadas conservan su precio.')
          }}
        />
      )}
    </section>
  )
}

function ServiceForm({ service, onClose, onSaved }: { service: Service | null; onClose: () => void; onSaved: () => void }) {
  const ws = useWorkspace()
  const { center } = ws
  const [name, setName] = useState(service?.name ?? '')
  const [category, setCategory] = useState(service?.category ?? '')
  const [description, setDescription] = useState(service?.description ?? '')
  const [duration, setDuration] = useState(String(service?.duration_minutes ?? 60))
  const [buffer, setBuffer] = useState(String(service?.buffer_minutes ?? 10))
  const [price, setPrice] = useState(service ? (service.price_cents / 100).toFixed(2) : '')
  const [color, setColor] = useState(service?.color ?? COLORS[0])
  const [online, setOnline] = useState(service?.online_bookable ?? true)
  const [active, setActive] = useState(service?.active ?? true)
  const [staffIds, setStaffIds] = useState<string[]>(service ? ws.staffServices.filter((l) => l.service_id === service.id).map((l) => l.staff_id!) : [])
  const [resourceIds, setResourceIds] = useState<string[]>(service ? ws.serviceResources.filter((l) => l.service_id === service.id).map((l) => l.resource_id!) : [])
  const [materials, setMaterials] = useState<{ product_id: string; quantity: string }[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const products = useLoad(
    async () => {
      const [list, current] = await Promise.all([
        run(supabase.from('inventory_products').select('*').eq('center_id', center.id).order('name')) as Promise<Product[]>,
        service ? (run(supabase.from('service_materials').select('*').eq('service_id', service.id)) as Promise<ServiceMaterial[]>) : Promise.resolve([]),
      ])
      setMaterials(current.map((m) => ({ product_id: m.product_id, quantity: String(m.quantity) })))
      return list
    },
    [service?.id],
    [] as Product[],
  )
  const productById = new Map(products.data.map((p) => [p.id, p]))
  const materialCost = materials.reduce((s, m) => s + (Number(m.quantity.replace(',', '.')) || 0) * (productById.get(m.product_id)?.cost_per_unit_cents ?? 0), 0)
  const priceCents = toCents(price)
  const categories = [...new Set(ws.services.map((s) => s.category).filter(Boolean))] as string[]

  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id])

  async function save(e: FormEvent) {
    e.preventDefault()
    const cents = toCents(price)
    if (!Number.isFinite(cents) || cents < 0) return setError('Revisa el precio.')
    setBusy(true)
    setError('')
    try {
      const values = {
        center_id: center.id,
        name: name.trim(),
        category: category.trim() || null,
        description: description.trim() || null,
        duration_minutes: Number(duration),
        buffer_minutes: Number(buffer),
        price_cents: cents,
        color,
        online_bookable: online,
        active,
      }
      const saved = (await run(
        service ? supabase.from('services').update(values).eq('id', service.id).select('*').single() : supabase.from('services').insert(values).select('*').single(),
      )) as Service
      await run(supabase.from('staff_services').delete().eq('service_id', saved.id))
      if (staffIds.length) await run(supabase.from('staff_services').insert(staffIds.map((staff_id) => ({ center_id: center.id, service_id: saved.id, staff_id }))))
      await run(supabase.from('service_resources').delete().eq('service_id', saved.id))
      if (resourceIds.length)
        await run(supabase.from('service_resources').insert(resourceIds.map((resource_id) => ({ center_id: center.id, service_id: saved.id, resource_id }))))
      const rows = materials
        .map((m) => ({ center_id: center.id, service_id: saved.id, product_id: m.product_id, quantity: Number(m.quantity.replace(',', '.')) }))
        .filter((m) => m.product_id && m.quantity > 0)
      await run(supabase.from('service_materials').delete().eq('service_id', saved.id))
      if (rows.length) await run(supabase.from('service_materials').insert([...new Map(rows.map((r) => [r.product_id, r])).values()]))
      await ws.reloadCatalog()
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={service ? 'Editar servicio' : 'Nuevo servicio'} kicker="SERVICIOS" onClose={onClose} wide>
      <form className="mgr-form" onSubmit={save}>
        <div className="mgr-form-grid">
          <label>
            Nombre
            <input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Categoría
            <input list="mgr-categories" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Facial, Corporal, Cejas…" />
            <datalist id="mgr-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
        </div>
        <label>
          Descripción (se ve en la reserva online)
          <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={600} />
        </label>
        <div className="mgr-form-grid three">
          <label>
            Duración (min)
            <input type="number" required min={5} max={600} step={5} value={duration} onChange={(e) => setDuration(e.target.value)} />
          </label>
          <label>
            Preparación y limpieza (min)
            <input type="number" required min={0} max={240} step={5} value={buffer} onChange={(e) => setBuffer(e.target.value)} />
          </label>
          <label>
            Precio ({center.currency})
            <input inputMode="decimal" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="45,00" />
          </label>
        </div>
        <fieldset>
          <legend>Profesionales habilitadas</legend>
          <p className="mgr-footnote">Si no marcas ninguna, cualquiera del equipo puede hacerlo.</p>
          <div className="mgr-chips">
            {ws.staff
              .filter((s) => s.active)
              .map((s) => (
                <label key={s.id} className={`mgr-chip ${staffIds.includes(s.id) ? 'on' : ''}`}>
                  <input type="checkbox" checked={staffIds.includes(s.id)} onChange={() => setStaffIds(toggle(staffIds, s.id))} />
                  {s.display_name}
                </label>
              ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Cabinas o equipos necesarios</legend>
          {ws.resources.length === 0 ? (
            <p className="mgr-footnote">
              No hay cabinas. Créalas en <a href="#/gestor/configuracion">Configuración</a> si quieres evitar que dos tratamientos usen la misma a la vez.
            </p>
          ) : (
            <>
              <p className="mgr-footnote">La cita necesitará una de las marcadas que esté libre.</p>
              <div className="mgr-chips">
                {ws.resources
                  .filter((r) => r.active)
                  .map((r) => (
                    <label key={r.id} className={`mgr-chip ${resourceIds.includes(r.id) ? 'on' : ''}`}>
                      <input type="checkbox" checked={resourceIds.includes(r.id)} onChange={() => setResourceIds(toggle(resourceIds, r.id))} />
                      {r.name}
                    </label>
                  ))}
              </div>
            </>
          )}
        </fieldset>
        <fieldset>
          <legend>Material por sesión (escandallo)</legend>
          {products.data.length === 0 ? (
            <p className="mgr-footnote">
              Da de alta tus productos en <a href="#/gestor/inventario">Inventario</a> para saber cuánto cuesta cada tratamiento y descontar stock al realizarlo.
            </p>
          ) : (
            <>
              {materials.map((m, i) => {
                const p = productById.get(m.product_id)
                return (
                  <div key={i} className="mgr-material-row">
                    <select value={m.product_id} onChange={(e) => setMaterials(materials.map((x, j) => (j === i ? { ...x, product_id: e.target.value } : x)))} aria-label="Producto">
                      <option value="">Elige producto…</option>
                      {products.data
                        .filter((x) => x.active || x.id === m.product_id)
                        .map((x) => (
                          <option key={x.id} value={x.id}>
                            {x.name}
                          </option>
                        ))}
                    </select>
                    <input
                      inputMode="decimal"
                      value={m.quantity}
                      onChange={(e) => setMaterials(materials.map((x, j) => (j === i ? { ...x, quantity: e.target.value } : x)))}
                      aria-label="Cantidad"
                    />
                    <span>{p?.unit ?? ''}</span>
                    <span className="mgr-muted">{p ? money(Math.round((Number(m.quantity.replace(',', '.')) || 0) * p.cost_per_unit_cents), center.currency) : ''}</span>
                    <button type="button" className="mgr-link muted" onClick={() => setMaterials(materials.filter((_, j) => j !== i))} aria-label="Quitar">
                      ×
                    </button>
                  </div>
                )
              })}
              <button type="button" className="mgr-link" onClick={() => setMaterials([...materials, { product_id: '', quantity: '1' }])}>
                ＋ Añadir producto
              </button>
              {Number.isFinite(priceCents) && priceCents > 0 && (
                <p className="mgr-footnote">
                  Coste de material: <strong>{money(Math.round(materialCost), center.currency)}</strong> · Margen antes de comisiones:{' '}
                  <strong>{money(Math.round(priceCents - materialCost), center.currency)}</strong> ({Math.round(((priceCents - materialCost) / priceCents) * 100)} %). Al marcar la
                  cita como realizada se descuenta del stock.
                </p>
              )}
            </>
          )}
        </fieldset>
        <div className="mgr-form-grid three">
          <label>
            Color en la agenda
            <div className="mgr-colors">
              {COLORS.map((c) => (
                <button type="button" key={c} className={color === c ? 'on' : ''} style={{ background: c }} onClick={() => setColor(c)} aria-label={c} />
              ))}
            </div>
          </label>
          <label className="mgr-check">
            <input type="checkbox" checked={online} onChange={(e) => setOnline(e.target.checked)} /> Reservable online
          </label>
          <label className="mgr-check">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Activo
          </label>
        </div>
        <Notice text={error} error />
        <div className="mgr-form-actions">
          <button type="button" className="mgr-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="mgr-primary" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar servicio'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
