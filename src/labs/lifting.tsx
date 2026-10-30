import { tx } from '../i18n'
import { bez, Tag } from './art'
import type { LabDef, P, Say } from './engine'

// Front view: close-up of a closed eye, 100 × 70, inner corner on the right (as in the lash lab).
const L0 = { x: 12, y: 40 }
const L1 = { x: 34, y: 52 }
const L2 = { x: 66, y: 52 }
const L3 = { x: 88, y: 40 }
const lashLine = (t: number) => bez(L0, L1, L2, L3, t)
const LASH_TS = Array.from({ length: 19 }, (_, i) => 0.06 + i * 0.049)
const fan = (t: number) => (0.5 - t) * 0.6

// Natural lashes point down from the closed lid; lifted ones stand up against the shield.
function lash(t: number, len: number, lifted: boolean, frizz: boolean) {
  const a = lashLine(t)
  const dx = fan(t)
  const dy = lifted ? -1 : 1
  const tip = { x: a.x + dx * len, y: a.y + dy * len }
  const ctrl = { x: a.x + dx * len * 0.3, y: a.y + dy * len * 0.7 }
  const end = frizz ? ` q ${0.6} ${-0.8}, ${1.2} ${0.2} t ${1} ${-0.6}` : ''
  return `M ${a.x} ${a.y} Q ${ctrl.x} ${ctrl.y}, ${tip.x} ${tip.y}${end}`
}

function FrontEye({ lifted, shield, frizz, lotion, tint }: { lifted?: boolean; shield?: boolean; frizz?: boolean; lotion?: boolean; tint?: boolean }) {
  const lid = `M ${L0.x} ${L0.y} C ${L1.x} ${L1.y}, ${L2.x} ${L2.y}, ${L3.x} ${L3.y}`
  return (
    <>
      <defs>
        <linearGradient id="lift-skin" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#efc9b4" />
          <stop offset="60%" stopColor="#f5d8c7" />
          <stop offset="100%" stopColor="#e9bfa8" />
        </linearGradient>
      </defs>
      <rect width="100" height="70" fill="url(#lift-skin)" />
      <path d="M8 8 C 30 0, 70 0, 92 8" fill="none" stroke="#6b4636" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <path d={`${lid} C 64 46, 36 46, ${L0.x} ${L0.y} Z`} fill="#e7b9a2" opacity="0.6" />
      {shield && (
        <path
          className="fade-in"
          d={`M ${L0.x + 6} ${L0.y + 2} C 30 50, 70 50, ${L3.x - 6} ${L3.y + 2} C 72 26, 28 26, ${L0.x + 6} ${L0.y + 2} Z`}
          fill="#cfe6f2"
          stroke="#8fb8cf"
          strokeWidth="0.5"
          opacity="0.9"
        />
      )}
      {lotion && <path className="fade-in" d="M 22 40 C 36 44, 64 44, 78 40 L 76 34 C 62 37, 38 37, 24 34 Z" fill="#9b6fc0" opacity="0.35" />}
      {LASH_TS.map((t) => (
        <path key={t} d={lash(t, lifted ? 9 : 6, !!lifted, !!frizz)} stroke={tint ? '#120c10' : '#3a2e33'} strokeWidth={tint ? 0.45 : 0.32} strokeLinecap="round" fill="none" />
      ))}
      <path d={lid} fill="none" stroke="#8a5a4a" strokeWidth="0.8" />
      <path d="M18 50 C 36 62, 64 62, 82 50 C 70 68, 30 68, 18 50 Z" fill="#f2f6fb" stroke="#d6e0ea" strokeWidth="0.4" opacity={lifted || shield ? 1 : 0} />
    </>
  )
}

// Side view for the shield task: the lash wraps around the shield, so the same lash curls more on a
// small shield and less on a big one. 4 drawing units per millimetre.
const U = 4
const ROOT = { x: 44, y: 50 }
const SHIELDS = [
  { name: 'S', r: 2.5 },
  { name: 'M', r: 3.2 },
  { name: 'L', r: 4 },
  { name: 'XL', r: 4.8 },
]
const LASH_MM = 8
const curlDeg = (size: number) => (LASH_MM / SHIELDS[size - 1].r) * (180 / Math.PI)

function wrapPath(r: number, lenMm: number, steps = 40) {
  const c = { x: ROOT.x, y: ROOT.y - r * U }
  const theta = lenMm / r
  const wrap = Math.min(theta, Math.PI)
  const pts: P[] = []
  for (let i = 0; i <= steps; i++) {
    const phi = Math.PI / 2 - (wrap * i) / steps
    pts.push({ x: c.x + r * U * Math.cos(phi), y: c.y + r * U * Math.sin(phi) })
  }
  // Longer than half the shield: the rest folds back over the lid.
  if (theta > Math.PI) pts.push({ x: ROOT.x - (theta - Math.PI) * r * U, y: c.y - r * U })
  return 'M ' + pts.map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' L ')
}

function SideEye({ size, minutes, s }: { size: number; minutes: number; s: Say }) {
  const r = SHIELDS[size - 1].r
  const frizz = minutes > 9
  const weak = minutes < 6
  return (
    <>
      <rect width="100" height="70" fill="#f5d8c7" />
      <path d={`M ${ROOT.x} 4 C ${ROOT.x - 2} 20, ${ROOT.x - 2} 40, ${ROOT.x} ${ROOT.y}`} fill="none" stroke="#8a5a4a" strokeWidth="1" />
      <path d={`M ${ROOT.x} ${ROOT.y} C ${ROOT.x + 10} ${ROOT.y + 4}, ${ROOT.x + 10} ${ROOT.y + 14}, ${ROOT.x - 2} 66`} fill="#fdfaf8" stroke="#c9a28f" strokeWidth="0.6" />
      <path d={`M ${ROOT.x} ${ROOT.y} A ${r * U} ${r * U} 0 0 0 ${ROOT.x} ${ROOT.y - 2 * r * U} Z`} fill="#cfe6f2" stroke="#8fb8cf" strokeWidth="0.6" />
      <path d={wrapPath(r, weak ? LASH_MM * 0.55 : LASH_MM)} fill="none" stroke="#1a1416" strokeWidth="0.9" strokeLinecap="round" strokeDasharray={frizz ? '1.2 0.5' : undefined} />
      <circle cx={ROOT.x} cy={ROOT.y} r="0.9" fill="#8a5a4a" />
      <Tag p={{ x: 30, y: 24 }} size={2.8} color="#8a5a4a">
        {s('Párpado', 'Lid')}
      </Tag>
      <Tag p={{ x: 30, y: 62 }} size={2.8} color="#8a5a4a">
        {s('Ojo', 'Eye')}
      </Tag>
      <Tag p={{ x: 78, y: 14 }} size={3.2} color="#3f6f8a">
        {s('Molde', 'Shield')} {SHIELDS[size - 1].name}
      </Tag>
      <Tag p={{ x: 78, y: 58 }} size={2.8}>
        {s('Pestaña de 8 mm', '8 mm lash')}
      </Tag>
    </>
  )
}

export const liftingLab: LabDef = {
  emoji: '🌙',
  title: tx('Práctica guiada: lifting de pestañas', 'Guided practice: lash lift'),
  viewBox: '0 0 100 70',
  background: '#f5d8c7',
  scene: (layers, s) => (
    <>
      <FrontEye lifted={layers.has('lifted')} shield={layers.has('shield')} frizz={layers.has('frizz')} lotion={layers.has('lotion')} tint={layers.has('tint')} />
      {layers.has('shieldTag') && <Tag p={{ x: 50, y: 24 }}>{s('Molde de silicona', 'Silicone shield')}</Tag>}
      {layers.has('lotionTag') && <Tag p={{ x: 50, y: 24 }}>{s('Loción solo en 2/3 desde la raíz', 'Lotion on the root 2/3 only')}</Tag>}
      {layers.has('frizzTag') && <Tag p={{ x: 50, y: 24 }}>{s('Puntas encrespadas', 'Frizzy tips')}</Tag>}
    </>
  ),
  learn: [
    {
      title: tx('Qué hace un lifting', 'What a lash lift does'),
      text: tx(
        'No alarga ni añade pestañas: eleva y curva las naturales desde la raíz, de forma que parecen más largas y abren la mirada durante 6–8 semanas.',
        'It doesn’t lengthen or add lashes: it lifts and curls the natural ones from the root, so they look longer and open the eye for 6–8 weeks.',
      ),
    },
    {
      title: tx('El molde', 'The shield'),
      text: tx(
        'Se pega un molde de silicona sobre el párpado, pegado a la línea de pestañas. Su tamaño decide cuánto se curvan: molde pequeño, más rizo; molde grande, efecto más suave.',
        'A silicone shield is stuck on the lid, right against the lash line. Its size decides how much the lashes curl: small shield, more curl; big shield, softer effect.',
      ),
      layers: ['shield', 'shieldTag'],
    },
    {
      title: tx('Peinar y fijar', 'Comb and fix'),
      text: tx(
        'Con un poco de adhesivo, se levantan las pestañas una a una sobre el molde, rectas y separadas. Una pestaña cruzada ahora será una pestaña cruzada durante semanas.',
        'With a little adhesive, lift the lashes one by one onto the shield, straight and separate. A crossed lash now stays crossed for weeks.',
      ),
      layers: ['shield', 'lifted'],
    },
    {
      title: tx('Las dos lociones', 'The two lotions'),
      text: tx(
        'La loción 1 rompe los enlaces de la queratina para que la pestaña tome la forma del molde. La loción 2 los vuelve a cerrar y la fija. Nunca se pone en las puntas: son la parte más frágil.',
        'Lotion 1 breaks the keratin bonds so the lash takes the shape of the shield. Lotion 2 closes them again and sets it. Never on the tips: they’re the most fragile part.',
      ),
      layers: ['shield', 'lifted', 'lotion', 'lotionTag'],
    },
    {
      title: tx('El resultado', 'The result'),
      text: tx(
        'Tras retirar el molde, se tiñe si la clienta quiere y se nutre con un aceite o sérum. Pestañas elevadas, separadas y sin encrespar.',
        'After removing the shield, tint if the client wants and nourish with an oil or serum. Lifted, separated lashes with no frizz.',
      ),
      layers: ['lifted', 'tint'],
    },
  ],
  tasks: [
    {
      kind: 'taporder',
      short: tx('Protocolo', 'Protocol'),
      title: tx('Ordena el protocolo', 'Put the protocol in order'),
      text: tx('Toca cada paso en el orden en que lo harías en cabina.', 'Tap each step in the order you’d do it in the treatment room.', 'Toca cada paso en el orden en que lo harías en el gabinete.'),
      spots: [
        { id: 'lotion2', at: { x: 12, y: 9 }, emoji: '💧', label: tx('Loción 2', 'Lotion 2'), why: tx('cierra los enlaces y fija la nueva forma.', 'closes the bonds and sets the new shape.') },
        { id: 'clean', at: { x: 37, y: 55 }, emoji: '🧴', label: tx('Limpiar', 'Cleanse'), why: tx('sin grasa ni maquillaje, el producto actúa igual en todas.', 'with no oil or make-up, the product works evenly.') },
        { id: 'nourish', at: { x: 88, y: 9 }, emoji: '🌿', label: tx('Nutrir', 'Nourish'), why: tx('devuelve hidratación a la pestaña tras la química.', 'puts moisture back into the lash after the chemistry.') },
        { id: 'pad', at: { x: 63, y: 55 }, emoji: '🩹', label: tx('Parche', 'Under-eye pad'), why: tx('protege la piel y aparta las pestañas inferiores.', 'protects the skin and keeps lower lashes away.') },
        { id: 'lotion1', at: { x: 12, y: 55 }, emoji: '🧪', label: tx('Loción 1', 'Lotion 1'), why: tx('ablanda la pestaña para que tome la forma del molde.', 'softens the lash so it takes the shield’s shape.') },
        { id: 'shield', at: { x: 37, y: 9 }, emoji: '🛡️', label: tx('Molde', 'Shield'), why: tx('el tamaño elegido según la longitud de la pestaña.', 'the size chosen for the lash length.') },
        { id: 'comb', at: { x: 88, y: 55 }, emoji: '🪮', label: tx('Peinar', 'Comb up'), why: tx('cada pestaña recta y separada sobre el molde.', 'every lash straight and separate on the shield.') },
        { id: 'tint', at: { x: 63, y: 9 }, emoji: '🎨', label: tx('Tinte', 'Tint'), why: tx('se tiñe después de fijar, con la pestaña ya elevada.', 'tint after setting, with the lash already lifted.') },
      ],
      order: ['clean', 'pad', 'shield', 'comb', 'lotion1', 'lotion2', 'tint', 'nourish'],
      hint: tx('Preparar, proteger, molde, peinar, las dos lociones, tinte y nutrir.', 'Prepare, protect, shield, comb, the two lotions, tint and nourish.'),
    },
    {
      kind: 'tune',
      short: tx('Molde y tiempo', 'Shield and time'),
      title: tx('Elige molde y tiempo', 'Choose the shield and time'),
      text: tx(
        `Clienta con pestañas de ${LASH_MM} mm, finas, que quiere un efecto natural elevado. Tu loción indica: finas 5–7 min, normales 8–10, gruesas 10–12.`,
        `Client with ${LASH_MM} mm fine lashes who wants a natural lifted look. Your lotion says: fine 5–7 min, normal 8–10, coarse 10–12.`,
      ),
      sliders: [
        { id: 'size', label: tx('Talla de molde', 'Shield size'), min: 1, max: 4, step: 1, start: 4, format: (v) => SHIELDS[v - 1].name },
        { id: 'minutes', label: tx('Loción 1', 'Lotion 1'), min: 3, max: 14, step: 1, start: 12, format: (v) => `${v} min` },
      ],
      visual: (v, s) => <SideEye size={v.size} minutes={v.minutes} s={s} />,
      readout: (v, s) => [
        { label: s('Curvatura', 'Curl'), value: `${Math.round(curlDeg(v.size))}°` },
        { label: s('Estado', 'Condition'), value: v.minutes > 7 ? s('se encrespa', 'frizzing') : v.minutes < 5 ? s('no se fija', 'won’t set') : s('sana', 'healthy') },
      ],
      check: (v) => [
        {
          ok: curlDeg(v.size) >= 120 && curlDeg(v.size) <= 165,
          msg: tx(
            'Molde M: la pestaña de 8 mm sube y se curva sin doblarse. Con S se dobla hacia el párpado; con L o XL apenas se nota.',
            'Shield M: an 8 mm lash lifts and curls without folding. On S it folds back onto the lid; on L or XL it barely shows.',
          ),
        },
        { ok: v.minutes >= 5 && v.minutes <= 7, msg: tx('Pestaña fina: 5–7 minutos. Más tiempo la encrespa; menos, no se fija.', 'Fine lashes: 5–7 minutes. Longer frizzes them; shorter won’t set.') },
      ],
      layers: ['side'],
    },
    {
      kind: 'choose',
      short: tx('Diagnóstico', 'Diagnosis'),
      title: tx('¿Qué ha pasado?', 'What went wrong?'),
      text: tx(
        'Una compañera te enseña este resultado: pestañas elevadas pero con las puntas encrespadas y sin brillo. ¿Cuál es la causa más probable?',
        'A colleague shows you this result: lifted lashes but with frizzy, dull tips. What’s the most likely cause?',
      ),
      layers: ['lifted', 'frizz', 'frizzTag'],
      options: [
        { text: tx('Molde demasiado grande', 'Shield too big'), good: false, feedback: tx('Un molde grande da poco rizo, pero no encrespa.', 'A big shield gives little curl, but doesn’t frizz.') },
        { text: tx('Loción 1 demasiado tiempo o hasta las puntas', 'Lotion 1 left too long or applied to the tips'), good: true, feedback: tx('Exacto: la pestaña se ha sobreprocesado. Ajusta el tiempo al grosor y deja las puntas libres.', 'Exactly: the lash was over-processed. Match the time to the thickness and keep the tips clear.') },
        { text: tx('Faltó el tinte', 'No tint was applied'), good: false, feedback: tx('El tinte da color, no cambia la textura.', 'Tint adds colour; it doesn’t change texture.') },
      ],
    },
  ],
  doneLayers: ['lifted', 'tint'],
  outro: tx(
    'Molde según la longitud, tiempo según el grosor y puntas siempre libres de producto: esas tres decisiones hacen un buen lifting.',
    'Shield by length, time by thickness and tips always free of product: those three decisions make a good lash lift.',
  ),
}
