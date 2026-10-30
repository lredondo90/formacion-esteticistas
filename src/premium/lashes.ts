import type { Course } from '../courses'
import { tx } from '../i18n'

export const lashes: Course = {
  id: 'pestanas',
  emoji: '👁️',
  color: '#5b4a8a',
  title: tx('Extensiones y lifting de pestañas', 'Lash extensions and lash lift'),
  summary: tx(
    'Nivel básico y avanzado: pelo a pelo, volumen, curvaturas y lifting paso a paso.',
    'Basic and advanced level: classic, volume, curls and lash lift step by step.',
  ),
  minutes: 40,
  premium: { eur: 59, usd: 65 },
  freeSteps: 2,
  certificate: true,
  steps: [
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
  ],
}
