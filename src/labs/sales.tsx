import { tx } from '../i18n'
import { Tag } from './art'
import type { LabDef } from './engine'

// Consultation table, 100 × 80: the esthetician on the left, the client on the right, a shelf above.
const PRODUCTS = [
  { name: tx('Sérum vit. C', 'Vit. C serum'), price: 32, color: '#f0a33a' },
  { name: tx('SPF 50', 'SPF 50'), price: 22, color: '#f3c34a' },
  { name: tx('Limpiador', 'Cleanser'), price: 18, color: '#7fb3c9' },
  { name: tx('Crema', 'Cream'), price: 26, color: '#e7a6b8' },
  { name: tx('Mascarilla', 'Mask'), price: 20, color: '#9ccf9a' },
]
const BUDGET = 60
const COST_SHARE = 0.5

const pack = (v: Record<string, number>) => {
  const list = PRODUCTS.slice(0, v.n).reduce((a, p) => a + p.price, 0)
  const total = list * (1 - v.discount / 100)
  const cost = list * COST_SHARE
  return { list, total, margin: total > 0 ? (total - cost) / total : 0 }
}
const eur = (n: number) => `${n.toFixed(n % 1 ? 2 : 0).replace('.', ',')} €`

function Person({ x, color, hair }: { x: number; color: string; hair: string }) {
  return (
    <g>
      <path d={`M${x - 9} 66 C ${x - 9} 52, ${x + 9} 52, ${x + 9} 66 Z`} fill={color} />
      <circle cx={x} cy="44" r="6" fill="#eec3ac" />
      <path d={`M${x - 6.5} 44 C ${x - 7} 35, ${x + 7} 35, ${x + 6.5} 44 C ${x + 4} 39, ${x - 4} 39, ${x - 6.5} 44 Z`} fill={hair} />
    </g>
  )
}

function Bottle({ x, y, color, label }: { x: number; y: number; color: string; label?: string }) {
  return (
    <g>
      <rect x={x - 2.5} y={y - 7} width="5" height="7" rx="1" fill={color} />
      <rect x={x - 1.2} y={y - 9} width="2.4" height="2" fill="#55505a" />
      {label && (
        <text x={x} y={y + 3} textAnchor="middle" fontSize="2" fill="#55505a">
          {label}
        </text>
      )}
    </g>
  )
}

function Bubble({ x, y, w, text }: { x: number; y: number; w: number; text: string }) {
  return (
    <g className="fade-in">
      <rect x={x - w / 2} y={y - 5} width={w} height="8" rx="3" fill="#fff" stroke="#d8cdd2" strokeWidth="0.4" />
      <text x={x} y={y + 0.3} textAnchor="middle" fontSize="2.6" fill="#2b2228">
        {text}
      </text>
    </g>
  )
}

export const salesLab: LabDef = {
  emoji: '🛍️',
  title: tx('Práctica guiada: una consulta que vende', 'Guided practice: a consultation that sells'),
  viewBox: '0 0 100 80',
  background: '#f7efe9',
  scene: (layers, s) => (
    <>
      <rect width="100" height="80" fill="#f7efe9" />
      <rect x="10" y="14" width="80" height="1.4" fill="#c9b4a6" />
      {PRODUCTS.map((p, i) => (
        <Bottle key={i} x={22 + i * 14} y={14} color={p.color} />
      ))}
      <Person x={24} color="#c2577a" hair="#5a3a2c" />
      <Person x={76} color="#6f8fb3" hair="#2b2228" />
      <rect x="6" y="64" width="88" height="16" rx="2" fill="#d9c3b4" />
      {layers.has('listen') && (
        <>
          <Bubble x={70} y={27} w={44} text={s('Me salen manchas con el sol…', 'I get dark spots in the sun…')} />
          <Bubble x={26} y={27} w={30} text={s('¿Desde cuándo?', 'Since when?')} />
        </>
      )}
      {layers.has('objection') && <Bubble x={72} y={27} w={36} text={s('Es un poco caro…', 'It’s a bit expensive…')} />}
      {layers.has('need') && (
        <g className="fade-in">
          <circle cx="22" cy="10" r="7" fill="none" stroke="#c2577a" strokeWidth="0.6" className="pulse-ring" />
          <Bottle x={50} y={72} color={PRODUCTS[0].color} />
        </g>
      )}
      {layers.has('benefit') && (
        <>
          <Bubble x={36} y={27} w={58} text={s('Tus manchas se irán aclarando', 'Your spots will gradually fade')} />
        </>
      )}
      {layers.has('close') && (
        <g className="fade-in">
          <Bubble x={36} y={27} w={56} text={s('¿Te veo en 4 semanas y lo revisamos?', 'See you in 4 weeks to review it?')} />
          <Tag p={{ x: 50, y: 74 }} size={5}>
            📅
          </Tag>
        </g>
      )}
    </>
  ),
  learn: [
    {
      title: tx('Escucha más de lo que hablas', 'Listen more than you talk'),
      text: tx(
        'Haz preguntas abiertas (¿qué te preocupa?, ¿desde cuándo?, ¿qué usas ahora?) y deja hablar a la clienta. La venta sale de lo que te cuenta.',
        'Ask open questions (what worries you? since when? what do you use now?) and let the client talk. The sale comes from what she tells you.',
      ),
      layers: ['listen'],
    },
    {
      title: tx('Recomienda por necesidad, no por stock', 'Recommend by need, not by stock'),
      text: tx(
        'Una preocupación principal, un producto clave. Si recomiendas diez cosas, no se lleva ninguna y pierde la confianza.',
        'One main concern, one key product. If you recommend ten things, she buys none and loses trust.',
      ),
      layers: ['need'],
    },
    {
      title: tx('Habla de beneficios', 'Talk about benefits'),
      text: tx(
        'No digas «tiene vitamina C al 15 %», di lo que va a notar: «tus manchas se irán aclarando y la piel tendrá más luz».',
        'Don’t say “it has 15% vitamin C”, say what she will notice: “your spots will fade and your skin will look brighter”.',
      ),
      layers: ['benefit'],
    },
    {
      title: tx('Cierra y fideliza', 'Close and build loyalty'),
      text: tx(
        'Resume la rutina, confirma el precio y deja agendada la próxima cita. La clienta que vuelve vale mucho más que la venta de hoy.',
        'Sum up the routine, confirm the price and book the next appointment. A client who comes back is worth far more than today’s sale.',
      ),
      layers: ['close'],
    },
  ],
  tasks: [
    {
      kind: 'taporder',
      short: tx('Consulta', 'Consultation'),
      title: tx('Ordena la consulta', 'Put the consultation in order'),
      text: tx('Toca las fases de la consulta en el orden correcto.', 'Tap the stages of the consultation in the right order.'),
      spots: [
        { id: 'recommend', at: { x: 50, y: 46 }, emoji: '💡', label: tx('Recomendar', 'Recommend'), why: tx('un producto clave para su preocupación principal.', 'one key product for her main concern.') },
        { id: 'hello', at: { x: 12, y: 30 }, emoji: '👋', label: tx('Bienvenida', 'Welcome'), why: tx('por su nombre y con una sonrisa.', 'by name and with a smile.') },
        { id: 'follow', at: { x: 88, y: 66 }, emoji: '📅', label: tx('Próxima cita', 'Next visit'), why: tx('agendada antes de que se vaya.', 'booked before she leaves.') },
        { id: 'ask', at: { x: 50, y: 30 }, emoji: '❓', label: tx('Preguntar', 'Ask'), why: tx('preguntas abiertas sobre su piel y su rutina.', 'open questions about her skin and routine.') },
        { id: 'close', at: { x: 12, y: 66 }, emoji: '🧾', label: tx('Cierre', 'Close'), why: tx('resume la rutina y confirma el precio.', 'sum up the routine and confirm the price.') },
        { id: 'diagnose', at: { x: 88, y: 30 }, emoji: '🔍', label: tx('Diagnosticar', 'Analyse'), why: tx('mira su piel y confirma lo que te ha contado.', 'look at her skin and confirm what she told you.') },
      ],
      order: ['hello', 'ask', 'diagnose', 'recommend', 'close', 'follow'],
      hint: tx('Primero conocer, después recomendar y al final cerrar y fidelizar.', 'First get to know her, then recommend, and finally close and build loyalty.'),
    },
    {
      kind: 'tune',
      short: tx('Pack', 'Bundle'),
      title: tx('Prepara un pack a su medida', 'Build a bundle that fits her'),
      text: tx(
        'Laura, 34 años, tiene manchas de sol y un presupuesto de 60 €. Elige cuántos productos del estante incluyes (por orden de prioridad) y el descuento del pack. Cada producto le cuesta al centro la mitad de su PVP.',
        'Laura, 34, has sun spots and a budget of €60. Choose how many shelf products to include (in order of priority) and the bundle discount. Each product costs the salon half its retail price.',
      ),
      sliders: [
        { id: 'n', label: tx('Productos en el pack', 'Products in the bundle'), min: 1, max: 5, step: 1, start: 5 },
        { id: 'discount', label: tx('Descuento', 'Discount'), min: 0, max: 30, step: 5, start: 0, format: (v) => `${v} %` },
      ],
      visual: (v, s) => (
        <>
          {PRODUCTS.slice(0, v.n).map((p, i) => (
            <Bottle key={i} x={50 - (v.n - 1) * 5 + i * 10} y={74} color={p.color} label={s(p.name.es, p.name.en)} />
          ))}
          <rect x="36" y="22" width="28" height="8" rx="2" fill={pack(v).total <= BUDGET ? '#2f8a5b' : '#c0392b'} />
          <text x="50" y="27.6" textAnchor="middle" fontSize="3.6" fontWeight="700" fill="#fff">
            {eur(pack(v).total)}
          </text>
        </>
      ),
      readout: (v, s) => [
        { label: s('Precio del pack', 'Bundle price'), value: eur(pack(v).total) },
        { label: s('Margen del centro', 'Salon margin'), value: `${Math.round(pack(v).margin * 100)} %` },
      ],
      check: (v) => [
        { ok: v.n >= 3, msg: tx('Rutina completa: tratar (sérum), proteger (SPF) y limpiar.', 'Complete routine: treat (serum), protect (SPF) and cleanse.') },
        { ok: pack(v).total <= BUDGET, msg: tx('Dentro de su presupuesto de 60 €.', 'Within her €60 budget.') },
        { ok: pack(v).margin >= 0.3, msg: tx('El centro conserva al menos un 30 % de margen.', 'The salon keeps at least a 30% margin.') },
      ],
    },
    {
      kind: 'choose',
      short: tx('Objeción', 'Objection'),
      title: tx('«Es un poco caro»', '“It’s a bit expensive”'),
      text: tx('Laura duda con el precio. ¿Qué respondes?', 'Laura hesitates over the price. What do you say?'),
      layers: ['objection'],
      options: [
        { text: tx('«Te hago un 50 % si lo compras hoy»', '“I’ll give you 50% off if you buy today”'), good: false, feedback: tx('Regalas tu margen y le enseñas que el precio real no vale lo que pides.', 'You give away your margin and teach her the real price isn’t worth it.') },
        { text: tx('«Entiendo. Te dura unos tres meses: sale a menos de 70 céntimos al día. ¿Empezamos por el sérum y el SPF?»', '“I understand. It lasts about three months: under 70 cents a day. Shall we start with the serum and SPF?”'), good: true, feedback: tx('Validas su duda, das contexto al precio y le ofreces un primer paso fácil.', 'You acknowledge her concern, put the price in context and offer an easy first step.') },
        { text: tx('«Pues es lo que hay»', '“Well, that’s the price”'), good: false, feedback: tx('Cierras la conversación y, con ella, la venta y la confianza.', 'You end the conversation, and with it the sale and her trust.') },
      ],
    },
  ],
  outro: tx(
    'Anota en su ficha qué se ha llevado: en la próxima cita podrás preguntar cómo le ha ido y ajustar.',
    'Note what she bought on her record card: at the next visit you can ask how it went and adjust.',
  ),
}
