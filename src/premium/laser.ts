import type { Step } from '../courses'
import { tx } from '../i18n'
import { modular } from '../modules'

// Activities from the first version of the course, reused inside the modules.
const A: Step[] = [
  {
    kind: 'lab',
    lab: 'laser',
    title: tx('Práctica guiada: ajusta el láser', 'Guided practice: set up the laser'),
  },
  {
    kind: 'flashcards',
    title: tx('Escala de Fitzpatrick', 'Fitzpatrick scale'),
    cards: [
      { front: tx('Fototipo I-II', 'Type I–II'), back: tx('Piel muy clara, siempre se quema. Ideal con vello oscuro.', 'Very fair skin, always burns. Ideal with dark hair.') },
      { front: tx('Fototipo III-IV', 'Type III–IV'), back: tx('Piel media o morena clara. Alejandrita o diodo con cuidado.', 'Medium to olive skin. Alexandrite or diode with care.') },
      { front: tx('Fototipo V-VI', 'Type V–VI'), back: tx('Piel oscura: láser Nd:YAG, que respeta la melanina de la piel.', 'Dark skin: Nd:YAG laser, which spares skin melanin.') },
      { front: tx('Vello rubio, canoso o pelirrojo', 'Blond, grey or red hair'), back: tx('Poca melanina: el láser apenas funciona.', 'Little melanin: the laser barely works.') },
    ],
  },
  {
    kind: 'match',
    title: tx('Une cada equipo con su uso', 'Match each device with its use'),
    pairs: [
      { left: tx('Alejandrita (755 nm)', 'Alexandrite (755 nm)'), right: tx('Pieles claras, vello fino', 'Fair skin, fine hair') },
      { left: tx('Diodo (810 nm)', 'Diode (810 nm)'), right: tx('El más versátil, fototipos I-IV', 'Most versatile, types I–IV') },
      { left: tx('Nd:YAG (1064 nm)', 'Nd:YAG (1064 nm)'), right: tx('Pieles oscuras, V-VI', 'Dark skin, V–VI') },
      { left: tx('IPL', 'IPL'), right: tx('Luz pulsada de banda ancha', 'Broad-spectrum pulsed light') },
    ],
  },
  {
    kind: 'branch',
    title: tx('Simulación: vuelve de vacaciones', 'Simulation: back from holiday'),
    start: 'a',
    nodes: {
      a: {
        who: '👩',
        text: tx(
          '"Vengo a mi tercera sesión de piernas. Acabo de volver de la playa, ¡mira qué morena estoy!"',
          '"I\'m here for my third leg session. Just back from the beach, look at my tan!"',
        ),
        choices: [
          {
            text: tx('"Genial, subimos un poco la potencia para que funcione mejor."', '"Great, let\'s turn up the power so it works better."'),
            end: 'bad',
            feedback: tx(
              'Con la piel bronceada hay más melanina en la piel: subir la potencia es receta para una quemadura.',
              'Tanned skin has more melanin: turning up the power is a recipe for a burn.',
            ),
          },
          {
            text: tx('"Antes de nada, hagamos una prueba en una zona pequeña."', '"First, let\'s do a test patch on a small area."'),
            next: 'b',
          },
          {
            text: tx('"Hoy no podemos tratar. Volvemos a citar cuando se vaya el bronceado."', '"We can\'t treat today. Let\'s rebook when the tan fades."'),
            end: 'good',
            feedback: tx(
              'La opción más segura: esperar unas 4 semanas sin sol. Ofrécele cita y explícale por qué.',
              'The safest option: wait about 4 weeks without sun. Offer a new date and explain why.',
            ),
          },
        ],
      },
      b: {
        who: '🔦',
        text: tx('La prueba enrojece mucho la piel y aparecen pequeñas ampollas.', 'The test patch turns very red and small blisters appear.'),
        choices: [
          {
            text: tx('Parar, enfriar la zona, aplicar calmante y reprogramar la cita', 'Stop, cool the area, apply a soothing product and reschedule'),
            end: 'good',
            feedback: tx(
              'Bien: la prueba ha cumplido su función. Anótalo en la ficha y espera a que se vaya el bronceado.',
              'Good: the patch test did its job. Note it in her record and wait for the tan to fade.',
            ),
          },
          {
            text: tx('Seguir con la sesión a menos potencia', 'Continue the session at lower power'),
            end: 'bad',
            feedback: tx('Con ampollas en la prueba, no se trata. Riesgo alto de quemadura y manchas.', 'Blistering on the test means no treatment. High risk of burns and marks.'),
          },
        ],
      },
    },
  },
  {
    kind: 'order',
    title: tx('Ordena la sesión de láser', 'Put the laser session in order'),
    items: [
      tx('Ficha: fototipo, medicación y exposición solar', 'Record: phototype, medication and sun exposure'),
      tx('Limpiar y comprobar el rasurado', 'Cleanse and check the shave'),
      tx('Gafas de protección para ambas', 'Protective goggles for both'),
      tx('Disparo de prueba y ajuste de parámetros', 'Test shot and adjust settings'),
      tx('Tratar la zona sin solapar disparos', 'Treat the area without overlapping shots'),
      tx('Calmante y SPF 50', 'Soothing product and SPF 50'),
    ],
  },
  {
    kind: 'case',
    title: tx('Caso: medicación', 'Case: medication'),
    story: tx(
      'En la ficha, Laura indica que toma doxiciclina para el acné desde hace una semana.',
      'On her record, Laura says she has been taking doxycycline for acne for a week.',
    ),
    options: [
      {
        text: tx('Tratar con normalidad', 'Treat as normal'),
        good: false,
        feedback: tx('La doxiciclina es fotosensibilizante: más riesgo de quemaduras y manchas.', 'Doxycycline is photosensitising: higher risk of burns and marks.'),
      },
      {
        text: tx('Posponer hasta terminar el tratamiento y consultar con su médico', 'Postpone until she finishes it and check with her doctor'),
        good: true,
        feedback: tx(
          'Correcto. Antibióticos como las tetraciclinas, algunos antiinflamatorios y los retinoides son fotosensibilizantes.',
          'Correct. Antibiotics such as tetracyclines, some anti-inflammatories and retinoids are photosensitising.',
        ),
      },
      {
        text: tx('Tratar solo la mitad de la zona', 'Treat only half the area'),
        good: false,
        feedback: tx('El riesgo es el mismo en cualquier zona.', 'The risk is the same on any area.'),
      },
    ],
  },
]

export const laser = modular(
  {
    id: 'laser',
    emoji: '🔦',
    color: '#b0532a',
    title: tx('Depilación láser y fotodepilación', 'Laser and IPL hair removal'),
    summary: tx(
      'Fototipos, tipos de láser, parámetros, seguridad ocular y cómo evitar quemaduras.',
      'Skin phototypes, laser types, settings, eye safety and how to avoid burns.',
    ),
    premium: { eur: 69, usd: 75 },
    certificate: true,
    minutes: 130,
  },
  [
    {
      emoji: '🔦',
      title: tx('Cómo funciona el láser', 'How the laser works'),
      steps: [
        {
          kind: 'theory',
          emoji: '🔦',
          title: tx('Luz que busca un color', 'Light that seeks a colour'),
          blocks: [
            { t: 'p', text: tx('El láser emite luz de una sola longitud de onda. Esa luz la absorbe un “cromóforo”, una sustancia con color. En depilación, el cromóforo es la melanina del pelo.', 'A laser emits light of a single wavelength. That light is absorbed by a “chromophore”, a coloured substance. In hair removal, the chromophore is the melanin in the hair.') },
            { t: 'p', text: tx('Al absorberla, el pelo se calienta y conduce ese calor hasta el bulbo y las células que lo regeneran. Si el calor es suficiente, el folículo queda dañado y deja de producir pelo.', 'As it absorbs it, the hair heats up and carries that heat to the bulb and the cells that regenerate it. If the heat is enough, the follicle is damaged and stops producing hair.') },
            { t: 'pairs', title: tx('Los parámetros que controlas', 'The settings you control'), items: [{ a: tx('Longitud de onda', 'Wavelength'), b: tx('El tipo de equipo. Más larga = más profunda y más segura en piel oscura.', 'The device type. Longer = deeper and safer on dark skin.') }, { a: tx('Fluencia (J/cm²)', 'Fluence (J/cm²)'), b: tx('La energía de cada disparo.', 'The energy of each shot.') }, { a: tx('Duración de pulso (ms)', 'Pulse duration (ms)'), b: tx('Cuánto dura el disparo. Más largo = más suave con la piel.', 'How long the shot lasts. Longer = gentler on the skin.') }, { a: tx('Spot', 'Spot size'), b: tx('Tamaño del haz. Más grande = penetra más y cubre antes.', 'Beam size. Bigger = deeper and faster coverage.') }] },
            { t: 'myth', claim: tx('El láser elimina el 100 % del vello para siempre.', 'Laser removes 100% of hair forever.'), myth: true, truth: tx('Consigue una reducción permanente del 80–90 %. Lo que queda es más fino y claro, y alguna sesión de mantenimiento al año es normal.', 'It achieves a permanent reduction of 80–90%. What remains is finer and lighter, and an occasional yearly maintenance session is normal.') },
            { t: 'fact', text: tx('La IPL (luz pulsada) no es un láser: emite muchas longitudes de onda a la vez. Es más versátil, pero menos selectiva y suele necesitar más sesiones.', 'IPL (pulsed light) is not a laser: it emits many wavelengths at once. It is more versatile but less selective and usually needs more sessions.') },
          ],
        },
        A[2],
        {
          kind: 'quiz',
          question: tx('¿Cuál es el cromóforo en la depilación láser?', 'What is the chromophore in laser hair removal?'),
          options: [tx('El agua', 'Water'), tx('La melanina del pelo', 'Hair melanin'), tx('La hemoglobina', 'Haemoglobin')],
          answer: 1,
          explain: tx('Por eso el pelo debe tener color para que funcione.', 'That is why hair must have colour for it to work.'),
        },
      ],
    },
    {
      emoji: '🧑🏽',
      title: tx('Fototipo y tipo de vello', 'Skin type and hair type'),
      steps: [
        {
          kind: 'theory',
          emoji: '🧑🏽',
          title: tx('El contraste lo es todo', 'Contrast is everything'),
          blocks: [
            { t: 'p', text: tx('El caso ideal es piel clara con vello oscuro y grueso: toda la energía va al pelo. Cuanto más se parecen el color de la piel y el del pelo, más difícil y arriesgado es.', 'The ideal case is fair skin with dark, coarse hair: all the energy goes to the hair. The more alike skin and hair colour are, the harder and riskier it gets.') },
            { t: 'pairs', title: tx('Qué esperar', 'What to expect'), items: [{ a: tx('Piel clara + vello oscuro', 'Fair skin + dark hair'), b: tx('Resultados excelentes y rápidos.', 'Excellent, fast results.') }, { a: tx('Piel oscura + vello oscuro', 'Dark skin + dark hair'), b: tx('Funciona con Nd:YAG y parámetros prudentes.', 'Works with Nd:YAG and cautious settings.') }, { a: tx('Vello rubio, pelirrojo o canoso', 'Blond, red or grey hair'), b: tx('Casi no tiene melanina: el láser apenas funciona.', 'Barely any melanin: the laser hardly works.') }] },
            { t: 'myth', claim: tx('Con más sesiones, el láser acaba funcionando en canas.', 'With enough sessions, laser eventually works on grey hair.'), myth: true, truth: tx('Sin melanina no hay nada que absorba la luz. Para el vello blanco existen otras técnicas, como la electrólisis.', 'Without melanin, nothing absorbs the light. White hair needs other methods, such as electrolysis.') },
            { t: 'warn', text: tx('El fototipo se valora en la zona a tratar, no en la cara. Las piernas pueden estar más morenas que el rostro.', 'Assess the phototype on the treatment area, not the face. Legs may be more tanned than the face.') },
          ],
        },
        A[1],
        {
          kind: 'quiz',
          question: tx('¿Qué clienta tendrá mejores resultados?', 'Which client will get the best results?'),
          options: [tx('Piel clara y vello rubio', 'Fair skin and blond hair'), tx('Piel clara y vello oscuro grueso', 'Fair skin and coarse dark hair'), tx('Piel oscura y vello canoso', 'Dark skin and grey hair')],
          answer: 1,
          explain: tx('Máximo contraste: la energía va directa al pelo.', 'Maximum contrast: the energy goes straight to the hair.'),
        },
      ],
    },
    {
      emoji: '🌱',
      title: tx('Ciclo del pelo y número de sesiones', 'Hair cycle and number of sessions'),
      steps: [
        {
          kind: 'theory',
          emoji: '🌱',
          title: tx('Por qué hacen falta varias sesiones', 'Why several sessions are needed'),
          blocks: [
            { t: 'p', text: tx('En cada momento, solo una parte del vello está en fase anágena (creciendo y unido al bulbo). Solo ese pelo se elimina en cada sesión. El resto habrá que pillarlo en las siguientes.', 'At any time only part of the hair is in anagen (growing and attached to the bulb). Only that hair is eliminated each session. The rest has to be caught in later ones.') },
            { t: 'pairs', title: tx('Intervalos orientativos', 'Typical intervals'), items: [{ a: tx('Cara', 'Face'), b: tx('Cada 4–6 semanas.', 'Every 4–6 weeks.') }, { a: tx('Axilas e ingles', 'Underarms and bikini'), b: tx('Cada 6–8 semanas.', 'Every 6–8 weeks.') }, { a: tx('Piernas y espalda', 'Legs and back'), b: tx('Cada 8–10 semanas.', 'Every 8–10 weeks.') }] },
            { t: 'key', title: tx('Lo que debe saber la clienta', 'What the client should know'), items: [tx('Entre 6 y 10 sesiones según zona, piel y hormonas.', 'Between 6 and 10 sessions depending on area, skin and hormones.'), tx('El pelo tratado cae a los 10–15 días: parece que crece, pero se está expulsando.', 'Treated hair sheds after 10–15 days: it looks like growth, but it is being pushed out.'), tx('Las zonas hormonales (cara, cuello) pueden necesitar mantenimiento.', 'Hormonal areas (face, neck) may need maintenance.')] },
            { t: 'myth', claim: tx('Entre sesiones puede depilarse con cera para estar más cómoda.', 'Between sessions she can wax to be more comfortable.'), myth: true, truth: tx('La cera arranca el pelo con su raíz y el láser se queda sin “mecha” en la siguiente sesión. Solo cuchilla o crema depilatoria.', 'Waxing pulls out the hair and root, leaving the laser no “wick” next time. Razor or depilatory cream only.') },
            { t: 'fact', text: tx('En raras ocasiones, sobre todo en cara y cuello con fluencias bajas, el láser estimula vello nuevo (hipertricosis paradójica). Es otra razón para usar parámetros eficaces.', 'Rarely, mostly on the face and neck with low fluence, laser stimulates new hair (paradoxical hypertrichosis). Another reason to use effective settings.') },
          ],
        },
        {
          kind: 'quiz',
          question: tx('¿Qué método puede usar la clienta entre sesiones?', 'Which method can the client use between sessions?'),
          options: [tx('Cera', 'Waxing'), tx('Pinzas', 'Tweezing'), tx('Cuchilla', 'Razor')],
          answer: 2,
          explain: tx('La cuchilla corta el pelo pero deja la raíz para el láser.', 'A razor cuts the hair but leaves the root for the laser.'),
        },
        {
          kind: 'quiz',
          question: tx('A los 12 días la clienta dice que “le sigue saliendo pelo”. ¿Qué le explicas?', 'After 12 days the client says “hair keeps growing”. What do you explain?'),
          options: [tx('Que el láser no le funciona', 'The laser doesn’t work for her'), tx('Que es el pelo tratado expulsándose', 'It is treated hair being pushed out'), tx('Que hay que subir la potencia al doble', 'You need to double the power')],
          answer: 1,
          explain: tx('Es normal entre los días 10 y 15: cae solo o al frotar.', 'Normal between days 10 and 15: it falls out on its own or when rubbed.'),
        },
      ],
    },
    {
      emoji: '⚙️',
      title: tx('Parámetros y técnica', 'Settings and technique'),
      steps: [
        {
          kind: 'theory',
          emoji: '⚙️',
          title: tx('Disparar con cabeza', 'Firing with judgement'),
          blocks: [
            { t: 'steps', title: tx('Técnica de disparo', 'Firing technique'), items: [tx('Zona rasurada, limpia y seca.', 'Area shaved, clean and dry.'), tx('Gel o sistema de frío según el equipo.', 'Gel or cooling as the device requires.'), tx('Cabezal perpendicular y bien apoyado.', 'Handpiece perpendicular and in full contact.'), tx('Disparos en filas, con un 10–20 % de solapamiento.', 'Shots in rows with 10–20% overlap.'), tx('Nunca dos disparos seguidos en el mismo punto.', 'Never two shots in a row on the same spot.')] },
            { t: 'p', text: tx('La respuesta correcta de la piel es una ligera rojez y pequeños bultitos alrededor de cada folículo (edema perifolicular). Aparece en minutos y es la señal de que la energía ha llegado.', 'The right skin response is slight redness and small bumps around each follicle (perifollicular oedema). It appears within minutes and shows the energy got there.') },
            { t: 'myth', claim: tx('Si escuece un poco, hay que bajar al mínimo.', 'If it stings a bit, turn it right down.'), myth: true, truth: tx('Una sensación de goma elástica es normal. Lo que no es normal es dolor intenso, blanqueo de la piel u olor a quemado: ahí paras y revisas.', 'A rubber-band snap is normal. Intense pain, skin whitening or a burning smell are not: stop and check.') },
            { t: 'warn', text: tx('Haz siempre un disparo de prueba en una zona pequeña en la primera sesión o al cambiar parámetros, y revisa la reacción.', 'Always do a test shot on a small area in the first session or when changing settings, and check the reaction.') },
          ],
        },
        A[0],
        {
          kind: 'quiz',
          question: tx('¿Qué solapamiento se usa entre disparos?', 'What overlap is used between shots?'),
          options: [tx('Ninguno', 'None'), tx('10–20 %', '10–20%'), tx('50 %', '50%')],
          answer: 1,
          explain: tx('Evita huecos sin quemar la piel por doble disparo.', 'It avoids gaps without burning the skin with double shots.'),
        },
      ],
    },
    {
      emoji: '🛡️',
      title: tx('Seguridad y contraindicaciones', 'Safety and contraindications'),
      steps: [
        {
          kind: 'theory',
          emoji: '🛡️',
          title: tx('Antes de encender el equipo', 'Before switching on'),
          blocks: [
            { t: 'key', title: tx('Protección', 'Protection'), items: [tx('Gafas específicas para la longitud de onda: para ti y para la clienta.', 'Goggles rated for the wavelength: for you and the client.'), tx('Cubrir tatuajes y lunares con lápiz blanco o protector.', 'Cover tattoos and moles with a white pencil or shield.'), tx('Nunca disparar cerca de los ojos ni sobre las cejas.', 'Never fire near the eyes or on the brows.')] },
            { t: 'pairs', title: tx('Contraindicaciones', 'Contraindications'), items: [{ a: tx('No se trata', 'Do not treat'), b: tx('Embarazo, bronceado reciente o autobronceador, piel con heridas o infección, herpes activo.', 'Pregnancy, recent tan or self-tanner, broken or infected skin, active cold sores.') }, { a: tx('Revisar medicación', 'Check medication'), b: tx('Isotretinoína, algunos antibióticos, hipérico y otros fotosensibilizantes.', 'Isotretinoin, some antibiotics, St John’s wort and other photosensitisers.') }, { a: tx('Con informe médico', 'With a doctor’s note'), b: tx('Epilepsia (sobre todo con IPL), enfermedades autoinmunes, queloides.', 'Epilepsy (especially with IPL), autoimmune conditions, keloids.') }] },
            { t: 'myth', claim: tx('Un poco de bronceado no importa si bajas la potencia.', 'A little tan doesn’t matter if you lower the power.'), myth: true, truth: tx('La piel bronceada tiene melanina activa que compite con el pelo. Espera unas 4 semanas sin sol antes de tratar.', 'Tanned skin has active melanin competing with the hair. Wait about 4 weeks without sun before treating.') },
            { t: 'warn', text: tx('Pregunta por la medicación en cada sesión, no solo en la primera. Un antibiótico nuevo puede hacer que una sesión normal acabe en quemadura.', 'Ask about medication every session, not just the first. A new antibiotic can turn a routine session into a burn.') },
          ],
        },
        A[3],
        A[5],
      ],
    },
    {
      emoji: '🧴',
      title: tx('Protocolo completo y cuidados', 'Full protocol and aftercare'),
      steps: [
        {
          kind: 'theory',
          emoji: '🧴',
          title: tx('Antes, durante y después', 'Before, during and after'),
          blocks: [
            { t: 'pairs', title: tx('Indicaciones para la clienta', 'Client instructions'), items: [{ a: tx('Antes', 'Before'), b: tx('Rasurar 24 h antes, sin cera ni pinzas 4–6 semanas, sin sol ni autobronceador.', 'Shave 24 h before, no waxing or tweezing for 4–6 weeks, no sun or self-tanner.') }, { a: tx('Después', 'After'), b: tx('Aloe o crema calmante, SPF 50, sin sol 2 semanas, sin sauna ni deporte intenso 48 h.', 'Aloe or soothing cream, SPF 50, no sun for 2 weeks, no sauna or intense exercise for 48 h.') }] },
            { t: 'pairs', title: tx('Reacciones', 'Reactions'), items: [{ a: tx('Normal', 'Normal'), b: tx('Rojez y bultitos alrededor del folículo que bajan en horas.', 'Redness and bumps around the follicle that settle within hours.') }, { a: tx('Alarma', 'Warning sign'), b: tx('Ampollas, costras, manchas oscuras o blancas: suspender y valorar con un médico.', 'Blisters, crusts, dark or light patches: stop and have a doctor assess.') }] },
            { t: 'myth', claim: tx('Si sale una ampolla, se revienta para que cure antes.', 'If a blister appears, pop it so it heals faster.'), myth: true, truth: tx('La ampolla protege la piel de debajo. Se deja intacta, se cubre y se deriva al médico.', 'The blister protects the skin underneath. Leave it intact, cover it and refer to a doctor.') },
            { t: 'fact', text: tx('Las fotos de la zona y los parámetros de cada sesión en la ficha te permiten ajustar con seguridad y te protegen ante una reclamación.', 'Photos of the area and each session’s settings on the record let you adjust safely and protect you if there is a complaint.') },
          ],
        },
        A[4],
        {
          kind: 'quiz',
          question: tx('¿Cuánto tiempo sin sol tras una sesión?', 'How long without sun after a session?'),
          options: [tx('24 horas', '24 hours'), tx('Unas 2 semanas', 'About 2 weeks'), tx('No hace falta', 'Not needed')],
          answer: 1,
          explain: tx('La piel queda sensibilizada y puede mancharse.', 'The skin is sensitised and can mark.'),
        },
      ],
    },
  ],
  [
    { question: tx('¿Qué absorbe la luz del láser en la depilación?', 'What absorbs laser light in hair removal?'), options: [tx('El agua de la piel', 'Water in the skin'), tx('La melanina del pelo', 'Hair melanin'), tx('La grasa', 'Fat')], answer: 1, explain: tx('Es el cromóforo diana.', 'It is the target chromophore.') },
    { question: tx('¿Qué reducción consigue el láser?', 'What reduction does laser achieve?'), options: [tx('100 % para siempre', '100% forever'), tx('80–90 % permanente', '80–90% permanent'), tx('20 %', '20%')], answer: 1, explain: tx('Lo que queda es más fino y claro.', 'What remains is finer and lighter.') },
    { question: tx('¿Qué parámetro es la energía de cada disparo?', 'Which setting is the energy per shot?'), options: [tx('Fluencia', 'Fluence'), tx('Spot', 'Spot size'), tx('Frecuencia', 'Frequency')], answer: 0, explain: tx('Se mide en J/cm².', 'Measured in J/cm².') },
    { question: tx('Un pulso más largo es…', 'A longer pulse is…'), options: [tx('Más agresivo con la piel', 'Harsher on the skin'), tx('Más suave con la piel', 'Gentler on the skin'), tx('Igual', 'The same')], answer: 1, explain: tx('Da tiempo a la piel a disipar el calor.', 'It gives the skin time to dissipate heat.') },
    { question: tx('¿Qué equipo es el más seguro en fototipo VI?', 'Which device is safest on phototype VI?'), options: [tx('Alejandrita 755 nm', 'Alexandrite 755 nm'), tx('Nd:YAG 1064 nm', 'Nd:YAG 1064 nm'), tx('IPL', 'IPL')], answer: 1, explain: tx('La melanina de la piel apenas lo absorbe.', 'Skin melanin barely absorbs it.') },
    { question: tx('¿Por qué no funciona en canas?', 'Why doesn’t it work on grey hair?'), options: [tx('Son más gruesas', 'They are thicker'), tx('No tienen melanina', 'They have no melanin'), tx('Crecen más rápido', 'They grow faster')], answer: 1, explain: tx('Sin cromóforo no hay absorción.', 'No chromophore, no absorption.') },
    { question: tx('¿Dónde se valora el fototipo?', 'Where do you assess the phototype?'), options: [tx('En la cara siempre', 'Always on the face'), tx('En la zona a tratar', 'On the treatment area'), tx('En las manos', 'On the hands')], answer: 1, explain: tx('Cada zona puede tener un tono distinto.', 'Each area may have a different tone.') },
    { question: tx('¿En qué fase debe estar el pelo para eliminarse?', 'Which phase must the hair be in to be eliminated?'), options: [tx('Anágena', 'Anagen'), tx('Telógena', 'Telogen'), tx('Cualquiera', 'Any')], answer: 0, explain: tx('Solo entonces está unido al bulbo.', 'Only then is it attached to the bulb.') },
    { question: tx('¿Cada cuánto se trata la cara?', 'How often is the face treated?'), options: [tx('Cada semana', 'Weekly'), tx('Cada 4–6 semanas', 'Every 4–6 weeks'), tx('Cada 6 meses', 'Every 6 months')], answer: 1, explain: tx('El cuerpo, con más intervalo.', 'The body, with longer gaps.') },
    { question: tx('¿Qué método no se usa entre sesiones?', 'Which method is not used between sessions?'), options: [tx('Cuchilla', 'Razor'), tx('Crema depilatoria', 'Depilatory cream'), tx('Cera', 'Wax')], answer: 2, explain: tx('Arranca la raíz que necesita el láser.', 'It pulls out the root the laser needs.') },
    { question: tx('¿Qué reacción indica que la energía ha llegado bien?', 'Which reaction shows the energy got there?'), options: [tx('Ampollas', 'Blisters'), tx('Edema perifolicular y ligera rojez', 'Perifollicular oedema and slight redness'), tx('Piel blanca', 'Whitened skin')], answer: 1, explain: tx('Bultitos alrededor del folículo que bajan en horas.', 'Bumps around the follicle that settle within hours.') },
    { question: tx('¿Cuánto esperar tras broncearse?', 'How long to wait after tanning?'), options: [tx('2 días', '2 days'), tx('Unas 4 semanas', 'About 4 weeks'), tx('No hace falta', 'No need')], answer: 1, explain: tx('La melanina activa compite con el pelo.', 'Active melanin competes with the hair.') },
    { question: tx('¿Cuál de estos es fotosensibilizante?', 'Which of these is photosensitising?'), options: [tx('Hipérico', 'St John’s wort'), tx('Agua', 'Water'), tx('Vitamina E en crema', 'Vitamin E cream')], answer: 0, explain: tx('Como la isotretinoína o algunos antibióticos.', 'Like isotretinoin or some antibiotics.') },
    { question: tx('Aparece una ampolla tras la sesión. ¿Qué haces?', 'A blister appears after the session. What do you do?'), options: [tx('Reventarla', 'Pop it'), tx('Dejarla intacta, cubrir y derivar', 'Leave it intact, cover and refer'), tx('Volver a disparar', 'Fire again')], answer: 1, explain: tx('Protege la piel de debajo.', 'It protects the skin underneath.') },
    { question: tx('¿Cuándo se hace el disparo de prueba?', 'When is the test shot done?'), options: [tx('Nunca', 'Never'), tx('Primera sesión y al cambiar parámetros', 'First session and when changing settings'), tx('Solo en la última sesión', 'Only in the last session')], answer: 1, explain: tx('Así compruebas la reacción con seguridad.', 'It lets you check the reaction safely.') },
  ],
)
