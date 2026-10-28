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
      kind: 'video',
      title: tx('Cómo leer una etiqueta', 'How to read a label'),
      scenes: [
        {
          emoji: '🏷️',
          props: ['🔍'],
          anim: 'zoom',
          title: tx('La lista INCI', 'The INCI list'),
          caption: tx(
            'Todos los cosméticos llevan la lista de ingredientes con nombres internacionales, llamada INCI.',
            'Every cosmetic lists its ingredients with international names, called INCI.',
          ),
        },
        {
          emoji: '📉',
          props: ['1️⃣', '2️⃣'],
          anim: 'slide',
          title: tx('De más a menos', 'From most to least'),
          caption: tx(
            'Los ingredientes aparecen de mayor a menor concentración. Por debajo del 1 %, pueden ir en cualquier orden.',
            'Ingredients are listed from highest to lowest concentration. Below 1% they can be in any order.',
          ),
          question: {
            question: tx('Si "Aqua" es el primero, significa que...', 'If "Aqua" comes first, it means...'),
            options: [
              tx('El producto lleva poca agua', 'There is little water'),
              tx('El agua es el ingrediente principal', 'Water is the main ingredient'),
              tx('No significa nada', 'It means nothing'),
            ],
            answer: 1,
            explain: tx('El primer ingrediente es el que está en mayor cantidad.', 'The first ingredient is the one present in the largest amount.'),
          },
        },
        {
          emoji: '⚖️',
          props: ['🍋', '🧼'],
          anim: 'pulse',
          title: tx('El pH de la piel', 'Skin pH'),
          caption: tx(
            'La piel sana es ligeramente ácida, con un pH de 4,5 a 5,5. Los limpiadores muy alcalinos alteran la barrera.',
            'Healthy skin is slightly acidic, pH 4.5 to 5.5. Very alkaline cleansers disrupt the barrier.',
          ),
          question: {
            question: tx('¿Cuál es el pH de la piel sana?', 'What is the pH of healthy skin?'),
            options: [tx('Entre 4,5 y 5,5', '4.5 to 5.5'), tx('7, neutro', '7, neutral'), tx('Entre 8 y 9', '8 to 9')],
            answer: 0,
            explain: tx('Este "manto ácido" protege frente a bacterias y deshidratación.', 'This "acid mantle" protects against bacteria and dehydration.'),
          },
        },
        {
          emoji: '🫙',
          props: ['💧', '🫒'],
          anim: 'float',
          title: tx('Texturas', 'Textures'),
          caption: tx(
            'Emulsión O/W: aceite en agua, ligera, para pieles grasas. W/O: agua en aceite, más nutritiva, para pieles secas.',
            'O/W emulsion: oil in water, light, for oily skin. W/O: water in oil, richer, for dry skin.',
          ),
        },
      ],
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
