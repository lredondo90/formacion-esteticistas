import type { Course } from '../courses'
import { tx } from '../i18n'

export const laser: Course = {
  id: 'laser',
  emoji: '🔦',
  color: '#b0532a',
  title: tx('Depilación láser y fotodepilación', 'Laser and IPL hair removal'),
  summary: tx(
    'Fototipos, tipos de láser, parámetros, seguridad ocular y cómo evitar quemaduras.',
    'Skin phototypes, laser types, settings, eye safety and how to avoid burns.',
  ),
  minutes: 45,
  premium: { eur: 69, usd: 75 },
  freeSteps: 2,
  certificate: true,
  steps: [
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
  ],
}
