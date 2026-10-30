import { tx } from '../i18n'
import { Tag } from './art'
import type { LabDef } from './engine'

// Cross-section of the skin, 100 × 80: epidermis at y 14–20, hair bulbs deep in the dermis.
const FOLLICLES = [25, 50, 75]
const WAVES = [755, 808, 1064]
const WAVE_COLOR = ['#ff5a5a', '#ff3b8b', '#b04bff']
const WAVE_DEPTH = [46, 58, 72]
// How much of the beam the melanin of a dark (type V) skin takes before it reaches the hair.
const SKIN_ABSORB = [1, 0.8, 0.3]

function Skin({ dark, phases }: { dark?: boolean; phases?: boolean }) {
  return (
    <>
      <rect width="100" height="80" fill="#f1cdbd" />
      <rect width="100" height="14" fill="#f4f1f6" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M0 ${26 + i * 6} C 25 ${24 + i * 6}, 50 ${28 + i * 6}, 100 ${25 + i * 6}`} fill="none" stroke="#e4b6a3" strokeWidth="0.4" />
      ))}
      <rect y="14" width="100" height="6" fill={dark ? '#8d5a3b' : '#e9c2a6'} />
      {FOLLICLES.map((x, i) => {
        const telogen = phases && i === 2
        const catagen = phases && i === 1
        const bulbY = telogen ? 40 : catagen ? 50 : 60
        return (
          <g key={x}>
            <path d={`M${x - 3} 20 L ${x - 3.5} ${bulbY} C ${x - 4} ${bulbY + 5}, ${x + 4} ${bulbY + 5}, ${x + 3.5} ${bulbY} L ${x + 3} 20 Z`} fill="#e7b9a6" stroke="#d29c88" strokeWidth="0.3" />
            <line x1={x} y1={12.5} x2={x} y2={bulbY} stroke="#2b2228" strokeWidth={telogen ? 0.7 : 1.1} />
            <ellipse cx={x} cy={bulbY + 1} rx={telogen ? 1.2 : 2.6} ry={telogen ? 1.2 : 2.2} fill="#2b2228" />
          </g>
        )
      })}
    </>
  )
}

function Beam({ wave, fluence = 18 }: { wave: number; fluence?: number }) {
  return (
    <g>
      <defs>
        <linearGradient id={`beam${wave}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={WAVE_COLOR[wave]} stopOpacity={0.25 + fluence / 80} />
          <stop offset="100%" stopColor={WAVE_COLOR[wave]} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M42 0 L 58 0 L 62 ${WAVE_DEPTH[wave]} L 38 ${WAVE_DEPTH[wave]} Z`} fill={`url(#beam${wave})`} />
      <rect x="40" y="0" width="20" height="4" rx="1" fill="#55505a" />
    </g>
  )
}

function risk(v: Record<string, number>) {
  return (v.fluence / 22) * SKIN_ABSORB[v.wave] * (v.pulse >= 30 ? 0.75 : 1.3) * (v.cool ? 0.65 : 1)
}
const reaches = (v: Record<string, number>) => WAVE_DEPTH[v.wave] >= 58 && v.fluence >= 10

export const laserLab: LabDef = {
  emoji: '⚡',
  title: tx('Práctica guiada: ajusta el láser', 'Guided practice: set up the laser'),
  viewBox: '0 0 100 80',
  background: '#f1cdbd',
  scene: (layers, s) => (
    <>
      <Skin dark={layers.has('dark')} phases={layers.has('phases')} />
      <Tag p={{ x: 9, y: 18.4 }} size={2.4} color={layers.has('dark') ? '#fff' : '#7a4e3e'}>
        {s('Epidermis', 'Epidermis')}
      </Tag>
      <Tag p={{ x: 9, y: 76 }} size={2.4} color="#7a4e3e">
        {s('Dermis', 'Dermis')}
      </Tag>
      {layers.has('beam') && (
        <g className="fade-in">
          <Beam wave={1} />
          {layers.has('hot') && <circle cx="50" cy="61" r="5" fill="#ff8a3d" opacity="0.55" className="pulse-ring" />}
        </g>
      )}
      {layers.has('phases') && (
        <g className="fade-in">
          <Tag p={{ x: 25, y: 72 }} size={2.8}>{s('Anágena ✓', 'Anagen ✓')}</Tag>
          <Tag p={{ x: 50, y: 62 }} size={2.8}>{s('Catágena', 'Catagen')}</Tag>
          <Tag p={{ x: 75, y: 52 }} size={2.8}>{s('Telógena', 'Telogen')}</Tag>
        </g>
      )}
      {layers.has('cool') && (
        <g className="fade-in">
          <rect x="38" y="4" width="24" height="5" rx="1.5" fill="#bfe3f7" stroke="#7fb3c9" strokeWidth="0.4" />
          <Tag p={{ x: 50, y: 8 }} size={2.8} color="#2f6aa0">
            ❄ {s('Enfriamiento', 'Cooling')}
          </Tag>
          <Tag p={{ x: 82, y: 9 }} size={2.8}>🕶 {s('Gafas', 'Goggles')}</Tag>
        </g>
      )}
    </>
  ),
  learn: [
    {
      title: tx('Fototermólisis selectiva', 'Selective photothermolysis'),
      text: tx(
        'La luz del láser la absorbe la melanina del pelo y se convierte en calor. Ese calor baja por el tallo y destruye el bulbo, sin dañar lo que hay alrededor.',
        'The laser light is absorbed by the melanin in the hair and turns into heat. That heat travels down the shaft and destroys the bulb without harming the tissue around it.',
      ),
      layers: ['beam', 'hot'],
    },
    {
      title: tx('Solo en fase anágena', 'Only in the anagen phase'),
      text: tx(
        'Solo el pelo en crecimiento está unido al bulbo y conduce el calor. Por eso hacen falta varias sesiones, cada 4–8 semanas según la zona.',
        'Only growing hair is attached to the bulb and carries the heat. That is why several sessions are needed, every 4–8 weeks depending on the area.',
      ),
      layers: ['phases'],
    },
    {
      title: tx('El fototipo lo cambia todo', 'Skin type changes everything'),
      text: tx(
        'En pieles oscuras, la melanina de la epidermis compite con la del pelo y puede quemarse. Usa longitudes de onda más largas (Nd:YAG 1064 nm), menos fluencia y pulsos largos.',
        'In darker skin, the melanin in the epidermis competes with the hair and can burn. Use longer wavelengths (Nd:YAG 1064 nm), lower fluence and long pulses.',
      ),
      layers: ['dark'],
    },
    {
      title: tx('Seguridad ante todo', 'Safety first'),
      text: tx(
        'Gafas para ti y para la clienta, zona rasurada, enfriamiento de la piel y un disparo de prueba antes de tratar toda la zona.',
        'Goggles for you and the client, a shaved area, skin cooling and a test shot before treating the whole area.',
      ),
      layers: ['cool'],
    },
  ],
  tasks: [
    {
      kind: 'tune',
      short: tx('Parámetros', 'Settings'),
      title: tx('Ajusta el equipo para esta clienta', 'Set the device for this client'),
      text: tx(
        'Fototipo V, vello negro y grueso en las piernas. Elige longitud de onda, fluencia, duración de pulso y enfriamiento.',
        'Skin type V, thick black hair on the legs. Choose wavelength, fluence, pulse duration and cooling.',
      ),
      layers: ['dark'],
      sliders: [
        { id: 'wave', label: tx('Longitud de onda', 'Wavelength'), min: 0, max: 2, step: 1, start: 0, format: (v) => `${WAVES[v]} nm` },
        { id: 'fluence', label: tx('Fluencia', 'Fluence'), min: 5, max: 40, step: 1, start: 32, format: (v) => `${v} J/cm²` },
        { id: 'pulse', label: tx('Duración de pulso', 'Pulse duration'), min: 5, max: 60, step: 5, start: 10, format: (v) => `${v} ms` },
        { id: 'cool', label: tx('Enfriamiento', 'Cooling'), min: 0, max: 1, step: 1, start: 0, format: (v, s) => (v ? s('Sí', 'On') : s('No', 'Off')) },
      ],
      visual: (v) => {
        const r = risk(v)
        return (
          <>
            <Beam wave={v.wave} fluence={v.fluence} />
            {r > 0.45 && <rect y="14" width="100" height="6" fill="#ff3b1f" opacity={Math.min(0.85, r - 0.3)} />}
            {reaches(v) && <circle cx="50" cy="61" r="5" fill="#ff8a3d" opacity="0.6" />}
            {v.cool === 1 && <rect x="38" y="9" width="24" height="3" rx="1" fill="#bfe3f7" opacity="0.9" />}
          </>
        )
      },
      readout: (v, s) => {
        const r = risk(v)
        return [
          { label: s('Riesgo de quemadura', 'Burn risk'), value: r > 0.8 ? s('alto 🔥', 'high 🔥') : r > 0.45 ? s('medio', 'medium') : s('bajo', 'low') },
          { label: s('Calor en el bulbo', 'Heat at the bulb'), value: reaches(v) ? s('suficiente', 'enough') : s('no llega', 'not reaching') },
        ]
      },
      check: (v) => [
        { ok: v.wave === 2, msg: tx('1064 nm (Nd:YAG): la epidermis oscura apenas lo absorbe y llega profundo.', '1064 nm (Nd:YAG): dark epidermis barely absorbs it and it reaches deep.') },
        { ok: v.fluence >= 10 && v.fluence <= 25, msg: tx('Fluencia moderada (10–25 J/cm²): suficiente para el bulbo sin quemar.', 'Moderate fluence (10–25 J/cm²): enough for the bulb without burning.') },
        { ok: v.pulse >= 30, msg: tx('Pulso largo (30 ms o más): da tiempo a la piel a enfriarse.', 'Long pulse (30 ms or more): gives the skin time to cool down.') },
        { ok: v.cool === 1, msg: tx('Enfriamiento activado: protege la epidermis.', 'Cooling on: it protects the epidermis.') },
      ],
    },
    {
      kind: 'taporder',
      short: tx('Seguridad', 'Safety'),
      title: tx('Sigue el protocolo de seguridad', 'Follow the safety protocol'),
      text: tx('Toca los pasos en el orden correcto, desde que llega la clienta hasta que se va.', 'Tap the steps in the right order, from the moment the client arrives until she leaves.'),
      spots: [
        { id: 'test', at: { x: 84, y: 30 }, emoji: '🎯', label: tx('Disparo de prueba', 'Test shot'), why: tx('en una zona pequeña; revisa la reacción antes de seguir.', 'on a small area; check the reaction before going on.') },
        { id: 'after', at: { x: 50, y: 62 }, emoji: '🧴', label: tx('Calmar + SPF', 'Soothe + SPF'), why: tx('aloe o crema calmante y protección solar.', 'aloe or soothing cream and sun protection.') },
        { id: 'consent', at: { x: 16, y: 30 }, emoji: '📝', label: tx('Ficha y fototipo', 'Record and skin type'), why: tx('consentimiento, medicación fotosensibilizante y fototipo.', 'consent, photosensitising medication and skin type.') },
        { id: 'treat', at: { x: 16, y: 62 }, emoji: '⚡', label: tx('Tratamiento', 'Treatment'), why: tx('pasadas ordenadas, sin solapar en exceso.', 'orderly passes, without too much overlap.') },
        { id: 'goggles', at: { x: 50, y: 30 }, emoji: '🕶️', label: tx('Gafas', 'Goggles'), why: tx('para la clienta y para ti antes de encender.', 'for the client and for you before switching on.') },
        { id: 'shave', at: { x: 84, y: 62 }, emoji: '🪒', label: tx('Rasurar', 'Shave'), why: tx('el pelo fuera de la piel solo quemaría la superficie.', 'hair above the skin would only burn the surface.') },
      ],
      order: ['consent', 'shave', 'goggles', 'test', 'treat', 'after'],
      hint: tx('Primero la ficha, después preparar la zona, protegerse, probar, tratar y cuidar.', 'First the record, then prepare the area, protect, test, treat and care.'),
    },
  ],
  outro: tx(
    'Ante la duda, baja la fluencia y repite el disparo de prueba: una sesión menos eficaz se recupera, una quemadura no.',
    'When in doubt, lower the fluence and repeat the test shot: a less effective session can be made up, a burn cannot.',
  ),
}
