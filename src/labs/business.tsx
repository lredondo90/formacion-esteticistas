import { tx } from '../i18n'
import { Tag } from './art'
import type { LabDef } from './engine'

// A small dashboard, 100 × 80, whose bars react to the numbers.
const COSTS = { product: 7, labour: 15, overhead: 9 }
const UNIT_COST = COSTS.product + COSTS.labour + COSTS.overhead
const FIXED = 2400
const PRICE = 55
const CONTRIBUTION = PRICE - COSTS.product - COSTS.labour
const CAPACITY = 120
const eur = (n: number) => `${Math.round(n).toLocaleString('es-ES')} €`

function Board() {
  return (
    <>
      <rect width="100" height="80" fill="#f4f1f6" />
      <rect x="6" y="6" width="88" height="68" rx="3" fill="#fff" stroke="#e2dbe6" strokeWidth="0.5" />
      <line x1="14" y1="64" x2="88" y2="64" stroke="#cfc6d4" strokeWidth="0.5" />
    </>
  )
}

// Stacked cost bar next to the price bar. 1 € = 0.6 units of height.
function PriceBars({ price, s }: { price: number; s: (es: string, en: string) => string }) {
  const k = 0.6
  const parts = [
    { v: COSTS.product, c: '#7fb3c9', l: s('Producto', 'Product') },
    { v: COSTS.labour, c: '#c2577a', l: s('Tiempo', 'Time') },
    { v: COSTS.overhead, c: '#9a8f95', l: s('Fijos', 'Overheads') },
  ]
  let y = 64
  const margin = (price - UNIT_COST) / price
  return (
    <g>
      {parts.map((p) => {
        y -= p.v * k
        return (
          <g key={p.l}>
            <rect x="24" y={y} width="16" height={p.v * k} fill={p.c} />
            <text x="22" y={y + (p.v * k) / 2 + 1} textAnchor="end" fontSize="2.6" fill="#55505a">
              {p.l}
            </text>
          </g>
        )
      })}
      <Tag p={{ x: 32, y: 69 }} size={2.8}>
        {s('Coste', 'Cost')} {UNIT_COST} €
      </Tag>
      <rect x="54" y={64 - price * k} width="16" height={price * k} fill={margin >= 0.4 ? '#2f8a5b' : '#d68a00'} />
      <line x1="50" x2="90" y1={64 - 65 * k} y2={64 - 65 * k} stroke="#c0392b" strokeWidth="0.4" strokeDasharray="1 0.8" />
      <text x="90" y={64 - 65 * k - 1} textAnchor="end" fontSize="2.4" fill="#c0392b">
        {s('Competencia 65 €', 'Competitors €65')}
      </text>
      <Tag p={{ x: 62, y: 69 }} size={2.8}>
        {s('Precio', 'Price')} {price} €
      </Tag>
    </g>
  )
}

function MonthBars({ n, s }: { n: number; s: (es: string, en: string) => string }) {
  const k = 0.012
  const income = n * CONTRIBUTION
  const profit = income - FIXED
  return (
    <g>
      <rect x="22" y={64 - FIXED * k} width="18" height={FIXED * k} fill="#9a8f95" />
      <Tag p={{ x: 31, y: 69 }} size={2.8}>
        {s('Gastos fijos', 'Fixed costs')}
      </Tag>
      <rect x="58" y={64 - income * k} width="18" height={income * k} fill={profit >= 0 ? '#2f8a5b' : '#d68a00'} />
      <line x1="16" x2="88" y1={64 - FIXED * k} y2={64 - FIXED * k} stroke="#55505a" strokeWidth="0.3" strokeDasharray="1 0.8" />
      <Tag p={{ x: 67, y: 69 }} size={2.8}>
        {s('Lo que aportan', 'Contribution')}
      </Tag>
      <Tag p={{ x: 67, y: 64 - income * k - 2 }} size={3} color={profit >= 0 ? '#2f8a5b' : '#c0392b'}>
        {profit >= 0 ? '+' : ''}
        {eur(profit)}
      </Tag>
    </g>
  )
}

export const businessLab: LabDef = {
  emoji: '📈',
  title: tx('Práctica guiada: precios y números del centro', 'Guided practice: pricing and salon numbers'),
  viewBox: '0 0 100 80',
  background: '#f4f1f6',
  scene: (layers, s) => (
    <>
      <Board />
      {layers.has('cost') && <PriceBars price={UNIT_COST} s={s} />}
      {layers.has('price') && <PriceBars price={52} s={s} />}
      {layers.has('breakeven') && <MonthBars n={73} s={s} />}
      {layers.has('discount') && <PriceBars price={38.5} s={s} />}
      {layers.has('value') && (
        <g className="fade-in">
          <Tag p={{ x: 50, y: 30 }} size={6}>
            💎
          </Tag>
          <Tag p={{ x: 50, y: 44 }} size={3.2}>
            {s('Diagnóstico + resultado + experiencia', 'Analysis + results + experience')}
          </Tag>
        </g>
      )}
    </>
  ),
  learn: [
    {
      title: tx('El coste real de un servicio', 'The real cost of a service'),
      text: tx(
        'No es solo el producto. Suma el producto, el tiempo de la profesional y la parte de los gastos fijos (alquiler, luz, software) que se come esa hora de cabina.',
        'It is not just the product. Add the product, the professional’s time and the share of fixed costs (rent, power, software) that hour in the treatment room uses.',
      ),
      layers: ['cost'],
    },
    {
      title: tx('Precio desde el margen', 'Price from the margin'),
      text: tx(
        'Precio = coste ÷ (1 − margen). Con 31 € de coste y un 40 % de margen: 31 ÷ 0,6 ≈ 52 €. Después compruebas que el mercado lo acepta.',
        'Price = cost ÷ (1 − margin). With €31 cost and a 40% margin: 31 ÷ 0.6 ≈ €52. Then check the market accepts it.',
      ),
      layers: ['price'],
    },
    {
      title: tx('El punto de equilibrio', 'The break-even point'),
      text: tx(
        'Cada servicio aporta su precio menos lo variable (producto y tiempo). Divide los gastos fijos del mes entre lo que aporta cada servicio: esos son los que necesitas para no perder dinero.',
        'Each service contributes its price minus variable costs (product and time). Divide the monthly fixed costs by that contribution: that is how many you need not to lose money.',
      ),
      layers: ['breakeven'],
    },
    {
      title: tx('Compite por valor, no por precio', 'Compete on value, not price'),
      text: tx(
        'Bajar precios es fácil de copiar. Un buen diagnóstico, resultados visibles y una experiencia cuidada justifican cobrar lo que vale tu trabajo.',
        'Lower prices are easy to copy. A good analysis, visible results and a careful experience justify charging what your work is worth.',
      ),
      layers: ['value'],
    },
  ],
  tasks: [
    {
      kind: 'tune',
      short: tx('Precio', 'Price'),
      title: tx('Pon precio a una higiene facial', 'Price a deep-cleansing facial'),
      text: tx(
        'Servicio de 60 minutos: 7 € de producto, 15 € de tiempo y 9 € de gastos fijos. Quieres al menos un 40 % de margen y la competencia cobra entre 55 y 65 €.',
        '60-minute service: €7 product, €15 time and €9 overheads. You want at least a 40% margin and competitors charge €55–65.',
      ),
      sliders: [{ id: 'price', label: tx('Precio', 'Price'), min: 20, max: 90, step: 1, start: 30, format: (v) => `${v} €` }],
      visual: (v, s) => <PriceBars price={v.price} s={s} />,
      readout: (v, s) => [
        { label: s('Beneficio por servicio', 'Profit per service'), value: eur(v.price - UNIT_COST) },
        { label: s('Margen', 'Margin'), value: `${Math.round(((v.price - UNIT_COST) / v.price) * 100)} %` },
      ],
      check: (v) => [
        { ok: (v.price - UNIT_COST) / v.price >= 0.4, msg: tx('Margen de al menos un 40 % (precio de 52 € o más).', 'At least a 40% margin (a price of €52 or more).') },
        { ok: v.price <= 65, msg: tx('No más de 65 €: por encima de la competencia te costará llenar la agenda.', 'No more than €65: above competitors it will be hard to fill the diary.') },
      ],
    },
    {
      kind: 'tune',
      short: tx('Equilibrio', 'Break-even'),
      title: tx('¿Cuántos servicios necesitas al mes?', 'How many services do you need a month?'),
      text: tx(
        'Cobras 55 € y cada servicio te aporta 33 € tras producto y tiempo. Tus gastos fijos son 2.400 € al mes y quieres ganar al menos 600 €. Tienes una cabina: unos 6 servicios al día, 20 días al mes.',
        'You charge €55 and each service contributes €33 after product and time. Fixed costs are €2,400 a month and you want to earn at least €600. You have one room: about 6 services a day, 20 days a month.',
      ),
      sliders: [{ id: 'n', label: tx('Servicios al mes', 'Services per month'), min: 20, max: 150, step: 1, start: 40 }],
      visual: (v, s) => <MonthBars n={v.n} s={s} />,
      readout: (v, s) => [
        { label: s('Beneficio del mes', 'Monthly profit'), value: eur(v.n * CONTRIBUTION - FIXED) },
        { label: s('Ocupación', 'Occupancy'), value: `${Math.round((v.n / CAPACITY) * 100)} %` },
      ],
      check: (v) => [
        { ok: v.n * CONTRIBUTION >= FIXED, msg: tx('Cubres los gastos fijos (73 servicios es el punto de equilibrio).', 'You cover fixed costs (73 services is break-even).') },
        { ok: v.n * CONTRIBUTION - FIXED >= 600, msg: tx('Ganas al menos 600 € al mes.', 'You earn at least €600 a month.') },
        { ok: v.n <= CAPACITY, msg: tx('Cabe en tu agenda: máximo 120 servicios al mes.', 'It fits your diary: 120 services a month at most.') },
      ],
    },
    {
      kind: 'choose',
      short: tx('Descuentos', 'Discounts'),
      title: tx('Te piden un 30 % de descuento', 'A client asks for 30% off'),
      text: tx('Una clienta habitual pide un 30 % de descuento en la higiene facial de 55 €. ¿Qué haces?', 'A regular client asks for 30% off the €55 facial. What do you do?'),
      layers: ['discount'],
      options: [
        { text: tx('Se lo aplico para que no se vaya', 'Give it so she doesn’t leave'), good: false, feedback: tx('A 38,50 € apenas cubres el coste de 31 € y trabajas casi gratis.', 'At €38.50 you barely cover the €31 cost and work almost for free.') },
        { text: tx('Le ofrezco un bono de 5 sesiones con un 10 % y la cita ya agendada', 'Offer a 5-session pack at 10% off with the dates booked'), good: true, feedback: tx('Así premias su fidelidad, aseguras ingresos y mantienes un margen sano.', 'That rewards loyalty, secures income and keeps a healthy margin.') },
        { text: tx('Le digo que no y punto', 'Just say no'), good: false, feedback: tx('Mantienes el precio, pero pierdes la oportunidad de fidelizarla con algo que también te conviene.', 'You keep the price but miss the chance to build loyalty with something that also suits you.') },
      ],
    },
  ],
  outro: tx(
    'Revisa estos números cada trimestre: si suben el alquiler o los productos, tu precio también tiene que moverse.',
    'Review these numbers every quarter: if rent or product costs go up, your price has to move too.',
  ),
}
