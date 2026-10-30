import { tx } from '../i18n'
import { Arrow, FrontFace, Tag } from './art'
import type { LabDef } from './engine'

// Massage strokes on the client's left side: always upwards and outwards.
const STROKES = {
  jaw: [{ x: 52, y: 95 }, { x: 64, y: 90 }, { x: 74, y: 80 }, { x: 79, y: 66 }],
  cheek: [{ x: 55, y: 72 }, { x: 64, y: 66 }, { x: 72, y: 58 }, { x: 77, y: 50 }],
  forehead: [{ x: 51, y: 36 }, { x: 58, y: 29 }, { x: 68, y: 27 }, { x: 76, y: 33 }],
}
const AVOID = 'M27 46 C 30 40, 42 40, 45 46 C 42 54, 30 54, 27 46 Z M55 46 C 58 40, 70 40, 73 46 C 70 54, 58 54, 55 46 Z M40 79 C 44 74, 56 74, 60 79 C 56 86, 44 86, 40 79 Z'

export const facialsLab: LabDef = {
  emoji: '🧖',
  title: tx('Práctica guiada: protocolo de higiene facial', 'Guided practice: deep-cleansing facial protocol'),
  viewBox: '0 0 100 130',
  background: '#f3e7e1',
  scene: (layers, s) => (
    <FrontFace>
      {layers.has('avoid') && (
        <g className="fade-in">
          <path d={AVOID} fill="#c0392b" opacity="0.22" />
          <Tag p={{ x: 50, y: 112 }}>{s('Contorno de ojos y labios: sin ácidos ni vapor directo', 'Eye and lip area: no acids or direct steam')}</Tag>
        </g>
      )}
      {layers.has('red') && (
        <g className="fade-in">
          {[
            [34, 66, 8, 6],
            [66, 66, 8, 6],
            [50, 62, 4, 5],
            [50, 30, 10, 4],
            [50, 90, 5, 3],
          ].map(([x, y, rx, ry], i) => (
            <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill="#e0525f" opacity="0.28" />
          ))}
        </g>
      )}
      {layers.has('strokes') && (
        <g className="fade-in">
          {Object.values(STROKES).map((r, i) => (
            <Arrow key={i} pts={r} animate color="#2f8a5b" />
          ))}
          {Object.values(STROKES).map((r, i) => (
            <Arrow key={`m${i}`} pts={r.map((p) => ({ x: 100 - p.x, y: p.y }))} animate color="#2f8a5b" />
          ))}
        </g>
      )}
      {layers.has('steam') && (
        <g className="fade-in">
          {[30, 50, 70].map((x) => (
            <path key={x} d={`M${x} 124 C ${x - 3} 118, ${x + 3} 114, ${x} 108`} fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" className="pulse-ring" />
          ))}
          <Tag p={{ x: 50, y: 104 }}>{s('Vapor: 8–10 min a 30–40 cm', 'Steam: 8–10 min at 30–40 cm')}</Tag>
        </g>
      )}
    </FrontFace>
  ),
  learn: [
    {
      title: tx('Un orden que tiene sentido', 'An order that makes sense'),
      text: tx(
        'Cada paso prepara el siguiente: limpiar para ver, exfoliar para abrir camino, vapor para ablandar, extraer, calmar y proteger.',
        'Each step prepares the next: cleanse to see, exfoliate to clear the way, steam to soften, extract, soothe and protect.',
      ),
    },
    {
      title: tx('Zonas que se respetan', 'Areas to protect'),
      text: tx(
        'El contorno de ojos y los labios tienen la piel más fina: ahí no van exfoliantes ácidos ni el vapor directo. Protégelos con algodón húmedo.',
        'The eye and lip areas have the thinnest skin: no acid exfoliants or direct steam there. Protect them with damp cotton pads.',
      ),
      layers: ['avoid'],
    },
    {
      title: tx('Vapor y extracción', 'Steam and extraction'),
      text: tx(
        'El vapor ablanda el sebo. Extrae con los dedos envueltos en gasa, presionando alrededor del poro y nunca con las uñas. Máximo 10–15 minutos.',
        'Steam softens the sebum. Extract with fingers wrapped in gauze, pressing around the pore and never with nails. 10–15 minutes at most.',
      ),
      layers: ['steam'],
    },
    {
      title: tx('Masaje hacia arriba y hacia fuera', 'Massage upwards and outwards'),
      text: tx(
        'Las maniobras de masaje van siempre hacia arriba y hacia fuera, del centro de la cara a las orejas: así no arrastras la piel hacia abajo.',
        'Massage strokes always go upwards and outwards, from the centre of the face to the ears: that way you never drag the skin down.',
      ),
      layers: ['strokes'],
    },
  ],
  tasks: [
    {
      kind: 'taporder',
      short: tx('Protocolo', 'Protocol'),
      title: tx('Ordena la higiene facial', 'Put the facial in order'),
      text: tx('Toca los pasos en el orden correcto.', 'Tap the steps in the right order.'),
      spots: [
        { id: 'mask', at: { x: 14, y: 70 }, emoji: '🎭', label: tx('Mascarilla', 'Mask'), why: tx('calma y cierra después de la extracción.', 'soothes and settles the skin after extraction.') },
        { id: 'cleanse', at: { x: 86, y: 22 }, emoji: '🧴', label: tx('Desmaquillar', 'Cleanse'), why: tx('quita maquillaje y suciedad para ver la piel real.', 'removes make-up and dirt so you see the real skin.') },
        { id: 'spf', at: { x: 86, y: 112 }, emoji: '☀️', label: tx('Hidratar + SPF', 'Moisturise + SPF'), why: tx('la piel queda sensible: protégela siempre.', 'the skin is sensitive now: always protect it.') },
        { id: 'steam', at: { x: 86, y: 70 }, emoji: '♨️', label: tx('Vapor', 'Steam'), why: tx('ablanda el sebo para extraer sin dañar.', 'softens sebum so you can extract without damage.') },
        { id: 'exfoliate', at: { x: 14, y: 22 }, emoji: '✨', label: tx('Exfoliar', 'Exfoliate'), why: tx('retira células muertas que tapan el poro.', 'removes dead cells that block pores.') },
        { id: 'extract', at: { x: 14, y: 112 }, emoji: '🩹', label: tx('Extracción', 'Extraction'), why: tx('con gasa y presión suave alrededor del poro.', 'with gauze and gentle pressure around the pore.') },
      ],
      order: ['cleanse', 'exfoliate', 'steam', 'extract', 'mask', 'spf'],
      hint: tx('Limpiar, preparar, ablandar, extraer, calmar y proteger.', 'Cleanse, prepare, soften, extract, soothe and protect.'),
    },
    {
      kind: 'trace',
      short: tx('Masaje', 'Massage'),
      title: tx('Haz el masaje final', 'Do the closing massage'),
      text: tx('Repasa las tres maniobras del lado izquierdo de la clienta, de dentro hacia fuera y hacia arriba.', "Trace the three strokes on the client's left side, from the centre outwards and upwards."),
      routes: [
        { id: 'jaw', label: tx('Mentón → oreja', 'Chin → ear'), pts: STROKES.jaw, directed: true },
        { id: 'cheek', label: tx('Nariz → sien', 'Nose → temple'), pts: STROKES.cheek, directed: true },
        { id: 'forehead', label: tx('Entrecejo → sien', 'Brow centre → temple'), pts: STROKES.forehead, directed: true },
      ],
      tol: 3,
      width: 2,
      directionHint: tx('Siempre del centro de la cara hacia fuera y hacia arriba.', 'Always from the centre of the face outwards and upwards.'),
    },
    {
      kind: 'choose',
      short: tx('Mascarilla', 'Mask'),
      title: tx('Elige la mascarilla', 'Choose the mask'),
      text: tx('Tras la extracción, la piel de tu clienta está enrojecida y algo caliente. ¿Qué mascarilla aplicas?', "After extraction, your client's skin is red and a little warm. Which mask do you apply?"),
      layers: ['red'],
      options: [
        { text: tx('Calmante y descongestiva (aloe, centella)', 'Soothing and decongesting (aloe, centella)'), good: true, feedback: tx('Perfecto: baja la rojez y repara la barrera tras la extracción.', 'Perfect: it calms redness and repairs the barrier after extraction.') },
        { text: tx('Peeling de ácido glicólico', 'Glycolic acid peel'), good: false, feedback: tx('Sobre una piel recién extraída y roja, un ácido irrita aún más.', 'On freshly extracted, red skin an acid irritates even more.') },
        { text: tx('Arcilla verde que se deja secar del todo', 'Green clay left to dry completely'), good: false, feedback: tx('La arcilla seca tira de la piel y la reseca justo cuando está más sensible.', 'Dried clay pulls on the skin and dries it out just when it is most sensitive.') },
      ],
    },
  ],
  doneLayers: [],
  outro: tx(
    'Anota en la ficha cómo ha reaccionado la piel: te dirá qué ajustar en la próxima sesión.',
    'Write down how the skin reacted on the record card: it tells you what to adjust next session.',
  ),
}
