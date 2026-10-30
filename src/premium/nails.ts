import type { Step } from '../courses'
import { tx } from '../i18n'
import { modular } from '../modules'

// Activities from the first version of the course, reused inside the modules.
const A: Step[] = [
  {
    kind: 'lab',
    lab: 'nails',
    title: tx('Práctica guiada: lima y esmalta una uña', 'Guided practice: file and polish a nail'),
  },
  {
    kind: 'hotspot',
    title: tx('Anatomía de la uña', 'Nail anatomy'),
    figure: 'nail',
    spots: [
      { x: 50, y: 22, label: tx('Borde libre', 'Free edge') },
      { x: 50, y: 44, label: tx('Lámina', 'Nail plate') },
      { x: 50, y: 63, label: tx('Lúnula', 'Lunula') },
      { x: 50, y: 74, label: tx('Cutícula', 'Cuticle') },
      { x: 30, y: 48, label: tx('Pliegue lateral', 'Side wall') },
    ],
    tasks: [
      {
        prompt: tx('Toca la lúnula, la media luna blanca.', 'Tap the lunula, the white half-moon.'),
        spot: 2,
        explain: tx('La lúnula es la parte visible de la matriz: nunca se lima ni se presiona.', 'The lunula is the visible part of the matrix: never file or press it.'),
      },
      {
        prompt: tx('Toca la zona donde se da forma con la lima.', 'Tap where you shape with the file.'),
        spot: 0,
        explain: tx('El borde libre es la parte que sobresale del dedo.', 'The free edge is the part that extends past the finger.'),
      },
      {
        prompt: tx('Toca la piel que protege la matriz de infecciones.', 'Tap the skin that protects the matrix from infection.'),
        spot: 3,
        explain: tx('La cutícula sella la uña: trátala con cuidado.', 'The cuticle seals the nail: treat it gently.'),
      },
    ],
  },
  {
    kind: 'match',
    title: tx('Une cada sistema con su característica', 'Match each system with its feature'),
    pairs: [
      { left: tx('Acrílico', 'Acrylic'), right: tx('Polvo + monómero líquido, seca al aire', 'Powder + liquid monomer, air-dries') },
      { left: tx('Gel', 'Gel'), right: tx('Cura con lámpara UV/LED, muy brillante', 'Cures under a UV/LED lamp, very glossy') },
      { left: tx('Semipermanente', 'Gel polish'), right: tx('Esmalte de gel, dura 2-3 semanas', 'Gel lacquer, lasts 2–3 weeks') },
      { left: tx('Polygel', 'Polygel'), right: tx('Pasta moldeable que cura en lámpara', 'Mouldable paste cured in a lamp') },
    ],
  },
  {
    kind: 'order',
    title: tx('Ordena una manicura semipermanente', 'Put a gel-polish manicure in order'),
    items: [
      tx('Preparar cutícula y matificar', 'Prep cuticle and buff'),
      tx('Deshidratador y primer', 'Dehydrator and primer'),
      tx('Base y curar en lámpara', 'Base coat and cure'),
      tx('Dos capas finas de color, curando cada una', 'Two thin colour coats, curing each'),
      tx('Top coat y curar', 'Top coat and cure'),
      tx('Retirar capa de dispersión y aceite de cutícula', 'Wipe the sticky layer and apply cuticle oil'),
    ],
  },
  {
    kind: 'case',
    title: tx('Caso: mancha verdosa', 'Case: greenish stain'),
    story: tx(
      'Al quitarle el gel a Nuria ves una mancha verdosa bajo la uña. Te pide que le pongas uñas nuevas encima.',
      "Removing Nora's gel, you see a greenish stain under the nail. She asks you to put new nails on top.",
      'Al retirarle el gel a Daniela ves una mancha verdosa bajo la uña. Te pide que le pongas uñas nuevas encima.',
    ),
    options: [
      {
        text: tx('Cubrirla con un color oscuro', 'Cover it with a dark colour'),
        good: false,
        feedback: tx('Taparla agrava la infección y puede contagiar tus herramientas.', 'Covering it makes the infection worse and can contaminate your tools.'),
      },
      {
        text: tx('No aplicar producto, desinfectar todo y recomendar ir al médico o podólogo', 'Apply nothing, disinfect everything and recommend a doctor or podiatrist'),
        good: true,
        feedback: tx(
          'Bien hecho. Suele ser una infección bacteriana (pseudomonas). Se trata primero y se vuelve a citar después.',
          'Well done. It is usually a bacterial infection (pseudomonas). Treat it first, then rebook.',
        ),
      },
      {
        text: tx('Limarla hasta que desaparezca', 'File it until it disappears'),
        good: false,
        feedback: tx('Limar adelgaza la uña y extiende la infección.', 'Filing thins the nail and spreads the infection.'),
      },
    ],
  },
  {
    kind: 'quiz',
    question: tx('¿Cada cuánto se rellenan las uñas esculpidas?', 'How often are sculpted nails refilled?'),
    options: [tx('Cada semana', 'Every week'), tx('Cada 2-3 semanas', 'Every 2–3 weeks'), tx('Cada 2 meses', 'Every 2 months')],
    answer: 1,
    explain: tx(
      'A las 2-3 semanas la uña ha crecido y el punto de tensión se desplaza: si se espera más, se rompe.',
      'After 2–3 weeks the nail has grown and the stress point moves: wait longer and it breaks.',
    ),
  },
]

export const nails = modular(
  {
    id: 'unas',
    emoji: '💅',
    color: '#c2457a',
    title: tx('Diseño de uñas: acrílico, gel y nail art', 'Nail design: acrylic, gel and nail art'),
    summary: tx(
      'Preparación de la uña, esculpidas, semipermanente, decoración y seguridad.',
      'Nail prep, sculpted nails, gel polish, decoration and safety.',
    ),
    premium: { eur: 49, usd: 55 },
    certificate: true,
    minutes: 120,
  },
  [
    {
      emoji: '💅',
      title: tx('Anatomía y salud de la uña', 'Nail anatomy and health'),
      steps: [
        {
          kind: 'theory',
          emoji: '💅',
          title: tx('Lo que hay debajo del esmalte', 'What lies under the polish'),
          blocks: [
            { t: 'p', text: tx('La uña es queratina, la misma proteína que el pelo. Crece desde la matriz, escondida bajo la piel, a unos 3 mm al mes: una uña completa tarda unos 6 meses en renovarse.', 'The nail is keratin, the same protein as hair. It grows from the matrix, hidden under the skin, about 3 mm a month: a whole nail takes around 6 months to renew.') },
            { t: 'pairs', title: tx('Las partes que debes conocer', 'The parts you need to know'), items: [{ a: tx('Matriz', 'Matrix'), b: tx('Fábrica de la uña. Si se daña, la uña crece deformada.', 'The nail factory. If damaged, the nail grows deformed.') }, { a: tx('Lúnula', 'Lunula'), b: tx('La media luna blanca: la parte visible de la matriz.', 'The white half-moon: the visible part of the matrix.') }, { a: tx('Cutícula', 'Cuticle'), b: tx('Piel que sella y protege la matriz de infecciones.', 'Skin that seals and protects the matrix from infection.') }, { a: tx('Lámina', 'Nail plate'), b: tx('La parte dura donde trabajamos.', 'The hard part we work on.') }, { a: tx('Borde libre', 'Free edge'), b: tx('Lo que sobresale del dedo. Aquí se da la forma.', 'What extends past the finger. This is where you shape.') }] },
            { t: 'myth', claim: tx('Las manchas blancas en las uñas son falta de calcio.', 'White spots on nails mean calcium deficiency.'), myth: true, truth: tx('Casi siempre son pequeños golpes en la matriz (leuconiquia). Desaparecen al crecer la uña.', 'They are almost always small knocks to the matrix (leukonychia). They grow out with the nail.') },
            { t: 'key', title: tx('Una uña sana', 'A healthy nail'), items: [tx('Lámina rosada, lisa y sin manchas.', 'Pink, smooth plate with no stains.'), tx('Bien pegada al lecho, sin despegarse.', 'Firmly attached to the bed, not lifting.'), tx('Cutícula intacta, sin rojez ni dolor.', 'Intact cuticle, no redness or pain.')] },
            { t: 'warn', text: tx('Nunca cortes la cutícula viva: solo se retira la piel muerta adherida a la lámina. Cortarla abre la puerta a infecciones.', 'Never cut the living cuticle: only remove dead skin stuck to the plate. Cutting it opens the door to infection.') },
          ],
        },
        A[1],
        {
          kind: 'quiz',
          question: tx('¿Cuánto tarda en renovarse por completo una uña de la mano?', 'How long does a fingernail take to fully renew?'),
          options: [tx('Unas 2 semanas', 'About 2 weeks'), tx('Unos 6 meses', 'About 6 months'), tx('Dos años', 'Two years')],
          answer: 1,
          explain: tx('Crece unos 3 mm al mes. Los pies tardan aún más, hasta un año.', 'It grows about 3 mm a month. Toenails take even longer, up to a year.'),
        },
      ],
    },
    {
      emoji: '🦠',
      title: tx('Higiene y alteraciones de la uña', 'Hygiene and nail conditions'),
      steps: [
        {
          kind: 'theory',
          emoji: '🦠',
          title: tx('Cuándo trabajar y cuándo no', 'When to work and when not to'),
          blocks: [
            { t: 'p', text: tx('Antes de tocar una uña, mírala bien. Hay alteraciones que puedes tratar y otras que necesitan médico: confundirlas puede contagiar a otras clientas.', 'Before touching a nail, take a good look. Some conditions you can work around and others need a doctor: mixing them up can infect other clients.') },
            { t: 'pairs', title: tx('Lo que te puedes encontrar', 'What you may find'), items: [{ a: tx('Mancha verdosa', 'Greenish stain'), b: tx('Bacteria (pseudomona) bajo un producto despegado. No se trabaja hasta que se trate.', 'Bacteria (pseudomonas) under lifted product. Do not work until treated.') }, { a: tx('Uña amarilla, gruesa y quebradiza', 'Yellow, thick, crumbly nail'), b: tx('Posible hongo (onicomicosis). Derivar al médico o podólogo.', 'Possible fungus (onychomycosis). Refer to a doctor or podiatrist.') }, { a: tx('Uña despegada del lecho', 'Nail lifting from the bed'), b: tx('Onicólisis. No se pone producto encima hasta que crezca sana.', 'Onycholysis. No product over it until it grows out healthy.') }, { a: tx('Estrías verticales', 'Vertical ridges'), b: tx('Normales con la edad. Se pueden pulir suavemente.', 'Normal with age. Can be gently buffed.') }] },
            { t: 'key', title: tx('Higiene en cada servicio', 'Hygiene every service'), items: [tx('Lavado de manos de la clienta y la tuya.', 'Hand washing for the client and you.'), tx('Instrumental metálico limpio y esterilizado.', 'Metal tools cleaned and sterilised.'), tx('Limas y pulidores de un solo uso o personales.', 'Files and buffers single-use or personal.'), tx('Superficie de trabajo desinfectada entre clientas.', 'Work surface disinfected between clients.')] },
            { t: 'myth', claim: tx('Si la uña tiene hongos, el esmalte los tapa y no pasa nada.', 'If the nail has fungus, polish covers it and it’s fine.'), myth: true, truth: tx('El esmalte crea un ambiente cerrado y húmedo que los empeora, y tus herramientas pueden contagiar a otras clientas.', 'Polish creates a closed, damp environment that makes it worse, and your tools can spread it to other clients.') },
            { t: 'fact', text: tx('Las alergias a los acrilatos de geles y semipermanentes casi siempre vienen de que el producto toque la piel repetidamente. Trabajar limpio, sin tocar cutícula, previene la mayoría.', 'Allergies to acrylates in gels and gel polish almost always come from product repeatedly touching the skin. Working cleanly, away from the cuticle, prevents most of them.') },
          ],
        },
        A[4],
        {
          kind: 'quiz',
          question: tx('Una uña está despegada del lecho. ¿Qué haces?', 'A nail is lifting from the bed. What do you do?'),
          options: [tx('Ponerle gel para que se sujete', 'Apply gel to hold it down'), tx('No poner producto y esperar a que crezca sana', 'Apply no product and wait for healthy regrowth'), tx('Cortarla al ras', 'Cut it right down')],
          answer: 1,
          explain: tx('Sellarla con producto atrapa humedad y bacterias debajo.', 'Sealing it with product traps moisture and bacteria underneath.'),
        },
      ],
    },
    {
      emoji: '📏',
      title: tx('Manicura: forma, cutículas y esmaltado', 'Manicure: shape, cuticles and polish'),
      steps: [
        {
          kind: 'theory',
          emoji: '📏',
          title: tx('La base de todo', 'The foundation of everything'),
          blocks: [
            { t: 'p', text: tx('Una buena manicura es la base de cualquier servicio de uñas. Si la forma o la cutícula están mal, ni el mejor diseño lo salva.', 'A good manicure is the base of every nail service. If the shape or cuticle is off, even the best design won’t save it.') },
            { t: 'pairs', title: tx('Formas de uña', 'Nail shapes'), items: [{ a: tx('Cuadrada', 'Square'), b: tx('Borde recto. Moderna y resistente, alarga poco.', 'Straight edge. Modern and strong, lengthens little.') }, { a: tx('Redonda', 'Round'), b: tx('Sigue la yema. Práctica y natural para uñas cortas.', 'Follows the fingertip. Practical and natural for short nails.') }, { a: tx('Almendra', 'Almond'), b: tx('Laterales que se estrechan a una punta redondeada. Estiliza.', 'Sides taper to a rounded tip. Slimming.') }, { a: tx('Squoval', 'Squoval'), b: tx('Cuadrada con esquinas suaves. La más pedida.', 'Square with soft corners. The most requested.') }] },
            { t: 'key', title: tx('Limado sin dañar', 'Filing without damage'), items: [tx('Lima de grano fino (180/240) en uña natural.', 'Fine grit (180/240) on natural nails.'), tx('Siempre del lateral al centro, en una dirección.', 'Always from the side to the centre, one direction.'), tx('Nunca limes los laterales hacia dentro: debilitan la uña.', 'Never file deep into the sidewalls: it weakens the nail.')] },
            { t: 'myth', claim: tx('Agitar el esmalte con fuerza lo mezcla mejor.', 'Shaking polish hard mixes it better.'), myth: true, truth: tx('Agitar mete burbujas que luego salen en la uña. Hazlo rodar entre las manos.', 'Shaking adds bubbles that show up on the nail. Roll it between your palms.') },
            { t: 'steps', title: tx('Esmaltado tradicional', 'Classic polish'), items: [tx('Uña limpia y sin grasa.', 'Clean, oil-free nail.'), tx('Base protectora.', 'Protective base coat.'), tx('Dos capas finas de color, con secado entre ellas.', 'Two thin colour coats, drying between them.'), tx('Top coat para brillo y duración.', 'Top coat for shine and wear.'), tx('Sellar el borde libre con cada capa.', 'Cap the free edge with each coat.')] },
          ],
        },
        A[0],
        {
          kind: 'quiz',
          question: tx('¿Qué forma de uña es la más resistente y fácil de mantener en uñas cortas?', 'Which nail shape is the strongest and easiest to keep on short nails?'),
          options: [tx('Stiletto', 'Stiletto'), tx('Redonda', 'Round'), tx('Almendra muy fina', 'Very thin almond')],
          answer: 1,
          explain: tx('La redonda reparte bien la presión y apenas se engancha.', 'Round spreads pressure well and barely snags.'),
        },
      ],
    },
    {
      emoji: '✨',
      title: tx('Esmaltado semipermanente', 'Gel polish'),
      steps: [
        {
          kind: 'theory',
          emoji: '✨',
          title: tx('Brillo de tres semanas', 'Three weeks of shine'),
          blocks: [
            { t: 'p', text: tx('El semipermanente es un esmalte de gel que no seca al aire: se cura bajo una lámpara LED o UV. Dura 2–3 semanas sin perder brillo.', 'Gel polish is a gel lacquer that doesn’t air-dry: it cures under an LED or UV lamp. It lasts 2–3 weeks without losing shine.') },
            { t: 'steps', title: tx('El proceso', 'The process'), items: [tx('Retirar el brillo de la lámina con un buffer suave.', 'Remove the shine from the plate with a soft buffer.'), tx('Limpiar el polvo y deshidratar.', 'Clean off dust and dehydrate.'), tx('Base de gel y curar.', 'Gel base, cure.'), tx('Dos capas finas de color, curando cada una.', 'Two thin colour coats, curing each.'), tx('Top coat y curar.', 'Top coat, cure.'), tx('Retirar la capa pegajosa si el top la deja.', 'Wipe off the sticky layer if the top leaves one.')] },
            { t: 'pairs', title: tx('Tiempos de curado orientativos', 'Typical curing times'), items: [{ a: tx('Lámpara LED', 'LED lamp'), b: tx('30–60 segundos por capa.', '30–60 seconds per coat.') }, { a: tx('Lámpara UV', 'UV lamp'), b: tx('Unos 2 minutos por capa.', 'About 2 minutes per coat.') }] },
            { t: 'myth', claim: tx('Capas gruesas de color cubren mejor y duran más.', 'Thick colour coats cover better and last longer.'), myth: true, truth: tx('La capa gruesa no cura bien por dentro, se arruga y se levanta. Siempre capas finas.', 'Thick coats don’t cure all the way through, wrinkle and lift. Always thin coats.') },
            { t: 'warn', text: tx('Si el producto toca la cutícula o la piel, retíralo antes de curar. Curado sobre piel es la causa principal de alergias.', 'If product touches the cuticle or skin, remove it before curing. Cured on skin is the main cause of allergies.') },
            { t: 'fact', text: tx('Para retirar: lima el top, envuelve con algodón y acetona 10–15 minutos y empuja suave. Arrancarlo se lleva capas de uña.', 'To remove: file off the top, wrap with acetone-soaked cotton for 10–15 minutes and push gently. Peeling it off strips nail layers.') },
          ],
        },
        A[3],
        {
          kind: 'quiz',
          question: tx('El semipermanente se levanta a los 3 días por los bordes. ¿Causa más probable?', 'Gel polish lifts at the edges after 3 days. Most likely cause?'),
          options: [tx('Lámina con grasa o sin preparar', 'Oily or unprepped plate'), tx('Demasiado tiempo en la lámpara', 'Too long under the lamp'), tx('Uñas demasiado cortas', 'Nails too short')],
          answer: 0,
          explain: tx('Sin retirar brillo ni deshidratar, el producto no se adhiere.', 'Without buffing and dehydrating, product won’t adhere.'),
        },
      ],
    },
    {
      emoji: '💎',
      title: tx('Uñas esculpidas: gel y acrílico', 'Sculpted nails: gel and acrylic'),
      steps: [
        {
          kind: 'theory',
          emoji: '💎',
          title: tx('Construir una uña que aguante', 'Building a nail that lasts'),
          blocks: [
            { t: 'p', text: tx('Las uñas esculpidas alargan con tips (puntas de plástico) o con moldes de papel bajo la uña. Después se construye la estructura con gel o con acrílico.', 'Sculpted nails extend with tips or with paper forms under the nail. Then the structure is built with gel or acrylic.') },
            { t: 'key', title: tx('Una estructura correcta', 'Correct structure'), items: [tx('Ápex: el punto más alto, en la zona de estrés, donde la uña se une al dedo.', 'Apex: the highest point, in the stress zone where the nail meets the finger.'), tx('Fina en cutícula y borde libre.', 'Thin at the cuticle and free edge.'), tx('Curva en C uniforme vista de frente.', 'Even C-curve seen from the front.'), tx('Laterales rectos y paralelos.', 'Straight, parallel sidewalls.')] },
            { t: 'pairs', title: tx('Gel o acrílico', 'Gel or acrylic'), items: [{ a: tx('Gel', 'Gel'), b: tx('Sin olor, autonivela, cura con lámpara. Más flexible.', 'No odour, self-levels, lamp-cured. More flexible.') }, { a: tx('Acrílico', 'Acrylic'), b: tx('Polvo y líquido, seca al aire, muy resistente. Tiene olor.', 'Powder and liquid, air-dries, very strong. Has an odour.') }] },
            { t: 'myth', claim: tx('Las uñas esculpidas estropean siempre la uña natural.', 'Sculpted nails always ruin the natural nail.'), myth: true, truth: tx('Lo que daña es limar en exceso la uña natural o arrancar el producto. Bien hechas y retiradas, la uña se mantiene sana.', 'The damage comes from over-filing the natural nail or ripping off product. Done and removed properly, the nail stays healthy.') },
            { t: 'warn', text: tx('Usa solo monómero EMA. El MMA está prohibido en cosmética en la UE y en muchos países: daña la uña y provoca alergias.', 'Use only EMA monomer. MMA is banned in cosmetics in the EU and many countries: it damages the nail and causes allergies.') },
            { t: 'fact', text: tx('El relleno se hace cada 2–3 semanas: se rebaja el producto, se rellena el hueco de crecimiento y se reequilibra el ápex.', 'Refills are every 2–3 weeks: thin the product, fill the regrowth gap and rebalance the apex.') },
          ],
        },
        A[2],
        A[5],
      ],
    },
    {
      emoji: '🎨',
      title: tx('Nail art y servicio profesional', 'Nail art and professional service'),
      steps: [
        {
          kind: 'theory',
          emoji: '🎨',
          title: tx('Diseños que se venden', 'Designs that sell'),
          blocks: [
            { t: 'pairs', title: tx('Técnicas básicas', 'Core techniques'), items: [{ a: tx('Francesa', 'French'), b: tx('Borde libre blanco con línea limpia.', 'White free edge with a clean smile line.') }, { a: tx('Baby boomer', 'Baby boomer'), b: tx('Degradado de rosa a blanco con esponja o pincel.', 'Pink-to-white ombré with sponge or brush.') }, { a: tx('Stamping', 'Stamping'), b: tx('Diseño transferido desde una placa grabada.', 'Design transferred from an engraved plate.') }, { a: tx('Efecto espejo', 'Chrome'), b: tx('Polvo metálico frotado sobre top sin capa pegajosa.', 'Metallic powder rubbed over a no-wipe top.') }] },
            { t: 'p', text: tx('El nail art más rentable es el que se repite: ten un muestrario de 15–20 diseños con precio y tiempo fijos. La clienta elige rápido y tú no improvisas.', 'The most profitable nail art is repeatable: keep a sample board of 15–20 designs with fixed prices and times. The client chooses fast and you don’t improvise.') },
            { t: 'myth', claim: tx('Cobrar el nail art aparte espanta a las clientas.', 'Charging extra for nail art scares clients away.'), myth: true, truth: tx('Si el precio está claro en el muestrario, lo aceptan. Lo que molesta son las sorpresas al pagar.', 'If the price is clear on the sample board, they accept it. What annoys them is surprises at the till.') },
            { t: 'key', title: tx('Fotos que atraen clientas', 'Photos that attract clients'), items: [tx('Luz natural o aro de luz, sin sombras.', 'Natural light or a ring light, no shadows.'), tx('Cutícula limpia y piel hidratada.', 'Clean cuticles and moisturised skin.'), tx('Fondo neutro y la mano en una pose natural.', 'Neutral background and a natural hand pose.')] },
            { t: 'fact', text: tx('Muchas clientas eligen centro por Instagram o TikTok. Una foto cuidada de cada trabajo es tu mejor publicidad gratuita.', 'Many clients choose a salon on Instagram or TikTok. A careful photo of every job is your best free advertising.') },
          ],
        },
        {
          kind: 'match',
          title: tx('Une cada técnica con lo que necesita', 'Match each technique with what it needs'),
          pairs: [
            { left: tx('Francesa', 'French'), right: tx('Pincel fino y pulso', 'Fine brush and a steady hand') },
            { left: tx('Baby boomer', 'Baby boomer'), right: tx('Esponja o pincel de degradado', 'Sponge or ombré brush') },
            { left: tx('Stamping', 'Stamping'), right: tx('Placa y tampón', 'Plate and stamper') },
            { left: tx('Efecto espejo', 'Chrome'), right: tx('Top sin capa pegajosa', 'No-wipe top coat') },
          ],
        },
        {
          kind: 'quiz',
          question: tx('¿Cuál es la mejor forma de vender nail art sin perder tiempo?', 'What is the best way to sell nail art without wasting time?'),
          options: [tx('Improvisar cada diseño', 'Improvise every design'), tx('Un muestrario con precios y tiempos fijos', 'A sample board with fixed prices and times'), tx('Regalarlo siempre', 'Always give it free')],
          answer: 1,
          explain: tx('Precio claro, servicio rápido y sin sorpresas.', 'Clear price, quick service and no surprises.'),
        },
      ],
    },
  ],
  [
    { question: tx('¿Qué parte de la uña es la “fábrica” donde se forma?', 'Which part of the nail is the “factory” where it forms?'), options: [tx('El borde libre', 'The free edge'), tx('La matriz', 'The matrix'), tx('La lámina', 'The plate')], answer: 1, explain: tx('Si la matriz se daña, la uña crece deformada.', 'If the matrix is damaged, the nail grows deformed.') },
    { question: tx('¿Qué función tiene la cutícula?', 'What does the cuticle do?'), options: [tx('Dar color', 'Give colour'), tx('Sellar y proteger la matriz', 'Seal and protect the matrix'), tx('Ninguna, se corta siempre', 'Nothing, always cut it')], answer: 1, explain: tx('Por eso no se corta la cutícula viva.', 'That is why you never cut the living cuticle.') },
    { question: tx('Las manchas blancas en la uña suelen ser…', 'White spots on the nail are usually…'), options: [tx('Falta de calcio', 'Calcium deficiency'), tx('Pequeños golpes en la matriz', 'Small knocks to the matrix'), tx('Hongos', 'Fungus')], answer: 1, explain: tx('Leuconiquia: desaparece al crecer.', 'Leukonychia: it grows out.') },
    { question: tx('Ves una mancha verdosa bajo un gel despegado. ¿Qué es?', 'You see a greenish stain under lifted gel. What is it?'), options: [tx('Restos de esmalte', 'Polish residue'), tx('Una infección bacteriana', 'A bacterial infection'), tx('Un moratón', 'A bruise')], answer: 1, explain: tx('Pseudomona: no se trabaja hasta que se trate.', 'Pseudomonas: don’t work on it until treated.') },
    { question: tx('Uña amarilla, gruesa y que se desmenuza. ¿Qué haces?', 'Yellow, thick, crumbly nail. What do you do?'), options: [tx('Esmaltarla para disimular', 'Polish it to hide it'), tx('Derivar al médico o podólogo', 'Refer to a doctor or podiatrist'), tx('Limarla a fondo', 'File it down hard')], answer: 1, explain: tx('Posible onicomicosis: necesita diagnóstico.', 'Possible onychomycosis: it needs a diagnosis.') },
    { question: tx('¿En qué dirección se lima la uña natural?', 'Which direction do you file the natural nail?'), options: [tx('Vaivén rápido', 'Fast back and forth'), tx('Del lateral al centro, en una dirección', 'From the side to the centre, one direction'), tx('Del centro hacia los lados con fuerza', 'Hard from the centre outwards')], answer: 1, explain: tx('El vaivén abre las capas.', 'Sawing splits the layers.') },
    { question: tx('¿Qué grano de lima se usa en uña natural?', 'Which file grit is used on natural nails?'), options: [tx('80', '80'), tx('100', '100'), tx('180/240', '180/240')], answer: 2, explain: tx('Los granos bajos son para producto artificial.', 'Low grits are for artificial product.') },
    { question: tx('¿Por qué no se agita el esmalte?', 'Why not shake nail polish?'), options: [tx('Se seca', 'It dries'), tx('Le entran burbujas', 'It gets bubbles'), tx('Cambia de color', 'It changes colour')], answer: 1, explain: tx('Se hace rodar entre las manos.', 'Roll it between your palms.') },
    { question: tx('¿Cuánto cura una capa de semipermanente en lámpara LED?', 'How long does a gel polish coat cure under an LED lamp?'), options: [tx('5 segundos', '5 seconds'), tx('30–60 segundos', '30–60 seconds'), tx('10 minutos', '10 minutes')], answer: 1, explain: tx('En UV, unos 2 minutos.', 'Under UV, about 2 minutes.') },
    { question: tx('¿Cuál es la causa principal de alergia a los geles?', 'What is the main cause of gel allergies?'), options: [tx('El color del gel', 'Gel colour'), tx('Que el producto toque la piel y se cure sobre ella', 'Product touching and curing on the skin'), tx('Lavar las manos', 'Hand washing')], answer: 1, explain: tx('Trabajar limpio, sin tocar cutícula.', 'Work cleanly, away from the cuticle.') },
    { question: tx('¿Cómo se retira el semipermanente?', 'How is gel polish removed?'), options: [tx('Arrancándolo', 'Peeling it off'), tx('Limando el top y con acetona 10–15 min', 'Filing the top and acetone for 10–15 min'), tx('Con agua caliente', 'With hot water')], answer: 1, explain: tx('Arrancarlo se lleva capas de uña.', 'Peeling strips nail layers.') },
    { question: tx('¿Dónde va el ápex en una uña esculpida?', 'Where does the apex go on a sculpted nail?'), options: [tx('En el borde libre', 'At the free edge'), tx('En la zona de estrés', 'In the stress zone'), tx('Pegado a la cutícula', 'Right at the cuticle')], answer: 1, explain: tx('Donde la uña se une al dedo y más se dobla.', 'Where the nail meets the finger and bends most.') },
    { question: tx('¿Qué monómero está prohibido en cosmética en la UE?', 'Which monomer is banned in cosmetics in the EU?'), options: [tx('EMA', 'EMA'), tx('MMA', 'MMA'), tx('Ninguno', 'Neither')], answer: 1, explain: tx('El MMA daña la uña y provoca alergias.', 'MMA damages the nail and causes allergies.') },
    { question: tx('¿Cada cuánto se rellenan las uñas esculpidas?', 'How often are sculpted nails refilled?'), options: [tx('Cada 2–3 semanas', 'Every 2–3 weeks'), tx('Cada 2 meses', 'Every 2 months'), tx('Nunca', 'Never')], answer: 0, explain: tx('Así se mantiene el equilibrio del ápex.', 'That keeps the apex balanced.') },
    { question: tx('¿Qué necesita el efecto espejo?', 'What does chrome need?'), options: [tx('Top sin capa pegajosa', 'A no-wipe top coat'), tx('Esmalte normal húmedo', 'Wet regular polish'), tx('Acetona', 'Acetone')], answer: 0, explain: tx('El polvo se frota sobre top sin capa pegajosa.', 'The powder is rubbed over a no-wipe top.') },
  ],
)
