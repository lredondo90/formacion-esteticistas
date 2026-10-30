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
      kind: 'lab',
      lab: 'massage',
      title: tx('Práctica guiada: drenaje linfático facial', 'Guided practice: facial lymphatic drainage'),
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
