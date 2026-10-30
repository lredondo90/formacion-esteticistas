import type { Step } from '../courses'
import { tx } from '../i18n'
import { modular } from '../modules'

// Activities from the first version of the course, reused inside the modules.
const A: Step[] = [
  {
    kind: 'lab',
    lab: 'facials',
    title: tx('Práctica guiada: protocolo de higiene facial', 'Guided practice: deep-cleansing facial protocol'),
  },
  {
    kind: 'flashcards',
    title: tx('Tres tecnologías clave', 'Three key technologies'),
    cards: [
      {
        front: tx('Peeling químico', 'Chemical peel'),
        back: tx('Ácidos que exfolian: manchas, textura, acné y luminosidad.', 'Exfoliating acids: pigmentation, texture, acne and glow.'),
      },
      {
        front: tx('Dermapen (microneedling)', 'Microneedling'),
        back: tx(
          'Microperforaciones que estimulan colágeno: cicatrices de acné, poros y firmeza.',
          'Micro-injuries that boost collagen: acne scars, pores and firmness.',
        ),
      },
      {
        front: tx('Radiofrecuencia', 'Radiofrequency'),
        back: tx('Calor profundo que contrae y regenera el colágeno: flacidez y arrugas.', 'Deep heat that tightens and renews collagen: sagging and wrinkles.'),
      },
      {
        front: tx('Profundidad estética del dermapen', 'Cosmetic microneedling depth'),
        back: tx(
          'En cabina estética, hasta 0,5 mm. Las profundidades mayores son de uso médico.',
          'In a beauty salon, up to 0.5 mm. Deeper needling is a medical procedure.',
        ),
      },
    ],
  },
  {
    kind: 'match',
    title: tx('Une cada problema con su tratamiento', 'Match each concern with its treatment'),
    pairs: [
      { left: tx('Cicatrices de acné', 'Acne scars'), right: tx('Dermapen', 'Microneedling') },
      { left: tx('Flacidez del óvalo', 'Sagging jawline'), right: tx('Radiofrecuencia', 'Radiofrequency') },
      { left: tx('Piel apagada y textura irregular', 'Dull, uneven texture'), right: tx('Peeling glicólico', 'Glycolic peel') },
      { left: tx('Barrera alterada y rojeces', 'Damaged barrier and redness'), right: tx('Tratamiento calmante, sin agresiones', 'Soothing treatment, nothing aggressive') },
    ],
  },
  {
    kind: 'branch',
    title: tx('Simulación: la clienta quiere dermapen', 'Simulation: the client wants microneedling'),
    start: 'a',
    nodes: {
      a: {
        who: '👩',
        text: tx(
          '"Hola, quiero dermapen para las marcas de acné. Mi dermatóloga me ha recetado isotretinoína hace dos meses."',
          '"Hi, I want microneedling for my acne marks. My dermatologist put me on isotretinoin two months ago."',
          '"Hola, quiero dermapen para las marcas de acné. Mi dermatóloga me recetó isotretinoína hace dos meses."',
        ),
        choices: [
          {
            text: tx('"¡Perfecto! Empezamos hoy mismo."', '"Perfect! Let\'s start today."'),
            end: 'bad',
            feedback: tx(
              'Con isotretinoína la piel cicatriza mal: hay riesgo de cicatrices y heridas. Es una contraindicación.',
              'On isotretinoin the skin heals poorly: there is a risk of scarring and wounds. It is a contraindication.',
            ),
          },
          {
            text: tx('"Antes necesito saber más. ¿Sigues tomándola?"', '"I need to know more first. Are you still taking it?"'),
            next: 'b',
          },
        ],
      },
      b: {
        who: '👩',
        text: tx('"Sí, me quedan cuatro meses. Pero yo quiero hacer algo ya..."', '"Yes, four more months. But I want to do something now..."'),
        choices: [
          {
            text: tx(
              '"Haremos un tratamiento hidratante y calmante ahora, y el dermapen cuando lleves 6 meses sin tomarla."',
              '"We\'ll do a hydrating, soothing treatment now, and microneedling once you\'ve been off it for 6 months."',
            ),
            end: 'good',
            feedback: tx(
              'Perfecto: cuidas su piel, mantienes a la clienta y planificas el tratamiento con seguridad.',
              'Perfect: you look after her skin, keep the client and plan the treatment safely.',
            ),
          },
          {
            text: tx('"Hacemos un peeling medio, que es más suave."', '"Let\'s do a medium peel instead, it\'s gentler."'),
            end: 'bad',
            feedback: tx(
              'Los peelings medios también están contraindicados con isotretinoína.',
              'Medium peels are also contraindicated with isotretinoin.',
            ),
          },
        ],
      },
    },
  },
  {
    kind: 'order',
    title: tx('Ordena un protocolo de dermapen', 'Put a microneedling protocol in order'),
    items: [
      tx('Ficha, contraindicaciones y consentimiento', 'Record card, contraindications and consent'),
      tx('Limpieza y desinfección de la piel', 'Cleanse and disinfect the skin'),
      tx('Aplicar el sérum estéril', 'Apply a sterile serum'),
      tx('Pasadas con cartucho estéril de un solo uso', 'Passes with a sterile single-use cartridge'),
      tx('Mascarilla calmante', 'Soothing mask'),
      tx('SPF 50 y cuidados en casa', 'SPF 50 and home care'),
    ],
  },
  {
    kind: 'quiz',
    question: tx('¿Qué es una contraindicación de la radiofrecuencia?', 'Which is a contraindication for radiofrequency?'),
    options: [
      tx('Arrugas finas', 'Fine lines'),
      tx('Marcapasos o implantes metálicos en la zona', 'Pacemaker or metal implants in the area'),
      tx('Piel mixta', 'Combination skin'),
    ],
    answer: 1,
    explain: tx(
      'La corriente puede interferir con marcapasos y calentar los metales. También embarazo y procesos oncológicos.',
      'The current can interfere with pacemakers and heat metal. Pregnancy and active cancer are also contraindications.',
    ),
  },
]

export const facials = modular(
  {
    id: 'faciales-avanzados',
    emoji: '🧖',
    color: '#2f7f8a',
    title: tx('Tratamientos faciales avanzados', 'Advanced facial treatments'),
    summary: tx(
      'Peeling químico, dermapen y radiofrecuencia: indicaciones, protocolo y seguridad.',
      'Chemical peels, microneedling and radiofrequency: indications, protocol and safety.',
    ),
    premium: { eur: 69, usd: 75 },
    certificate: true,
    minutes: 130,
  },
  [
    {
      emoji: '🔬',
      title: tx('Diagnóstico avanzado de la piel', 'Advanced skin analysis'),
      steps: [
        {
          kind: 'theory',
          emoji: '🔬',
          title: tx('Antes de tratar, entender', 'Understand before you treat'),
          blocks: [
            { t: 'p', text: tx('Un tratamiento avanzado mal elegido puede dejar manchas o irritar durante semanas. Por eso el diagnóstico va más allá del tipo de piel: miramos fototipo, estado de la barrera y alteraciones concretas.', 'A poorly chosen advanced treatment can leave marks or irritate for weeks. That is why analysis goes beyond skin type: we look at phototype, barrier condition and specific concerns.') },
            { t: 'pairs', title: tx('Fototipos de Fitzpatrick', 'Fitzpatrick phototypes'), items: [{ a: tx('I–II', 'I–II'), b: tx('Piel muy clara, se quema fácil. Ojo con rojeces.', 'Very fair skin, burns easily. Watch for redness.') }, { a: tx('III–IV', 'III–IV'), b: tx('Piel media, se broncea bien. Riesgo moderado de manchas.', 'Medium skin, tans well. Moderate risk of marks.') }, { a: tx('V–VI', 'V–VI'), b: tx('Piel oscura. Alto riesgo de manchas tras inflamación: tratamientos suaves.', 'Dark skin. High risk of post-inflammatory marks: gentle treatments.') }] },
            { t: 'pairs', title: tx('Seca no es lo mismo que deshidratada', 'Dry is not the same as dehydrated'), items: [{ a: tx('Seca', 'Dry'), b: tx('Le falta grasa. Es un tipo de piel.', 'Lacks oil. It is a skin type.') }, { a: tx('Deshidratada', 'Dehydrated'), b: tx('Le falta agua. Es un estado: hasta una piel grasa puede estarlo.', 'Lacks water. It is a condition: even oily skin can be dehydrated.') }] },
            { t: 'myth', claim: tx('Las pieles oscuras aguantan tratamientos más fuertes.', 'Darker skin can take stronger treatments.'), myth: true, truth: tx('Al contrario: reaccionan a la inflamación fabricando melanina y les quedan manchas. Se tratan con más prudencia.', 'The opposite: they react to inflammation by producing melanin and get marks. They need more caution.') },
            { t: 'key', title: tx('Herramientas del diagnóstico', 'Analysis tools'), items: [tx('Lupa con luz fría.', 'Cold-light magnifier.'), tx('Luz de Wood: muestra manchas profundas y zonas grasas.', 'Wood’s lamp: reveals deep pigment and oily areas.'), tx('Fotos de antes con la misma luz y ángulo.', 'Before photos with the same light and angle.'), tx('Ficha con medicación, alergias y tratamientos previos.', 'Record with medication, allergies and previous treatments.')] },
            { t: 'warn', text: tx('Pregunta siempre por isotretinoína (Roacután), retinoides, anticoagulantes, embarazo y herpes. Cambian por completo lo que puedes hacer.', 'Always ask about isotretinoin (Accutane), retinoids, blood thinners, pregnancy and cold sores. They completely change what you can do.') },
          ],
        },
        {
          kind: 'quiz',
          question: tx('Una piel grasa con tirantez y líneas finas tras lavarse está…', 'Oily skin with tightness and fine lines after washing is…'),
          options: [tx('Seca', 'Dry'), tx('Deshidratada', 'Dehydrated'), tx('Normal', 'Normal')],
          answer: 1,
          explain: tx('Tiene grasa pero le falta agua: necesita hidratación, no más desengrasantes.', 'It has oil but lacks water: it needs hydration, not more degreasing.'),
        },
        {
          kind: 'quiz',
          question: tx('¿Qué fototipo tiene más riesgo de manchas tras un tratamiento agresivo?', 'Which phototype has the highest risk of marks after an aggressive treatment?'),
          options: [tx('I', 'I'), tx('III', 'III'), tx('VI', 'VI')],
          answer: 2,
          explain: tx('Cuanto más oscura la piel, más reacciona con hiperpigmentación.', 'The darker the skin, the more it reacts with hyperpigmentation.'),
        },
      ],
    },
    {
      emoji: '🧖',
      title: tx('Higiene facial profunda', 'Deep-cleansing facial'),
      steps: [
        {
          kind: 'theory',
          emoji: '🧖',
          title: tx('El tratamiento que todo el mundo pide', 'The treatment everyone asks for'),
          blocks: [
            { t: 'p', text: tx('La higiene facial es la puerta de entrada al centro: si sale bien, la clienta vuelve y prueba todo lo demás. Tiene que ser eficaz y, a la vez, una experiencia agradable.', 'The deep-cleansing facial is the gateway to your salon: if it goes well, the client comes back and tries everything else. It has to be effective and a pleasant experience.') },
            { t: 'pairs', title: tx('Comedones y lesiones', 'Comedones and lesions'), items: [{ a: tx('Punto negro', 'Blackhead'), b: tx('Comedón abierto: se oxida y oscurece. Se extrae.', 'Open comedone: oxidises and darkens. Extract it.') }, { a: tx('Punto blanco', 'Whitehead'), b: tx('Comedón cerrado. Se extrae con cuidado, a veces con lanceta estéril.', 'Closed comedone. Extract carefully, sometimes with a sterile lancet.') }, { a: tx('Pápula o pústula inflamada', 'Inflamed papule or pustule'), b: tx('No se exprime: se calma y se trata.', 'Do not squeeze: calm and treat it.') }, { a: tx('Milium', 'Milium'), b: tx('Bolita blanca y dura de queratina. Mejor derivar si no tienes formación específica.', 'Small hard white keratin bump. Better refer if not specifically trained.') }] },
            { t: 'myth', claim: tx('El vapor abre los poros.', 'Steam opens the pores.'), myth: true, truth: tx('Los poros no tienen músculos para abrirse o cerrarse. El vapor ablanda el sebo y la capa córnea, y eso facilita la extracción.', 'Pores have no muscles to open or close. Steam softens sebum and the outer layer, which makes extraction easier.') },
            { t: 'warn', text: tx('Extracción máximo 10–15 minutos y siempre con dedos envueltos en gasa. Insistir en una lesión deja marcas y rotura de capilares.', 'Extraction 10–15 minutes at most, always with gauze-wrapped fingers. Overworking a spot leaves marks and broken capillaries.') },
            { t: 'fact', text: tx('Tras la extracción, la alta frecuencia con electrodo de vidrio ayuda a desinfectar gracias al ozono que genera.', 'After extraction, high frequency with a glass electrode helps disinfect thanks to the ozone it produces.') },
          ],
        },
        A[0],
        {
          kind: 'quiz',
          question: tx('¿Qué haces con una pústula muy inflamada durante la higiene?', 'What do you do with a very inflamed pustule during the facial?'),
          options: [tx('Exprimirla con fuerza', 'Squeeze it hard'), tx('No forzarla: calmar y tratar', 'Don’t force it: calm and treat'), tx('Pincharla con una aguja cualquiera', 'Prick it with any needle')],
          answer: 1,
          explain: tx('Forzar una lesión inflamada extiende la infección y deja marca.', 'Forcing an inflamed lesion spreads infection and leaves a mark.'),
        },
      ],
    },
    {
      emoji: '🧪',
      title: tx('Peelings químicos', 'Chemical peels'),
      steps: [
        {
          kind: 'theory',
          emoji: '🧪',
          title: tx('Renovar la piel con ácidos', 'Renewing skin with acids'),
          blocks: [
            { t: 'p', text: tx('Un peeling químico aplica un ácido que suelta las uniones entre las células muertas. La piel se renueva más rápido: mejora textura, manchas, poros y luminosidad.', 'A chemical peel applies an acid that loosens the bonds between dead cells. Skin renews faster: texture, marks, pores and glow all improve.') },
            { t: 'pairs', title: tx('Los ácidos más usados en cabina', 'The most used acids in the salon', 'Los ácidos más usados en el gabinete'), items: [{ a: tx('Glicólico', 'Glycolic'), b: tx('Molécula pequeña, penetra rápido. Textura y luminosidad.', 'Small molecule, penetrates fast. Texture and glow.') }, { a: tx('Láctico', 'Lactic'), b: tx('Más suave e hidratante. Pieles sensibles o secas.', 'Gentler and hydrating. Sensitive or dry skin.') }, { a: tx('Mandélico', 'Mandelic'), b: tx('Molécula grande y suave. Ideal en fototipos altos.', 'Large, gentle molecule. Ideal for darker phototypes.') }, { a: tx('Salicílico', 'Salicylic'), b: tx('Soluble en grasa: entra en el poro. Acné y piel grasa.', 'Oil-soluble: gets into the pore. Acne and oily skin.') }] },
            { t: 'steps', title: tx('Protocolo seguro', 'Safe protocol'), items: [tx('Preparar la piel en casa 2 semanas con un ácido suave.', 'Prep the skin at home for 2 weeks with a mild acid.'), tx('Limpiar y desengrasar.', 'Cleanse and degrease.'), tx('Proteger ojos, comisuras y aletas nasales con vaselina.', 'Protect eyes, mouth corners and nostrils with petroleum jelly.'), tx('Aplicar en capa uniforme y controlar el tiempo.', 'Apply evenly and time it.'), tx('Neutralizar o retirar según el producto.', 'Neutralise or remove as the product requires.'), tx('Calmar y proteger con SPF 50.', 'Soothe and protect with SPF 50.')] },
            { t: 'myth', claim: tx('Si no se pela, el peeling no ha funcionado.', 'If it doesn’t peel, the peel didn’t work.'), myth: true, truth: tx('Los peelings superficiales renuevan sin descamación visible. Pelarse mucho no significa mejor resultado.', 'Superficial peels renew without visible peeling. Peeling a lot does not mean better results.') },
            { t: 'warn', text: tx('Los peelings medios y profundos (como el TCA alto) son de uso médico. En estética se trabaja con peelings superficiales.', 'Medium and deep peels (such as high TCA) are for medical use. Aestheticians work with superficial peels.') },
            { t: 'fact', text: tx('Otoño e invierno son la mejor época: menos sol, menos riesgo de manchas. En verano, solo ácidos muy suaves y SPF estricto.', 'Autumn and winter are the best season: less sun, less risk of marks. In summer, only very mild acids and strict SPF.') },
          ],
        },
        {
          kind: 'match',
          title: tx('Une cada piel con su ácido', 'Match each skin with its acid'),
          pairs: [
            { left: tx('Acné y poros obstruidos', 'Acne and clogged pores'), right: tx('Salicílico', 'Salicylic') },
            { left: tx('Piel sensible y seca', 'Sensitive, dry skin'), right: tx('Láctico', 'Lactic') },
            { left: tx('Fototipo V con manchas', 'Phototype V with marks'), right: tx('Mandélico', 'Mandelic') },
            { left: tx('Textura apagada en piel resistente', 'Dull texture on resilient skin'), right: tx('Glicólico', 'Glycolic') },
          ],
        },
        {
          kind: 'quiz',
          question: tx('¿Por qué el ácido salicílico es el preferido para el acné?', 'Why is salicylic acid the go-to for acne?'),
          options: [tx('Porque es soluble en grasa y entra en el poro', 'It is oil-soluble and gets into the pore'), tx('Porque huele mejor', 'It smells nicer'), tx('Porque no necesita SPF', 'It doesn’t need SPF')],
          answer: 0,
          explain: tx('Disuelve el sebo dentro del poro y además es antiinflamatorio.', 'It dissolves sebum inside the pore and is anti-inflammatory too.'),
        },
      ],
    },
    {
      emoji: '📍',
      title: tx('Microneedling (dermapen)', 'Microneedling'),
      steps: [
        {
          kind: 'theory',
          emoji: '📍',
          title: tx('Pequeñas heridas que regeneran', 'Tiny wounds that regenerate'),
          blocks: [
            { t: 'p', text: tx('El dermapen hace miles de microperforaciones. La piel responde reparándose: fabrica colágeno y elastina nuevos. Mejora cicatrices de acné, poros, textura y líneas finas.', 'A microneedling pen makes thousands of micro-channels. Skin responds by repairing: it builds new collagen and elastin. It improves acne scars, pores, texture and fine lines.') },
            { t: 'pairs', title: tx('Profundidad orientativa', 'Typical depth'), items: [{ a: tx('0,25–0,5 mm', '0.25–0.5 mm'), b: tx('Estético: textura, luminosidad y penetración de activos.', 'Cosmetic: texture, glow and product penetration.') }, { a: tx('Más de 1 mm', 'Over 1 mm'), b: tx('Cicatrices profundas. En muchos países, uso médico.', 'Deep scars. Medical use in many countries.') }] },
            { t: 'key', title: tx('No se hace si…', 'Do not treat if…'), items: [tx('Toma o ha tomado isotretinoína en los últimos 6–12 meses.', 'She takes or took isotretinoin in the last 6–12 months.'), tx('Hay acné activo inflamado, herpes o infección.', 'There is active inflamed acne, cold sores or infection.'), tx('Tiene tendencia a queloides.', 'She is prone to keloids.'), tx('Está embarazada o toma anticoagulantes.', 'She is pregnant or on blood thinners.')] },
            { t: 'myth', claim: tx('Con el dermapen se puede aplicar cualquier sérum.', 'Any serum can be used with microneedling.'), myth: true, truth: tx('Los canales abiertos dejan pasar todo, también irritantes y alérgenos. Usa solo productos estériles y aptos para microneedling, como ácido hialurónico.', 'Open channels let everything in, irritants and allergens too. Use only sterile, microneedling-safe products like hyaluronic acid.') },
            { t: 'warn', text: tx('Cartucho de agujas estéril y de un solo uso, siempre. Reutilizarlo es un riesgo grave de infección.', 'Sterile single-use needle cartridge, always. Reusing it is a serious infection risk.') },
          ],
        },
        A[4],
        A[3],
      ],
    },
    {
      emoji: '⚡',
      title: tx('Aparatología facial', 'Facial devices'),
      steps: [
        {
          kind: 'theory',
          emoji: '⚡',
          title: tx('Qué hace cada máquina', 'What each device does'),
          blocks: [
            { t: 'pairs', title: tx('Las más habituales', 'The most common'), items: [{ a: tx('Radiofrecuencia', 'Radiofrequency'), b: tx('Calienta la dermis y estimula colágeno: firmeza y óvalo.', 'Heats the dermis and boosts collagen: firmness and jawline.') }, { a: tx('Espátula ultrasónica', 'Ultrasonic scrubber'), b: tx('Vibración que limpia y exfolia suavemente.', 'Vibration that cleanses and gently exfoliates.') }, { a: tx('Alta frecuencia', 'High frequency'), b: tx('Genera ozono: desinfecta y seca granitos.', 'Produces ozone: disinfects and dries spots.') }, { a: tx('LED', 'LED'), b: tx('Rojo: regenera. Azul: bacterias del acné.', 'Red: regenerates. Blue: acne bacteria.') }, { a: tx('Microcorrientes', 'Microcurrent'), b: tx('Tonifican la musculatura facial.', 'Tone the facial muscles.') }] },
            { t: 'myth', claim: tx('Cuanto más calor con la radiofrecuencia, mejor resultado.', 'The hotter the radiofrequency, the better the result.'), myth: true, truth: tx('Se busca una temperatura constante y tolerable (en superficie unos 40–42 °C). Más calor solo provoca quemaduras.', 'You want a steady, tolerable temperature (around 40–42 °C on the surface). More heat only causes burns.') },
            { t: 'key', title: tx('Contraindicaciones habituales de la aparatología', 'Common device contraindications'), items: [tx('Marcapasos o implantes electrónicos.', 'Pacemaker or electronic implants.'), tx('Embarazo.', 'Pregnancy.'), tx('Metales en la zona (placas, tornillos).', 'Metal in the area (plates, screws).'), tx('Cáncer activo o en tratamiento.', 'Active cancer or under treatment.'), tx('Piel con heridas o infección.', 'Broken or infected skin.')] },
            { t: 'fact', text: tx('Los resultados de la radiofrecuencia se ven a las 4–6 semanas, cuando el colágeno nuevo se ha formado. Plantea un bono de 6–8 sesiones.', 'Radiofrequency results show after 4–6 weeks, once new collagen has formed. Offer a course of 6–8 sessions.') },
          ],
        },
        A[1],
        A[5],
      ],
    },
    {
      emoji: '📅',
      title: tx('Planificar tratamientos', 'Planning treatments'),
      steps: [
        {
          kind: 'theory',
          emoji: '📅',
          title: tx('De un servicio suelto a un plan', 'From a one-off to a plan'),
          blocks: [
            { t: 'p', text: tx('Los resultados de verdad llegan con un plan: varias sesiones, combinadas con sentido y con cuidados en casa. Además, el plan fideliza a la clienta.', 'Real results come from a plan: several sessions, combined sensibly, with home care. A plan also builds client loyalty.') },
            { t: 'steps', title: tx('Cómo montar un plan', 'How to build a plan'), items: [tx('Diagnóstico y fotos de inicio.', 'Analysis and starting photos.'), tx('Un objetivo principal (no diez).', 'One main goal (not ten).'), tx('Tratamientos y número de sesiones.', 'Treatments and number of sessions.'), tx('Rutina en casa que lo apoye.', 'A home routine that supports it.'), tx('Revisión con fotos a mitad y al final.', 'Review with photos midway and at the end.')] },
            { t: 'myth', claim: tx('Se puede hacer peeling y dermapen la misma semana para ir más rápido.', 'You can do a peel and microneedling in the same week to speed things up.'), myth: true, truth: tx('Dos tratamientos que agreden la barrera seguidos multiplican la irritación. Deja al menos 2–4 semanas entre ellos.', 'Two barrier-disrupting treatments back to back multiply irritation. Leave at least 2–4 weeks between them.') },
            { t: 'fact', text: tx('Las fotos de antes y después son tu mejor argumento de venta, y también te protegen si la clienta duda del resultado.', 'Before-and-after photos are your best sales argument, and they protect you if the client doubts the result.') },
          ],
        },
        A[2],
        {
          kind: 'quiz',
          question: tx('Clienta con flacidez y manchas en junio. ¿Qué plan propones?', 'Client with sagging and marks in June. What plan do you suggest?'),
          options: [tx('Peeling fuerte ya mismo', 'A strong peel right away'), tx('Radiofrecuencia ahora y peelings para las manchas en otoño', 'Radiofrequency now and peels for the marks in autumn'), tx('Nada hasta el año que viene', 'Nothing until next year')],
          answer: 1,
          explain: tx('La radiofrecuencia no fotosensibiliza; los peelings mejor con menos sol.', 'Radiofrequency is not photosensitising; peels are better with less sun.'),
        },
      ],
    },
  ],
  [
    { question: tx('¿Qué diferencia hay entre piel seca y deshidratada?', 'What is the difference between dry and dehydrated skin?'), options: [tx('Ninguna', 'None'), tx('La seca carece de grasa; la deshidratada, de agua', 'Dry lacks oil; dehydrated lacks water'), tx('La deshidratada es siempre más mayor', 'Dehydrated is always older')], answer: 1, explain: tx('Una es un tipo; la otra, un estado.', 'One is a type; the other a condition.') },
    { question: tx('¿Por qué hay que ser prudente con fototipos altos?', 'Why be careful with darker phototypes?'), options: [tx('Se queman antes', 'They burn sooner'), tx('Hacen manchas tras la inflamación', 'They get marks after inflammation'), tx('No tienen poros', 'They have no pores')], answer: 1, explain: tx('Hiperpigmentación postinflamatoria.', 'Post-inflammatory hyperpigmentation.') },
    { question: tx('¿Qué medicación cambia por completo lo que puedes hacer?', 'Which medication completely changes what you can do?'), options: [tx('Isotretinoína', 'Isotretinoin'), tx('Vitamina C oral', 'Oral vitamin C'), tx('Antihistamínicos', 'Antihistamines')], answer: 0, explain: tx('Adelgaza la piel y altera la cicatrización.', 'It thins the skin and alters healing.') },
    { question: tx('¿Qué hace realmente el vapor?', 'What does steam really do?'), options: [tx('Abre los poros', 'Opens pores'), tx('Ablanda el sebo y la capa córnea', 'Softens sebum and the outer layer'), tx('Mata bacterias', 'Kills bacteria')], answer: 1, explain: tx('Los poros no se abren ni se cierran.', 'Pores don’t open or close.') },
    { question: tx('¿Cuánto tiempo máximo de extracción?', 'Maximum extraction time?'), options: [tx('5 minutos', '5 minutes'), tx('10–15 minutos', '10–15 minutes'), tx('45 minutos', '45 minutes')], answer: 1, explain: tx('Más tiempo irrita y rompe capilares.', 'Longer irritates and breaks capillaries.') },
    { question: tx('¿Qué ácido entra en el poro porque es soluble en grasa?', 'Which acid gets into the pore because it is oil-soluble?'), options: [tx('Glicólico', 'Glycolic'), tx('Salicílico', 'Salicylic'), tx('Láctico', 'Lactic')], answer: 1, explain: tx('Ideal para acné y piel grasa.', 'Ideal for acne and oily skin.') },
    { question: tx('¿Qué ácido es más seguro en fototipos altos?', 'Which acid is safest on darker phototypes?'), options: [tx('Mandélico', 'Mandelic'), tx('TCA alto', 'High TCA'), tx('Glicólico al 70 %', '70% glycolic')], answer: 0, explain: tx('Molécula grande, penetra despacio.', 'Large molecule, penetrates slowly.') },
    { question: tx('¿Cuál es la mejor época para peelings?', 'What is the best season for peels?'), options: [tx('Verano', 'Summer'), tx('Otoño e invierno', 'Autumn and winter'), tx('Da igual', 'It doesn’t matter')], answer: 1, explain: tx('Menos sol, menos riesgo de manchas.', 'Less sun, less risk of marks.') },
    { question: tx('Si un peeling superficial no pela, ¿qué significa?', 'If a superficial peel doesn’t flake, what does it mean?'), options: [tx('Que no ha funcionado', 'It didn’t work'), tx('Nada: renueva sin descamación visible', 'Nothing: it renews without visible flaking'), tx('Que hay que repetirlo enseguida', 'It must be repeated right away')], answer: 1, explain: tx('Pelar más no es mejor.', 'More peeling isn’t better.') },
    { question: tx('¿Qué profundidad de dermapen es estética?', 'Which microneedling depth is cosmetic?'), options: [tx('0,25–0,5 mm', '0.25–0.5 mm'), tx('2 mm', '2 mm'), tx('3 mm', '3 mm')], answer: 0, explain: tx('Más de 1 mm suele ser de uso médico.', 'Over 1 mm is usually medical.') },
    { question: tx('¿Qué producto usas con el dermapen?', 'Which product do you use with microneedling?'), options: [tx('Cualquier sérum con perfume', 'Any fragranced serum'), tx('Producto estéril apto, como ácido hialurónico', 'A sterile, suitable product like hyaluronic acid'), tx('Retinol puro', 'Pure retinol')], answer: 1, explain: tx('Los canales abiertos dejan pasar irritantes.', 'Open channels let irritants in.') },
    { question: tx('¿Qué hace la luz LED azul?', 'What does blue LED light do?'), options: [tx('Combate la bacteria del acné', 'Fights acne bacteria'), tx('Broncea', 'Tans'), tx('Elimina vello', 'Removes hair')], answer: 0, explain: tx('El rojo, en cambio, regenera.', 'Red, on the other hand, regenerates.') },
    { question: tx('¿Cuál es una contraindicación de la radiofrecuencia?', 'Which is a contraindication for radiofrequency?'), options: [tx('Piel seca', 'Dry skin'), tx('Marcapasos', 'Pacemaker'), tx('Tener pecas', 'Freckles')], answer: 1, explain: tx('Interfiere con implantes electrónicos.', 'It interferes with electronic implants.') },
    { question: tx('¿Cuándo se ven los resultados de la radiofrecuencia?', 'When do radiofrequency results show?'), options: [tx('Al salir de la cabina', 'Walking out of the room'), tx('A las 4–6 semanas', 'After 4–6 weeks'), tx('Al año', 'After a year')], answer: 1, explain: tx('Cuando se forma el colágeno nuevo.', 'Once new collagen forms.') },
    { question: tx('¿Cuánto separar peeling y dermapen?', 'How far apart should a peel and microneedling be?'), options: [tx('Mismo día', 'Same day'), tx('2–4 semanas', '2–4 weeks'), tx('2 días', '2 days')], answer: 1, explain: tx('Así la barrera se recupera entre uno y otro.', 'So the barrier recovers between them.') },
  ],
)
