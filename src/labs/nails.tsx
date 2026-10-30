import { tx } from '../i18n'
import { Arrow, Tag } from './art'
import type { LabDef } from './engine'

// Fingertip seen from above, 100 × 100. The cuticle is at the bottom of the nail, the free edge on top.
const BED = 'M35 66 C 35 50, 35 42, 36 34 L 64 34 C 65 42, 65 50, 65 66 C 58 71, 42 71, 35 66 Z'
const LONG_EDGE = 'M36 34 L 35.5 14 L 64.5 14 L 64 34 Z'
const ALMOND_EDGE = 'M36 34 C 36 25, 43 17, 50 13 C 57 17, 64 25, 64 34 Z'
const ALMOND_NAIL = 'M35 66 C 35 50, 35 42, 36 34 C 36 25, 43 17, 50 13 C 57 17, 64 25, 64 34 C 65 42, 65 50, 65 66 C 58 71, 42 71, 35 66 Z'

function Finger({ shaped, polished }: { shaped?: boolean; polished?: boolean }) {
  return (
    <>
      <rect width="100" height="100" fill="#f3e7e1" />
      <path d="M24 100 L 24 44 C 24 20, 76 20, 76 44 L 76 100 Z" fill="#eec3ac" stroke="#c9917a" strokeWidth="0.5" />
      <path d="M33 70 C 33 54, 33 40, 34 32 M67 70 C 67 54, 67 40, 66 32" fill="none" stroke="#c9917a" strokeWidth="0.6" />
      <path d="M33 68 C 42 76, 58 76, 67 68" fill="none" stroke="#c9917a" strokeWidth="0.8" />
      <path d={BED} fill="#f2b8b5" />
      <path d={shaped ? ALMOND_EDGE : LONG_EDGE} fill="#f8f1ea" stroke="#e2d4c8" strokeWidth="0.4" />
      <path d="M36 34 C 44 31, 56 31, 64 34" fill="none" stroke="#e7cfc6" strokeWidth="0.5" />
      {polished && <path d={ALMOND_NAIL} fill="#b8325a" opacity="0.92" transform="translate(50 40) scale(0.94) translate(-50 -40)" />}
      <path d="M38 66 C 44 69, 56 69, 62 66" fill="none" stroke="#fff" strokeWidth="0.6" opacity="0.6" />
    </>
  )
}

export const nailsLab: LabDef = {
  emoji: '💅',
  title: tx('Práctica guiada: lima y esmalta una uña', 'Guided practice: file and polish a nail'),
  viewBox: '0 0 100 100',
  background: '#f3e7e1',
  scene: (layers, s) => (
    <>
      <Finger shaped={layers.has('almond') || layers.has('shaped')} polished={layers.has('polished')} />
      {layers.has('anatomy') && (
        <g className="fade-in">
          <Tag p={{ x: 50, y: 10 }}>{s('Borde libre', 'Free edge')}</Tag>
          <Tag p={{ x: 50, y: 50 }}>{s('Lámina', 'Nail plate')}</Tag>
          <Tag p={{ x: 50, y: 80 }}>{s('Cutícula', 'Cuticle')}</Tag>
          <Tag p={{ x: 18, y: 58 }} size={2.8}>
            {s('Pliegue', 'Side')}
          </Tag>
          <Tag p={{ x: 18, y: 62 }} size={2.8}>
            {s('lateral', 'fold')}
          </Tag>
        </g>
      )}
      {layers.has('fileDir') && (
        <g className="fade-in">
          <Arrow pts={[{ x: 33, y: 32 }, { x: 37, y: 22 }, { x: 47, y: 13 }]} animate />
          <Arrow pts={[{ x: 67, y: 32 }, { x: 63, y: 22 }, { x: 53, y: 13 }]} animate />
          <Tag p={{ x: 50, y: 7 }}>{s('Del lateral al centro', 'From the side to the centre', 'Del lateral al centro')}</Tag>
        </g>
      )}
      {layers.has('almond') && <path d={ALMOND_EDGE} fill="none" stroke="#c2577a" strokeWidth="0.5" strokeDasharray="1.2 0.8" className="fade-in" />}
      {layers.has('polishDir') && (
        <g className="fade-in">
          <Arrow pts={[{ x: 50, y: 62 }, { x: 50, y: 18 }]} animate />
          <Arrow pts={[{ x: 42, y: 60 }, { x: 42.5, y: 25 }]} animate />
          <Arrow pts={[{ x: 58, y: 60 }, { x: 57.5, y: 25 }]} animate />
          <Tag p={{ x: 50, y: 80 }}>{s('1 mm libre junto a la cutícula', '1 mm gap at the cuticle')}</Tag>
        </g>
      )}
    </>
  ),
  learn: [
    {
      title: tx('Conoce la uña', 'Know the nail'),
      text: tx(
        'La lámina es la parte dura; el borde libre, lo que sobresale; la cutícula y los pliegues laterales son piel viva que hay que respetar.',
        'The plate is the hard part; the free edge is what sticks out; the cuticle and side folds are living skin you must respect.',
      ),
      layers: ['anatomy'],
    },
    {
      title: tx('Lima en una sola dirección', 'File in one direction'),
      text: tx(
        'Lima desde cada lateral hacia el centro, sin vaivén. El movimiento de ida y vuelta abre las capas de la uña y la hace quebradiza.',
        'File from each side towards the centre, never back and forth. A sawing motion splits the nail layers and makes it brittle.',
      ),
      layers: ['fileDir'],
    },
    {
      title: tx('La forma almendra', 'The almond shape'),
      text: tx(
        'Laterales rectos que se van estrechando hasta una punta redondeada en el centro. Estiliza los dedos y es resistente si no se afina demasiado.',
        'Straight sides that taper to a rounded point in the centre. It slims the fingers and stays strong if you do not over-thin it.',
      ),
      layers: ['almond'],
    },
    {
      title: tx('Esmalta en tres pasadas', 'Polish in three strokes'),
      text: tx(
        'Una pasada por el centro y una por cada lateral, siempre de la cutícula hacia la punta. Deja 1 mm libre junto a la cutícula para que no se levante.',
        'One stroke down the centre and one down each side, always from cuticle to tip. Leave a 1 mm gap at the cuticle so it does not lift.',
      ),
      layers: ['shaped', 'polishDir'],
    },
  ],
  tasks: [
    {
      kind: 'taporder',
      short: tx('Protocolo', 'Protocol'),
      title: tx('Ordena la manicura', 'Put the manicure in order'),
      text: tx('Toca los pasos en el orden en que los harías en cabina.', 'Tap the steps in the order you would do them in the salon.', 'Toca los pasos en el orden en que los harías en el gabinete.'),
      spots: [
        { id: 'color', at: { x: 88, y: 50 }, emoji: '💅', label: tx('Color', 'Colour'), why: tx('dos capas finas mejor que una gruesa.', 'two thin coats are better than one thick one.') },
        { id: 'remove', at: { x: 13, y: 20 }, emoji: '🧴', label: tx('Quitar esmalte', 'Remove polish'), why: tx('empiezas con la uña limpia.', 'start with a clean nail.') },
        { id: 'base', at: { x: 13, y: 80 }, emoji: '🫙', label: tx('Base', 'Base coat'), why: tx('protege la uña y ayuda a que el color agarre.', 'protects the nail and helps colour grip.') },
        { id: 'file', at: { x: 88, y: 20 }, emoji: '📏', label: tx('Limar', 'File'), why: tx('das forma antes de tocar la cutícula.', 'shape before working on the cuticle.') },
        { id: 'top', at: { x: 88, y: 80 }, emoji: '✨', label: tx('Top coat', 'Top coat'), why: tx('sella el color y le da brillo.', 'seals the colour and adds shine.') },
        { id: 'cuticle', at: { x: 13, y: 50 }, emoji: '🪵', label: tx('Cutículas', 'Cuticles'), why: tx('empuja con el palito de naranjo y retira solo la piel muerta.', 'push back with an orange stick and only remove dead skin.') },
      ],
      order: ['remove', 'file', 'cuticle', 'base', 'color', 'top'],
      hint: tx('Piensa: limpiar, dar forma, cuidar la cutícula y después las capas de esmalte.', 'Think: clean, shape, care for the cuticle, then the polish layers.'),
    },
    {
      kind: 'trace',
      short: tx('Limar', 'File'),
      title: tx('Lima en forma almendra', 'File an almond shape'),
      text: tx('Pasa la lima por cada lado, desde el lateral hasta la punta central. Nunca de vuelta.', 'Run the file down each side, from the edge to the centre point. Never back.'),
      layers: ['almond'],
      routes: [
        { id: 'left', label: tx('Lado izquierdo', 'Left side'), pts: [{ x: 36, y: 33 }, { x: 38, y: 24 }, { x: 44, y: 17 }, { x: 50, y: 13 }], directed: true },
        { id: 'right', label: tx('Lado derecho', 'Right side'), pts: [{ x: 64, y: 33 }, { x: 62, y: 24 }, { x: 56, y: 17 }, { x: 50, y: 13 }], directed: true },
      ],
      tol: 2.2,
      width: 1.2,
      directionHint: tx('Lima siempre del lateral hacia el centro, en una sola dirección.', 'Always file from the side towards the centre, in one direction.'),
    },
    {
      kind: 'trace',
      short: tx('Esmaltar', 'Polish'),
      title: tx('Esmalta en tres pasadas', 'Polish in three strokes'),
      text: tx('Primero el centro y luego cada lateral, de la cutícula hacia la punta, dejando 1 mm libre abajo.', 'First the centre, then each side, from cuticle to tip, leaving a 1 mm gap at the bottom.'),
      layers: ['shaped'],
      routes: [
        { id: 'center', label: tx('Centro', 'Centre'), pts: [{ x: 50, y: 63 }, { x: 50, y: 17 }], directed: true },
        { id: 'left', label: tx('Lateral izquierdo', 'Left side'), pts: [{ x: 42, y: 61 }, { x: 42.5, y: 25 }], directed: true },
        { id: 'right', label: tx('Lateral derecho', 'Right side'), pts: [{ x: 58, y: 61 }, { x: 57.5, y: 25 }], directed: true },
      ],
      tol: 2.4,
      width: 4,
      paint: '#b8325a',
      directionHint: tx('El pincel va de la cutícula hacia la punta.', 'The brush goes from the cuticle towards the tip.'),
    },
  ],
  doneLayers: ['shaped', 'polished'],
  outro: tx(
    'Capas finas y bien secas entre una y otra: así el esmaltado dura más y no hace burbujas.',
    'Thin coats, each one dry before the next: that is how polish lasts and avoids bubbles.',
  ),
}
