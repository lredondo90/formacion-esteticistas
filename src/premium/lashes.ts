import type { Step } from '../courses'
import { tx } from '../i18n'
import { modular } from '../modules'

// Activities from the first version of the course, reused inside the modules.
const A: Step[] = [
  {
    kind: 'lab',
    lab: 'lashes',
    title: tx('Práctica guiada: aplica extensiones de pestañas', 'Guided practice: apply lash extensions'),
  },
  {
    kind: 'hotspot',
    title: tx('Zonas del ojo para el mapeo', 'Eye zones for lash mapping'),
    figure: 'eye',
    spots: [
      { x: 18, y: 50, label: tx('Lagrimal (zona interna)', 'Inner corner') },
      { x: 50, y: 30, label: tx('Centro', 'Centre') },
      { x: 82, y: 48, label: tx('Rabillo (zona externa)', 'Outer corner') },
      { x: 50, y: 18, label: tx('Párpado', 'Eyelid') },
    ],
    tasks: [
      {
        prompt: tx('Para un efecto "ojo de gato", ¿dónde van las extensiones más largas?', 'For a "cat eye" effect, where do the longest extensions go?'),
        spot: 2,
        explain: tx('Las más largas hacia el rabillo alargan y elevan la mirada.', 'Longest towards the outer corner to lengthen and lift the eye.'),
      },
      {
        prompt: tx('¿Y para un efecto "muñeca" (ojo redondo)?', 'And for a "doll eye" (rounder) effect?'),
        spot: 1,
        explain: tx('Las más largas en el centro abren y redondean el ojo.', 'Longest in the centre to open and round the eye.'),
      },
      {
        prompt: tx('¿Dónde usas siempre las más cortas?', 'Where do you always use the shortest ones?'),
        spot: 0,
        explain: tx('En el lagrimal las pestañas son más finas y cortas.', 'Natural lashes are finer and shorter at the inner corner.'),
      },
    ],
  },
  {
    kind: 'match',
    title: tx('Une cada curvatura con su efecto', 'Match each curl with its effect'),
    pairs: [
      { left: tx('J', 'J'), right: tx('Muy natural, casi recta', 'Very natural, almost straight') },
      { left: tx('B', 'B'), right: tx('Natural con un poco de curva', 'Natural with a little curl') },
      { left: tx('C', 'C'), right: tx('La más usada, mirada abierta', 'Most popular, open look') },
      { left: tx('D', 'D'), right: tx('Muy curvada, efecto dramático', 'Very curled, dramatic effect') },
    ],
  },
  {
    kind: 'order',
    title: tx('Ordena el lifting de pestañas', 'Put the lash lift in order'),
    items: [
      tx('Limpiar y desengrasar las pestañas', 'Cleanse and degrease the lashes'),
      tx('Pegar el molde de silicona en el párpado', 'Stick the silicone shield on the eyelid'),
      tx('Peinar y fijar las pestañas sobre el molde', 'Comb and set the lashes onto the shield'),
      tx('Loción 1: permanente (ablanda)', 'Lotion 1: perming (softens)'),
      tx('Loción 2: fijadora (neutraliza)', 'Lotion 2: setting (neutralises)'),
      tx('Tinte opcional y nutrición', 'Optional tint and nourishing serum'),
    ],
  },
  {
    kind: 'case',
    title: tx('Caso: ojos rojos', 'Case: red eyes'),
    story: tx(
      'A las 24 horas de ponerle extensiones, Sara te escribe: tiene el párpado hinchado, le pica y está rojo.',
      '24 hours after her extensions, Sarah messages you: her eyelid is swollen, itchy and red.',
    ),
    options: [
      {
        text: tx('Decirle que es normal y que espere una semana', 'Tell her it is normal and to wait a week'),
        good: false,
        feedback: tx('Puede ser una reacción alérgica al cianoacrilato: no hay que esperar.', 'It may be an allergic reaction to cyanoacrylate: do not wait.'),
      },
      {
        text: tx(
          'Retirarlas con removedor cuanto antes y recomendarle que vaya al médico',
          'Remove them with remover as soon as possible and advise her to see a doctor',
        ),
        good: true,
        feedback: tx(
          'Correcto. Retirar, derivar al médico y anotarlo en su ficha. En el futuro, prueba de alergia 48 h antes.',
          'Correct. Remove, refer to a doctor and note it in her record. In future, patch test 48 h before.',
        ),
      },
      {
        text: tx('Ponerle colirio y unas pestañas nuevas', 'Give her eye drops and a new set'),
        good: false,
        feedback: tx('Nunca vuelvas a aplicar adhesivo sobre una reacción.', 'Never reapply adhesive over a reaction.'),
      },
    ],
  },
  {
    kind: 'quiz',
    question: tx('Técnica de volumen 3D: ¿cuántas extensiones van sobre cada pestaña natural?', '3D volume technique: how many extensions go on each natural lash?'),
    options: [tx('1', '1'), tx('3, en abanico', '3, as a fan'), tx('3, pegadas a 3 pestañas', '3, on 3 different lashes')],
    answer: 1,
    explain: tx(
      'El volumen 2D-6D crea un abanico muy fino sobre una sola pestaña natural.',
      'Volume (2D–6D) makes a very fine fan placed on one single natural lash.',
    ),
  },
]

export const lashes = modular(
  {
    id: 'pestanas',
    emoji: '👁️',
    color: '#5b4a8a',
    title: tx('Extensiones y lifting de pestañas', 'Lash extensions and lash lift'),
    summary: tx(
      'Nivel básico y avanzado: pelo a pelo, volumen, curvaturas y lifting paso a paso.',
      'Basic and advanced level: classic, volume, curls and lash lift step by step.',
    ),
    premium: { eur: 59, usd: 65 },
    certificate: true,
    minutes: 120,
  },
  [
    {
      emoji: '👁️',
      title: tx('La pestaña natural', 'The natural lash'),
      steps: [
        {
          kind: 'theory',
          emoji: '👁️',
          title: tx('Conoce lo que vas a extender', 'Know what you are extending'),
          blocks: [
            { t: 'p', text: tx('Cada ojo tiene entre 90 y 150 pestañas superiores. Cada una vive unos 3 meses: crece, descansa y se cae. Por eso las extensiones se van cayendo poco a poco y hacen falta retoques.', 'Each eye has 90 to 150 upper lashes. Each lives about 3 months: it grows, rests and falls out. That is why extensions shed gradually and need refills.') },
            { t: 'pairs', title: tx('El ciclo de la pestaña', 'The lash cycle'), items: [{ a: tx('Anágena', 'Anagen'), b: tx('Crece. Pestaña fina y corta: no se le pone extensión pesada.', 'Growing. Fine, short lash: no heavy extension on it.') }, { a: tx('Catágena', 'Catagen'), b: tx('Deja de crecer. Es la ideal para trabajar.', 'Stops growing. The ideal lash to work on.') }, { a: tx('Telógena', 'Telogen'), b: tx('Descansa y se caerá pronto, con extensión incluida.', 'Resting and will fall soon, extension and all.') }] },
            { t: 'myth', claim: tx('Las extensiones hacen que se caigan las pestañas naturales.', 'Extensions make natural lashes fall out.'), myth: true, truth: tx('Bien puestas, no. Lo que daña es pegar varias pestañas juntas, usar extensiones demasiado pesadas o arrancarlas en casa.', 'Applied properly, no. Damage comes from gluing lashes together, using extensions that are too heavy or pulling them off at home.') },
            { t: 'key', title: tx('Qué observar antes de empezar', 'What to check before starting'), items: [tx('Grosor y fuerza de la pestaña natural.', 'Thickness and strength of the natural lash.'), tx('Densidad: cuántas pestañas hay y si hay huecos.', 'Density: how many lashes and any gaps.'), tx('Dirección: si crecen rectas, hacia abajo o cruzadas.', 'Direction: straight, downward or criss-crossed.'), tx('Forma del ojo y del párpado.', 'Eye and eyelid shape.')] },
            { t: 'fact', text: tx('Es normal perder de 1 a 5 pestañas naturales al día. Muchas clientas se asustan al ver caer extensiones: explícaselo desde la primera cita.', 'Losing 1 to 5 natural lashes a day is normal. Many clients panic when extensions fall: explain it from the first appointment.') },
          ],
        },
        {
          kind: 'quiz',
          question: tx('¿Cuánto vive aproximadamente una pestaña natural?', 'Roughly how long does a natural lash live?'),
          options: [tx('Una semana', 'One week'), tx('Unos 3 meses', 'About 3 months'), tx('Dos años', 'Two years')],
          answer: 1,
          explain: tx('Por eso las extensiones necesitan retoques cada 2–3 semanas.', 'That is why extensions need refills every 2–3 weeks.'),
        },
        {
          kind: 'quiz',
          question: tx('¿Por qué no se pone una extensión pesada sobre una pestaña recién nacida?', 'Why not put a heavy extension on a brand-new lash?'),
          options: [tx('Porque es fina y débil y se doblaría', 'It is fine and weak and would bend'), tx('Porque no agarra el pegamento', 'Glue won’t stick to it'), tx('Porque es muy larga', 'It is too long')],
          answer: 0,
          explain: tx('En fase de crecimiento la pestaña aún no soporta peso.', 'In its growth phase the lash cannot carry weight yet.'),
        },
      ],
    },
    {
      emoji: '🧰',
      title: tx('Materiales: extensiones y adhesivo', 'Materials: extensions and adhesive'),
      steps: [
        {
          kind: 'theory',
          emoji: '🧰',
          title: tx('Grosor, curva, largo y pegamento', 'Thickness, curl, length and glue'),
          blocks: [
            { t: 'p', text: tx('Cada extensión se elige por tres medidas: grosor (en milímetros), curvatura (una letra) y longitud. Combinarlas bien es lo que diferencia un resultado natural de uno pesado.', 'Each extension is chosen by three measures: thickness (in millimetres), curl (a letter) and length. Combining them well is what separates a natural result from a heavy one.') },
            { t: 'pairs', title: tx('Grosores habituales', 'Common thicknesses'), items: [{ a: tx('0,03–0,07 mm', '0.03–0.07 mm'), b: tx('Volumen: se hacen abanicos de varias extensiones finas.', 'Volume: fans made of several fine extensions.') }, { a: tx('0,10–0,12 mm', '0.10–0.12 mm'), b: tx('Clásica en pestañas finas o débiles.', 'Classic on fine or weak lashes.') }, { a: tx('0,15 mm', '0.15 mm'), b: tx('Clásica estándar en pestañas sanas.', 'Standard classic on healthy lashes.') }] },
            { t: 'key', title: tx('El adhesivo', 'The adhesive'), items: [tx('Es cianoacrilato: seca con la humedad del aire.', 'It is cyanoacrylate: it cures with air humidity.'), tx('Funciona mejor con 40–60 % de humedad y 20–24 °C en la cabina.', 'Works best at 40–60% humidity and 20–24 °C in the room.', 'Funciona mejor con 40–60 % de humedad y 20–24 °C en el gabinete.'), tx('Una gota nueva cada 15–20 minutos: la gota vieja ya no pega igual.', 'A fresh drop every 15–20 minutes: an old drop no longer bonds the same.'), tx('Bote abierto: úsalo en 4–6 semanas.', 'Opened bottle: use within 4–6 weeks.')] },
            { t: 'myth', claim: tx('Las extensiones de “visón” son de pelo de visón.', '“Mink” extensions are made of mink fur.'), myth: true, truth: tx('Casi todas son de fibra sintética (PBT) con acabado mate; el nombre solo describe el aspecto. Así se evitan alergias y se respeta a los animales.', 'Almost all are synthetic PBT fibre with a matte finish; the name just describes the look. That avoids allergies and spares animals.') },
            { t: 'warn', text: tx('Si hace mucho calor o humedad, el adhesivo seca demasiado rápido y se cristaliza; si hace frío y seco, tarda y suelta vapores más tiempo. Ten un higrómetro en la cabina.', 'Too hot or humid and the adhesive cures too fast and turns brittle; cold and dry and it cures slowly, giving off fumes for longer. Keep a hygrometer in the room.', 'Si hace mucho calor o humedad, el adhesivo seca demasiado rápido y se cristaliza; si hace frío y seco, tarda y suelta vapores más tiempo. Ten un higrómetro en el gabinete.') },
          ],
        },
        A[2],
        {
          kind: 'quiz',
          question: tx('El adhesivo de pestañas seca con…', 'Lash adhesive cures with…'),
          options: [tx('El calor de la lámpara', 'Heat from the lamp'), tx('La humedad del aire', 'Air humidity'), tx('La luz ultravioleta siempre', 'UV light, always')],
          answer: 1,
          explain: tx('El cianoacrilato polimeriza con la humedad. Por eso se controla la humedad de la sala.', 'Cyanoacrylate polymerises with humidity. That is why room humidity is controlled.'),
        },
      ],
    },
    {
      emoji: '✨',
      title: tx('Aplicación clásica pelo a pelo', 'Classic one-to-one application'),
      steps: [
        {
          kind: 'theory',
          emoji: '✨',
          title: tx('Una extensión, una pestaña', 'One extension, one lash'),
          blocks: [
            { t: 'steps', title: tx('El protocolo', 'The protocol'), items: [tx('Ficha, alergias y consentimiento.', 'Record card, allergies and consent.'), tx('Limpieza de pestañas y primer para quitar grasa.', 'Cleanse lashes and apply primer to remove oils.'), tx('Parches de gel bajo el ojo, sin tocar la mucosa.', 'Gel pads under the eye, not touching the waterline.'), tx('Aislar una pestaña con la pinza de la mano izquierda.', 'Isolate one lash with the tweezers in your non-dominant hand.'), tx('Mojar la base de la extensión en el adhesivo y colocarla.', 'Dip the extension base in adhesive and place it.'), tx('Repetir por todo el ojo siguiendo el mapping.', 'Repeat across the eye following the map.')] },
            { t: 'key', title: tx('La colocación correcta', 'Correct placement'), items: [tx('A 0,5–1 mm del párpado: nunca tocando la piel.', '0.5–1 mm from the lid: never touching the skin.'), tx('Bien apoyada sobre la pestaña natural, al menos la mitad inferior.', 'Well attached along the natural lash, at least the lower half.'), tx('Siguiendo la dirección natural de la pestaña.', 'Following the natural direction of the lash.'), tx('Con la cantidad justa de adhesivo: una perla pequeña, no una gota que chorree.', 'With just enough adhesive: a small bead, not a dripping drop.')] },
            { t: 'myth', claim: tx('Cuanto más adhesivo, más duran.', 'More adhesive means they last longer.'), myth: true, truth: tx('El exceso forma bolas que pesan, pegan pestañas entre sí y dan más vapores. La retención depende de la técnica y la preparación, no de la cantidad.', 'Excess forms heavy beads, glues lashes together and gives off more fumes. Retention depends on technique and prep, not quantity.') },
            { t: 'fact', text: tx('Una puesta completa clásica lleva entre 80 y 120 extensiones por ojo y unas 2 horas. Con práctica, bajarás a una hora y media.', 'A full classic set uses 80 to 120 extensions per eye and takes about 2 hours. With practice you will get down to an hour and a half.') },
            { t: 'warn', text: tx('Si al peinar ves dos pestañas pegadas, sepáralas antes de que seque. Una pestaña pegada a otra tira de ella al crecer y la arranca.', 'If you see two lashes stuck together when brushing, separate them before it cures. A lash stuck to another pulls it out as it grows.') },
          ],
        },
        A[0],
        {
          kind: 'order',
          title: tx('Ordena la preparación', 'Put the prep in order'),
          items: [tx('Ficha y consentimiento', 'Record card and consent'), tx('Limpiar las pestañas', 'Cleanse the lashes'), tx('Aplicar primer', 'Apply primer'), tx('Colocar parches de gel', 'Place gel pads'), tx('Aislar la primera pestaña', 'Isolate the first lash')],
        },
      ],
    },
    {
      emoji: '🗺️',
      title: tx('Mapping y diseño de la mirada', 'Mapping and eye design'),
      steps: [
        {
          kind: 'theory',
          emoji: '🗺️',
          title: tx('Diseñar antes de pegar', 'Design before you glue'),
          blocks: [
            { t: 'p', text: tx('El mapping es el plano: dividimos el ojo en zonas y decidimos longitud y curva en cada una. Se dibuja en los parches con un rotulador antes de empezar.', 'Mapping is the blueprint: we split the eye into zones and decide length and curl for each. It is drawn on the pads with a marker before starting.') },
            { t: 'pairs', title: tx('Los efectos más pedidos', 'The most requested effects'), items: [{ a: tx('Natural', 'Natural'), b: tx('Sigue la forma de sus pestañas, solo más largas.', 'Follows her own lashes, just longer.') }, { a: tx('Muñeca', 'Doll'), b: tx('Las más largas en el centro: abre y redondea el ojo.', 'Longest in the centre: opens and rounds the eye.') }, { a: tx('Ojo de gato', 'Cat eye'), b: tx('Crece hacia el rabillo: alarga y eleva.', 'Builds towards the outer corner: lengthens and lifts.') }, { a: tx('Ardilla', 'Squirrel'), b: tx('Pico entre el centro y el rabillo, y cae al final.', 'Peaks between the centre and outer corner, then drops.') }] },
            { t: 'pairs', title: tx('Según la forma del ojo', 'By eye shape'), items: [{ a: tx('Ojos juntos', 'Close-set'), b: tx('Más largo hacia fuera para separarlos.', 'Longer towards the outside to widen.') }, { a: tx('Ojos separados', 'Wide-set'), b: tx('Más largo hacia el centro.', 'Longer towards the centre.') }, { a: tx('Párpado caído', 'Hooded'), b: tx('Más curva (C, D o L) para que se vean.', 'More curl (C, D or L) so they show.') }, { a: tx('Ojos redondos', 'Round eyes'), b: tx('Ojo de gato para alargar.', 'Cat eye to elongate.') }] },
            { t: 'myth', claim: tx('El ojo de gato le queda bien a todo el mundo.', 'Cat eye suits everyone.'), myth: true, truth: tx('En párpados caídos o con el rabillo hacia abajo puede hundir la mirada. Siempre se adapta a la forma del ojo.', 'On hooded eyes or down-turned outer corners it can drag the look down. Always adapt to the eye shape.') },
            { t: 'fact', text: tx('La regla práctica: la extensión no debe superar en más de un 30–40 % la longitud de la pestaña natural.', 'Rule of thumb: an extension should not exceed the natural lash length by more than 30–40%.') },
          ],
        },
        A[1],
        {
          kind: 'quiz',
          question: tx('Clienta con ojos juntos. ¿Dónde pones las extensiones más largas?', 'Client with close-set eyes. Where do the longest extensions go?'),
          options: [tx('En el lagrimal', 'At the inner corner'), tx('Hacia el rabillo', 'Towards the outer corner'), tx('Todas iguales', 'All the same')],
          answer: 1,
          explain: tx('Alargar hacia fuera separa visualmente los ojos.', 'Lengthening outwards visually widens the gap between the eyes.'),
        },
      ],
    },
    {
      emoji: '💫',
      title: tx('Volumen y lifting', 'Volume and lash lift'),
      steps: [
        {
          kind: 'theory',
          emoji: '💫',
          title: tx('Más densidad y curva natural', 'More density and natural curl'),
          blocks: [
            { t: 'p', text: tx('En volumen no se pone una extensión por pestaña, sino un abanico de 2 a 6 extensiones muy finas. Pesan lo mismo que una clásica gruesa, pero dan mucha más densidad.', 'In volume you don’t put one extension per lash but a fan of 2 to 6 very fine ones. They weigh the same as one thick classic but give far more density.') },
            { t: 'pairs', title: tx('Abanicos', 'Fans'), items: [{ a: tx('2D–3D', '2D–3D'), b: tx('Volumen ligero y natural. Grosor 0,07.', 'Light, natural volume. 0.07 thickness.') }, { a: tx('4D–6D', '4D–6D'), b: tx('Volumen ruso, muy denso. Grosor 0,03–0,05.', 'Russian volume, very dense. 0.03–0.05 thickness.') }] },
            { t: 'p', text: tx('El lifting es otra cosa: no añade nada, sino que riza la pestaña natural desde la raíz con un líquido permanente sobre un molde de silicona. Dura 6–8 semanas.', 'A lash lift is different: it adds nothing, it curls the natural lash from the root with a perming lotion over a silicone shield. It lasts 6–8 weeks.') },
            { t: 'myth', claim: tx('El lifting y las extensiones se pueden hacer el mismo día.', 'Lift and extensions can be done on the same day.'), myth: true, truth: tx('El lifting deja la pestaña sensibilizada. Si quiere extensiones, espera al menos una semana o elige una de las dos.', 'A lift leaves the lash sensitised. If she wants extensions, wait at least a week or choose one or the other.') },
            { t: 'warn', text: tx('El tiempo de exposición del lifting depende del grosor de la pestaña: fina, menos minutos. Pasarse rompe la pestaña.', 'Lift processing time depends on lash thickness: fine lashes need fewer minutes. Overprocessing breaks the lash.') },
          ],
        },
        A[5],
        A[3],
      ],
    },
    {
      emoji: '🩺',
      title: tx('Seguridad, retoques y retirada', 'Safety, refills and removal'),
      steps: [
        {
          kind: 'theory',
          emoji: '🩺',
          title: tx('Que vuelva contenta y con sus pestañas sanas', 'Back happy, with healthy lashes'),
          blocks: [
            { t: 'key', title: tx('Cuidados para la clienta', 'Client aftercare'), items: [tx('No mojarlas en las primeras 24 h.', 'No water for the first 24 h.'), tx('Nada de desmaquillantes con aceite.', 'No oil-based make-up removers.'), tx('Cepillarlas cada día con un cepillo limpio.', 'Brush them daily with a clean spoolie.'), tx('Nunca arrancarlas ni usar rizador.', 'Never pull them off or use a curler.')] },
            { t: 'pairs', title: tx('Rojez tras la sesión', 'Redness after the session'), items: [{ a: tx('Irritación', 'Irritation'), b: tx('Ojo rojo justo al terminar, por vapores. Mejora en 24 h.', 'Red eye right after, from fumes. Improves within 24 h.') }, { a: tx('Alergia', 'Allergy'), b: tx('Párpado hinchado, picor y rojez que empeoran a las 24–48 h. Hay que retirar y derivar al médico.', 'Swollen, itchy, red lid that worsens after 24–48 h. Remove and refer to a doctor.') }] },
            { t: 'myth', claim: tx('Si la clienta tiene alergia, basta con cambiar de pegamento.', 'If the client is allergic, just switch glue.'), myth: true, truth: tx('Casi todos los adhesivos son cianoacrilato. Una alergia confirmada suele significar no volver a ponerse extensiones.', 'Almost all adhesives are cyanoacrylate. A confirmed allergy usually means no more extensions.') },
            { t: 'steps', title: tx('Retirada profesional', 'Professional removal'), items: [tx('Parches y protección del ojo.', 'Pads and eye protection.'), tx('Removedor en crema o gel sobre la base.', 'Cream or gel remover on the base.'), tx('Esperar el tiempo que indique el fabricante.', 'Wait the time the maker indicates.'), tx('Deslizar con microcepillo, sin tirar.', 'Slide off with a micro-brush, never pull.'), tx('Limpiar bien los restos.', 'Clean off all residue.')] },
            { t: 'fact', text: tx('Recomienda retoque cada 2–3 semanas. Si pasan más de 4, suele quedar tan poco que hay que hacer una puesta nueva.', 'Recommend a refill every 2–3 weeks. After 4 weeks there is usually so little left it needs a new full set.') },
          ],
        },
        A[4],
      ],
    },
  ],
  [
    { question: tx('¿En qué fase del ciclo está la pestaña ideal para trabajar?', 'Which phase is the ideal lash to work on?'), options: [tx('Anágena (crecimiento)', 'Anagen (growth)'), tx('Catágena (transición)', 'Catagen (transition)'), tx('Telógena (caída)', 'Telogen (shedding)')], answer: 1, explain: tx('Ha terminado de crecer y aún tardará en caer.', 'It has finished growing and won’t shed for a while.') },
    { question: tx('¿Cuántas pestañas naturales es normal perder al día?', 'How many natural lashes is it normal to shed a day?'), options: [tx('Ninguna', 'None'), tx('De 1 a 5', '1 to 5'), tx('Más de 20', 'Over 20')], answer: 1, explain: tx('Es parte del ciclo natural.', 'It is part of the natural cycle.') },
    { question: tx('¿Qué grosor eliges para una clásica en pestañas débiles?', 'Which thickness for a classic set on weak lashes?'), options: [tx('0,10 mm', '0.10 mm'), tx('0,20 mm', '0.20 mm'), tx('0,25 mm', '0.25 mm')], answer: 0, explain: tx('Fina y ligera para no dañar la pestaña.', 'Fine and light so the lash isn’t damaged.') },
    { question: tx('¿Qué humedad es ideal para el adhesivo?', 'What humidity is ideal for the adhesive?'), options: [tx('10–20 %', '10–20%'), tx('40–60 %', '40–60%'), tx('80–90 %', '80–90%')], answer: 1, explain: tx('Con 40–60 % seca a la velocidad correcta.', 'At 40–60% it cures at the right speed.') },
    { question: tx('¿Cada cuánto cambias la gota de adhesivo?', 'How often do you change the adhesive drop?'), options: [tx('Cada 15–20 minutos', 'Every 15–20 minutes'), tx('Una vez por sesión', 'Once per session'), tx('Cada hora', 'Every hour')], answer: 0, explain: tx('La gota expuesta al aire pierde fuerza.', 'A drop exposed to air loses strength.') },
    { question: tx('¿A qué distancia del párpado se coloca la extensión?', 'How far from the lid is the extension placed?'), options: [tx('Tocando la piel', 'Touching the skin'), tx('A 0,5–1 mm', '0.5–1 mm away'), tx('A 5 mm', '5 mm away')], answer: 1, explain: tx('Nunca toca la piel: irrita y crece mal.', 'It never touches the skin: it irritates and grows out badly.') },
    { question: tx('¿Qué pasa si pegas dos pestañas naturales juntas?', 'What happens if you glue two natural lashes together?'), options: [tx('Duran más', 'They last longer'), tx('Se tiran entre sí y se arrancan al crecer', 'They pull on each other and get ripped out as they grow'), tx('Nada', 'Nothing')], answer: 1, explain: tx('Cada pestaña crece a su ritmo.', 'Each lash grows at its own pace.') },
    { question: tx('¿Qué efecto abre y redondea el ojo?', 'Which effect opens and rounds the eye?'), options: [tx('Muñeca', 'Doll'), tx('Ojo de gato', 'Cat eye'), tx('Ardilla', 'Squirrel')], answer: 0, explain: tx('Las más largas en el centro.', 'Longest in the centre.') },
    { question: tx('Para un párpado caído, ¿qué curvatura ayuda más?', 'Which curl helps most on hooded eyes?'), options: [tx('J', 'J'), tx('B', 'B'), tx('C, D o L', 'C, D or L')], answer: 2, explain: tx('Más curva para que la pestaña asome.', 'More curl so the lash shows.') },
    { question: tx('¿Cuánto más larga que la natural puede ser la extensión?', 'How much longer than the natural lash can the extension be?'), options: [tx('Hasta un 30–40 %', 'Up to 30–40%'), tx('El doble', 'Double'), tx('El triple', 'Triple')], answer: 0, explain: tx('Más largo pesaría demasiado.', 'Any longer would be too heavy.') },
    { question: tx('En volumen ruso 4D–6D, ¿qué grosor se usa?', 'In 4D–6D Russian volume, which thickness is used?'), options: [tx('0,03–0,05 mm', '0.03–0.05 mm'), tx('0,15 mm', '0.15 mm'), tx('0,20 mm', '0.20 mm')], answer: 0, explain: tx('Muy finas para que el abanico no pese.', 'Very fine so the fan stays light.') },
    { question: tx('¿Cuánto dura un lifting de pestañas?', 'How long does a lash lift last?'), options: [tx('1 semana', '1 week'), tx('6–8 semanas', '6–8 weeks'), tx('6 meses', '6 months')], answer: 1, explain: tx('Hasta que la pestaña se renueva.', 'Until the lash renews.') },
    { question: tx('Párpado hinchado y con picor que empeora a las 48 h. ¿Qué es?', 'Swollen, itchy lid getting worse after 48 h. What is it?'), options: [tx('Irritación normal', 'Normal irritation'), tx('Posible alergia: retirar y derivar al médico', 'Possible allergy: remove and refer to a doctor'), tx('Falta de cepillado', 'Not brushing')], answer: 1, explain: tx('La irritación mejora; la alergia empeora.', 'Irritation improves; allergy gets worse.') },
    { question: tx('¿Cada cuánto se recomienda el retoque?', 'How often is a refill recommended?'), options: [tx('Cada 2–3 semanas', 'Every 2–3 weeks'), tx('Cada 2 meses', 'Every 2 months'), tx('Nunca', 'Never')], answer: 0, explain: tx('Después de 4 semanas suele hacer falta puesta nueva.', 'After 4 weeks a new set is usually needed.') },
    { question: tx('¿Cómo se retiran las extensiones?', 'How are extensions removed?'), options: [tx('Tirando con las pinzas', 'Pulling with tweezers'), tx('Con removedor en crema o gel y microcepillo', 'With cream or gel remover and a micro-brush'), tx('Con aceite de oliva en casa', 'With olive oil at home')], answer: 1, explain: tx('Sin tirar nunca de la pestaña natural.', 'Never pulling the natural lash.') },
  ],
)
