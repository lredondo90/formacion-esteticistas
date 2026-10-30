import type { Step } from '../courses'
import { tx } from '../i18n'
import { modular } from '../modules'

// Activities from the first version of the course, reused inside the modules.
const A: Step[] = [
  {
    kind: 'lab',
    lab: 'brows',
    title: tx('Práctica guiada: diseña y traza una ceja', 'Guided practice: map and draw a brow'),
  },
  {
    kind: 'flashcards',
    title: tx('Microblading o micropigmentación', 'Microblading or micropigmentation'),
    cards: [
      {
        front: tx('Microblading', 'Microblading'),
        back: tx(
          'Pluma manual con microagujas. Trazos pelo a pelo muy naturales. Ideal en piel normal o seca.',
          'Manual hand tool with micro-needles. Very natural hair strokes. Best on normal or dry skin.',
        ),
      },
      {
        front: tx('Micropigmentación (dermógrafo)', 'Machine micropigmentation'),
        back: tx(
          'Máquina eléctrica. Permite efecto polvo o sombreado y dura más. Mejor en piel grasa.',
          'Electric machine. Allows powder or shaded effect and lasts longer. Better on oily skin.',
        ),
      },
      {
        front: tx('Retoque', 'Touch-up'),
        back: tx(
          'Entre 4 y 8 semanas después, cuando la piel ha cicatrizado del todo.',
          'Between 4 and 8 weeks later, once the skin has fully healed.',
        ),
      },
      {
        front: tx('Duración', 'Longevity'),
        back: tx(
          'De 12 a 18 meses de media. El sol, la piel grasa y los ácidos lo aclaran antes.',
          '12 to 18 months on average. Sun, oily skin and acids make it fade sooner.',
        ),
      },
    ],
  },
  {
    kind: 'quiz',
    question: tx(
      '¿Cuál de estas situaciones es una contraindicación para hacer microblading?',
      'Which of these is a contraindication for microblading?',
    ),
    options: [
      tx('Cejas muy despobladas', 'Very sparse brows'),
      tx('Embarazo o lactancia', 'Pregnancy or breastfeeding'),
      tx('Piel normal', 'Normal skin'),
      tx('Tener más de 50 años', 'Being over 50'),
    ],
    answer: 1,
    explain: tx(
      'Embarazo, lactancia, anticoagulantes, isotretinoína, queloides, diabetes no controlada o infecciones en la zona son contraindicaciones.',
      'Pregnancy, breastfeeding, blood thinners, isotretinoin, keloids, uncontrolled diabetes or infection in the area are contraindications.',
    ),
  },
  {
    kind: 'order',
    title: tx('Ordena el protocolo de la sesión', 'Put the session protocol in order'),
    items: [
      tx('Ficha, alergias y consentimiento firmado', 'Record card, allergies and signed consent'),
      tx('Diseño y aprobación de la clienta', 'Design and client approval'),
      tx('Desinfección de la zona', 'Disinfect the area'),
      tx('Trazos pelo a pelo con material estéril de un solo uso', 'Hair strokes with sterile single-use tools'),
      tx('Aplicar el pigmento y retirar el exceso', 'Apply pigment and remove the excess'),
      tx('Explicar cuidados y fijar el retoque', 'Explain aftercare and book the touch-up'),
    ],
  },
  {
    kind: 'case',
    title: tx('Caso: cicatrización', 'Case: healing'),
    story: tx(
      'Marta vuelve a los 5 días: "Se me está pelando y parece que el color se va. ¿Me lo has hecho mal?"',
      'Martha comes back after 5 days: "It\'s peeling and the colour seems to be fading. Did you do it wrong?"',
      'Camila vuelve a los 5 días: "Se me está pelando y parece que el color se va. ¿Me lo hiciste mal?"',
    ),
    options: [
      {
        text: tx('Repetir la sesión ese mismo día', 'Redo the session that same day'),
        good: false,
        feedback: tx('La piel aún está cicatrizando: trabajarla ahora la dañaría.', 'The skin is still healing: working on it now would damage it.'),
      },
      {
        text: tx(
          'Tranquilizarla: es normal, el color reaparece en unas semanas y en el retoque se corrige',
          'Reassure her: it is normal, the colour comes back in a few weeks and the touch-up fixes it',
        ),
        good: true,
        feedback: tx(
          'Exacto. La descamación y el "efecto fantasma" son normales. No debe rascarse ni mojar en exceso.',
          'Exactly. Flaking and the "ghosting" phase are normal. She should not pick or soak the area.',
        ),
      },
      {
        text: tx('Recomendarle un exfoliante para acelerar', 'Recommend a scrub to speed it up'),
        good: false,
        feedback: tx('Exfoliar arrancaría pigmento y podría infectar.', 'Exfoliating would pull out pigment and risk infection.'),
      },
    ],
  },
  {
    kind: 'lesson',
    emoji: '📜',
    title: tx('Normativa y certificación', 'Regulations and certification'),
    body: tx(
      'En España necesitas la formación higiénico-sanitaria que exige tu comunidad autónoma y registrar el centro. Trabaja siempre con pigmentos registrados y agujas estériles de un solo uso.',
      'In most countries you need a health and hygiene licence for tattooing and permanent make-up, and a registered studio. Always work with registered pigments and sterile single-use needles.',
      'En Latinoamérica la normativa cambia según el país: consulta los requisitos de salud de tu ciudad. Trabaja siempre con pigmentos registrados y agujas estériles de un solo uso.',
    ),
    tip: tx(
      'Este curso te da un certificado de finalización. No sustituye a la licencia sanitaria obligatoria.',
      'This course gives you a certificate of completion. It does not replace any mandatory health licence.',
    ),
  },
]

export const microblading = modular(
  {
    id: 'microblading',
    emoji: '✒️',
    color: '#8a5a44',
    title: tx('Microblading y micropigmentación de cejas', 'Microblading and brow micropigmentation'),
    summary: tx(
      'Visagismo, diseño, técnica pelo a pelo, seguridad y cuidados. Con certificado final.',
      'Face mapping, design, hair-stroke technique, safety and aftercare. With a final certificate.',
    ),
    premium: { eur: 79, usd: 89 },
    certificate: true,
    minutes: 120,
  },
  [
    {
      emoji: '📐',
      title: tx('Visagismo y diseño de cejas', 'Face mapping and brow design'),
      steps: [
        {
          kind: 'theory',
          emoji: '📐',
          title: tx('Una ceja para cada cara', 'A brow for every face'),
          blocks: [
            { t: 'p', text: tx('Las cejas enmarcan la mirada: cambian la expresión más que cualquier otro rasgo. Por eso el diseño se hace midiendo la cara de la clienta, nunca con una plantilla igual para todas.', 'Brows frame the eyes: they change the expression more than any other feature. That is why the design comes from measuring the client’s face, never from a one-size-fits-all stencil.') },
            { t: 'steps', title: tx('Los tres puntos clave', 'The three key points'), items: [tx('Inicio: en la vertical que sube desde el ala de la nariz.', 'Start: on the vertical line rising from the side of the nostril.'), tx('Arco: en la línea que va del ala de la nariz al borde exterior del iris.', 'Arch: on the line from the nostril through the outer edge of the iris.'), tx('Final: en la línea que va del ala de la nariz al rabillo del ojo.', 'Tail: on the line from the nostril to the outer corner of the eye.')] },
            { t: 'myth', claim: tx('Las dos cejas tienen que quedar idénticas.', 'Both brows must end up identical.'), myth: true, truth: tx('Ninguna cara es simétrica. Buscamos que parezcan hermanas, no gemelas: misma altura de inicio y de arco, adaptando el resto a cada lado.', 'No face is symmetrical. We want them to look like sisters, not twins: same start and arch height, adapting the rest to each side.') },
            { t: 'pairs', title: tx('El diseño según la forma del rostro', 'Design by face shape'), items: [{ a: tx('Redondo', 'Round'), b: tx('Arco más marcado y alto para alargar.', 'A higher, more defined arch to lengthen.') }, { a: tx('Alargado', 'Long'), b: tx('Ceja más recta y horizontal para acortar.', 'A flatter, more horizontal brow to shorten.') }, { a: tx('Cuadrado', 'Square'), b: tx('Arco suave y redondeado para suavizar la mandíbula.', 'A soft, rounded arch to soften the jaw.') }, { a: tx('Corazón', 'Heart'), b: tx('Curva suave, sin arcos muy picudos.', 'A gentle curve, no sharp peaks.') }] },
            { t: 'fact', text: tx('Muchas profesionales usan hilo con pigmento (mapping string) para marcar las líneas: queda un dibujo limpio y simétrico en segundos.', 'Many artists use a pigmented mapping string to mark the lines: it leaves a clean, symmetrical outline in seconds.') },
            { t: 'warn', text: tx('Nunca empieces sin que la clienta haya visto y aprobado el diseño en el espejo. Hazle una foto al dibujo antes de trabajar.', 'Never start until the client has seen and approved the design in the mirror. Take a photo of the drawing before you begin.') },
          ],
        },
        A[0],
        {
          kind: 'quiz',
          question: tx('Una clienta con rostro alargado quiere cejas muy arqueadas. ¿Qué le aconsejas?', 'A client with a long face wants very arched brows. What do you advise?'),
          options: [tx('Arco alto, como pide', 'A high arch, as requested'), tx('Una ceja más horizontal, con arco suave', 'A more horizontal brow with a soft arch'), tx('Que se las depile del todo', 'Remove them completely')],
          answer: 1,
          explain: tx('Un arco alto alargaría aún más el rostro. Explícale por qué y propón un arco suave.', 'A high arch would make her face look even longer. Explain why and suggest a soft arch.'),
        },
      ],
    },
    {
      emoji: '🧬',
      title: tx('La piel y el pigmento', 'Skin and pigment'),
      steps: [
        {
          kind: 'theory',
          emoji: '🧬',
          title: tx('Dónde se queda el color', 'Where the colour stays'),
          blocks: [
            { t: 'p', text: tx('La piel tiene tres capas: epidermis (fuera), dermis (en medio) e hipodermis (grasa). La epidermis se renueva cada mes más o menos, así que el pigmento que se queda ahí desaparece al descamarse.', 'Skin has three layers: epidermis (outer), dermis (middle) and hypodermis (fat). The epidermis renews roughly every month, so pigment left there disappears as it flakes off.') },
            { t: 'p', text: tx('En microblading buscamos la dermis superficial, justo por debajo de la epidermis y a menos de 1 mm. Ahí el pigmento queda atrapado y se ve a través de la piel.', 'Microblading targets the upper dermis, just below the epidermis and less than 1 mm deep. There the pigment gets trapped and shows through the skin.') },
            { t: 'pairs', title: tx('Profundidad y resultado', 'Depth and result'), items: [{ a: tx('Demasiado superficial', 'Too shallow'), b: tx('El color se va al cicatrizar: trazos que desaparecen.', 'Colour leaves as it heals: strokes that vanish.') }, { a: tx('Justo', 'Just right'), b: tx('Trazo fino y nítido que dura 12–18 meses.', 'A fine, crisp stroke that lasts 12–18 months.') }, { a: tx('Demasiado profundo', 'Too deep'), b: tx('El pigmento se expande: trazos borrosos y grisáceos.', 'Pigment spreads: blurry, greyish strokes.') }] },
            { t: 'myth', claim: tx('El microblading es un tatuaje permanente.', 'Microblading is a permanent tattoo.'), myth: true, truth: tx('Es semipermanente: al estar mucho más arriba que un tatuaje, el cuerpo elimina el pigmento poco a poco en uno o dos años.', 'It is semi-permanent: because it sits much higher than a tattoo, the body clears the pigment gradually over one or two years.') },
            { t: 'key', title: tx('Qué hace que dure menos', 'What makes it fade faster'), items: [tx('Piel grasa: el sebo difumina y expulsa el pigmento.', 'Oily skin: sebum blurs and pushes out the pigment.'), tx('Sol sin protección.', 'Unprotected sun.'), tx('Ácidos y retinol en la zona.', 'Acids and retinol on the area.'), tx('Rascar las costras durante la cicatrización.', 'Picking the scabs while healing.')] },
            { t: 'fact', text: tx('En pieles grasas o con poros muy abiertos suele funcionar mejor la técnica de polvo (sombreado con máquina) que el pelo a pelo.', 'On oily skin or large pores, powder brows (machine shading) usually work better than hair strokes.') },
          ],
        },
        A[1],
        {
          kind: 'quiz',
          question: tx('Los trazos de una clienta salen borrosos y grisáceos al curar. ¿Qué ha pasado probablemente?', 'A client’s strokes heal blurry and greyish. What probably happened?'),
          options: [tx('Se trabajó demasiado profundo', 'They were worked too deep'), tx('Se trabajó demasiado superficial', 'They were worked too shallow'), tx('El pigmento era demasiado claro', 'The pigment was too light')],
          answer: 0,
          explain: tx('A demasiada profundidad el pigmento se expande y se ve gris a través de la piel.', 'Too deep, the pigment spreads and looks grey through the skin.'),
        },
      ],
    },
    {
      emoji: '🎨',
      title: tx('Colorimetría y elección del pigmento', 'Colour theory and pigment choice'),
      steps: [
        {
          kind: 'theory',
          emoji: '🎨',
          title: tx('El color que ves no es el que queda', 'The colour you see is not the one that stays'),
          blocks: [
            { t: 'p', text: tx('El pigmento se ve a través de la piel, y la piel tiene su propio tono. Por eso el mismo marrón puede quedar cálido en una clienta y gris en otra.', 'Pigment is seen through the skin, and skin has its own tone. That is why the same brown can heal warm on one client and grey on another.') },
            { t: 'pairs', title: tx('Subtono de la piel', 'Skin undertone'), items: [{ a: tx('Frío', 'Cool'), b: tx('Venas azuladas, le favorece la plata. Evita pigmentos ceniza: tienden a verse grises.', 'Bluish veins, silver suits her. Avoid ash pigments: they tend to look grey.') }, { a: tx('Cálido', 'Warm'), b: tx('Venas verdosas, le favorece el oro. Evita pigmentos muy rojizos: pueden virar a naranja.', 'Greenish veins, gold suits her. Avoid very red pigments: they can turn orange.') }, { a: tx('Neutro', 'Neutral'), b: tx('Mezcla de los dos. Admite la mayoría de marrones.', 'A mix of both. Most browns work.') }] },
            { t: 'key', title: tx('Reglas de oro', 'Golden rules'), items: [tx('Nunca más oscuro que el pelo natural de la clienta.', 'Never darker than the client’s natural hair.'), tx('El color cicatrizado queda un 30–50 % más claro y suave que el recién hecho.', 'Healed colour ends up 30–50% lighter and softer than fresh.'), tx('Con dudas, elige el tono más claro: oscurecer en el retoque es fácil; aclarar, no.', 'When in doubt, go lighter: darkening at the touch-up is easy; lightening is not.')] },
            { t: 'myth', claim: tx('El negro es el color más natural para una morena.', 'Black is the most natural colour for a brunette.'), myth: true, truth: tx('El negro puro vira a azul o gris con el tiempo. Incluso en pelo muy oscuro se usan marrones oscuros.', 'Pure black turns blue or grey over time. Even on very dark hair, dark browns are used.') },
            { t: 'pairs', title: tx('Correctores', 'Correctors'), items: [{ a: tx('Ceja vieja gris o azulada', 'Old grey or bluish brow'), b: tx('Se neutraliza con un corrector naranja.', 'Neutralise with an orange corrector.') }, { a: tx('Ceja vieja rojiza o salmón', 'Old red or salmon brow'), b: tx('Se neutraliza con un corrector verde.', 'Neutralise with a green corrector.') }] },
            { t: 'fact', text: tx('Los colores opuestos en la rueda cromática se anulan entre sí. Es la misma lógica que el corrector de ojeras naranja en maquillaje.', 'Opposite colours on the colour wheel cancel each other out. It is the same logic as an orange under-eye corrector in make-up.') },
          ],
        },
        {
          kind: 'match',
          title: tx('Une cada situación con su solución', 'Match each situation to its fix'),
          pairs: [
            { left: tx('Piel de subtono frío', 'Cool-undertone skin'), right: tx('Evitar tonos ceniza', 'Avoid ash tones') },
            { left: tx('Ceja antigua azulada', 'Old bluish brow'), right: tx('Corrector naranja', 'Orange corrector') },
            { left: tx('Ceja antigua salmón', 'Old salmon brow'), right: tx('Corrector verde', 'Green corrector') },
            { left: tx('Dudas entre dos tonos', 'Torn between two shades'), right: tx('Elegir el más claro', 'Choose the lighter one') },
          ],
        },
        {
          kind: 'quiz',
          question: tx('Clienta rubia con subtono frío. ¿Qué pigmento eliges?', 'Blonde client with a cool undertone. Which pigment do you choose?'),
          options: [tx('Marrón oscuro ceniza', 'Dark ash brown'), tx('Marrón claro neutro o ligeramente cálido', 'Light neutral or slightly warm brown'), tx('Negro suavizado', 'Softened black')],
          answer: 1,
          explain: tx('Claro para no superar su pelo y sin ceniza, que en piel fría se vería gris.', 'Light so it is not darker than her hair, and no ash, which would look grey on cool skin.'),
        },
      ],
    },
    {
      emoji: '🧼',
      title: tx('Higiene, seguridad y contraindicaciones', 'Hygiene, safety and contraindications'),
      steps: [
        {
          kind: 'theory',
          emoji: '🧼',
          title: tx('Trabajar abriendo la piel', 'Working on broken skin'),
          blocks: [
            { t: 'p', text: tx('El microblading abre la piel, así que cualquier fallo de higiene puede provocar una infección o transmitir enfermedades por sangre. La seguridad no es un extra: es la base del oficio.', 'Microblading breaks the skin, so any hygiene slip can cause infection or transmit blood-borne diseases. Safety is not an extra: it is the foundation of the job.') },
            { t: 'key', title: tx('Imprescindibles en cada sesión', 'Must-haves every session'), items: [tx('Cuchillas y agujas estériles de un solo uso, abiertas delante de la clienta.', 'Sterile single-use blades and needles, opened in front of the client.'), tx('Guantes de nitrilo, cambiados si tocas algo fuera de la zona.', 'Nitrile gloves, changed if you touch anything outside the area.'), tx('Film protector en todo lo que no se puede esterilizar.', 'Barrier film on anything that cannot be sterilised.'), tx('Contenedor de objetos punzantes para las cuchillas usadas.', 'A sharps container for used blades.')] },
            { t: 'pairs', title: tx('Contraindicaciones', 'Contraindications'), items: [{ a: tx('No se trabaja', 'Do not treat'), b: tx('Embarazo y lactancia, isotretinoína en el último año, quimioterapia, queloides, infección o herpes en la zona.', 'Pregnancy and breastfeeding, isotretinoin in the last year, chemotherapy, keloids, infection or cold sores in the area.') }, { a: tx('Con informe médico', 'With a doctor’s note'), b: tx('Anticoagulantes, diabetes, problemas de coagulación o enfermedades autoinmunes.', 'Blood thinners, diabetes, clotting disorders or autoimmune conditions.') }] },
            { t: 'myth', claim: tx('Si la clienta toma aspirina un día antes, no pasa nada.', 'A client taking aspirin the day before is fine.'), myth: true, truth: tx('La aspirina y el ibuprofeno hacen sangrar más y el pigmento se va con la sangre. Pide que los evite 48–72 h antes, salvo prescripción médica.', 'Aspirin and ibuprofen increase bleeding, and pigment washes out with the blood. Ask her to avoid them 48–72 h before, unless prescribed.') },
            { t: 'warn', text: tx('Sin consentimiento firmado no hay sesión. En él constan sus antecedentes, el diseño aprobado y los cuidados que se compromete a seguir.', 'No signed consent, no session. It records her history, the approved design and the aftercare she agrees to follow.') },
          ],
        },
        A[2],
        {
          kind: 'case',
          title: tx('Caso: la clienta con prisa', 'Case: the client in a hurry'),
          story: tx('Lucía llega y te dice: "Tengo herpes en el labio, pero es pequeño. ¿Lo hacemos igual, que me caso en dos semanas?"', 'Lucy arrives and says: "I have a cold sore on my lip, but it’s small. Can we still do it? I’m getting married in two weeks."'),
          options: [
            { text: tx('Hacerlo, porque el herpes está en el labio y no en la ceja', 'Go ahead, the cold sore is on her lip, not the brow'), good: false, feedback: tx('El herpes activo indica defensas bajas y riesgo de contagio a otras zonas. Mejor no trabajar.', 'An active cold sore means low defences and a risk of spreading. Better not to work.') },
            { text: tx('Aplazar la cita hasta que esté curado y explicarle por qué', 'Postpone until it has healed and explain why'), good: true, feedback: tx('Correcto. Además, con boda en dos semanas no habría tiempo para cicatrizar ni hacer el retoque: lo ideal es hacerlo con 6–8 semanas de margen.', 'Correct. Besides, with the wedding in two weeks there would be no time to heal or touch up: ideally allow 6–8 weeks.') },
            { text: tx('Hacerlo con doble de anestésico', 'Do it with double the numbing cream'), good: false, feedback: tx('El anestésico no cambia el riesgo de infección, y en exceso altera la piel.', 'Numbing cream does not change the infection risk, and too much changes the skin.') },
          ],
        },
      ],
    },
    {
      emoji: '✍️',
      title: tx('Técnica y protocolo de la sesión', 'Technique and session protocol'),
      steps: [
        {
          kind: 'theory',
          emoji: '✍️',
          title: tx('El trazo perfecto', 'The perfect stroke'),
          blocks: [
            { t: 'p', text: tx('Un buen trazo es fino, nítido y sigue la dirección natural del pelo. Se consigue con tres cosas a la vez: piel tensa, cuchilla en el ángulo correcto y presión constante.', 'A good stroke is fine, crisp and follows the natural hair direction. It takes three things at once: taut skin, the blade at the right angle and steady pressure.') },
            { t: 'steps', title: tx('Cómo hacer cada trazo', 'How to make each stroke'), items: [tx('Tensa la piel en tres puntos con la mano libre.', 'Stretch the skin at three points with your free hand.'), tx('Coloca la cuchilla a 90° respecto a la piel.', 'Hold the blade at 90° to the skin.'), tx('Desliza en una sola pasada, con presión constante, sin volver atrás.', 'Glide in a single pass with steady pressure, never going back.'), tx('Deja espacio entre trazos: la ceja natural tiene huecos.', 'Leave space between strokes: a natural brow has gaps.')] },
            { t: 'pairs', title: tx('Dirección del pelo', 'Hair direction'), items: [{ a: tx('Inicio', 'Start'), b: tx('Hacia arriba, casi vertical.', 'Upwards, almost vertical.') }, { a: tx('Cuerpo', 'Body'), b: tx('En diagonal hacia el arco.', 'Diagonally towards the arch.') }, { a: tx('Cola', 'Tail'), b: tx('Hacia fuera y ligeramente hacia abajo.', 'Outwards and slightly down.') }] },
            { t: 'myth', claim: tx('Si repasas cada trazo varias veces, el color agarra mejor.', 'Going over each stroke several times makes the colour hold better.'), myth: true, truth: tx('Repasar abre más la herida y el trazo cicatriza ancho y borroso. Mejor una pasada bien hecha y, si hace falta, otra en el retoque.', 'Going over it opens the wound further and the stroke heals wide and blurry. One good pass is better, plus another at the touch-up if needed.') },
            { t: 'fact', text: tx('Practicar en piel sintética o látex antes de trabajar con clientas es lo que hacen todas las profesionales. Cientos de cejas antes de la primera de verdad.', 'Practising on synthetic skin or latex before working on clients is what every professional does. Hundreds of brows before the first real one.') },
          ],
        },
        A[3],
        {
          kind: 'quiz',
          question: tx('¿En qué ángulo se sujeta la cuchilla respecto a la piel?', 'At what angle do you hold the blade to the skin?'),
          options: [tx('45°', '45°'), tx('90°', '90°'), tx('Casi plano, a 10°', 'Almost flat, at 10°')],
          answer: 1,
          explain: tx('A 90° el corte es limpio y a la profundidad correcta. Inclinada, corta en bisel y el trazo se abre.', 'At 90° the cut is clean and at the right depth. Tilted, it cuts at a bevel and the stroke spreads.'),
        },
      ],
    },
    {
      emoji: '🌱',
      title: tx('Cicatrización, cuidados y retoque', 'Healing, aftercare and touch-up'),
      steps: [
        {
          kind: 'theory',
          emoji: '🌱',
          title: tx('Las fases de la cicatrización', 'The healing stages'),
          blocks: [
            { t: 'p', text: tx('Explicarle a la clienta lo que va a vivir cada semana evita sustos, llamadas y opiniones negativas. Una clienta informada cuida mejor su ceja.', 'Telling the client what to expect each week prevents scares, calls and bad reviews. An informed client looks after her brows better.') },
            { t: 'pairs', title: tx('Semana a semana', 'Week by week'), items: [{ a: tx('Días 1–3', 'Days 1–3'), b: tx('Color intenso y oscuro, algo de rojez.', 'Intense, dark colour, some redness.') }, { a: tx('Días 4–10', 'Days 4–10'), b: tx('Pica y se pela en finas costras. No se rascan.', 'Itching and fine flaking. No picking.') }, { a: tx('Días 10–20', 'Days 10–20'), b: tx('Efecto fantasma: parece que el color se ha ido.', 'Ghosting: the colour seems to have gone.') }, { a: tx('Semanas 4–6', 'Weeks 4–6'), b: tx('El color vuelve y se asienta. Momento de valorar el retoque.', 'Colour returns and settles. Time to assess the touch-up.') }] },
            { t: 'key', title: tx('Cuidados en casa', 'Home aftercare'), items: [tx('No mojar en exceso ni maquillar la zona durante 7–10 días.', 'No soaking or make-up on the area for 7–10 days.'), tx('Nada de sol, sauna, piscina ni deporte intenso durante dos semanas.', 'No sun, sauna, pool or intense exercise for two weeks.'), tx('Aplicar solo el producto que le indiques, en capa muy fina.', 'Apply only the product you recommend, in a very thin layer.'), tx('No rascar ni arrancar las costras.', 'No scratching or picking scabs.')] },
            { t: 'myth', claim: tx('El retoque sirve para cobrar dos veces.', 'The touch-up is just a way to charge twice.'), myth: true, truth: tx('Cada piel retiene el pigmento de forma distinta. El retoque (4–8 semanas) rellena huecos y ajusta el color: es parte del tratamiento y suele incluirse en el precio.', 'Every skin holds pigment differently. The touch-up (4–8 weeks) fills gaps and adjusts the colour: it is part of the treatment and is usually included in the price.') },
            { t: 'warn', text: tx('Si aparece pus, calor, dolor que aumenta o fiebre, la clienta debe ir al médico. Déjalo por escrito en la hoja de cuidados.', 'If there is pus, heat, increasing pain or fever, the client must see a doctor. Put it in writing on the aftercare sheet.') },
          ],
        },
        A[4],
        A[5],
      ],
    },
  ],
  [
    { question: tx('¿Desde qué punto se trazan las tres líneas del diseño?', 'From which point are the three design lines drawn?'), options: [tx('Desde el centro de la frente', 'From the centre of the forehead'), tx('Desde el ala de la nariz', 'From the side of the nostril'), tx('Desde la comisura de la boca', 'From the corner of the mouth')], answer: 1, explain: tx('Las tres líneas salen del ala de la nariz.', 'All three lines start at the side of the nostril.') },
    { question: tx('El arco de la ceja está en la línea que pasa por…', 'The brow arch lies on the line that passes through…'), options: [tx('El lagrimal', 'The inner corner of the eye'), tx('El borde exterior del iris', 'The outer edge of the iris'), tx('El centro de la pupila', 'The centre of the pupil')], answer: 1, explain: tx('Ala de la nariz → borde exterior del iris.', 'Nostril → outer edge of the iris.') },
    { question: tx('Para un rostro redondo, ¿qué ceja favorece más?', 'Which brow suits a round face best?'), options: [tx('Recta y horizontal', 'Straight and horizontal'), tx('Con arco más alto y definido', 'With a higher, defined arch'), tx('Muy corta', 'Very short')], answer: 1, explain: tx('El arco alto alarga visualmente el rostro.', 'A higher arch visually lengthens the face.') },
    { question: tx('¿En qué capa de la piel se deposita el pigmento del microblading?', 'Which skin layer does microblading pigment go into?'), options: [tx('Epidermis', 'Epidermis'), tx('Dermis superficial', 'Upper dermis'), tx('Hipodermis', 'Hypodermis')], answer: 1, explain: tx('En la dermis superficial, a menos de 1 mm.', 'The upper dermis, under 1 mm deep.') },
    { question: tx('¿Qué ocurre si se trabaja demasiado profundo?', 'What happens if you work too deep?'), options: [tx('El color desaparece', 'The colour disappears'), tx('El trazo se ve borroso y gris', 'The stroke looks blurry and grey'), tx('Dura menos', 'It lasts less')], answer: 1, explain: tx('El pigmento se expande y vira a gris.', 'The pigment spreads and turns grey.') },
    { question: tx('¿Qué tipo de piel suele dar peor resultado con pelo a pelo?', 'Which skin type usually gives the worst hair-stroke results?'), options: [tx('Seca', 'Dry'), tx('Normal', 'Normal'), tx('Grasa con poros abiertos', 'Oily with large pores')], answer: 2, explain: tx('El sebo difumina los trazos. Mejor técnica de polvo.', 'Sebum blurs the strokes. Powder brows work better.') },
    { question: tx('¿Cuánto dura de media un microblading?', 'How long does microblading last on average?'), options: [tx('3 meses', '3 months'), tx('12–18 meses', '12–18 months'), tx('Toda la vida', 'For life')], answer: 1, explain: tx('Es semipermanente: entre uno y dos años según la piel y los cuidados.', 'It is semi-permanent: one to two years depending on skin and aftercare.') },
    { question: tx('Una clienta tiene subtono frío. ¿Qué pigmentos evitas?', 'A client has a cool undertone. Which pigments do you avoid?'), options: [tx('Ceniza', 'Ash'), tx('Neutros', 'Neutral'), tx('Ligeramente cálidos', 'Slightly warm')], answer: 0, explain: tx('En piel fría, la ceniza tiende a verse gris.', 'On cool skin, ash tends to look grey.') },
    { question: tx('Una ceja antigua se ve azulada. ¿Qué corrector usas?', 'An old brow looks bluish. Which corrector do you use?'), options: [tx('Verde', 'Green'), tx('Naranja', 'Orange'), tx('Violeta', 'Violet')], answer: 1, explain: tx('El naranja neutraliza el azul.', 'Orange cancels out blue.') },
    { question: tx('¿Cómo queda el color tras cicatrizar?', 'How does the colour look once healed?'), options: [tx('Igual que el primer día', 'The same as day one'), tx('Un 30–50 % más claro y suave', '30–50% lighter and softer'), tx('Más oscuro', 'Darker')], answer: 1, explain: tx('Por eso, con dudas, se elige el tono más claro.', 'That is why, when in doubt, you choose the lighter shade.') },
    { question: tx('¿Cuál es una contraindicación absoluta?', 'Which is an absolute contraindication?'), options: [tx('Tener más de 60 años', 'Being over 60'), tx('Embarazo', 'Pregnancy'), tx('Cejas muy finas', 'Very thin brows')], answer: 1, explain: tx('Embarazo y lactancia: no se trabaja.', 'Pregnancy and breastfeeding: do not treat.') },
    { question: tx('¿Por qué se pide evitar aspirina e ibuprofeno antes de la sesión?', 'Why should aspirin and ibuprofen be avoided before the session?'), options: [tx('Porque manchan el pigmento', 'They stain the pigment'), tx('Porque aumentan el sangrado y el pigmento se va', 'They increase bleeding and the pigment washes out'), tx('Porque producen alergia', 'They cause allergies')], answer: 1, explain: tx('Más sangrado, peor fijación del color.', 'More bleeding, poorer colour retention.') },
    { question: tx('¿Cómo se hace cada trazo?', 'How is each stroke made?'), options: [tx('Varias pasadas suaves', 'Several light passes'), tx('Una sola pasada con presión constante y piel tensa', 'A single pass with steady pressure and taut skin'), tx('Con la cuchilla inclinada', 'With the blade tilted')], answer: 1, explain: tx('Una pasada limpia a 90°, con la piel tensa.', 'One clean pass at 90°, with the skin taut.') },
    { question: tx('Entre los días 10 y 20 parece que el color se ha ido. ¿Qué es?', 'Between days 10 and 20 the colour seems gone. What is it?'), options: [tx('Un fallo de la técnica', 'A technique failure'), tx('El efecto fantasma, normal en la cicatrización', 'Ghosting, a normal healing stage'), tx('Una alergia', 'An allergy')], answer: 1, explain: tx('El color reaparece hacia la semana 4–6.', 'The colour comes back around weeks 4–6.') },
    { question: tx('¿Cuándo se hace el retoque?', 'When is the touch-up done?'), options: [tx('A la semana', 'After one week'), tx('Entre 4 y 8 semanas después', '4 to 8 weeks later'), tx('Al año', 'After a year')], answer: 1, explain: tx('Cuando la piel ha cicatrizado del todo.', 'Once the skin has fully healed.') },
  ],
)
