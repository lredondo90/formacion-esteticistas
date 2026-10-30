import { tx } from '../i18n'
import { bez, Tag } from './art'
import type { LabDef, P } from './engine'

// Close-up of a closed eye, 100 × 70. The inner corner (tear duct) is on the right.
const L0 = { x: 12, y: 34 }
const L1 = { x: 34, y: 46 }
const L2 = { x: 66, y: 46 }
const L3 = { x: 88, y: 34 }
const lashLine = (t: number) => bez(L0, L1, L2, L3, t)
const LASH_TS = Array.from({ length: 21 }, (_, i) => 0.05 + i * 0.045)

// Natural lashes grow downwards from the closed lid, fanning out towards each corner.
function dir(t: number): P {
  const x = (0.5 - t) * 0.7
  const n = Math.hypot(x, 1)
  return { x: x / n, y: 1 / n }
}
const along = (t: number, d: number): P => {
  const b = lashLine(t)
  const v = dir(t)
  return { x: b.x + v.x * d, y: b.y + v.y * d }
}

// Zone of the eye for mapping: outer third, middle, inner third.
const zone = (t: number) => (t < 0.36 ? 'outer' : t < 0.68 ? 'middle' : 'inner')
const MM = 1.1

function Eye({ pad, weak }: { pad?: boolean; weak?: boolean }) {
  const lid = `M ${L0.x} ${L0.y} C ${L1.x} ${L1.y}, ${L2.x} ${L2.y}, ${L3.x} ${L3.y}`
  return (
    <>
      <defs>
        <linearGradient id="lash-skin" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#efc9b4" />
          <stop offset="55%" stopColor="#f5d8c7" />
          <stop offset="100%" stopColor="#e9bfa8" />
        </linearGradient>
      </defs>
      <rect width="100" height="70" fill="url(#lash-skin)" />
      <path d="M8 10 C 30 2, 70 2, 92 10" fill="none" stroke="#6b4636" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <path d="M14 22 C 36 12, 64 12, 86 22" fill="none" stroke="#c9917a" strokeWidth="0.6" />
      <path d={`${lid} C 64 40, 36 40, ${L0.x} ${L0.y} Z`} fill="#e7b9a2" opacity="0.6" />
      {pad && <path d="M16 44 C 36 58, 64 58, 84 44 C 72 66, 28 66, 16 44 Z" fill="#f2f6fb" stroke="#d6e0ea" strokeWidth="0.4" />}
      {LASH_TS.map((t) => {
        const a = lashLine(t)
        const b = along(t, weak ? 3.5 : 4.5)
        return <line key={t} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#2b2228" strokeWidth={weak ? 0.22 : 0.35} strokeLinecap="round" />
      })}
      <path d={lid} fill="none" stroke="#8a5a4a" strokeWidth="0.8" />
    </>
  )
}

function Extensions({ lengths }: { lengths: Record<string, number> }) {
  return (
    <>
      {LASH_TS.map((t) => {
        const a = along(t, 0.8)
        const b = along(t, 0.8 + lengths[zone(t)] * MM)
        return <path key={t} d={`M ${a.x} ${a.y} Q ${(a.x + b.x) / 2 + dir(t).x * 0.8} ${(a.y + b.y) / 2 + 1}, ${b.x} ${b.y}`} stroke="#1a1416" strokeWidth="0.6" strokeLinecap="round" fill="none" />
      })}
    </>
  )
}

const TRACE_TS = [0.32, 0.5, 0.7]

export const lashesLab: LabDef = {
  emoji: '👁️',
  title: tx('Práctica guiada: aplica extensiones de pestañas', 'Guided practice: apply lash extensions'),
  viewBox: '0 0 100 70',
  background: '#f5d8c7',
  scene: (layers, s) => (
    <>
      <Eye pad={!layers.has('nopad')} weak={layers.has('weak')} />
      {layers.has('isolate') && (
        <g className="fade-in">
          <line x1={lashLine(0.5).x} y1={lashLine(0.5).y} x2={along(0.5, 6).x} y2={along(0.5, 6).y} stroke="#c2577a" strokeWidth="0.9" strokeLinecap="round" />
          <path d={`M ${along(0.455, 4).x} ${along(0.455, 4).y} L ${along(0.47, 7).x} ${along(0.47, 7).y}`} stroke="#3f6f8a" strokeWidth="0.5" />
          <path d={`M ${along(0.545, 4).x} ${along(0.545, 4).y} L ${along(0.53, 7).x} ${along(0.53, 7).y}`} stroke="#3f6f8a" strokeWidth="0.5" />
          <Tag p={along(0.5, 12)}>{s('Una extensión, una pestaña', 'One extension, one lash')}</Tag>
        </g>
      )}
      {layers.has('gap') && (
        <g className="fade-in">
          <circle cx={lashLine(0.5).x} cy={lashLine(0.5).y + 0.8} r="2.4" fill="none" stroke="#c2577a" strokeWidth="0.4" className="pulse-ring" />
          <line x1={along(0.5, 0.9).x} y1={along(0.5, 0.9).y} x2={along(0.5, 9).x} y2={along(0.5, 9).y} stroke="#1a1416" strokeWidth="0.6" strokeLinecap="round" />
          <Tag p={{ x: 50, y: 66 }}>{s('0,5–1 mm del párpado', '0.5–1 mm from the lid')}</Tag>
        </g>
      )}
      {layers.has('map') && (
        <g className="fade-in">
          <Extensions lengths={{ outer: 12, middle: 10, inner: 8 }} />
          <Tag p={{ x: 22, y: 30 }}>12 mm</Tag>
          <Tag p={{ x: 50, y: 36 }}>10 mm</Tag>
          <Tag p={{ x: 78, y: 30 }}>8 mm</Tag>
          <Tag p={{ x: 86, y: 27 }} size={2.6} color="#3f6f8a">
            {s('Lagrimal', 'Inner')}
          </Tag>
          <Tag p={{ x: 13, y: 27 }} size={2.6} color="#3f6f8a">
            {s('Exterior', 'Outer')}
          </Tag>
        </g>
      )}
    </>
  ),
  learn: [
    {
      title: tx('Prepara el ojo', 'Prepare the eye'),
      text: tx(
        'Limpia las pestañas naturales y coloca un parche de gel bajo el ojo para aislar las pestañas inferiores. La clienta, con los ojos cerrados y relajados.',
        'Cleanse the natural lashes and place a gel pad under the eye to isolate the lower lashes. The client keeps her eyes closed and relaxed.',
      ),
    },
    {
      title: tx('Aislamiento', 'Isolation'),
      text: tx(
        'Separa una sola pestaña natural con las pinzas. Cada extensión va pegada a una única pestaña: si pegas dos, se tiran entre ellas y se caen antes.',
        'Separate one natural lash with your tweezers. Each extension goes on a single lash: if you glue two together, they pull each other and fall out sooner.',
      ),
      layers: ['isolate'],
    },
    {
      title: tx('Nunca toques la piel', 'Never touch the skin'),
      text: tx(
        'Apoya la extensión entre 0,5 y 1 mm por encima del párpado, siguiendo la pestaña natural. Pegada a la piel irrita y crece mal.',
        'Place the extension 0.5 to 1 mm away from the lid, following the natural lash. Glued to the skin, it irritates and grows out badly.',
      ),
      layers: ['gap'],
    },
    {
      title: tx('El mapping', 'Lash mapping'),
      text: tx(
        'Antes de empezar, decides la longitud en cada zona. En un efecto ojo de gato, el lagrimal es corto y la longitud crece hacia el exterior.',
        'Before you start, decide the length for each area. For a cat-eye effect, the inner corner is short and length grows towards the outer corner.',
      ),
      layers: ['map'],
    },
  ],
  tasks: [
    {
      kind: 'trace',
      short: tx('Aplicar', 'Apply'),
      title: tx('Coloca tres extensiones', 'Place three extensions'),
      text: tx(
        'Desliza cada extensión sobre su pestaña natural: empieza junto al párpado (sin tocarlo) y sigue hacia la punta.',
        'Slide each extension along its natural lash: start next to the lid (without touching it) and follow towards the tip.',
      ),
      routes: TRACE_TS.map((t, i) => ({
        id: `l${i}`,
        label: tx(`Pestaña ${i + 1}`, `Lash ${i + 1}`),
        pts: [along(t, 1), along(t, 5), along(t, 9)],
        directed: true,
      })),
      tol: 1.4,
      width: 0.6,
      directionHint: tx('Empieza siempre en la base, junto al párpado, y ve hacia la punta.', 'Always start at the base, next to the lid, and move towards the tip.'),
    },
    {
      kind: 'tune',
      short: tx('Mapping', 'Mapping'),
      title: tx('Diseña un ojo de gato', 'Design a cat eye'),
      text: tx(
        'La clienta quiere un efecto ojo de gato natural y sus pestañas aguantan bien hasta 12–13 mm. Elige la longitud de cada zona.',
        'The client wants a natural cat-eye effect and her lashes can hold up to 12–13 mm. Choose the length for each area.',
      ),
      sliders: [
        { id: 'inner', label: tx('Lagrimal', 'Inner corner'), min: 6, max: 15, step: 1, start: 11, format: (v) => `${v} mm` },
        { id: 'middle', label: tx('Centro', 'Middle'), min: 6, max: 15, step: 1, start: 11, format: (v) => `${v} mm` },
        { id: 'outer', label: tx('Exterior', 'Outer corner'), min: 6, max: 15, step: 1, start: 11, format: (v) => `${v} mm` },
      ],
      visual: (v) => <Extensions lengths={v} />,
      check: (v) => [
        { ok: v.inner >= 7 && v.inner <= 9, msg: tx('Lagrimal corto (7–9 mm): ahí la pestaña natural es más débil.', 'Short inner corner (7–9 mm): the natural lashes are weaker there.') },
        { ok: v.middle > v.inner && v.middle < v.outer, msg: tx('El centro, entre el lagrimal y el exterior.', 'The middle sits between the inner and outer lengths.') },
        { ok: v.outer >= v.middle + 2, msg: tx('El exterior, al menos 2 mm más largo que el centro: eso crea el ojo de gato.', 'The outer corner at least 2 mm longer than the middle: that creates the cat eye.') },
        { ok: Math.max(v.inner, v.middle, v.outer) <= 13, msg: tx('Nada por encima de 13 mm: pesaría demasiado para sus pestañas.', 'Nothing over 13 mm: it would be too heavy for her lashes.') },
      ],
    },
    {
      kind: 'choose',
      short: tx('Grosor', 'Thickness'),
      title: tx('Pestañas finas y débiles', 'Fine, weak lashes'),
      text: tx(
        'Otra clienta tiene pestañas naturales muy finas y cortas, y quiere técnica clásica pelo a pelo. ¿Qué grosor de extensión eliges?',
        'Another client has very fine, short natural lashes and wants a classic one-to-one set. Which extension thickness do you choose?',
      ),
      layers: ['weak'],
      options: [
        { text: tx('0,25 mm, para que se note mucho', '0.25 mm, so it really shows'), good: false, feedback: tx('Demasiado peso: la pestaña natural se doblaría y se caería antes de tiempo.', 'Far too heavy: the natural lash would bend and fall out early.') },
        { text: tx('0,10 mm', '0.10 mm'), good: true, feedback: tx('Bien. Una extensión fina y ligera protege la pestaña natural y sigue viéndose bonita.', 'Right. A fine, light extension protects the natural lash and still looks lovely.') },
        { text: tx('0,20 mm con 14 mm de largo', '0.20 mm at 14 mm long'), good: false, feedback: tx('Grosor y largo a la vez multiplican el peso. Con pestañas débiles, nunca.', 'Thickness plus length multiplies the weight. Never on weak lashes.') },
      ],
    },
  ],
  outro: tx(
    'La regla de oro: la extensión nunca debe pesar más de lo que la pestaña natural puede sostener.',
    'The golden rule: an extension must never weigh more than the natural lash can hold.',
  ),
}
