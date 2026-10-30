import type { Step } from '../courses'
import { tx } from '../i18n'
import { modular } from '../modules'

// Activities from the first version of the course, reused inside the modules.
const A: Step[] = [
  {
    kind: 'lab',
    lab: 'makeup',
    title: tx('Práctica guiada: contorno e iluminación', 'Guided practice: contour and highlight'),
  },
  {
    kind: 'hotspot',
    title: tx('Luces y sombras', 'Highlight and contour'),
    figure: 'face',
    spots: [
      { x: 24, y: 62, label: tx('Bajo el pómulo', 'Under the cheekbone') },
      { x: 70, y: 52, label: tx('Parte alta del pómulo', 'Top of the cheekbone') },
      { x: 50, y: 50, label: tx('Tabique nasal', 'Bridge of the nose') },
      { x: 50, y: 76, label: tx('Labios', 'Lips') },
    ],
    tasks: [
      {
        prompt: tx('¿Dónde aplicas el contorno para marcar el pómulo?', 'Where do you contour to define the cheekbone?'),
        spot: 0,
        explain: tx('La sombra bajo el pómulo crea profundidad.', 'Shadow under the cheekbone creates depth.'),
      },
      {
        prompt: tx('¿Dónde va el iluminador para dar luz?', 'Where does highlighter go to add glow?'),
        spot: 1,
        explain: tx('En la parte alta del pómulo, donde la luz incide de forma natural.', 'On top of the cheekbone, where light naturally hits.'),
      },
      {
        prompt: tx('Para que la nariz parezca más fina, ¿dónde pones un toque de luz?', 'To make the nose look slimmer, where do you add a touch of light?'),
        spot: 2,
        explain: tx('Una línea fina de luz en el tabique y sombra suave en los laterales.', 'A thin line of light on the bridge and soft shadow on the sides.'),
      },
    ],
  },
  {
    kind: 'match',
    title: tx('Une cada subtono con su base', 'Match each undertone with its foundation'),
    pairs: [
      { left: tx('Venas verdosas, el oro le favorece', 'Greenish veins, gold suits her'), right: tx('Subtono cálido: base amarillenta', 'Warm: yellow-based foundation') },
      { left: tx('Venas azuladas, la plata le favorece', 'Bluish veins, silver suits her'), right: tx('Subtono frío: base rosada', 'Cool: pink-based foundation') },
      { left: tx('Venas mixtas, le quedan ambos', 'Mixed veins, both suit her'), right: tx('Subtono neutro: base neutra', 'Neutral: neutral foundation') },
    ],
  },
  {
    kind: 'branch',
    title: tx('Simulación: prueba de novia', 'Simulation: bridal trial'),
    start: 'a',
    nodes: {
      a: {
        who: '👰',
        text: tx(
          '"Me caso en dos meses. Quiero ir natural, pero que aguante desde la iglesia hasta el baile."',
          '"I\'m getting married in two months. I want to look natural, but it has to last from the ceremony to the dancing."',
        ),
        choices: [
          {
            text: tx('"Lo hacemos el mismo día de la boda, ¡no hace falta prueba!"', '"We\'ll just do it on the day, no trial needed!"'),
            end: 'bad',
            feedback: tx('Sin prueba no sabes cómo reacciona su piel ni si le gusta el resultado. Siempre se hace prueba.', 'Without a trial you do not know how her skin reacts or if she likes it. Always do a trial.'),
          },
          {
            text: tx('"Hagamos una prueba. ¿Me enseñas fotos de maquillajes que te gusten y del vestido?"', '"Let\'s do a trial. Can you show me make-up photos you like and your dress?"'),
            next: 'b',
          },
        ],
      },
      b: {
        who: '👰',
        text: tx('"En la prueba me encanta, pero ¿y si lloro en la ceremonia?"', '"I love the trial look, but what if I cry during the ceremony?"'),
        choices: [
          {
            text: tx(
              '"Usaremos máscara waterproof y fijador, y te preparo un kit de retoque con polvos y labial."',
              '"We\'ll use waterproof mascara and setting spray, and I\'ll put together a touch-up kit with powder and lipstick."',
            ),
            end: 'good',
            feedback: tx('Así se trabaja una novia: prueba, productos de larga duración y kit de retoque.', 'That is how you work with a bride: trial, long-wear products and a touch-up kit.'),
          },
          {
            text: tx('"Mejor no te maquilles los ojos."', '"Better not to do your eyes at all."'),
            end: 'bad',
            feedback: tx('No hace falta renunciar: hay productos resistentes al agua para eso.', 'No need to give it up: waterproof products exist for exactly that.'),
          },
        ],
      },
    },
  },
  {
    kind: 'order',
    title: tx('Ordena un maquillaje completo', 'Put a full make-up in order'),
    items: [
      tx('Preparar e hidratar la piel', 'Prep and moisturise the skin', 'Preparar y humectar la piel'),
      tx('Prebase y corrección de color', 'Primer and colour correction'),
      tx('Base de maquillaje', 'Foundation'),
      tx('Corrector de ojeras y sellar con polvo', 'Under-eye concealer and set with powder'),
      tx('Cejas, ojos y pestañas', 'Brows, eyes and lashes'),
      tx('Contorno, colorete, labios y fijador', 'Contour, blush, lips and setting spray'),
    ],
  },
  {
    kind: 'quiz',
    question: tx('¿Cuánto antes de la boda se hace la prueba?', 'How long before the wedding is the trial?'),
    options: [tx('El día anterior', 'The day before'), tx('Entre 1 y 2 meses antes', '1 to 2 months before'), tx('Un año antes', 'A year before')],
    answer: 1,
    explain: tx('Da tiempo a ajustar y a hacer tratamientos de piel si hacen falta.', 'It leaves time to adjust and to do skin treatments if needed.'),
  },
]

export const makeup = modular(
  {
    id: 'maquillaje',
    emoji: '💄',
    color: '#b8475a',
    title: tx('Maquillaje profesional, novias y eventos', 'Professional, bridal and event make-up'),
    summary: tx(
      'Preparación de la piel, corrección de color, contouring y maquillaje de larga duración.',
      'Skin prep, colour correction, contouring and long-wear make-up.',
    ),
    premium: { eur: 49, usd: 55 },
    certificate: true,
    minutes: 120,
  },
  [
    {
      emoji: '🎨',
      title: tx('Color, subtono y corrección', 'Colour, undertone and correction'),
      steps: [
        {
          kind: 'theory',
          emoji: '🎨',
          title: tx('La rueda de color en tu cara', 'The colour wheel on your face'),
          blocks: [
            { t: 'p', text: tx('El maquillaje profesional empieza por entender el color. Una base del tono correcto pero del subtono equivocado se nota a metros: deja la cara gris, rosa o amarilla.', 'Professional make-up starts with understanding colour. A foundation in the right shade but wrong undertone shows a mile off: it makes the face look grey, pink or yellow.') },
            { t: 'pairs', title: tx('Cómo saber el subtono', 'How to read the undertone'), items: [{ a: tx('Frío', 'Cool'), b: tx('Venas azuladas, le favorece la plata, se quema fácil.', 'Bluish veins, silver suits her, burns easily.') }, { a: tx('Cálido', 'Warm'), b: tx('Venas verdosas, le favorece el oro, se broncea.', 'Greenish veins, gold suits her, tans.') }, { a: tx('Neutro', 'Neutral'), b: tx('Mezcla de las dos señales.', 'A mix of both signs.') }] },
            { t: 'pairs', title: tx('Correctores de color', 'Colour correctors'), items: [{ a: tx('Verde', 'Green'), b: tx('Neutraliza rojeces y granitos.', 'Neutralises redness and spots.') }, { a: tx('Melocotón o naranja', 'Peach or orange'), b: tx('Neutraliza ojeras azuladas o violáceas.', 'Neutralises bluish or purple dark circles.') }, { a: tx('Lila', 'Lilac'), b: tx('Ilumina tonos amarillentos o apagados.', 'Brightens sallow, dull tones.') }] },
            { t: 'myth', claim: tx('Para tapar una ojera oscura, cuanto más claro el corrector, mejor.', 'To cover a dark circle, the lighter the concealer the better.'), myth: true, truth: tx('Un corrector muy claro sobre algo oscuro lo vuelve gris. Primero se neutraliza con el color opuesto y luego se iguala con el tono de piel.', 'A very light concealer over something dark turns it grey. First neutralise with the opposite colour, then match to skin tone.') },
            { t: 'fact', text: tx('Los colores opuestos en la rueda cromática se anulan: verde contra rojo, naranja contra azul, lila contra amarillo.', 'Opposite colours on the wheel cancel each other: green vs red, orange vs blue, lilac vs yellow.') },
          ],
        },
        A[2],
        {
          kind: 'quiz',
          question: tx('¿Con qué color neutralizas una rojez alrededor de la nariz?', 'Which colour neutralises redness around the nose?'),
          options: [tx('Lila', 'Lilac'), tx('Verde', 'Green'), tx('Naranja', 'Orange')],
          answer: 1,
          explain: tx('El verde es el opuesto del rojo.', 'Green is red’s opposite.'),
        },
      ],
    },
    {
      emoji: '🧴',
      title: tx('Preparación y base perfecta', 'Prep and the perfect base'),
      steps: [
        {
          kind: 'theory',
          emoji: '🧴',
          title: tx('Un buen maquillaje empieza en la piel', 'Great make-up starts with the skin'),
          blocks: [
            { t: 'steps', title: tx('Preparación', 'Prep'), items: [tx('Limpiar y tonificar.', 'Cleanse and tone.'), tx('Hidratante según el tipo de piel y dejar absorber.', 'Moisturiser for the skin type, let it sink in.'), tx('Contorno de ojos y bálsamo de labios.', 'Eye cream and lip balm.'), tx('Prebase (primer): matificante, hidratante o alisadora según lo que necesite.', 'Primer: mattifying, hydrating or smoothing as needed.')] },
            { t: 'pairs', title: tx('Qué base elegir', 'Which foundation to choose'), items: [{ a: tx('Piel grasa', 'Oily skin'), b: tx('Fluida oil-free de acabado mate.', 'Oil-free fluid with a matte finish.') }, { a: tx('Piel seca', 'Dry skin'), b: tx('Hidratante, acabado satinado o luminoso.', 'Hydrating, satin or dewy finish.') }, { a: tx('Piel madura', 'Mature skin'), b: tx('Ligera y luminosa: las capas gruesas marcan arrugas.', 'Light and luminous: thick layers settle into lines.') }] },
            { t: 'myth', claim: tx('El tono de la base se prueba en la muñeca.', 'Foundation shade is tested on the wrist.'), myth: true, truth: tx('Se prueba en la mandíbula, con luz natural. La base correcta “desaparece” entre la cara y el cuello.', 'Test it on the jawline in daylight. The right shade “disappears” between face and neck.') },
            { t: 'key', title: tx('Aplicación', 'Application'), items: [tx('De dentro hacia fuera, difuminando hacia el cuello.', 'From the centre outwards, blending into the neck.'), tx('Capas finas: se añade cobertura solo donde hace falta.', 'Thin layers: add coverage only where needed.'), tx('Sellar con polvo solo en la zona T si la piel es seca.', 'Set with powder only on the T-zone if skin is dry.')] },
          ],
        },
        A[4],
        {
          kind: 'quiz',
          question: tx('¿Dónde compruebas el tono de la base?', 'Where do you check the foundation shade?'),
          options: [tx('En la muñeca', 'On the wrist'), tx('En la mandíbula, con luz natural', 'On the jaw, in daylight'), tx('En el dorso de la mano', 'On the back of the hand')],
          answer: 1,
          explain: tx('Tiene que unir cara y cuello sin cortes.', 'It must blend face and neck seamlessly.'),
        },
      ],
    },
    {
      emoji: '✨',
      title: tx('Visagismo: luces y sombras', 'Face sculpting: light and shadow'),
      steps: [
        {
          kind: 'theory',
          emoji: '✨',
          title: tx('Esculpir sin bisturí', 'Sculpting without a scalpel'),
          blocks: [
            { t: 'p', text: tx('Con luz y sombra cambiamos cómo se ven las formas: lo claro adelanta y agranda, lo oscuro hunde y afina. El objetivo es acercar el rostro a un óvalo equilibrado.', 'Light and shadow change how shapes look: light brings forward and enlarges, dark recedes and slims. The goal is to bring the face towards a balanced oval.') },
            { t: 'pairs', title: tx('Según la forma del rostro', 'By face shape'), items: [{ a: tx('Redondo', 'Round'), b: tx('Contorno diagonal en mejillas y sienes para alargar.', 'Diagonal contour on cheeks and temples to lengthen.') }, { a: tx('Cuadrado', 'Square'), b: tx('Sombra en los ángulos de la mandíbula para suavizar.', 'Shadow on the jaw angles to soften.') }, { a: tx('Alargado', 'Long'), b: tx('Sombra en frente alta y mentón para acortar.', 'Shadow on the top of the forehead and chin to shorten.') }, { a: tx('Corazón', 'Heart'), b: tx('Sombra en las sienes, luz en la mandíbula.', 'Shadow at the temples, light on the jaw.') }] },
            { t: 'myth', claim: tx('El bronceador y el contorno son el mismo producto.', 'Bronzer and contour are the same product.'), myth: true, truth: tx('El contorno es frío y mate (imita una sombra). El bronceador es cálido y da efecto sol: va donde el sol daría de forma natural.', 'Contour is cool and matte (it mimics a shadow). Bronzer is warm and gives a sun-kissed look: it goes where the sun would naturally hit.') },
            { t: 'fact', text: tx('Para foto y vídeo el contorno se marca un poco más: la cámara aplana los volúmenes.', 'For photo and video, contour is a bit stronger: the camera flattens volume.') },
          ],
        },
        A[1],
        A[0],
      ],
    },
    {
      emoji: '👁️',
      title: tx('Ojos y cejas', 'Eyes and brows'),
      steps: [
        {
          kind: 'theory',
          emoji: '👁️',
          title: tx('Una mirada para cada ojo', 'A look for every eye'),
          blocks: [
            { t: 'pairs', title: tx('Formas de ojo y qué hacer', 'Eye shapes and what to do'), items: [{ a: tx('Párpado caído (encapotado)', 'Hooded'), b: tx('Marca la cuenca un poco por encima de la natural, con los ojos abiertos.', 'Define the crease slightly above the natural one, with eyes open.') }, { a: tx('Ojos juntos', 'Close-set'), b: tx('Luz en el lagrimal y color oscuro hacia fuera.', 'Light at the inner corner, dark colour towards the outside.') }, { a: tx('Ojos separados', 'Wide-set'), b: tx('Más intensidad hacia el lagrimal.', 'More intensity towards the inner corner.') }, { a: tx('Ojos caídos', 'Down-turned'), b: tx('Eleva el ahumado y el delineado hacia la sien.', 'Lift the smoke and liner towards the temple.') }] },
            { t: 'steps', title: tx('Un ahumado que no falla', 'A smoky eye that never fails'), items: [tx('Prebase de párpado.', 'Eyelid primer.'), tx('Tono de transición en la cuenca.', 'Transition shade in the crease.'), tx('Tono medio en el párpado móvil.', 'Medium shade on the lid.'), tx('Oscuro en la esquina externa en forma de V.', 'Dark in the outer corner in a V.'), tx('Difuminar hasta que no haya cortes.', 'Blend until there are no harsh edges.'), tx('Delineado y máscara.', 'Liner and mascara.')] },
            { t: 'myth', claim: tx('Primero se hace la base y luego los ojos.', 'Always do the base first, then the eyes.'), myth: true, truth: tx('En ojos con mucho pigmento oscuro conviene hacer los ojos primero: si cae sombra, limpias sin estropear la base.', 'With dark, pigmented eyes it’s better to do eyes first: if shadow falls, you clean up without ruining the base.') },
            { t: 'fact', text: tx('Las cejas enmarcan todo el maquillaje. Rellena los huecos con trazos finos en la dirección del pelo y fija con gel: transforman la cara en un minuto.', 'Brows frame the whole look. Fill gaps with fine strokes in the hair direction and set with gel: they transform the face in a minute.') },
          ],
        },
        {
          kind: 'match',
          title: tx('Une cada ojo con su truco', 'Match each eye with its trick'),
          pairs: [
            { left: tx('Encapotado', 'Hooded'), right: tx('Cuenca por encima de la natural', 'Crease above the natural one') },
            { left: tx('Juntos', 'Close-set'), right: tx('Luz en el lagrimal', 'Light at the inner corner') },
            { left: tx('Separados', 'Wide-set'), right: tx('Intensidad hacia el lagrimal', 'Intensity towards the inner corner') },
            { left: tx('Caídos', 'Down-turned'), right: tx('Elevar hacia la sien', 'Lift towards the temple') },
          ],
        },
        {
          kind: 'quiz',
          question: tx('¿Cómo se marca la cuenca en un párpado encapotado?', 'How do you define the crease on a hooded eye?'),
          options: [tx('Justo en el pliegue, con el ojo cerrado', 'Right in the fold, eye closed'), tx('Un poco por encima, con el ojo abierto', 'Slightly above, eye open'), tx('No se marca', 'You don’t')],
          answer: 1,
          explain: tx('Con el ojo abierto ves dónde se esconde el párpado.', 'With the eye open you see where the lid hides.'),
        },
      ],
    },
    {
      emoji: '💄',
      title: tx('Labios, fijación y fotografía', 'Lips, setting and photography'),
      steps: [
        {
          kind: 'theory',
          emoji: '💄',
          title: tx('Que dure y que salga bien en las fotos', 'Make it last and look good on camera'),
          blocks: [
            { t: 'steps', title: tx('Labios de larga duración', 'Long-lasting lips'), items: [tx('Exfoliar suave e hidratar.', 'Gently exfoliate and moisturise.'), tx('Perfilar con lápiz del tono del labio o del labial.', 'Line with a pencil matching the lip or lipstick.'), tx('Rellenar todo el labio con el lápiz.', 'Fill the whole lip with the pencil.'), tx('Labial con pincel, secar con pañuelo y segunda capa.', 'Lipstick with a brush, blot, second coat.')] },
            { t: 'myth', claim: tx('Cualquier polvo suelto sirve para fotos con flash.', 'Any loose powder is fine for flash photos.'), myth: true, truth: tx('Algunos polvos con sílice o mucho blanco, y protectores con filtros físicos, dejan la cara blanca con flash (flashback). Pruébalo con una foto antes.', 'Some silica or very white powders, and mineral sunscreens, make the face look white with flash (flashback). Test with a photo first.') },
            { t: 'key', title: tx('Fijación', 'Setting'), items: [tx('Polvo traslúcido solo donde brilla.', 'Translucent powder only where it shines.'), tx('Bruma fijadora al terminar.', 'Setting spray at the end.'), tx('En calor o lágrimas, máscara y delineado resistentes al agua.', 'For heat or tears, waterproof mascara and liner.')] },
            { t: 'fact', text: tx('Haz siempre una foto con el móvil y flash antes de dar por terminado un maquillaje de evento: verás lo que verá el fotógrafo.', 'Always take a phone photo with flash before finishing event make-up: you’ll see what the photographer will see.', 'Haz siempre una foto con el celular y flash antes de dar por terminado un maquillaje de evento: verás lo que verá el fotógrafo.') },
          ],
        },
        {
          kind: 'quiz',
          question: tx('En las fotos con flash la cara de la novia sale blanca. ¿Causa probable?', 'In flash photos the bride’s face looks white. Likely cause?'),
          options: [tx('Demasiado colorete', 'Too much blush'), tx('Polvo o protector con efecto flashback', 'Powder or sunscreen causing flashback'), tx('Labial claro', 'Pale lipstick')],
          answer: 1,
          explain: tx('Algunos polvos y filtros físicos reflejan el flash.', 'Some powders and mineral filters reflect the flash.'),
        },
        {
          kind: 'order',
          title: tx('Ordena unos labios que duren', 'Order for long-lasting lips'),
          items: [tx('Exfoliar e hidratar', 'Exfoliate and moisturise'), tx('Perfilar', 'Line'), tx('Rellenar con lápiz', 'Fill with pencil'), tx('Primera capa de labial', 'First lipstick coat'), tx('Secar con pañuelo y segunda capa', 'Blot and second coat')],
        },
      ],
    },
    {
      emoji: '👰',
      title: tx('Novias y eventos', 'Brides and events'),
      steps: [
        {
          kind: 'theory',
          emoji: '👰',
          title: tx('El día más fotografiado de su vida', 'The most photographed day of her life'),
          blocks: [
            { t: 'p', text: tx('Una novia no compra solo un maquillaje: compra tranquilidad. La organización vale tanto como la técnica.', 'A bride isn’t just buying make-up: she’s buying peace of mind. Organisation matters as much as technique.') },
            { t: 'steps', title: tx('El servicio de novia', 'The bridal service'), items: [tx('Entrevista: vestido, peinado, estilo, fotos de referencia.', 'Consultation: dress, hair, style, reference photos.'), tx('Prueba 1–2 meses antes, con fotos.', 'Trial 1–2 months before, with photos.'), tx('Presupuesto y condiciones por escrito (señal, horarios, desplazamiento).', 'Quote and terms in writing (deposit, times, travel).'), tx('Plan de horarios del día con margen.', 'A timed plan for the day with buffer.'), tx('Kit de retoque para ella: labial, polvo y papel matificante.', 'Touch-up kit for her: lipstick, powder and blotting papers.')] },
            { t: 'myth', claim: tx('En la prueba hay que hacer exactamente lo que pide la novia.', 'At the trial you must do exactly what the bride asks.'), myth: false, truth: tx('Es su día: se respeta su estilo. Tu trabajo es asesorar con argumentos (luz, fotos, duración) y llegar juntas a una versión que la haga sentirse ella misma.', 'It’s her day: her style is respected. Your job is to advise with reasons (light, photos, longevity) and reach together a version that feels like her.') },
            { t: 'warn', text: tx('Nada de tratamientos nuevos en la piel (peelings, productos que no haya usado) en las 2 semanas antes de la boda.', 'No new skin treatments (peels, untried products) in the 2 weeks before the wedding.') },
          ],
        },
        A[3],
        A[5],
      ],
    },
  ],
  [
    { question: tx('Venas azuladas y la plata le favorece. ¿Subtono?', 'Bluish veins and silver suits her. Undertone?'), options: [tx('Cálido', 'Warm'), tx('Frío', 'Cool'), tx('Neutro', 'Neutral')], answer: 1, explain: tx('Base de matiz rosado.', 'Pink-based foundation.') },
    { question: tx('¿Qué corrector neutraliza una ojera azulada?', 'Which corrector neutralises a bluish dark circle?'), options: [tx('Verde', 'Green'), tx('Melocotón o naranja', 'Peach or orange'), tx('Blanco', 'White')], answer: 1, explain: tx('El naranja es opuesto al azul.', 'Orange is opposite blue.') },
    { question: tx('¿Por qué un corrector muy claro sobre una ojera la vuelve gris?', 'Why does a very light concealer turn a dark circle grey?'), options: [tx('Porque no se neutraliza el color de fondo', 'The underlying colour isn’t neutralised'), tx('Porque es de mala calidad', 'It’s poor quality'), tx('Porque se seca', 'It dries out')], answer: 0, explain: tx('Primero se neutraliza, luego se iguala.', 'Neutralise first, then match.') },
    { question: tx('¿Qué base para piel grasa?', 'Which foundation for oily skin?'), options: [tx('Oil-free mate', 'Oil-free matte'), tx('Luminosa con aceites', 'Dewy with oils'), tx('Ninguna', 'None')], answer: 0, explain: tx('Controla brillos y dura más.', 'It controls shine and lasts longer.') },
    { question: tx('En piel madura, la base debe ser…', 'On mature skin, foundation should be…'), options: [tx('Gruesa y mate', 'Thick and matte'), tx('Ligera y luminosa', 'Light and luminous'), tx('Del tono más claro', 'The lightest shade')], answer: 1, explain: tx('Las capas gruesas marcan arrugas.', 'Thick layers settle into lines.') },
    { question: tx('¿Qué hace el contorno?', 'What does contour do?'), options: [tx('Adelanta y agranda', 'Brings forward and enlarges'), tx('Hunde y afina', 'Recedes and slims'), tx('Da brillo', 'Adds shine')], answer: 1, explain: tx('Imita una sombra.', 'It mimics a shadow.') },
    { question: tx('¿Diferencia entre contorno y bronceador?', 'Difference between contour and bronzer?'), options: [tx('Ninguna', 'None'), tx('Contorno frío y mate; bronceador cálido', 'Contour cool and matte; bronzer warm'), tx('El bronceador es más claro', 'Bronzer is lighter')], answer: 1, explain: tx('Uno esculpe; el otro da efecto sol.', 'One sculpts; the other adds a sun-kissed look.') },
    { question: tx('Rostro cuadrado: ¿dónde va la sombra?', 'Square face: where does the shadow go?'), options: [tx('En los ángulos de la mandíbula', 'On the jaw angles'), tx('En el centro de la frente', 'Centre of the forehead'), tx('En la nariz', 'On the nose')], answer: 0, explain: tx('Suaviza la mandíbula.', 'It softens the jaw.') },
    { question: tx('Ojos juntos: ¿dónde va la luz?', 'Close-set eyes: where does the light go?'), options: [tx('En el lagrimal', 'At the inner corner'), tx('En la esquina externa', 'At the outer corner'), tx('En ningún sitio', 'Nowhere')], answer: 0, explain: tx('Separa visualmente los ojos.', 'It visually widens the gap.') },
    { question: tx('¿Por qué a veces se hacen los ojos antes que la base?', 'Why sometimes do eyes before base?'), options: [tx('Para que caiga sombra sin estropear la base', 'So fallen shadow doesn’t ruin the base'), tx('Por costumbre', 'Habit'), tx('Para ahorrar producto', 'To save product')], answer: 0, explain: tx('Útil con ahumados muy pigmentados.', 'Useful with heavily pigmented smoky eyes.') },
    { question: tx('¿Cómo se consigue un labial de larga duración?', 'How do you make lipstick last?'), options: [tx('Una capa gruesa', 'One thick coat'), tx('Perfilar, rellenar con lápiz y dos capas secando entre ellas', 'Line, fill with pencil and two coats with blotting'), tx('Brillo encima', 'Gloss on top')], answer: 1, explain: tx('El lápiz hace de base.', 'The pencil acts as a base.') },
    { question: tx('¿Qué es el flashback?', 'What is flashback?'), options: [tx('Cara blanca en fotos con flash', 'A white face in flash photos'), tx('Un tipo de ahumado', 'A kind of smoky eye'), tx('Una técnica de cejas', 'A brow technique')], answer: 0, explain: tx('Por polvos o filtros que reflejan la luz.', 'Caused by powders or filters that reflect light.') },
    { question: tx('¿Cuándo se hace la prueba de novia?', 'When is the bridal trial?'), options: [tx('El día antes', 'The day before'), tx('1–2 meses antes', '1–2 months before'), tx('Un año antes', 'A year before')], answer: 1, explain: tx('Hay tiempo para ajustar sin que cambie su piel.', 'Time to adjust without her skin changing.') },
    { question: tx('¿Qué no debe hacer la novia las 2 semanas previas?', 'What should the bride avoid in the 2 weeks before?'), options: [tx('Hidratarse', 'Moisturise'), tx('Tratamientos nuevos o peelings', 'New treatments or peels'), tx('Dormir', 'Sleep')], answer: 1, explain: tx('Riesgo de reacciones justo antes del día.', 'Risk of reactions right before the day.') },
    { question: tx('¿Qué incluyes en su kit de retoque?', 'What goes in her touch-up kit?'), options: [tx('Labial, polvo y papel matificante', 'Lipstick, powder and blotting papers'), tx('Base nueva', 'A new foundation'), tx('Desmaquillante', 'Make-up remover')], answer: 0, explain: tx('Lo justo para retocar sin rehacer.', 'Just enough to touch up without redoing.') },
  ],
)
