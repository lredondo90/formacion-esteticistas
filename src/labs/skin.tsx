import { tx } from '../i18n'
import { FACE, FrontFace, Pulse, Tag } from './art'
import type { LabDef } from './engine'

const T_ZONE = 'M30 24 C 40 20, 60 20, 70 24 L 70 36 C 62 38, 56 40, 55 46 L 56 68 C 56 72, 58 86, 56 96 C 52 99, 48 99, 44 96 C 42 86, 44 72, 44 68 L 45 46 C 44 40, 38 38, 30 36 Z'
const U_ZONE = 'M22 50 C 24 62, 30 80, 44 94 L 44 72 L 40 70 C 34 70, 28 64, 26 52 Z M78 50 C 76 62, 70 80, 56 94 L 56 72 L 60 70 C 66 70, 72 64, 74 52 Z'

const PAPERS = { forehead: FACE.forehead, nose: { x: 50, y: 60 }, cheek: { x: 30, y: 68 } }

function Paper({ x, y, oil, flakes }: { x: number; y: number; oil?: boolean; flakes?: boolean }) {
  return (
    <g>
      <rect x={x - 5} y={y - 3.5} width="10" height="7" rx="0.6" fill="#fffdf6" stroke="#d8cfc0" strokeWidth="0.3" opacity="0.95" />
      {oil && (
        <>
          <ellipse cx={x - 1} cy={y} rx="2.6" ry="1.8" fill="#e8d9a8" opacity="0.9" />
          <ellipse cx={x + 2} cy={y + 1} rx="1.6" ry="1.1" fill="#e8d9a8" opacity="0.9" />
        </>
      )}
      {flakes && [-2.5, 0.5, 2.5].map((d) => <circle key={d} cx={x + d} cy={y + (d % 2)} r="0.35" fill="#cdbfb3" />)}
    </g>
  )
}

export const skinLab: LabDef = {
  emoji: '🔍',
  title: tx('Práctica guiada: diagnostica una piel', 'Guided practice: analyse a skin'),
  viewBox: '0 0 100 130',
  background: '#f3e7e1',
  scene: (layers, s) => (
    <FrontFace>
      {layers.has('tzone') && (
        <g className="fade-in">
          <path d={T_ZONE} fill="#f3c34a" opacity="0.32" />
          <Tag p={{ x: 50, y: 31 }} color="#a26c00">
            {s('Zona T', 'T-zone')}
          </Tag>
        </g>
      )}
      {layers.has('uzone') && (
        <g className="fade-in">
          <path d={U_ZONE} fill="#5b9bd5" opacity="0.3" />
          <Tag p={{ x: 27, y: 75 }} color="#2f6aa0">
            {s('Zona U', 'U-zone')}
          </Tag>
        </g>
      )}
      {layers.has('shine') && (
        <g className="fade-in">
          {[
            [50, 27, 6, 2.4],
            [50, 58, 1.6, 4],
            [50, 92, 3, 1.4],
          ].map(([x, y, rx, ry], i) => (
            <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill="#fff" opacity="0.55" />
          ))}
        </g>
      )}
      {layers.has('pores') && (
        <g className="fade-in">
          {[
            [48, 62],
            [52, 62],
            [47, 64],
            [53, 64],
            [49.5, 60.5],
            [44, 66],
            [56, 66],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="0.35" fill="#8a5a4a" />
          ))}
          <Pulse p={{ x: 50, y: 63 }} r={5} />
        </g>
      )}
      {layers.has('dry') && (
        <g className="fade-in">
          {[
            [28, 66],
            [31, 70],
            [26, 72],
            [72, 66],
            [69, 70],
            [74, 72],
          ].map(([x, y], i) => (
            <path key={i} d={`M${x - 1.2} ${y} l 1 -0.6 l 1 0.7 l 0.8 -0.4`} fill="none" stroke="#fff" strokeWidth="0.35" opacity="0.9" />
          ))}
        </g>
      )}
      {layers.has('papers') && (
        <g className="fade-in">
          <Paper {...PAPERS.forehead} oil />
          <Paper {...PAPERS.nose} oil />
          <Paper {...PAPERS.cheek} />
        </g>
      )}
      {layers.has('result') && (
        <g className="fade-in">
          <Paper x={22} y={118} oil />
          <Paper x={50} y={118} oil />
          <Paper x={78} y={118} flakes />
          <Tag p={{ x: 22, y: 126 }} size={2.8}>
            {s('Frente', 'Forehead')}
          </Tag>
          <Tag p={{ x: 50, y: 126 }} size={2.8}>
            {s('Nariz', 'Nose')}
          </Tag>
          <Tag p={{ x: 78, y: 126 }} size={2.8}>
            {s('Mejilla', 'Cheek')}
          </Tag>
        </g>
      )}
    </FrontFace>
  ),
  learn: [
    {
      title: tx('Primero, piel limpia y buena luz', 'First, clean skin and good light'),
      text: tx(
        'No se diagnostica una piel maquillada. Desmaquilla, limpia y observa con luz natural o con una lupa de luz fría.',
        'You cannot analyse a skin with make-up on. Remove it, cleanse and look in natural light or under a cold-light magnifier.',
      ),
    },
    {
      title: tx('La zona T', 'The T-zone'),
      text: tx(
        'Frente, nariz y barbilla tienen más glándulas sebáceas. Es donde primero aparecen el brillo y los poros abiertos.',
        'Forehead, nose and chin have more sebaceous glands. Shine and open pores show up there first.',
        'Frente, nariz y mentón tienen más glándulas sebáceas. Es donde primero aparecen el brillo y los poros abiertos.',
      ),
      layers: ['tzone'],
    },
    {
      title: tx('La zona U', 'The U-zone'),
      text: tx(
        'Mejillas y contorno producen menos sebo. Si aquí hay tirantez o descamación, esa parte de la piel es seca.',
        'Cheeks and jawline produce less sebum. Tightness or flaking here means that part of the skin is dry.',
      ),
      layers: ['uzone'],
    },
    {
      title: tx('Las señales', 'The signs'),
      text: tx(
        'Brillo y poros dilatados indican exceso de sebo. Tirantez, aspereza y pequeñas escamas indican falta de lípidos.',
        'Shine and enlarged pores mean excess sebum. Tightness, roughness and small flakes mean a lack of lipids.',
        'Brillo y poros dilatados indican exceso de sebo. Tirantez, aspereza y pequeñas escamas indican resequedad.',
      ),
      layers: ['shine', 'pores', 'dry'],
    },
    {
      title: tx('El test del papel secante', 'The blotting paper test'),
      text: tx(
        'Presiona un papel secante en la frente, la nariz y la mejilla. Las manchas translúcidas son sebo: así ves dónde sobra grasa.',
        'Press a blotting paper on the forehead, nose and cheek. Translucent marks are sebum: they show where there is too much oil.',
      ),
      layers: ['papers'],
    },
  ],
  tasks: [
    {
      kind: 'taporder',
      short: tx('Protocolo', 'Protocol'),
      title: tx('Sigue el protocolo de diagnóstico', 'Follow the analysis protocol'),
      text: tx('Toca los pasos en el orden correcto.', 'Tap the steps in the right order.'),
      spots: [
        { id: 'record', at: { x: 85, y: 108 }, emoji: '📝', label: tx('Ficha', 'Record card'), why: tx('completa la ficha con lo que has visto y lo que te cuenta.', 'write down what you saw and what the client tells you.') },
        { id: 'touch', at: { x: 15, y: 108 }, emoji: '🤏', label: tx('Tacto', 'Touch'), why: tx('palpa la textura: aspereza, granitos, elasticidad.', 'feel the texture: roughness, bumps, elasticity.') },
        { id: 'loupe', at: { x: 85, y: 26 }, emoji: '🔍', label: tx('Lupa', 'Magnifier'), why: tx('observa poros, brillo y rojeces con luz fría.', 'look at pores, shine and redness under cold light.') },
        { id: 'clean', at: { x: 15, y: 26 }, emoji: '🧼', label: tx('Limpiar', 'Cleanse'), why: tx('sin maquillaje ni restos, la piel no engaña.', 'with no make-up or residue, the skin tells the truth.') },
      ],
      order: ['clean', 'loupe', 'touch', 'record'],
      hint: tx('Primero la piel limpia, después mirar, después tocar y al final anotar.', 'First clean skin, then look, then touch, and finally write it down.'),
    },
    {
      kind: 'place',
      short: tx('Papel secante', 'Blotting test'),
      title: tx('Haz el test del papel secante', 'Do the blotting paper test'),
      text: tx('Arrastra cada papel a su zona: uno a la frente, otro a la nariz y otro a la mejilla.', 'Drag each paper to its area: one on the forehead, one on the nose and one on the cheek.'),
      handles: [
        { id: 'forehead', label: tx('Frente', 'Forehead'), start: { x: 20, y: 116 }, target: PAPERS.forehead, tol: 7, hint: tx('va en el centro de la frente.', 'goes in the middle of the forehead.') },
        { id: 'nose', label: tx('Nariz', 'Nose'), start: { x: 50, y: 116 }, target: PAPERS.nose, tol: 5, hint: tx('va sobre el dorso de la nariz.', 'goes on the bridge of the nose.') },
        { id: 'cheek', label: tx('Mejilla', 'Cheek'), start: { x: 80, y: 116 }, target: PAPERS.cheek, tol: 7, hint: tx('va en el pómulo, fuera de la zona T.', 'goes on the cheek, outside the T-zone.') },
      ],
      overlay: (marks) => (
        <>
          {Object.values(marks).map((m, i) => (
            <Paper key={i} x={m.x} y={m.y} />
          ))}
        </>
      ),
    },
    {
      kind: 'choose',
      short: tx('Diagnóstico', 'Diagnosis'),
      title: tx('Lee los papeles', 'Read the papers'),
      text: tx(
        'La frente y la nariz dejan manchas de grasa. La mejilla sale limpia, con alguna escamita, y la clienta dice que le tira. ¿Qué piel tiene?',
        'Forehead and nose leave oily marks. The cheek paper is clean with a few flakes, and the client says it feels tight. What skin type is it?',
      ),
      layers: ['result', 'shine', 'dry'],
      options: [
        { text: tx('Grasa', 'Oily'), good: false, feedback: tx('Una piel grasa mancharía también la mejilla. Aquí la zona U es seca.', 'Oily skin would mark the cheek too. Here the U-zone is dry.') },
        { text: tx('Mixta', 'Combination'), good: true, feedback: tx('¡Eso es! Zona T grasa y zona U seca: piel mixta. Tratarás cada zona por separado.', "That's it! Oily T-zone and dry U-zone: combination skin. You'll treat each area separately.") },
        { text: tx('Seca', 'Dry'), good: false, feedback: tx('La frente y la nariz tienen exceso de sebo, así que no es una piel seca.', 'Forehead and nose have excess sebum, so it is not dry skin.') },
        { text: tx('Normal', 'Normal'), good: false, feedback: tx('Una piel normal no tendría ni manchas de grasa ni tirantez.', 'Normal skin would show neither oily marks nor tightness.') },
      ],
    },
  ],
  outro: tx(
    'En cabina, repite el test unas dos horas después de la limpieza para que la piel haya vuelto a producir sebo.',
    'In the salon, repeat the test about two hours after cleansing so the skin has had time to produce sebum again.',
    'En el gabinete, repite el test unas dos horas después de la limpieza para que la piel haya vuelto a producir sebo.',
  ),
}
