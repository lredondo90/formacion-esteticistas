import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { sayer, tr, type Locale, type Text } from '../i18n'

// Generic guided practice. Every lab follows the same rhythm as the brow lab: learn on an animated
// drawing first, then do one or more hands-on tasks on that same drawing, then see a result.

export type P = { x: number; y: number }
export type Say = ReturnType<typeof sayer>

export type Learn = { title: Text; text: Text; layers?: string[] }

// Drag each handle onto its target.
export type PlaceTask = {
  kind: 'place'
  short: Text
  title: Text
  text: Text
  layers?: string[]
  handles: { id: string; label: Text; start: P; target: P; tol?: number; hint: Text }[]
  // Extra drawing under the handles: guide lines, the effect of the placement...
  overlay?: (marks: Record<string, P>, dragging: string | null, checked: boolean, s: Say) => ReactNode
}

// Draw over one or more routes. `directed` routes must be drawn from their first point to their last.
export type TraceTask = {
  kind: 'trace'
  short: Text
  title: Text
  text: Text
  layers?: string[]
  routes: { id: string; label: Text; pts: P[]; directed?: boolean }[]
  tol: number
  // Hidden routes are only revealed with "show example".
  hidden?: boolean
  viewBox?: string
  width?: number
  // Colour of correct strokes (polish, contour powder...). Defaults to green.
  paint?: string
  directionHint?: Text
}

// Set the right values with sliders. The drawing reacts to the values.
export type TuneTask = {
  kind: 'tune'
  short: Text
  title: Text
  text: Text
  layers?: string[]
  sliders: { id: string; label: Text; min: number; max: number; step: number; start: number; format?: (v: number, s: Say) => string }[]
  visual?: (v: Record<string, number>, s: Say) => ReactNode
  readout?: (v: Record<string, number>, s: Say) => { label: string; value: string }[]
  check: (v: Record<string, number>) => { ok: boolean; msg: Text }[]
}

// Tap the spots on the drawing in the right order.
export type OrderTask = {
  kind: 'taporder'
  short: Text
  title: Text
  text: Text
  layers?: string[]
  spots: { id: string; at: P; emoji: string; label: Text; why: Text }[]
  order: string[]
  hint: Text
}

// Look at the drawing and choose.
export type ChooseTask = {
  kind: 'choose'
  short: Text
  title: Text
  text: Text
  layers?: string[]
  options: { text: Text; good: boolean; feedback: Text }[]
}

export type Task = PlaceTask | TraceTask | TuneTask | OrderTask | ChooseTask

export type LabDef = {
  emoji: string
  title: Text
  viewBox: string
  background: string
  scene: (layers: Set<string>, s: Say) => ReactNode
  learn: Learn[]
  tasks: Task[]
  // Layers shown on the result screen; defaults to the last task's.
  doneLayers?: string[]
  outro: Text
}

export const dist = (a: P, b: P) => Math.hypot(a.x - b.x, a.y - b.y)

function toSvg(svg: SVGSVGElement, e: { clientX: number; clientY: number }): P {
  const pt = svg.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  const r = pt.matrixTransform(svg.getScreenCTM()!.inverse())
  return { x: r.x, y: r.y }
}

export const line = (pts: P[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')

// Route as dense points so distances can be measured anywhere along it.
function densify(pts: P[], step = 0.8): P[] {
  const out: P[] = [pts[0]]
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]
    const b = pts[i]
    const n = Math.max(1, Math.ceil(dist(a, b) / step))
    for (let k = 1; k <= n; k++) out.push({ x: a.x + ((b.x - a.x) * k) / n, y: a.y + ((b.y - a.y) * k) / n })
  }
  return out
}

function nearestIndex(route: P[], p: P) {
  let best = 0
  let bestD = Infinity
  route.forEach((q, i) => {
    const d = dist(p, q)
    if (d < bestD) {
      bestD = d
      best = i
    }
  })
  return { i: best, d: bestD }
}

type StrokeVerdict = 'good' | 'direction' | 'outside'
const STROKE_COLORS: Record<StrokeVerdict, string> = { good: '#2f8a5b', direction: '#d68a00', outside: '#c0392b' }

function judgeStroke(stroke: P[], routes: { pts: P[]; directed?: boolean }[], tol: number): StrokeVerdict {
  const near = stroke.filter((p) => routes.some((r) => nearestIndex(r.pts, p).d <= tol)).length
  if (near / stroke.length < 0.7) return 'outside'
  // The route this stroke follows is the one most of its points are closest to.
  const votes = routes.map((r) => stroke.filter((p) => nearestIndex(r.pts, p).d <= tol).length)
  const r = routes[votes.indexOf(Math.max(...votes))]
  if (r.directed) {
    const a = nearestIndex(r.pts, stroke[0]).i
    const b = nearestIndex(r.pts, stroke[stroke.length - 1]).i
    if (b < a - 2) return 'direction'
  }
  return 'good'
}

function Marker({ p, n, label, color }: { p: P; n: number | string; label: string; color: string }) {
  return (
    <g className="handle">
      <circle cx={p.x} cy={p.y} r="3.2" fill={color} stroke="#fff" strokeWidth="0.7" />
      <text x={p.x} y={p.y + 1.2} textAnchor="middle" fontSize="3.4" fontWeight="700" fill="#fff">
        {n}
      </text>
      <text x={p.x} y={p.y - 4.4} textAnchor="middle" fontSize="3.2" fontWeight="700" fill={color} stroke="#fff" strokeWidth="0.8" paintOrder="stroke">
        {label}
      </text>
    </g>
  )
}

export function GuidedLab({ def, locale, onSolved }: { def: LabDef; locale: Locale; onSolved: () => void }) {
  const s = sayer(locale)
  const T = (t: Text) => tr(t, locale)
  // -1 = learning, tasks.length = finished.
  const [taskIndex, setTaskIndex] = useState(-1)
  const [learn, setLearn] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const task = taskIndex >= 0 && taskIndex < def.tasks.length ? def.tasks[taskIndex] : null
  const done = taskIndex >= def.tasks.length

  // Task state, reset whenever a new task starts.
  const [marks, setMarks] = useState<Record<string, P>>({})
  const [dragging, setDragging] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [strokes, setStrokes] = useState<{ pts: P[]; v: StrokeVerdict }[]>([])
  const [drawing, setDrawing] = useState<P[] | null>(null)
  const [showExample, setShowExample] = useState(false)
  const [values, setValues] = useState<Record<string, number>>({})
  const [tapped, setTapped] = useState<string[]>([])
  const [wrongTap, setWrongTap] = useState<string | null>(null)
  const [choice, setChoice] = useState<number | null>(null)
  const [solvedTask, setSolvedTask] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  const startTask = (i: number) => {
    setTaskIndex(i)
    setChecked(false)
    setStrokes([])
    setDrawing(null)
    setShowExample(false)
    setTapped([])
    setWrongTap(null)
    setChoice(null)
    setSolvedTask(false)
    const t = def.tasks[i]
    if (t?.kind === 'place') setMarks(Object.fromEntries(t.handles.map((h) => [h.id, h.start])))
    if (t?.kind === 'tune') setValues(Object.fromEntries(t.sliders.map((sl) => [sl.id, sl.start])))
    if (!t) onSolved()
  }

  const dense = task?.kind === 'trace' ? task.routes.map((r) => ({ ...r, pts: densify(r.pts) })) : []

  const onDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current!
    const p = toSvg(svg, e)
    if (task?.kind === 'place' && !checked) {
      const near = task.handles.map((h) => ({ id: h.id, d: dist(p, marks[h.id]) })).sort((a, b) => a.d - b.d)[0]
      if (near && near.d < 7) {
        setDragging(near.id)
        svg.setPointerCapture(e.pointerId)
      }
    } else if (task?.kind === 'trace' && !solvedTask) {
      setDrawing([p])
      svg.setPointerCapture(e.pointerId)
    }
  }
  const onMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!dragging && !drawing) return
    const p = toSvg(svgRef.current!, e)
    if (dragging) setMarks((m) => ({ ...m, [dragging]: p }))
    else if (drawing) setDrawing([...drawing, p])
  }
  const onUp = () => {
    setDragging(null)
    if (task?.kind === 'trace' && drawing && drawing.length > 2) {
      setStrokes((list) => [...list, { pts: drawing, v: judgeStroke(drawing, dense, task.tol) }])
    }
    setDrawing(null)
  }

  // Results for the current task.
  const placeErrors = task?.kind === 'place' ? task.handles.map((h) => dist(marks[h.id] ?? h.start, h.target) <= (h.tol ?? 5)) : []
  const coverage =
    task?.kind === 'trace'
      ? dense.map((r) => {
          const good = strokes.filter((st) => st.v === 'good').flatMap((st) => st.pts)
          return r.pts.filter((q) => good.some((p) => dist(p, q) <= task.tol)).length / r.pts.length
        })
      : []
  const traceOk = coverage.length > 0 && coverage.every((c) => c >= 0.7) && strokes.every((st) => st.v === 'good')
  const tuneResults = task?.kind === 'tune' ? task.check(values) : []

  const steps = [s('Aprende', 'Learn'), ...def.tasks.map((t) => T(t.short)), s('Resultado', 'Result')]
  const stageIndex = taskIndex + 1
  const layers = new Set(task ? (task.layers ?? []) : done ? (def.doneLayers ?? def.tasks[def.tasks.length - 1]?.layers ?? []) : (def.learn[learn].layers ?? []))
  const viewBox = task?.kind === 'trace' && task.viewBox ? task.viewBox : def.viewBox
  const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1

  const finishTask = () => startTask(taskIndex + 1)

  return (
    <div className="lab">
      <h2>
        {def.emoji} {T(def.title)}
      </h2>
      <ol className="lab-steps">
        {steps.map((label, i) => (
          <li key={i} className={i < stageIndex ? 'done' : i === stageIndex ? 'current' : ''}>
            <span>{i < stageIndex ? '✓' : i + 1}</span> {label}
          </li>
        ))}
      </ol>

      <div className={`lab-body ${task?.kind === 'trace' && task.viewBox ? 'wide' : ''}`}>
        <div className={`lab-canvas ${task?.kind === 'place' ? 'map' : task?.kind === 'trace' ? 'strokes' : ''}`} style={{ background: def.background }}>
          <svg
            ref={svgRef}
            viewBox={viewBox}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            style={{ touchAction: task?.kind === 'place' || task?.kind === 'trace' ? 'none' : 'auto' }}
          >
            {def.scene(layers, s)}

            {task?.kind === 'place' && (
              <>
                {task.overlay?.(marks, dragging, checked, s)}
                {checked &&
                  task.handles.map((h) => (
                    <circle key={h.id} cx={h.target.x} cy={h.target.y} r={h.tol ?? 5} fill="#2f8a5b" opacity="0.18" stroke="#2f8a5b" strokeWidth="0.4" strokeDasharray="1 0.8" />
                  ))}
                {task.handles.map((h, i) => (
                  <Marker
                    key={h.id}
                    p={marks[h.id] ?? h.start}
                    n={i + 1}
                    label={T(h.label)}
                    color={!checked ? '#c2577a' : placeErrors[i] ? '#2f8a5b' : '#c0392b'}
                  />
                ))}
              </>
            )}

            {task?.kind === 'trace' && (
              <>
                {dense.map((r) =>
                  !task.hidden || showExample ? (
                    <g key={r.id}>
                      <path d={line(r.pts)} fill="none" stroke="#fff" strokeWidth={task.tol * 1.6} strokeLinecap="round" strokeLinejoin="round" opacity="0.28" />
                      <path d={line(r.pts)} fill="none" stroke="#c2577a" strokeWidth="0.35" strokeDasharray="1 0.8" />
                      {r.directed && (
                        <circle cx={r.pts[0].x} cy={r.pts[0].y} r="1.1" fill="#c2577a" stroke="#fff" strokeWidth="0.3" />
                      )}
                    </g>
                  ) : null,
                )}
                {strokes.map((st, i) => (
                  <path key={i} d={line(st.pts)} stroke={st.v === 'good' && task.paint ? task.paint : STROKE_COLORS[st.v]} strokeWidth={task.width ?? 1} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.85" />
                ))}
                {drawing && <path d={line(drawing)} stroke="#5a3a2c" strokeWidth={task.width ?? 1} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.85" />}
              </>
            )}

            {task?.kind === 'tune' && task.visual?.(values, s)}

            {task?.kind === 'taporder' &&
              task.spots.map((sp) => {
                const n = tapped.indexOf(sp.id)
                const wrong = wrongTap === sp.id
                return (
                  <g
                    key={sp.id}
                    className={`tap-spot ${wrong ? 'shake' : ''}`}
                    role="button"
                    aria-label={T(sp.label)}
                    onClick={() => {
                      if (n >= 0 || solvedTask) return
                      if (task.order[tapped.length] === sp.id) {
                        const next = [...tapped, sp.id]
                        setTapped(next)
                        setWrongTap(null)
                        if (next.length === task.order.length) setSolvedTask(true)
                      } else {
                        setWrongTap(sp.id)
                        setMistakes((m) => m + 1)
                      }
                    }}
                  >
                    <circle cx={sp.at.x} cy={sp.at.y} r="5" fill={n >= 0 ? '#2f8a5b' : wrong ? '#c0392b' : '#fff'} stroke={n >= 0 ? '#fff' : '#c2577a'} strokeWidth="0.7" />
                    <text x={sp.at.x} y={sp.at.y + 1.6} textAnchor="middle" fontSize={n >= 0 ? 4.2 : 4.6} fontWeight="700" fill="#fff">
                      {n >= 0 ? n + 1 : sp.emoji}
                    </text>
                    <text x={sp.at.x} y={sp.at.y + 9} textAnchor="middle" fontSize="3" fontWeight="700" fill="#2b2228" stroke="#fff" strokeWidth="0.8" paintOrder="stroke">
                      {T(sp.label)}
                    </text>
                  </g>
                )
              })}
          </svg>
        </div>

        <div className="lab-panel">
          {taskIndex === -1 && (
            <>
              <p className="eyebrow">
                {learn + 1}/{def.learn.length}
              </p>
              <h3>{T(def.learn[learn].title)}</h3>
              <p>{T(def.learn[learn].text)}</p>
              <div className="lab-actions">
                {learn > 0 && (
                  <button className="ghost" onClick={() => setLearn(learn - 1)}>
                    ← {s('Atrás', 'Back')}
                  </button>
                )}
                {learn < def.learn.length - 1 ? (
                  <button className="primary" onClick={() => setLearn(learn + 1)}>
                    {s('Siguiente', 'Next')} →
                  </button>
                ) : (
                  <button className="primary" onClick={() => startTask(0)}>
                    ✋ {s('Ahora tú', 'Your turn')}
                  </button>
                )}
              </div>
            </>
          )}

          {task && (
            <>
              <p className="eyebrow">
                {s('Práctica', 'Practice')} {taskIndex + 1}/{def.tasks.length}
              </p>
              <h3>{T(task.title)}</h3>
              <p>{T(task.text)}</p>
            </>
          )}

          {task?.kind === 'place' && (
            <>
              {checked && (
                <ul className="lab-results">
                  {task.handles.map((h, i) => (
                    <li key={h.id} className={placeErrors[i] ? 'good' : 'bad'}>
                      {placeErrors[i] ? '✅' : '❌'} {T(h.label)}: {placeErrors[i] ? s('perfecto', 'spot on') : T(h.hint)}
                    </li>
                  ))}
                </ul>
              )}
              <div className="lab-actions">
                {!checked ? (
                  <button
                    className="primary"
                    onClick={() => {
                      setChecked(true)
                      if (!placeErrors.every(Boolean)) setMistakes((m) => m + 1)
                    }}
                  >
                    {s('Comprobar', 'Check')}
                  </button>
                ) : placeErrors.every(Boolean) ? (
                  <button className="primary" onClick={finishTask}>
                    {s('Continuar', 'Continue')} →
                  </button>
                ) : (
                  <button className="primary" onClick={() => setChecked(false)}>
                    {s('Ajustar y volver a comprobar', 'Adjust and check again')}
                  </button>
                )}
              </div>
            </>
          )}

          {task?.kind === 'trace' && (
            <>
              <ul className="lab-results">
                {task.routes.map((r, i) => (
                  <li key={r.id} className={coverage[i] >= 0.7 ? 'good' : ''}>
                    {coverage[i] >= 0.7 ? '✅' : '⬜'} {T(r.label)} <span className="hint">({Math.round(Math.min(1, coverage[i] / 0.7) * 100)}%)</span>
                  </li>
                ))}
              </ul>
              <p className="lab-legend">
                <span style={{ color: STROKE_COLORS.good }}>■</span> {s('bien', 'good')} <span style={{ color: STROKE_COLORS.direction }}>■</span> {s('sentido contrario', 'wrong direction')}{' '}
                <span style={{ color: STROKE_COLORS.outside }}>■</span> {s('fuera de la zona', 'off the area')}
              </p>
              {strokes.some((st) => st.v === 'direction') && <p className="feedback bad">{T(task.directionHint ?? { es: 'Hay trazos en sentido contrario. Deshazlos y repítelos.', en: 'Some strokes go the wrong way. Undo and redo them.' })}</p>}
              {strokes.some((st) => st.v === 'outside') && <p className="feedback bad">{s('Hay trazos fuera de la zona. Deshazlos y repítelos.', 'Some strokes are off the area. Undo and redo them.')}</p>}
              <div className="lab-actions">
                <button className="ghost" disabled={!strokes.length} onClick={() => setStrokes((l) => l.slice(0, -1))}>
                  ↶ {s('Deshacer', 'Undo')}
                </button>
                {task.hidden && (
                  <button
                    className="ghost"
                    onClick={() => {
                      if (!showExample) setMistakes((m) => m + 1)
                      setShowExample(!showExample)
                    }}
                  >
                    👀 {showExample ? s('Ocultar guía', 'Hide guide') : s('Ver guía', 'Show guide')}
                  </button>
                )}
                <button
                  className="primary"
                  disabled={!traceOk}
                  onClick={() => {
                    if (strokes.length > task.routes.length * 3) setMistakes((m) => m + 1)
                    finishTask()
                  }}
                >
                  {s('Continuar', 'Continue')} →
                </button>
              </div>
            </>
          )}

          {task?.kind === 'tune' && (
            <>
              <div className="lab-sliders">
                {task.sliders.map((sl) => (
                  <label key={sl.id}>
                    <span>
                      {T(sl.label)} <strong>{sl.format ? sl.format(values[sl.id] ?? sl.start, s) : values[sl.id]}</strong>
                    </span>
                    <input
                      type="range"
                      min={sl.min}
                      max={sl.max}
                      step={sl.step}
                      value={values[sl.id] ?? sl.start}
                      disabled={checked && tuneResults.every((r) => r.ok)}
                      onChange={(e) => {
                        setValues((v) => ({ ...v, [sl.id]: Number(e.target.value) }))
                        setChecked(false)
                      }}
                    />
                  </label>
                ))}
              </div>
              {task.readout && (
                <div className="lab-meter">
                  {task.readout(values, s).map((r) => (
                    <span key={r.label}>
                      {r.label}: <strong>{r.value}</strong>
                    </span>
                  ))}
                </div>
              )}
              {checked && (
                <ul className="lab-results">
                  {tuneResults.map((r, i) => (
                    <li key={i} className={r.ok ? 'good' : 'bad'}>
                      {r.ok ? '✅' : '❌'} {T(r.msg)}
                    </li>
                  ))}
                </ul>
              )}
              <div className="lab-actions">
                {checked && tuneResults.every((r) => r.ok) ? (
                  <button className="primary" onClick={finishTask}>
                    {s('Continuar', 'Continue')} →
                  </button>
                ) : (
                  <button
                    className="primary"
                    disabled={checked}
                    onClick={() => {
                      setChecked(true)
                      if (!tuneResults.every((r) => r.ok)) setMistakes((m) => m + 1)
                    }}
                  >
                    {s('Comprobar', 'Check')}
                  </button>
                )}
              </div>
            </>
          )}

          {task?.kind === 'taporder' && (
            <>
              <ol className="lab-results">
                {tapped.map((id) => {
                  const sp = task.spots.find((x) => x.id === id)!
                  return (
                    <li key={id} className="good">
                      ✅ {sp.emoji} <strong>{T(sp.label)}</strong>: {T(sp.why)}
                    </li>
                  )
                })}
              </ol>
              {wrongTap && <p className="feedback bad">❌ {T(task.hint)}</p>}
              <div className="lab-actions">
                <button className="primary" disabled={!solvedTask} onClick={finishTask}>
                  {s('Continuar', 'Continue')} →
                </button>
              </div>
            </>
          )}

          {task?.kind === 'choose' && (
            <>
              <div className="options">
                {task.options.map((o, i) => (
                  <button
                    key={i}
                    className={`option ${choice === i ? (o.good ? 'good' : 'bad') : ''}`}
                    disabled={solvedTask}
                    onClick={() => {
                      setChoice(i)
                      if (o.good) setSolvedTask(true)
                      else setMistakes((m) => m + 1)
                    }}
                  >
                    {T(o.text)}
                  </button>
                ))}
              </div>
              {choice !== null && <p className={`feedback ${task.options[choice].good ? 'good' : 'bad'}`}>{T(task.options[choice].feedback)}</p>}
              <div className="lab-actions">
                <button className="primary" disabled={!solvedTask} onClick={finishTask}>
                  {s('Continuar', 'Continue')} →
                </button>
              </div>
            </>
          )}

          {done && (
            <>
              <div className="big-emoji">🎉</div>
              <h3>{s('¡Práctica completada!', 'Practice complete!')}</h3>
              <ul className="lab-results">
                <li className="good">
                  {'⭐'.repeat(stars)} {mistakes === 0 ? s('sin fallos', 'no mistakes') : `${mistakes} ${mistakes === 1 ? s('fallo', 'mistake') : s('fallos', 'mistakes')}`}
                </li>
              </ul>
              <p className="hint">{T(def.outro)}</p>
              <button
                className="secondary"
                onClick={() => {
                  setMistakes(0)
                  startTask(0)
                }}
              >
                ↺ {s('Repetir la práctica', 'Redo the practice')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
