import { tx } from '../i18n'
import { Tag } from './art'
import type { LabDef } from './engine'

// Lab bench, 100 × 80: a pH strip on top, a beaker in the middle.
const phX = (ph: number) => 8 + (84 * ph) / 14
const phColor = (ph: number) => `hsl(${(ph / 14) * 270}, 70%, 55%)`
const SLOTS = { vitc: { x: 17, y: 52 }, spf: { x: 37, y: 52 }, retinol: { x: 63, y: 52 }, cream: { x: 83, y: 52 } }

function Bench({ beaker = true, liquid = 40, ph = 5.5 }: { beaker?: boolean; liquid?: number; ph?: number }) {
  const top = 70 - liquid * 0.9
  return (
    <>
      <defs>
        <linearGradient id="ph-scale">
          {Array.from({ length: 8 }, (_, i) => (
            <stop key={i} offset={`${(i / 7) * 100}%`} stopColor={phColor((i / 7) * 14)} />
          ))}
        </linearGradient>
      </defs>
      <rect width="100" height="80" fill="#eef3f4" />
      <rect y="72" width="100" height="8" fill="#d9e2e4" />
      <rect x="8" y="6" width="84" height="5" rx="1" fill="url(#ph-scale)" />
      {[0, 7, 14].map((n) => (
        <text key={n} x={phX(n)} y="15" textAnchor="middle" fontSize="2.6" fill="#55505a">
          {n}
        </text>
      ))}
      <text x="4" y="10" fontSize="2.6" fontWeight="700" fill="#55505a">
        pH
      </text>
      {beaker && (
        <g>
          <path d={`M41 ${top} L 59 ${top} L 59 68 Q 59 71, 56 71 L 44 71 Q 41 71, 41 68 Z`} fill={phColor(ph)} opacity="0.75" />
          <path d="M40 26 L 40 68 Q 40 72, 44 72 L 56 72 Q 60 72, 60 68 L 60 26" fill="none" stroke="#9fb3b8" strokeWidth="0.8" />
          {[36, 46, 56].map((y) => (
            <line key={y} x1="40" x2="43" y1={y} y2={y} stroke="#9fb3b8" strokeWidth="0.4" />
          ))}
        </g>
      )}
    </>
  )
}

function PhMark({ ph, label, from, to }: { ph?: number; label: string; from?: number; to?: number }) {
  return (
    <g className="fade-in">
      {from !== undefined && to !== undefined && <rect x={phX(from)} y="4.6" width={phX(to) - phX(from)} height="7.8" fill="none" stroke="#2b2228" strokeWidth="0.5" rx="0.6" />}
      {ph !== undefined && <path d={`M${phX(ph)} 12.5 l -1.4 2.4 h 2.8 Z`} fill="#2b2228" />}
      <Tag p={{ x: phX(ph ?? ((from ?? 0) + (to ?? 0)) / 2), y: 20 }} size={2.8}>
        {label}
      </Tag>
    </g>
  )
}

export const cosmetologyLab: LabDef = {
  emoji: '🧪',
  title: tx('Práctica guiada: formula y receta activos', 'Guided practice: formulate and prescribe actives'),
  viewBox: '0 0 100 80',
  background: '#eef3f4',
  scene: (layers, s) => (
    <>
      <Bench beaker={!layers.has('routine')} liquid={layers.has('aha') ? 45 : 30} ph={layers.has('aha') ? 3.8 : 5.5} />
      {layers.has('skinph') && <PhMark from={4.5} to={5.5} label={s('Piel sana: 4,5–5,5', 'Healthy skin: 4.5–5.5')} />}
      {layers.has('aha') && <PhMark from={3.5} to={4.2} label={s('AHA: eficaz y tolerable', 'AHA: effective and tolerable')} />}
      {layers.has('ampm') && (
        <g className="fade-in">
          <Tag p={{ x: 20, y: 40 }} size={3.4}>☀️</Tag>
          <Tag p={{ x: 20, y: 46 }} size={2.8}>{s('Vitamina C', 'Vitamin C')}</Tag>
          <Tag p={{ x: 20, y: 50 }} size={2.8}>+ SPF</Tag>
          <Tag p={{ x: 80, y: 40 }} size={3.4}>🌙</Tag>
          <Tag p={{ x: 80, y: 46 }} size={2.8}>Retinol</Tag>
          <Tag p={{ x: 80, y: 50 }} size={2.8}>{s('o ácidos', 'or acids')}</Tag>
        </g>
      )}
      {layers.has('sun') && (
        <g className="fade-in">
          <circle cx="82" cy="36" r="6" fill="#f3c34a" />
          <Tag p={{ x: 50, y: 78 }} size={2.8}>{s('Con AHA o retinol: SPF 50 cada mañana', 'With AHAs or retinol: SPF 50 every morning')}</Tag>
        </g>
      )}
      {layers.has('routine') && (
        <g>
          <rect x="8" y="34" width="38" height="30" rx="3" fill="#fff6dc" stroke="#e8d39a" strokeWidth="0.5" />
          <rect x="54" y="34" width="38" height="30" rx="3" fill="#e6e9f7" stroke="#b6bde3" strokeWidth="0.5" />
          <Tag p={{ x: 27, y: 39 }}>☀️ {s('Mañana', 'Morning')}</Tag>
          <Tag p={{ x: 73, y: 39 }}>🌙 {s('Noche', 'Night')}</Tag>
          {Object.values(SLOTS).map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="4.5" fill="none" stroke="#9a8f95" strokeWidth="0.4" strokeDasharray="1 0.8" />
          ))}
          {[SLOTS.vitc, SLOTS.retinol].map((p, i) => (
            <text key={i} x={p.x} y={p.y + 8} textAnchor="middle" fontSize="2.4" fill="#76686f">
              1º
            </text>
          ))}
          {[SLOTS.spf, SLOTS.cream].map((p, i) => (
            <text key={i} x={p.x} y={p.y + 8} textAnchor="middle" fontSize="2.4" fill="#76686f">
              2º
            </text>
          ))}
        </g>
      )}
    </>
  ),
  learn: [
    {
      title: tx('El manto ácido', 'The acid mantle'),
      text: tx(
        'La piel sana tiene un pH ligeramente ácido, entre 4,5 y 5,5. Ese manto ácido la protege de bacterias y mantiene la barrera en buen estado.',
        'Healthy skin is slightly acidic, between pH 4.5 and 5.5. That acid mantle protects it from bacteria and keeps the barrier in good shape.',
      ),
      layers: ['skinph'],
    },
    {
      title: tx('Ácidos: porcentaje y pH', 'Acids: percentage and pH'),
      text: tx(
        'Un AHA como el glicólico depende de dos cosas: su concentración y el pH de la fórmula. Para casa, 5–10 % a pH 3,5–4,2 exfolia sin irritar.',
        'An AHA like glycolic acid depends on two things: its concentration and the pH of the formula. For home use, 5–10% at pH 3.5–4.2 exfoliates without irritating.',
      ),
      layers: ['aha'],
    },
    {
      title: tx('Cada activo, a su hora', 'Each active at its time'),
      text: tx(
        'La vitamina C es antioxidante: de día, bajo el protector. El retinol y los ácidos se degradan con la luz y sensibilizan: de noche.',
        'Vitamin C is an antioxidant: by day, under sunscreen. Retinol and acids break down in light and sensitise: at night.',
      ),
      layers: ['ampm'],
    },
    {
      title: tx('El protector no es opcional', 'Sunscreen is not optional'),
      text: tx(
        'Exfoliantes y retinoides hacen la piel más sensible al sol. Si los recomiendas, recomienda también un SPF 50 diario.',
        'Exfoliants and retinoids make skin more sun-sensitive. If you recommend them, recommend a daily SPF 50 too.',
      ),
      layers: ['sun'],
    },
  ],
  tasks: [
    {
      kind: 'tune',
      short: tx('Formular', 'Formulate'),
      title: tx('Formula un sérum exfoliante', 'Formulate an exfoliating serum'),
      text: tx(
        'Clienta con piel grasa que nunca ha usado ácidos. Ajusta el porcentaje de glicólico, el pH y cuántas noches por semana lo usará al principio.',
        'Client with oily skin who has never used acids. Set the glycolic percentage, the pH and how many nights a week she will use it at first.',
      ),
      sliders: [
        { id: 'pct', label: tx('Ácido glicólico', 'Glycolic acid'), min: 1, max: 30, step: 1, start: 20, format: (v) => `${v} %` },
        { id: 'ph', label: tx('pH de la fórmula', 'Formula pH'), min: 1.5, max: 7, step: 0.1, start: 2, format: (v, s) => v.toFixed(1).replace('.', s(',', '.')) },
        { id: 'nights', label: tx('Noches por semana', 'Nights per week'), min: 1, max: 7, step: 1, start: 7, format: (v) => `${v}` },
      ],
      visual: (v, s) => (
        <>
          <Bench liquid={v.pct * 2} ph={v.ph} />
          <PhMark ph={v.ph} label={`pH ${v.ph.toFixed(1).replace('.', s(',', '.'))}`} />
          <Tag p={{ x: 50, y: 78 }} size={2.8}>
            {'🌙'.repeat(v.nights)}
          </Tag>
        </>
      ),
      check: (v) => [
        { ok: v.pct >= 5 && v.pct <= 10, msg: tx('Glicólico al 5–10 %: concentración segura para uso en casa.', 'Glycolic at 5–10%: a safe concentration for home use.') },
        { ok: v.ph >= 3.5 && v.ph <= 4.2, msg: tx('pH 3,5–4,2: por debajo irrita, por encima casi no exfolia.', 'pH 3.5–4.2: lower irritates, higher barely exfoliates.') },
        { ok: v.nights >= 2 && v.nights <= 3, msg: tx('Empieza con 2–3 noches por semana y sube según tolere.', 'Start with 2–3 nights a week and increase as tolerated.') },
      ],
    },
    {
      kind: 'place',
      short: tx('Rutina', 'Routine'),
      title: tx('Monta su rutina de mañana y noche', 'Build her morning and night routine'),
      text: tx('Arrastra cada producto a su momento del día y en su orden de aplicación.', 'Drag each product to its time of day and in its order of application.'),
      layers: ['routine'],
      handles: [
        { id: 'retinol', label: tx('Retinol', 'Retinol'), start: { x: 14, y: 74 }, target: SLOTS.retinol, tol: 4.5, hint: tx('la luz lo degrada: de noche, primero.', 'light breaks it down: at night, first.') },
        { id: 'spf', label: tx('SPF 50', 'SPF 50'), start: { x: 38, y: 74 }, target: SLOTS.spf, tol: 4.5, hint: tx('por la mañana y siempre el último.', 'in the morning and always last.') },
        { id: 'cream', label: tx('Crema', 'Cream'), start: { x: 62, y: 74 }, target: SLOTS.cream, tol: 4.5, hint: tx('de noche, encima del retinol para calmar.', 'at night, over the retinol to soothe.') },
        { id: 'vitc', label: tx('Vitamina C', 'Vitamin C'), start: { x: 86, y: 74 }, target: SLOTS.vitc, tol: 4.5, hint: tx('antioxidante de día: por la mañana, antes del SPF.', 'daytime antioxidant: in the morning, before SPF.') },
      ],
    },
    {
      kind: 'choose',
      short: tx('Caso', 'Case'),
      title: tx('Retinol y peeling', 'Retinol and a peel'),
      text: tx(
        'Una clienta usa retinol cada noche y quiere un peeling de glicólico en cabina el viernes. ¿Qué le indicas?',
        'A client uses retinol every night and wants an in-salon glycolic peel on Friday. What do you tell her?',
      ),
      layers: ['sun'],
      options: [
        { text: tx('Que deje el retinol 3–5 días antes', 'Stop the retinol 3–5 days before'), good: true, feedback: tx('Correcto: así evitas una irritación fuerte. Lo retoma unos días después, cuando la piel esté calmada.', 'Correct: that avoids strong irritation. She resumes it a few days later, once the skin has calmed down.') },
        { text: tx('Que se lo ponga justo antes del peeling para potenciarlo', 'Apply it right before the peel to boost it'), good: false, feedback: tx('Sumar retinol y ácido en el mismo momento puede provocar quemaduras químicas.', 'Combining retinol and acid at the same time can cause chemical burns.') },
        { text: tx('Nada, no influye', 'Nothing, it makes no difference'), good: false, feedback: tx('Sí influye: el retinol adelgaza la capa córnea y el ácido penetra mucho más.', 'It does: retinol thins the outer layer and the acid penetrates much further.') },
      ],
    },
  ],
  outro: tx(
    'Introduce los activos de uno en uno: si algo irrita, sabrás exactamente qué ha sido.',
    'Introduce actives one at a time: if something irritates, you will know exactly what it was.',
  ),
}
