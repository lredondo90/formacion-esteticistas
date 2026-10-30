import type { Course } from '../courses'
import { tx } from '../i18n'

export const nails: Course = {
  id: 'unas',
  emoji: '💅',
  color: '#c2457a',
  title: tx('Diseño de uñas: acrílico, gel y nail art', 'Nail design: acrylic, gel and nail art'),
  summary: tx(
    'Preparación de la uña, esculpidas, semipermanente, decoración y seguridad.',
    'Nail prep, sculpted nails, gel polish, decoration and safety.',
  ),
  minutes: 40,
  premium: { eur: 49, usd: 55 },
  freeSteps: 2,
  certificate: true,
  steps: [
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
  ],
}
