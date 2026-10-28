import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { sayer, type Locale } from '../i18n'

// Guided practice for brow mapping and hair strokes. Coordinates live in a 100 × 130 view of the
// client's right side of the face: the nose is on the right, the outer corner of the eye on the left.
type P = { x: number; y: number }

const NOSTRIL: P = { x: 63, y: 118 }
const IRIS_EDGE: P = { x: 40, y: 59 }
const OUTER_CORNER: P = { x: 24, y: 60 }

// Point where the line from `a` through `b` reaches height `y`.
const atY = (a: P, b: P, y: number): P => ({ x: a.x + ((b.x - a.x) * (y - a.y)) / (b.y - a.y), y })

const TARGET = {
  start: { x: NOSTRIL.x, y: 40 },
  arch: atY(NOSTRIL, IRIS_EDGE, 34),
  tail: atY(NOSTRIL, OUTER_CORNER, 42),
}
type Key = keyof typeof TARGET
const KEYS: Key[] = ['start', 'arch', 'tail']

const BROW_PATH = `M ${TARGET.start.x} 36.5 C 52 33.5, 40 31, ${TARGET.arch.x} 32 C 22 33.5, 16 37.5, ${TARGET.tail.x} 41.5
  C 16 41, 23 37.8, ${TARGET.arch.x + 1} 37.6 C 42 38.6, 54 41, ${TARGET.start.x} 43.6 Z`

const dist = (a: P, b: P) => Math.hypot(a.x - b.x, a.y - b.y)

function toSvg(svg: SVGSVGElement, e: { clientX: number; clientY: number }): P {
  const pt = svg.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  const r = pt.matrixTransform(svg.getScreenCTM()!.inverse())
  return { x: r.x, y: r.y }
}

function Face({ children, faintBrow = true }: { children?: ReactNode; faintBrow?: boolean }) {
  return (
    <>
      <defs>
        <radialGradient id="lab-skin" cx="35%" cy="40%" r="80%">
          <stop offset="0%" stopColor="#f6d9c8" />
          <stop offset="100%" stopColor="#e8bba3" />
        </radialGradient>
        <linearGradient id="lab-shade" x1="0" x2="1">
          <stop offset="0%" stopColor="#c9917a" stopOpacity="0" />
          <stop offset="100%" stopColor="#c9917a" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      <rect width="100" height="130" fill="url(#lab-skin)" />
      <path d="M0 0 H100 V8 C70 4 30 6 0 14 Z" fill="#5a3a2c" />
      {/* nose */}
      <path d="M74 44 C 72 70, 76 92, 80 106 L 100 106 L 100 44 Z" fill="url(#lab-shade)" />
      <path d="M73 48 C 71 72, 74 94, 78 106" fill="none" stroke="#b98472" strokeWidth="0.7" />
      <path d="M78 104 C 66 102, 57 110, 61 118 C 64 124, 72 122, 76 120" fill="none" stroke="#a46f5d" strokeWidth="1" strokeLinecap="round" />
      <ellipse cx="72" cy="119" rx="4" ry="2" fill="#a46f5d" opacity="0.45" />
      {/* eye */}
      <path d="M 20 55 C 30 44, 52 43, 64 54" fill="none" stroke="#c39079" strokeWidth="0.8" opacity="0.7" />
      <path d={`M ${OUTER_CORNER.x} ${OUTER_CORNER.y} C 32 49, 52 48, 61 61 C 50 68, 33 68, ${OUTER_CORNER.x} ${OUTER_CORNER.y} Z`} fill="#fff" stroke="#7a4e3e" strokeWidth="0.6" />
      <circle cx="46" cy="59" r="6" fill="#6b8f71" />
      <circle cx="46" cy="59" r="2.6" fill="#1f1a1c" />
      <circle cx="47.6" cy="57.4" r="1" fill="#fff" />
      <path d={`M ${OUTER_CORNER.x} ${OUTER_CORNER.y} C 32 49, 52 48, 61 61`} fill="none" stroke="#2b2228" strokeWidth="1.3" />
      {Array.from({ length: 14 }, (_, i) => {
        const tt = i / 13
        const x = (1 - tt) ** 3 * 24 + 3 * (1 - tt) ** 2 * tt * 32 + 3 * (1 - tt) * tt * tt * 52 + tt ** 3 * 61
        const y = (1 - tt) ** 3 * 60 + 3 * (1 - tt) ** 2 * tt * 49 + 3 * (1 - tt) * tt * tt * 48 + tt ** 3 * 61
        return <line key={i} x1={x} y1={y} x2={x - 2.5 + tt * 2} y2={y - 4} stroke="#2b2228" strokeWidth="0.45" strokeLinecap="round" />
      })}
      {faintBrow && <path d={BROW_PATH} fill="#7a5644" opacity="0.18" />}
      {children}
    </>
  )
}

function Guide({ from, through, toY, color = '#c2577a', animate }: { from: P; through: P; toY: number; color?: string; animate?: boolean }) {
  const end = atY(from, through, toY)
  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={end.x}
      y2={end.y}
      stroke={color}
      strokeWidth="0.6"
      strokeDasharray={animate ? undefined : '1.6 1.2'}
      className={animate ? 'draw-line' : ''}
      pathLength={animate ? 1 : undefined}
    />
  )
}

function Dot({ p, label, color = '#c2577a' }: { p: P; label?: string; color?: string }) {
  return (
    <g className="pop-in">
      <circle cx={p.x} cy={p.y} r="1.8" fill={color} stroke="#fff" strokeWidth="0.5" />
      {label && (
        <text x={p.x} y={p.y - 3} textAnchor="middle" fontSize="3.6" fontWeight="700" fill={color} stroke="#fff" strokeWidth="0.8" paintOrder="stroke">
          {label}
        </text>
      )}
    </g>
  )
}

type Stroke = P[]
type Verdict = 'good' | 'direction' | 'outside' | 'length'

// Inner third: hairs grow upwards. Body: up and outwards. Tail: outwards, slightly down.
function judge(stroke: Stroke, inBrow: (p: P) => boolean): Verdict {
  const a = stroke[0]
  const b = stroke[stroke.length - 1]
  const len = dist(a, b)
  if (len < 1.5 || len > 10) return 'length'
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
  if (!inBrow(mid)) return 'outside'
  let ang = (Math.atan2(-(b.y - a.y), -(b.x - a.x)) * 180) / Math.PI
  if (ang > 90) ang -= 180
  if (ang <= -90) ang += 180
  const u = (TARGET.start.x - mid.x) / (TARGET.start.x - TARGET.tail.x)
  const ok = u < 0.25 ? ang >= 50 || ang <= -80 : u < 0.68 ? ang >= 10 && ang <= 70 : ang >= -45 && ang <= 22
  return ok ? 'good' : 'direction'
}

const EXAMPLE: Stroke[] = [
  [{ x: 62, y: 43 }, { x: 61.5, y: 38 }],
  [{ x: 59.5, y: 43 }, { x: 58.5, y: 37.5 }],
  [{ x: 57, y: 42.5 }, { x: 55.5, y: 37 }],
  [{ x: 54, y: 41.5 }, { x: 51, y: 36 }],
  [{ x: 50, y: 41 }, { x: 46, y: 35.5 }],
  [{ x: 46, y: 40.5 }, { x: 41.5, y: 34.5 }],
  [{ x: 42, y: 39.5 }, { x: 37, y: 33.5 }],
  [{ x: 38, y: 39 }, { x: 33, y: 33 }],
  [{ x: 34, y: 38.5 }, { x: 28, y: 33.5 }],
  [{ x: 30, y: 38 }, { x: 23, y: 35.5 }],
  [{ x: 26, y: 39 }, { x: 19, y: 38 }],
  [{ x: 22, y: 40 }, { x: 15, y: 40.5 }],
]

const COLORS: Record<Verdict, string> = { good: '#5a3a2c', direction: '#d68a00', outside: '#c0392b', length: '#c0392b' }

export function BrowLab({ locale, onSolved }: { locale: Locale; onSolved: () => void }) {
  const s = sayer(locale)
  const [stage, setStage] = useState<'learn' | 'map' | 'strokes' | 'done'>('learn')
  const [learn, setLearn] = useState(0)
  const [marks, setMarks] = useState<Record<Key, P>>({ start: { x: 82, y: 14 }, arch: { x: 88, y: 24 }, tail: { x: 94, y: 14 } })
  const [dragging, setDragging] = useState<Key | null>(null)
  const [checked, setChecked] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [strokes, setStrokes] = useState<{ pts: Stroke; v: Verdict }[]>([])
  const [drawing, setDrawing] = useState<Stroke | null>(null)
  const [showExample, setShowExample] = useState(false)
  const [lastTip, setLastTip] = useState('')
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)

  const names: Record<Key, string> = { start: s('Inicio', 'Start'), arch: s('Arco', 'Arch'), tail: s('Final', 'Tail') }
  const errors = KEYS.map((k) => dist(marks[k], TARGET[k]))
  const allGood = errors.every((e) => e <= 4.5)

  const inBrow = (p: P) => {
    const path = pathRef.current
    const svg = svgRef.current
    if (!path || !svg) return false
    const pt = svg.createSVGPoint()
    // Allow a little margin around the outline.
    return [
      [0, 0],
      [0, 1.2],
      [0, -1.2],
    ].some(([dx, dy]) => {
      pt.x = p.x + dx
      pt.y = p.y + dy
      return path.isPointInFill(pt)
    })
  }

  const good = strokes.filter((st) => st.v === 'good').length
  const pct = strokes.length ? Math.round((good / strokes.length) * 100) : 0
  const strokesPass = strokes.length >= 10 && pct >= 70

  const learnSteps = [
    {
      title: s('El visagismo manda', 'Face mapping comes first'),
      text: s(
        'Cada ceja se diseña según la cara de la clienta, no con una plantilla. Usamos tres líneas que salen del ala de la nariz.',
        "Every brow is designed for the client's face, not from a stencil. We use three lines that start at the side of the nostril.",
      ),
    },
    {
      title: s('1. El inicio', '1. The start'),
      text: s('Sube en vertical desde el ala de la nariz. Ahí empieza la ceja.', 'Go straight up from the side of the nostril. That is where the brow starts.'),
    },
    {
      title: s('2. El arco', '2. The arch'),
      text: s(
        'Traza la línea desde el ala de la nariz pasando por el borde exterior del iris. Donde corta la ceja está el punto más alto.',
        'Draw the line from the nostril through the outer edge of the iris. Where it crosses the brow is the highest point.',
      ),
    },
    {
      title: s('3. El final', '3. The tail'),
      text: s(
        'La línea desde el ala de la nariz hasta el rabillo del ojo marca dónde termina la cola. Nunca más baja que el inicio.',
        'The line from the nostril to the outer corner of the eye marks where the tail ends. Never lower than the start.',
      ),
    },
    {
      title: s('4. Une los puntos', '4. Join the points'),
      text: s(
        'Inicio más ancho y suave, subida hasta el arco y cola cada vez más fina. Esta es la forma que vas a rellenar con trazos.',
        'A wider, softer start, a rise to the arch and a tail that tapers. This is the shape you will fill with strokes.',
      ),
    },
  ]

  const onDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current!
    const p = toSvg(svg, e)
    if (stage === 'map' && !checked) {
      const near = KEYS.map((k) => ({ k, d: dist(p, marks[k]) })).sort((a, b) => a.d - b.d)[0]
      if (near.d < 7) {
        setDragging(near.k)
        svg.setPointerCapture(e.pointerId)
      }
    } else if (stage === 'strokes') {
      setDrawing([p])
      svg.setPointerCapture(e.pointerId)
    }
  }
  const onMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const p = toSvg(svgRef.current!, e)
    if (dragging) setMarks((m) => ({ ...m, [dragging]: { x: Math.max(2, Math.min(98, p.x)), y: Math.max(2, Math.min(128, p.y)) } }))
    else if (drawing) setDrawing([...drawing, p])
  }
  const onUp = () => {
    setDragging(null)
    if (drawing && drawing.length > 1) {
      const v = judge(drawing, inBrow)
      setStrokes((list) => [...list, { pts: drawing, v }])
      setLastTip(
        v === 'good'
          ? ''
          : v === 'outside'
            ? s('Ese trazo se sale del diseño.', 'That stroke goes outside the design.')
            : v === 'length'
              ? s('Trazos cortos, como un pelo natural.', 'Keep strokes short, like a natural hair.')
              : s(
                  'Ojo con la dirección: hacia arriba en el inicio, en diagonal en el cuerpo y hacia fuera en la cola.',
                  'Watch the direction: up at the start, diagonal in the body and outwards at the tail.',
                ),
      )
    }
    setDrawing(null)
  }

  const viewBox = stage === 'strokes' ? '8 28 58 18' : '0 0 100 130'
  const line = (pts: P[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')

  const steps = [s('Aprende', 'Learn'), s('Diseña', 'Map'), s('Traza', 'Draw'), s('Resultado', 'Result')]
  const stageIndex = ['learn', 'map', 'strokes', 'done'].indexOf(stage)

  return (
    <div className="lab">
      <h2>✒️ {s('Práctica guiada: diseña y traza una ceja', 'Guided practice: map and draw a brow')}</h2>
      <ol className="lab-steps">
        {steps.map((label, i) => (
          <li key={label} className={i < stageIndex ? 'done' : i === stageIndex ? 'current' : ''}>
            <span>{i < stageIndex ? '✓' : i + 1}</span> {label}
          </li>
        ))}
      </ol>

      <div className={`lab-body ${stage === 'strokes' ? 'wide' : ''}`}>
        <div className={`lab-canvas ${stage}`}>
          <svg
            ref={svgRef}
            viewBox={viewBox}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            style={{ touchAction: stage === 'map' || stage === 'strokes' ? 'none' : 'auto' }}
          >
            <Face faintBrow={stage !== 'strokes' && stage !== 'done'}>
              {stage === 'learn' && (
                <>
                  {learn >= 4 && <path d={BROW_PATH} fill="#5a3a2c" opacity="0.75" className="fade-in" />}
                  <Dot p={NOSTRIL} label={s('Ala nariz', 'Nostril')} color="#3f6f8a" />
                  {learn >= 1 && <Guide key={`s${learn}`} from={NOSTRIL} through={{ x: NOSTRIL.x, y: 0 }} toY={30} animate={learn === 1} />}
                  {learn >= 1 && <Dot p={TARGET.start} label={names.start} />}
                  {learn >= 2 && <Guide key={`a${learn}`} from={NOSTRIL} through={IRIS_EDGE} toY={28} animate={learn === 2} />}
                  {learn === 2 && <circle cx={IRIS_EDGE.x} cy={IRIS_EDGE.y} r="2.4" fill="none" stroke="#3f6f8a" strokeWidth="0.6" className="pulse-ring" />}
                  {learn >= 2 && <Dot p={TARGET.arch} label={names.arch} />}
                  {learn >= 3 && <Guide key={`t${learn}`} from={NOSTRIL} through={OUTER_CORNER} toY={36} animate={learn === 3} />}
                  {learn === 3 && <circle cx={OUTER_CORNER.x} cy={OUTER_CORNER.y} r="2.4" fill="none" stroke="#3f6f8a" strokeWidth="0.6" className="pulse-ring" />}
                  {learn >= 3 && <Dot p={TARGET.tail} label={names.tail} />}
                </>
              )}

              {stage === 'map' && (
                <>
                  <Dot p={NOSTRIL} color="#3f6f8a" />
                  {(dragging === 'start' || checked) && <Guide from={NOSTRIL} through={{ x: marks.start.x, y: marks.start.y }} toY={20} color="#3f6f8a" />}
                  {(dragging === 'arch' || checked) && <Guide from={NOSTRIL} through={marks.arch} toY={20} color="#3f6f8a" />}
                  {(dragging === 'tail' || checked) && <Guide from={NOSTRIL} through={marks.tail} toY={20} color="#3f6f8a" />}
                  {checked &&
                    KEYS.map((k) => <circle key={k} cx={TARGET[k].x} cy={TARGET[k].y} r="4.5" fill="#2f8a5b" opacity="0.18" stroke="#2f8a5b" strokeWidth="0.4" strokeDasharray="1 0.8" />)}
                  {KEYS.map((k, i) => {
                    const verdict = !checked ? '#c2577a' : errors[i] <= 4.5 ? '#2f8a5b' : errors[i] <= 9 ? '#d68a00' : '#c0392b'
                    return (
                      <g key={k} className="handle">
                        <circle cx={marks[k].x} cy={marks[k].y} r="3.2" fill={verdict} stroke="#fff" strokeWidth="0.7" />
                        <text x={marks[k].x} y={marks[k].y + 1.2} textAnchor="middle" fontSize="3.4" fontWeight="700" fill="#fff">
                          {i + 1}
                        </text>
                        <text x={marks[k].x} y={marks[k].y - 4.4} textAnchor="middle" fontSize="3.2" fontWeight="700" fill={verdict} stroke="#fff" strokeWidth="0.8" paintOrder="stroke">
                          {names[k]}
                        </text>
                      </g>
                    )
                  })}
                </>
              )}

              {(stage === 'strokes' || stage === 'done') && (
                <>
                  <path ref={pathRef} d={BROW_PATH} fill={stage === 'done' ? 'none' : '#fff'} fillOpacity="0.35" stroke="#c2577a" strokeWidth="0.25" strokeDasharray="0.8 0.6" />
                  {showExample &&
                    EXAMPLE.map((st, i) => <path key={i} d={line(st)} stroke="#2f8a5b" strokeWidth="0.4" strokeLinecap="round" opacity="0.6" fill="none" />)}
                  {strokes.map((st, i) => (
                    <path key={i} d={line(st.pts)} stroke={stage === 'done' ? '#5a3a2c' : COLORS[st.v]} strokeWidth="0.42" strokeLinecap="round" fill="none" />
                  ))}
                  {drawing && <path d={line(drawing)} stroke="#5a3a2c" strokeWidth="0.42" strokeLinecap="round" fill="none" />}
                  {stage === 'strokes' && KEYS.map((k) => <circle key={k} cx={TARGET[k].x} cy={TARGET[k].y} r="0.7" fill="#c2577a" />)}
                </>
              )}
            </Face>
          </svg>
        </div>

        <div className="lab-panel">
          {stage === 'learn' && (
            <>
              <p className="eyebrow">
                {learn + 1}/{learnSteps.length}
              </p>
              <h3>{learnSteps[learn].title}</h3>
              <p>{learnSteps[learn].text}</p>
              <div className="lab-actions">
                {learn > 0 && (
                  <button className="ghost" onClick={() => setLearn(learn - 1)}>
                    ← {s('Atrás', 'Back')}
                  </button>
                )}
                {learn < learnSteps.length - 1 ? (
                  <button className="primary" onClick={() => setLearn(learn + 1)}>
                    {s('Siguiente', 'Next')} →
                  </button>
                ) : (
                  <button className="primary" onClick={() => setStage('map')}>
                    ✋ {s('Ahora tú', 'Your turn')}
                  </button>
                )}
              </div>
            </>
          )}

          {stage === 'map' && (
            <>
              <h3>{s('Marca los tres puntos', 'Place the three points')}</h3>
              <p>
                {s(
                  'Arrastra cada punto a su sitio sobre la ceja. Mientras arrastras verás la línea que sale del ala de la nariz: úsala para comprobar por dónde pasa.',
                  'Drag each point onto the brow. While dragging you will see the line from the nostril: use it to check where it passes.',
                )}
              </p>
              {checked && (
                <ul className="lab-results">
                  {KEYS.map((k, i) => (
                    <li key={k} className={errors[i] <= 4.5 ? 'good' : 'bad'}>
                      {errors[i] <= 4.5 ? '✅' : errors[i] <= 9 ? '🟠' : '❌'} {names[k]}:{' '}
                      {errors[i] <= 4.5
                        ? s('perfecto', 'spot on')
                        : k === 'start'
                          ? s('debe estar en la vertical del ala de la nariz', 'should be straight above the nostril')
                          : k === 'arch'
                            ? s('la línea tiene que pasar por el borde exterior del iris', 'the line must pass the outer edge of the iris')
                            : s('la línea tiene que pasar por el rabillo del ojo', 'the line must pass the outer corner of the eye')}
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
                      setAttempts((a) => a + 1)
                    }}
                  >
                    {s('Comprobar', 'Check')}
                  </button>
                ) : allGood ? (
                  <button className="primary" onClick={() => setStage('strokes')}>
                    ✍️ {s('Pasar a los trazos', 'Move on to strokes')}
                  </button>
                ) : (
                  <button className="primary" onClick={() => setChecked(false)}>
                    {s('Ajustar y volver a comprobar', 'Adjust and check again')}
                  </button>
                )}
              </div>
            </>
          )}

          {stage === 'strokes' && (
            <>
              <h3>{s('Rellena la ceja pelo a pelo', 'Fill the brow hair by hair')}</h3>
              <p>
                {s(
                  'Dibuja trazos cortos con el dedo o el ratón: hacia arriba en el inicio, en diagonal hacia el arco y hacia fuera en la cola.',
                  'Draw short strokes with your finger or mouse: upwards at the start, diagonally towards the arch and outwards at the tail.',
                )}
              </p>
              <div className="lab-meter">
                <span>
                  {s('Trazos', 'Strokes')}: <strong>{strokes.length}</strong>/10
                </span>
                <span>
                  {s('Correctos', 'Correct')}: <strong>{pct}%</strong>
                </span>
              </div>
              <p className="lab-legend">
                <span style={{ color: COLORS.good }}>■</span> {s('bien', 'good')} <span style={{ color: COLORS.direction }}>■</span> {s('dirección', 'direction')}{' '}
                <span style={{ color: COLORS.outside }}>■</span> {s('fuera o largo', 'outside or long')}
              </p>
              {lastTip && <p className="feedback bad">{lastTip}</p>}
              <div className="lab-actions">
                <button className="ghost" disabled={!strokes.length} onClick={() => setStrokes((l) => l.slice(0, -1))}>
                  ↶ {s('Deshacer', 'Undo')}
                </button>
                <button className="ghost" onClick={() => setShowExample(!showExample)}>
                  👀 {showExample ? s('Ocultar ejemplo', 'Hide example') : s('Ver ejemplo', 'Show example')}
                </button>
                <button
                  className="primary"
                  disabled={!strokesPass}
                  onClick={() => {
                    setStage('done')
                    onSolved()
                  }}
                >
                  {s('Terminar', 'Finish')}
                </button>
              </div>
              {!strokesPass && strokes.length >= 10 && (
                <p className="hint">{s('Necesitas al menos un 70 % de trazos correctos. Deshaz los que no estén bien.', 'You need at least 70% correct strokes. Undo the wrong ones.')}</p>
              )}
            </>
          )}

          {stage === 'done' && (
            <>
              <div className="big-emoji">🎉</div>
              <h3>{s('¡Ceja terminada!', 'Brow finished!')}</h3>
              <ul className="lab-results">
                <li className="good">
                  📐 {s('Diseño', 'Mapping')}: {attempts === 1 ? s('a la primera', 'first try') : `${attempts} ${s('intentos', 'attempts')}`}
                </li>
                <li className="good">
                  ✍️ {s('Trazos correctos', 'Correct strokes')}: {good}/{strokes.length} ({pct}%)
                </li>
                <li className="good">{'⭐'.repeat(attempts === 1 && pct >= 85 ? 3 : attempts <= 2 && pct >= 75 ? 2 : 1)}</li>
              </ul>
              <p className="hint">
                {s('En cabina, cada trazo lleva la presión justa para quedarse en la dermis superficial.', 'In the salon, each stroke needs just enough pressure to stay in the upper dermis.', 'En el gabinete, cada trazo lleva la presión justa para quedarse en la dermis superficial.')}
              </p>
              <button
                className="secondary"
                onClick={() => {
                  setStrokes([])
                  setStage('strokes')
                }}
              >
                ↺ {s('Repetir los trazos', 'Redo the strokes')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
