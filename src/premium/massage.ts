import type { Course } from '../courses'
import { tx } from '../i18n'

export const massage: Course = {
  id: 'masaje-drenaje',
  emoji: '💆',
  color: '#3f8f5f',
  title: tx('Masaje y drenaje linfático', 'Massage and lymphatic drainage'),
  summary: tx(
    'Drenaje manual, masaje corporal y moldeador: maniobras, presión y contraindicaciones.',
    'Manual lymphatic drainage, body and sculpting massage: strokes, pressure and contraindications.',
  ),
  minutes: 40,
  premium: { eur: 49, usd: 55 },
  freeSteps: 2,
  certificate: true,
  steps: [
    {
      kind: 'video',
      title: tx('Cómo se mueve la linfa', 'How lymph moves'),
      scenes: [
        {
          emoji: '💧',
          props: ['🔁'],
          anim: 'float',
          title: tx('Un sistema sin bomba', 'A system without a pump'),
          caption: tx(
            'La linfa no tiene corazón que la empuje: se mueve con la respiración, los músculos y el masaje.',
            'Lymph has no heart to push it: it moves with breathing, muscles and massage.',
          ),
        },
        {
          emoji: '🫳',
          props: ['🪶'],
          anim: 'pulse',
          title: tx('Presión muy suave', 'Very light pressure'),
          caption: tx(
            'El drenaje usa una presión ligera, de unos 30-40 mmHg, con movimientos lentos y rítmicos que estiran la piel.',
            'Drainage uses light pressure, about 30–40 mmHg, with slow rhythmic movements that stretch the skin.',
          ),
          question: {
            question: tx('¿Cómo es la presión en el drenaje linfático?', 'What pressure is used in lymphatic drainage?'),
            options: [tx('Fuerte y profunda', 'Strong and deep'), tx('Suave y rítmica', 'Light and rhythmic'), tx('Con percusión', 'Percussive')],
            answer: 1,
            explain: tx('Los vasos linfáticos están en la superficie: si aprietas, los cierras.', 'Lymph vessels are superficial: press hard and you close them.'),
          },
        },
        {
          emoji: '🎯',
          props: ['⬆️'],
          anim: 'zoom',
          title: tx('Primero vaciar, después drenar', 'Empty first, then drain'),
          caption: tx(
            'Empieza siempre por los ganglios más cercanos al final del recorrido, en el cuello y la clavícula.',
            'Always start at the nodes nearest the end of the pathway, at the neck and collarbone.',
          ),
        },
        {
          emoji: '➡️',
          props: ['🦵'],
          anim: 'slide',
          title: tx('Siempre hacia los ganglios', 'Always towards the nodes'),
          caption: tx(
            'Las maniobras van de la zona a los ganglios: en la pierna, de abajo arriba hacia la ingle.',
            'Strokes move from the area towards the nodes: on the leg, from bottom to top towards the groin.',
          ),
          question: {
            question: tx('En la pierna, ¿hacia dónde se dirigen las maniobras?', 'On the leg, which way do the strokes go?'),
            options: [tx('Hacia el pie', 'Towards the foot'), tx('Hacia la ingle', 'Towards the groin'), tx('En círculos sin dirección', 'Circles with no direction')],
            answer: 1,
            explain: tx('La linfa de la pierna drena a los ganglios inguinales.', 'Lymph from the leg drains into the inguinal nodes.'),
          },
        },
      ],
    },
    {
      kind: 'hotspot',
      title: tx('Localiza los grupos de ganglios', 'Find the lymph node groups'),
      figure: 'body',
      spots: [
        { x: 56, y: 21, label: tx('Clavícula (terminus)', 'Collarbone (terminus)') },
        { x: 32, y: 28, label: tx('Axila', 'Armpit') },
        { x: 41, y: 56, label: tx('Ingle', 'Groin') },
        { x: 57, y: 76, label: tx('Rodilla (hueco poplíteo)', 'Back of the knee') },
      ],
      tasks: [
        {
          prompt: tx('¿Por dónde empieza siempre un drenaje? Toca el punto.', 'Where does drainage always begin? Tap the spot.'),
          spot: 0,
          explain: tx('En el terminus, sobre la clavícula, la linfa vuelve a la sangre.', 'At the terminus, above the collarbone, lymph returns to the blood.'),
        },
        {
          prompt: tx('Drenaje de brazos: ¿a qué ganglios llevas la linfa?', 'Arm drainage: which nodes do you move lymph to?'),
          spot: 1,
          explain: tx('El brazo drena a los ganglios axilares.', 'The arm drains into the axillary nodes.'),
        },
        {
          prompt: tx('Drenaje de piernas: ¿qué ganglios vacías antes de trabajar el muslo?', 'Leg drainage: which nodes do you empty before working the thigh?'),
          spot: 2,
          explain: tx('Primero la ingle, después el muslo, la rodilla y la pantorrilla.', 'Groin first, then thigh, knee and calf.'),
        },
      ],
    },
    {
      kind: 'match',
      title: tx('Une cada maniobra con su objetivo', 'Match each stroke with its purpose'),
      pairs: [
        { left: tx('Effleurage (roce)', 'Effleurage'), right: tx('Calentar y relajar al empezar', 'Warm up and relax at the start') },
        { left: tx('Amasamiento', 'Kneading'), right: tx('Trabajar el músculo y la grasa', 'Work muscle and fat tissue') },
        { left: tx('Bombeo', 'Pumping'), right: tx('Mover la linfa en el drenaje', 'Move lymph in drainage') },
        { left: tx('Pinza rodada (palpar-rodar)', 'Skin rolling'), right: tx('Moldear y tratar la celulitis', 'Sculpt and treat cellulite') },
      ],
    },
    {
      kind: 'case',
      title: tx('Caso: pierna hinchada', 'Case: swollen leg'),
      story: tx(
        'Rosa, 58 años, quiere drenaje porque una pierna se le ha hinchado de golpe, está caliente y le duele la pantorrilla.',
        'Rose, 58, wants drainage because one leg suddenly swelled up, feels warm and her calf hurts.',
      ),
      options: [
        {
          text: tx('Hacer el drenaje con más presión en la pantorrilla', 'Do the drainage with more pressure on the calf'),
          good: false,
          feedback: tx('Podría ser una trombosis: el masaje podría soltar un coágulo.', 'It could be a thrombosis: massage could dislodge a clot.'),
        },
        {
          text: tx('No tratar y pedirle que vaya al médico hoy mismo', 'Do not treat and ask her to see a doctor today'),
          good: true,
          feedback: tx(
            'Correcto. Hinchazón en una sola pierna, calor y dolor son señales de alarma de trombosis venosa.',
            'Correct. Swelling in one leg, heat and pain are warning signs of deep vein thrombosis.',
          ),
        },
        {
          text: tx('Hacer solo masaje relajante en la espalda', 'Just do a relaxing back massage'),
          good: false,
          feedback: tx('Lo urgente es que la vea un médico: no lo retrases.', 'The urgent thing is for a doctor to see her: do not delay it.'),
        },
      ],
    },
    {
      kind: 'quiz',
      question: tx('¿Cuál NO es una contraindicación del drenaje linfático?', 'Which is NOT a contraindication for lymphatic drainage?'),
      options: [
        tx('Insuficiencia cardiaca', 'Heart failure'),
        tx('Infección aguda con fiebre', 'Acute infection with fever'),
        tx('Retención de líquidos leve', 'Mild fluid retention'),
        tx('Trombosis', 'Thrombosis'),
      ],
      answer: 2,
      explain: tx('La retención leve es justo una indicación. Las otras tres son contraindicaciones.', 'Mild retention is an indication. The other three are contraindications.'),
    },
  ],
}
