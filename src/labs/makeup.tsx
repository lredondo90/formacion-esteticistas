import { tx } from '../i18n'
import { FACE, FrontFace, Tag } from './art'
import type { LabDef } from './engine'

const CONTOUR_L = [{ x: 21, y: 61 }, { x: 28, y: 65 }, { x: 35, y: 68.5 }]
const CONTOUR_R = CONTOUR_L.map((p) => ({ x: 100 - p.x, y: p.y }))
const GLOW = { cheek: FACE.cheekboneL, bridge: { x: 50, y: 56 }, cupid: FACE.cupid, brow: { x: 34, y: 44.6 } }

function Glow({ x, y, r = 2.6 }: { x: number; y: number; r?: number }) {
  return <ellipse cx={x} cy={y} rx={r * 1.4} ry={r} fill="url(#mk-glow)" />
}

export const makeupLab: LabDef = {
  emoji: '💄',
  title: tx('Práctica guiada: contorno e iluminación', 'Guided practice: contour and highlight'),
  viewBox: '0 0 100 130',
  background: '#f3e7e1',
  scene: (layers, s) => (
    <FrontFace>
      <defs>
        <radialGradient id="mk-glow">
          <stop offset="0%" stopColor="#fffbe8" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#fffbe8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mk-blush">
          <stop offset="0%" stopColor="#e2737f" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#e2737f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mk-shade">
          <stop offset="0%" stopColor="#8a5a44" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#8a5a44" stopOpacity="0" />
        </linearGradient>
      </defs>
      {layers.has('light') && (
        <g className="fade-in">
          <Tag p={{ x: 50, y: 112 }}>{s('Claro = adelanta · Oscuro = hunde', 'Light = brings forward · Dark = recedes')}</Tag>
        </g>
      )}
      {layers.has('contour') && (
        <g className="fade-in">
          <path d="M20 58 C 26 62, 32 65, 36 67 C 32 69, 26 68, 20 64 Z" fill="url(#mk-shade)" />
          <path d="M20 58 C 26 62, 32 65, 36 67 C 32 69, 26 68, 20 64 Z" fill="url(#mk-shade)" transform="translate(100 0) scale(-1 1)" />
          <line x1="36" y1="53" x2="36" y2="75" stroke="#3f6f8a" strokeWidth="0.4" strokeDasharray="1 0.8" />
          <Tag p={{ x: 36, y: 79 }} size={2.6} color="#3f6f8a">
            {s('centro del ojo', 'eye centre')}
          </Tag>
        </g>
      )}
      {layers.has('highlight') && (
        <g className="fade-in">
          <Glow {...GLOW.cheek} />
          <Glow x={100 - GLOW.cheek.x} y={GLOW.cheek.y} />
          <Glow {...GLOW.bridge} r={1.8} />
          <Glow {...GLOW.cupid} r={1.4} />
          <Glow {...GLOW.brow} r={1.8} />
          <Glow x={100 - GLOW.brow.x} y={GLOW.brow.y} r={1.8} />
        </g>
      )}
      {layers.has('blush') && (
        <g className="fade-in">
          <ellipse cx="31" cy="66" rx="7" ry="4.5" fill="url(#mk-blush)" transform="rotate(-20 31 66)" />
          <ellipse cx="69" cy="66" rx="7" ry="4.5" fill="url(#mk-blush)" transform="rotate(20 69 66)" />
        </g>
      )}
    </FrontFace>
  ),
  learn: [
    {
      title: tx('Luz y sombra', 'Light and shadow'),
      text: tx(
        'El maquillaje esculpe con luz: los tonos claros acercan y destacan, los oscuros hunden y afinan. Siempre 1–2 tonos respecto a la piel.',
        'Make-up sculpts with light: light tones bring features forward, dark tones push them back. Always 1–2 shades from the skin tone.',
      ),
      layers: ['light'],
    },
    {
      title: tx('El contorno', 'Contour'),
      text: tx(
        'Va justo bajo el pómulo, desde delante de la oreja hacia la comisura, y se detiene a la altura del centro del ojo. Más allá, ensucia.',
        'It goes just under the cheekbone, from in front of the ear towards the corner of the mouth, and stops below the centre of the eye. Any further looks muddy.',
      ),
      layers: ['contour'],
    },
    {
      title: tx('El iluminador', 'Highlighter'),
      text: tx(
        'En los puntos altos donde la luz cae de forma natural: parte alta del pómulo, tabique, arco de cupido y bajo el arco de la ceja.',
        'On the high points where light naturally falls: top of the cheekbone, bridge of the nose, cupid’s bow and under the brow arch.',
      ),
      layers: ['highlight'],
    },
    {
      title: tx('El colorete', 'Blush'),
      text: tx(
        'En la manzana de la mejilla (pide a la clienta que sonría) y difuminado hacia la sien. Une el contorno y el iluminador.',
        'On the apple of the cheek (ask the client to smile) and blended up towards the temple. It ties contour and highlight together.',
        'En la manzana del cachete (pide a la clienta que sonría) y difuminado hacia la sien. Une el contorno y el iluminador.',
      ),
      layers: ['contour', 'highlight', 'blush'],
    },
  ],
  tasks: [
    {
      kind: 'trace',
      short: tx('Contorno', 'Contour'),
      title: tx('Traza el contorno', 'Draw the contour'),
      text: tx(
        'Dibuja la línea de contorno en los dos lados, desde la oreja hacia la boca. La guía está oculta: búscala tú bajo el pómulo.',
        'Draw the contour line on both sides, from the ear towards the mouth. The guide is hidden: find it under the cheekbone yourself.',
      ),
      routes: [
        { id: 'left', label: tx('Lado izquierdo', 'Left side'), pts: CONTOUR_L, directed: true },
        { id: 'right', label: tx('Lado derecho', 'Right side'), pts: CONTOUR_R, directed: true },
      ],
      tol: 3,
      width: 2.6,
      paint: '#9a6a52',
      hidden: true,
      directionHint: tx('Empieza junto a la oreja y avanza hacia la boca: así la mayor carga de producto queda atrás.', 'Start next to the ear and move towards the mouth: that keeps most of the product at the back.'),
    },
    {
      kind: 'place',
      short: tx('Iluminador', 'Highlighter'),
      title: tx('Coloca el iluminador', 'Place the highlighter'),
      text: tx('Arrastra cada punto de luz a su sitio en el lado izquierdo de la cara.', 'Drag each touch of light to its place on the left side of the face.'),
      layers: ['contour'],
      handles: [
        { id: 'cheek', label: tx('Pómulo', 'Cheekbone'), start: { x: 14, y: 116 }, target: GLOW.cheek, tol: 5, hint: tx('en la parte más alta del pómulo, por encima del contorno.', 'on the highest point of the cheekbone, above the contour.') },
        { id: 'bridge', label: tx('Tabique', 'Bridge'), start: { x: 38, y: 116 }, target: GLOW.bridge, tol: 4, hint: tx('a mitad del tabique, sin llegar a la punta.', 'halfway down the bridge, not on the tip.') },
        { id: 'cupid', label: tx('Arco de cupido', 'Cupid’s bow'), start: { x: 62, y: 116 }, target: GLOW.cupid, tol: 3.5, hint: tx('justo encima del labio superior, en el centro.', 'just above the centre of the upper lip.') },
        { id: 'brow', label: tx('Bajo la ceja', 'Brow bone'), start: { x: 86, y: 116 }, target: GLOW.brow, tol: 3.5, hint: tx('debajo del arco de la ceja izquierda.', 'under the arch of the left brow.') },
      ],
      overlay: (marks) => (
        <>
          {Object.values(marks).map((m, i) => (
            <Glow key={i} x={m.x} y={m.y} r={2.4} />
          ))}
        </>
      ),
    },
    {
      kind: 'choose',
      short: tx('Visagismo', 'Face shape'),
      title: tx('Un rostro redondo', 'A round face'),
      text: tx(
        'Tu clienta tiene el rostro redondo y quiere que se vea más alargado. ¿Cómo adaptas el contorno?',
        'Your client has a round face and wants it to look longer. How do you adapt the contour?',
      ),
      layers: ['contour', 'highlight'],
      options: [
        { text: tx('Más diagonal, hacia la comisura, y un toque en las sienes', 'More diagonal, towards the mouth corner, plus a touch at the temples'), good: true, feedback: tx('Eso es: las líneas diagonales y verticales alargan el rostro.', 'Exactly: diagonal and vertical lines make the face look longer.') },
        { text: tx('Una línea horizontal a lo largo de la mejilla', 'A horizontal line across the cheek'), good: false, feedback: tx('La línea horizontal ensancha todavía más un rostro redondo.', 'A horizontal line makes a round face look even wider.') },
        { text: tx('Oscurecer toda la mandíbula y el mentón', 'Darken the whole jaw and chin'), good: false, feedback: tx('Eso acorta el rostro: es lo que harías en una cara alargada.', 'That shortens the face: it is what you would do on a long face.') },
      ],
    },
  ],
  doneLayers: ['contour', 'highlight', 'blush'],
  outro: tx(
    'Difumina siempre hacia arriba y hacia fuera: el contorno no debe verse como una raya, sino como una sombra natural.',
    'Always blend upwards and outwards: contour should never look like a stripe, but like a natural shadow.',
  ),
}
