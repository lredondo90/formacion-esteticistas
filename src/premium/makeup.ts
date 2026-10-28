import type { Course } from '../courses'
import { tx } from '../i18n'

export const makeup: Course = {
  id: 'maquillaje',
  emoji: '💄',
  color: '#b8475a',
  title: tx('Maquillaje profesional, novias y eventos', 'Professional, bridal and event make-up'),
  summary: tx(
    'Preparación de la piel, corrección de color, contouring y maquillaje de larga duración.',
    'Skin prep, colour correction, contouring and long-wear make-up.',
  ),
  minutes: 40,
  premium: { eur: 49, usd: 55 },
  freeSteps: 2,
  certificate: true,
  steps: [
    {
      kind: 'video',
      title: tx('Una base que dura todo el día', 'A base that lasts all day'),
      scenes: [
        {
          emoji: '🧴',
          props: ['💧'],
          anim: 'zoom',
          title: tx('Empieza por la piel', 'Start with the skin'),
          caption: tx(
            'Limpia, hidrata y deja que el producto se absorba unos minutos. Una piel bien preparada es la mitad del maquillaje.',
            'Cleanse, moisturise and let it absorb for a few minutes. Well-prepped skin is half the make-up.',
            'Limpia, humecta y deja que el producto se absorba unos minutos. Una piel bien preparada es la mitad del maquillaje.',
          ),
        },
        {
          emoji: '🎨',
          props: ['🟢', '🍑'],
          anim: 'pulse',
          title: tx('Corrige con color', 'Correct with colour'),
          caption: tx(
            'El color opuesto neutraliza: verde para rojeces, melocotón o salmón para ojeras azuladas.',
            'Opposite colours cancel out: green for redness, peach or salmon for bluish dark circles.',
          ),
          question: {
            question: tx('¿Qué corrector usas para una rojez?', 'Which corrector for redness?'),
            options: [tx('Verde', 'Green'), tx('Lila', 'Lilac'), tx('Amarillo', 'Yellow')],
            answer: 0,
            explain: tx('El verde es el complementario del rojo y lo neutraliza.', 'Green is the complementary colour of red and cancels it out.'),
          },
        },
        {
          emoji: '🧽',
          props: ['✨'],
          anim: 'float',
          title: tx('Base en capas finas', 'Base in thin layers'),
          caption: tx(
            'Aplica la base del centro hacia fuera con esponja húmeda. Mejor dos capas finas que una gruesa.',
            'Apply foundation from the centre outwards with a damp sponge. Two thin layers beat one thick one.',
          ),
        },
        {
          emoji: '🌫️',
          props: ['📸'],
          anim: 'slide',
          title: tx('Sella para las fotos', 'Set it for photos'),
          caption: tx(
            'Polvos solo donde brilla y spray fijador al final. Evita polvos con mucho SPF o sílice: pueden salir blancos con flash.',
            'Powder only where it shines, then setting spray. Avoid powders with high SPF or lots of silica: they can flash white.',
          ),
          question: {
            question: tx('¿Por qué la cara sale blanca en las fotos con flash?', 'Why does the face look white in flash photos?'),
            options: [
              tx('Por usar poca base', 'Too little foundation'),
              tx('Por productos con SPF alto o sílice', 'Products with high SPF or silica'),
              tx('Por el colorete', 'The blush'),
            ],
            answer: 1,
            explain: tx('Esos ingredientes reflejan la luz del flash ("flashback").', 'Those ingredients bounce back the flash ("flashback").'),
          },
        },
      ],
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
  ],
}
