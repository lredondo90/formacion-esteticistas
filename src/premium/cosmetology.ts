import type { Course } from '../courses'
import { tx } from '../i18n'

export const cosmetology: Course = {
  id: 'cosmetologia',
  emoji: '🧪',
  color: '#4a6fa5',
  title: tx('Cosmetología y química de productos', 'Cosmetic science and product chemistry'),
  summary: tx(
    'Lee etiquetas INCI, entiende el pH y los activos, y recomienda bien a cada cliente.',
    'Read INCI labels, understand pH and actives, and recommend the right products to every client.',
  ),
  minutes: 35,
  premium: { eur: 39, usd: 45 },
  freeSteps: 2,
  certificate: true,
  steps: [
    {
      kind: 'lab',
      lab: 'cosmetology',
      title: tx('Práctica guiada: formula y receta activos', 'Guided practice: formulate and prescribe actives'),
    },
    {
      kind: 'flashcards',
      title: tx('Activos imprescindibles', 'Must-know actives'),
      cards: [
        { front: tx('Niacinamida', 'Niacinamide'), back: tx('Regula sebo, unifica tono y refuerza la barrera.', 'Balances oil, evens tone and strengthens the barrier.') },
        { front: tx('Retinol', 'Retinol'), back: tx('Renueva y trata arrugas. De noche, con SPF de día. No en embarazo.', 'Renews and treats wrinkles. At night, with SPF by day. Not in pregnancy.') },
        { front: tx('Ácido hialurónico', 'Hyaluronic acid'), back: tx('Atrae y retiene agua: hidratación para todas las pieles.', 'Attracts and holds water: hydration for every skin type.') },
        { front: tx('Ceramidas', 'Ceramides'), back: tx('Lípidos de la barrera: reparan pieles secas o sensibilizadas.', 'Barrier lipids: repair dry or sensitised skin.') },
        { front: tx('Vitamina C', 'Vitamin C'), back: tx('Antioxidante y luminosidad. Mejor por la mañana, con SPF.', 'Antioxidant and glow. Best in the morning, with SPF.') },
      ],
    },
    {
      kind: 'quiz',
      question: tx('¿Qué combinación es mejor NO usar a la vez en la misma rutina?', 'Which combination is best NOT used together in one routine?'),
      options: [
        tx('Ácido hialurónico + ceramidas', 'Hyaluronic acid + ceramides'),
        tx('Retinol + peeling de ácidos fuerte', 'Retinol + strong acid peel'),
        tx('Niacinamida + hialurónico', 'Niacinamide + hyaluronic acid'),
      ],
      answer: 1,
      explain: tx('Juntos irritan mucho. Altérnalos en noches distintas.', 'Together they are very irritating. Alternate them on different nights.'),
    },
    {
      kind: 'match',
      title: tx('Une cada necesidad con su producto', 'Match each need with its product'),
      pairs: [
        { left: tx('Piel grasa', 'Oily skin'), right: tx('Gel limpiador suave y emulsión O/W', 'Gentle gel cleanser and O/W emulsion') },
        { left: tx('Piel seca', 'Dry skin'), right: tx('Crema W/O con ceramidas', 'W/O cream with ceramides') },
        { left: tx('Manchas', 'Pigmentation'), right: tx('Vitamina C y SPF 50', 'Vitamin C and SPF 50') },
        { left: tx('Piel sensible', 'Sensitive skin'), right: tx('Fórmulas sin perfume con centella', 'Fragrance-free formulas with centella') },
      ],
    },
    {
      kind: 'case',
      title: tx('Caso: alergia al perfume', 'Case: fragrance allergy'),
      story: tx(
        'Elena es alérgica al perfume y te pregunta si esta crema "natural" le va bien. En el INCI ves "Parfum" y "Linalool".',
        'Ellen is allergic to fragrance and asks if this "natural" cream is OK. The INCI list shows "Parfum" and "Linalool".',
      ),
      options: [
        {
          text: tx('Sí, porque es natural', 'Yes, because it is natural'),
          good: false,
          feedback: tx('"Natural" no significa sin alérgenos: el linalool es un alérgeno de fragancia.', '"Natural" does not mean allergen-free: linalool is a fragrance allergen.'),
        },
        {
          text: tx('No: lleva perfume y un alérgeno declarado. Buscamos una sin fragancia', 'No: it contains fragrance and a declared allergen. Let\'s find a fragrance-free one'),
          good: true,
          feedback: tx('Correcto. Leer el INCI te convierte en una asesora de confianza.', 'Correct. Reading the INCI list makes you a trusted adviser.'),
        },
        {
          text: tx('Que la pruebe y vea qué pasa', 'Let her try it and see'),
          good: false,
          feedback: tx('Con una alergia conocida no se experimenta.', 'With a known allergy, you do not experiment.'),
        },
      ],
    },
    {
      kind: 'order',
      title: tx('Ordena una rutina de mañana', 'Put a morning routine in order'),
      items: [
        tx('Limpiador', 'Cleanser'),
        tx('Tónico', 'Toner'),
        tx('Sérum (vitamina C)', 'Serum (vitamin C)'),
        tx('Contorno de ojos', 'Eye cream'),
        tx('Hidratante', 'Moisturiser', 'Humectante'),
        tx('Protector solar', 'Sunscreen'),
      ],
    },
  ],
}
