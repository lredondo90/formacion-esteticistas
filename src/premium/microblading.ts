import type { Course } from '../courses'
import { tx } from '../i18n'

export const microblading: Course = {
  id: 'microblading',
  emoji: '✒️',
  color: '#8a5a44',
  title: tx('Microblading y micropigmentación de cejas', 'Microblading and brow micropigmentation'),
  summary: tx(
    'Visagismo, diseño, técnica pelo a pelo, seguridad y cuidados. Con certificado final.',
    'Face mapping, design, hair-stroke technique, safety and aftercare. With a final certificate.',
  ),
  minutes: 45,
  premium: { eur: 79, usd: 89 },
  freeSteps: 2,
  certificate: true,
  steps: [
    {
      kind: 'lab',
      lab: 'brows',
      title: tx('Práctica guiada: diseña y traza una ceja', 'Guided practice: map and draw a brow'),
    },
    {
      kind: 'flashcards',
      title: tx('Microblading o micropigmentación', 'Microblading or micropigmentation'),
      cards: [
        {
          front: tx('Microblading', 'Microblading'),
          back: tx(
            'Pluma manual con microagujas. Trazos pelo a pelo muy naturales. Ideal en piel normal o seca.',
            'Manual hand tool with micro-needles. Very natural hair strokes. Best on normal or dry skin.',
          ),
        },
        {
          front: tx('Micropigmentación (dermógrafo)', 'Machine micropigmentation'),
          back: tx(
            'Máquina eléctrica. Permite efecto polvo o sombreado y dura más. Mejor en piel grasa.',
            'Electric machine. Allows powder or shaded effect and lasts longer. Better on oily skin.',
          ),
        },
        {
          front: tx('Retoque', 'Touch-up'),
          back: tx(
            'Entre 4 y 8 semanas después, cuando la piel ha cicatrizado del todo.',
            'Between 4 and 8 weeks later, once the skin has fully healed.',
          ),
        },
        {
          front: tx('Duración', 'Longevity'),
          back: tx(
            'De 12 a 18 meses de media. El sol, la piel grasa y los ácidos lo aclaran antes.',
            '12 to 18 months on average. Sun, oily skin and acids make it fade sooner.',
          ),
        },
      ],
    },
    {
      kind: 'quiz',
      question: tx(
        '¿Cuál de estas situaciones es una contraindicación para hacer microblading?',
        'Which of these is a contraindication for microblading?',
      ),
      options: [
        tx('Cejas muy despobladas', 'Very sparse brows'),
        tx('Embarazo o lactancia', 'Pregnancy or breastfeeding'),
        tx('Piel normal', 'Normal skin'),
        tx('Tener más de 50 años', 'Being over 50'),
      ],
      answer: 1,
      explain: tx(
        'Embarazo, lactancia, anticoagulantes, isotretinoína, queloides, diabetes no controlada o infecciones en la zona son contraindicaciones.',
        'Pregnancy, breastfeeding, blood thinners, isotretinoin, keloids, uncontrolled diabetes or infection in the area are contraindications.',
      ),
    },
    {
      kind: 'order',
      title: tx('Ordena el protocolo de la sesión', 'Put the session protocol in order'),
      items: [
        tx('Ficha, alergias y consentimiento firmado', 'Record card, allergies and signed consent'),
        tx('Diseño y aprobación de la clienta', 'Design and client approval'),
        tx('Desinfección de la zona', 'Disinfect the area'),
        tx('Trazos pelo a pelo con material estéril de un solo uso', 'Hair strokes with sterile single-use tools'),
        tx('Aplicar el pigmento y retirar el exceso', 'Apply pigment and remove the excess'),
        tx('Explicar cuidados y fijar el retoque', 'Explain aftercare and book the touch-up'),
      ],
    },
    {
      kind: 'case',
      title: tx('Caso: cicatrización', 'Case: healing'),
      story: tx(
        'Marta vuelve a los 5 días: "Se me está pelando y parece que el color se va. ¿Me lo has hecho mal?"',
        'Martha comes back after 5 days: "It\'s peeling and the colour seems to be fading. Did you do it wrong?"',
        'Camila vuelve a los 5 días: "Se me está pelando y parece que el color se va. ¿Me lo hiciste mal?"',
      ),
      options: [
        {
          text: tx('Repetir la sesión ese mismo día', 'Redo the session that same day'),
          good: false,
          feedback: tx('La piel aún está cicatrizando: trabajarla ahora la dañaría.', 'The skin is still healing: working on it now would damage it.'),
        },
        {
          text: tx(
            'Tranquilizarla: es normal, el color reaparece en unas semanas y en el retoque se corrige',
            'Reassure her: it is normal, the colour comes back in a few weeks and the touch-up fixes it',
          ),
          good: true,
          feedback: tx(
            'Exacto. La descamación y el "efecto fantasma" son normales. No debe rascarse ni mojar en exceso.',
            'Exactly. Flaking and the "ghosting" phase are normal. She should not pick or soak the area.',
          ),
        },
        {
          text: tx('Recomendarle un exfoliante para acelerar', 'Recommend a scrub to speed it up'),
          good: false,
          feedback: tx('Exfoliar arrancaría pigmento y podría infectar.', 'Exfoliating would pull out pigment and risk infection.'),
        },
      ],
    },
    {
      kind: 'lesson',
      emoji: '📜',
      title: tx('Normativa y certificación', 'Regulations and certification'),
      body: tx(
        'En España necesitas la formación higiénico-sanitaria que exige tu comunidad autónoma y registrar el centro. Trabaja siempre con pigmentos registrados y agujas estériles de un solo uso.',
        'In most countries you need a health and hygiene licence for tattooing and permanent make-up, and a registered studio. Always work with registered pigments and sterile single-use needles.',
        'En Latinoamérica la normativa cambia según el país: consulta los requisitos de salud de tu ciudad. Trabaja siempre con pigmentos registrados y agujas estériles de un solo uso.',
      ),
      tip: tx(
        'Este curso te da un certificado de finalización. No sustituye a la licencia sanitaria obligatoria.',
        'This course gives you a certificate of completion. It does not replace any mandatory health licence.',
      ),
    },
  ],
}
