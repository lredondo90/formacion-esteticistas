import { tx } from '../i18n'
import { Arrow, FrontFace, Pulse, Tag } from './art'
import type { LabDef, P } from './engine'

// Lymph nodes on the client's left side (right of the drawing); the other side mirrors them.
const NODES: Record<string, P> = {
  terminus: { x: 66, y: 119 },
  cervical: { x: 61, y: 105 },
  submandibular: { x: 64, y: 91 },
  preauricular: { x: 79, y: 57 },
}
const mirror = (p: P): P => ({ x: 100 - p.x, y: p.y })

const ROUTES = {
  forehead: [{ x: 52, y: 29 }, { x: 64, y: 29 }, { x: 74, y: 37 }, { x: 78, y: 51 }],
  cheek: [{ x: 56, y: 63 }, { x: 65, y: 71 }, { x: 67, y: 81 }, { x: 64, y: 88 }],
  neck: [{ x: 63, y: 95 }, { x: 62, y: 104 }, { x: 65, y: 115 }],
}

function Nodes({ open }: { open?: boolean }) {
  return (
    <>
      {Object.values(NODES).flatMap((p, i) => [p, mirror(p)].map((q, j) => <circle key={`${i}${j}`} cx={q.x} cy={q.y} r="1.6" fill={open ? '#2f8a5b' : '#7fb3c9'} stroke="#fff" strokeWidth="0.4" />))}
    </>
  )
}

export const massageLab: LabDef = {
  emoji: '💆',
  title: tx('Práctica guiada: drenaje linfático facial', 'Guided practice: facial lymphatic drainage'),
  viewBox: '0 0 100 130',
  background: '#f3e7e1',
  scene: (layers, s) => (
    <FrontFace>
      {layers.has('nodes') && <Nodes open={layers.has('opened')} />}
      {layers.has('terminus') && (
        <g className="fade-in">
          <Pulse p={NODES.terminus} r={3.2} />
          <Pulse p={mirror(NODES.terminus)} r={3.2} />
          <Tag p={{ x: 50, y: 128 }}>{s('Terminus: se abre primero', 'Terminus: open it first')}</Tag>
        </g>
      )}
      {layers.has('open') && (
        <g className="fade-in">
          <Arrow pts={[NODES.terminus, NODES.cervical]} animate />
          <Arrow pts={[NODES.cervical, NODES.submandibular]} animate />
          <Arrow pts={[NODES.submandibular, { x: 74, y: 76 }, NODES.preauricular]} animate />
          <Tag p={{ x: 86, y: 98 }} size={2.8}>
            1 → 4
          </Tag>
        </g>
      )}
      {layers.has('routes') && (
        <g className="fade-in">
          {Object.values(ROUTES).map((r, i) => (
            <Arrow key={i} pts={r} animate color="#2f8a5b" />
          ))}
        </g>
      )}
    </FrontFace>
  ),
  learn: [
    {
      title: tx('Primero se vacía el desagüe', 'Empty the drain first'),
      text: tx(
        'La linfa de la cara acaba en los huecos de encima de la clavícula (el terminus). Si no lo abres primero, el líquido no tiene por dónde salir.',
        'Lymph from the face ends up in the hollows above the collarbone (the terminus). If you do not open it first, the fluid has nowhere to go.',
      ),
      layers: ['nodes', 'terminus'],
    },
    {
      title: tx('Abre de abajo arriba', 'Open from the bottom up'),
      text: tx(
        'Bombeos suaves en los ganglios en este orden: terminus, cervicales, submandibulares y preauriculares. Así preparas el camino.',
        'Gentle pumping on the nodes in this order: terminus, cervical, submandibular and preauricular. That clears the way.',
      ),
      layers: ['nodes', 'open'],
    },
    {
      title: tx('Drena hacia el ganglio más cercano', 'Drain towards the nearest node'),
      text: tx(
        'Ahora sí trabajas la cara, de dentro hacia fuera: la frente hacia la sien y la oreja; la mejilla hacia el ángulo de la mandíbula; y el cuello hacia abajo.',
        'Now you work the face, from the centre outwards: forehead towards the temple and ear; cheek towards the angle of the jaw; and the neck downwards.',
      ),
      layers: ['nodes', 'routes'],
    },
    {
      title: tx('Lento y muy suave', 'Slow and very light'),
      text: tx(
        'La presión es mínima, como si movieras solo la piel, y el ritmo lento: 5–7 repeticiones por zona. Si enrojece, aprietas demasiado.',
        'Pressure is minimal, as if moving only the skin, and the rhythm slow: 5–7 repetitions per area. If it turns red, you are pressing too hard.',
      ),
      layers: ['nodes'],
    },
  ],
  tasks: [
    {
      kind: 'taporder',
      short: tx('Abrir ganglios', 'Open nodes'),
      title: tx('Abre los ganglios en orden', 'Open the nodes in order'),
      text: tx('Toca los ganglios del lado izquierdo de la clienta en el orden correcto.', "Tap the nodes on the client's left side in the right order."),
      spots: [
        { id: 'preauricular', at: NODES.preauricular, emoji: '👂', label: tx('Preauricular', 'Preauricular'), why: tx('delante de la oreja, recoge la frente y las sienes.', 'in front of the ear, drains forehead and temples.') },
        { id: 'submandibular', at: NODES.submandibular, emoji: '🫧', label: tx('Submandibular', 'Submandibular'), why: tx('bajo la mandíbula, recoge mejillas, nariz y labios.', 'under the jaw, drains cheeks, nose and lips.') },
        { id: 'terminus', at: NODES.terminus, emoji: '🚰', label: tx('Terminus', 'Terminus'), why: tx('el desagüe final, encima de la clavícula.', 'the final drain, above the collarbone.') },
        { id: 'cervical', at: NODES.cervical, emoji: '🫧', label: tx('Cervical', 'Cervical'), why: tx('a lo largo del cuello, conecta la cara con el terminus.', 'along the neck, links the face to the terminus.') },
      ],
      order: ['terminus', 'cervical', 'submandibular', 'preauricular'],
      hint: tx('Se abre de abajo arriba, empezando por el desagüe final.', 'Open from the bottom up, starting with the final drain.'),
      layers: ['nodes'],
    },
    {
      kind: 'trace',
      short: tx('Drenar', 'Drain'),
      title: tx('Haz las maniobras de drenaje', 'Do the drainage strokes'),
      text: tx('Sigue cada recorrido en el sentido de la linfa: siempre hacia el ganglio.', 'Follow each route in the direction lymph flows: always towards the node.'),
      layers: ['nodes', 'opened'],
      routes: [
        { id: 'forehead', label: tx('Frente → oreja', 'Forehead → ear'), pts: ROUTES.forehead, directed: true },
        { id: 'cheek', label: tx('Mejilla → mandíbula', 'Cheek → jaw'), pts: ROUTES.cheek, directed: true },
        { id: 'neck', label: tx('Cuello → clavícula', 'Neck → collarbone'), pts: ROUTES.neck, directed: true },
      ],
      tol: 3,
      width: 2,
      directionHint: tx('La linfa va hacia el ganglio. Si la empujas al revés, la estancas.', 'Lymph flows towards the node. Pushing it the other way makes it pool.'),
    },
    {
      kind: 'choose',
      short: tx('Contraindicaciones', 'Contraindications'),
      title: tx('¿A quién NO se lo harías hoy?', 'Who would you NOT treat today?'),
      text: tx('Cuatro clientas piden drenaje facial. ¿Cuál tiene una contraindicación?', 'Four clients ask for facial drainage. Which one has a contraindication?'),
      layers: ['nodes'],
      options: [
        { text: tx('Bolsas y ojeras por la mañana', 'Morning puffiness and dark circles'), good: false, feedback: tx('Es justo una de las mejores indicaciones del drenaje.', 'That is actually one of the best reasons for drainage.') },
        { text: tx('Una infección aguda con fiebre', 'An acute infection with fever'), good: true, feedback: tx('Correcto: con infección aguda o fiebre el drenaje está contraindicado. Pide que vuelva cuando esté recuperada.', 'Correct: acute infection or fever is a contraindication. Ask her to come back once she has recovered.') },
        { text: tx('Retención de líquidos premenstrual', 'Premenstrual fluid retention'), good: false, feedback: tx('No es contraindicación: el drenaje puede aliviarla.', 'Not a contraindication: drainage can relieve it.') },
        { text: tx('Piel sensible con rojeces', 'Sensitive skin with redness'), good: false, feedback: tx('Al contrario: es un masaje suave que suele ir bien a la piel sensible.', 'On the contrary: it is a gentle massage that usually suits sensitive skin.') },
      ],
    },
  ],
  outro: tx(
    'Termina siempre con unos bombeos en el terminus para vaciar todo lo que has movido.',
    'Always finish with a few pumps at the terminus to empty everything you have moved.',
  ),
}
