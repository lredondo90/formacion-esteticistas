import type { Text } from './i18n'
import { tx } from './i18n'
import { PREMIUM_COURSES } from './premium'

export type Question = { question: Text; options: Text[]; answer: number; explain: Text }

// One shot of an animated video lesson. `emoji` is the main subject, `props` float in around it.
export type Scene = {
  emoji: string
  props?: string[]
  anim?: 'zoom' | 'float' | 'slide' | 'pulse' | 'spin'
  title?: Text
  caption: Text
  seconds?: number
  question?: Question
}

export type Figure = 'face' | 'eye' | 'nail' | 'body'

export type BranchNode = {
  who?: string
  text: Text
  choices: { text: Text; next?: string; end?: 'good' | 'bad'; feedback?: Text }[]
}

export type Step =
  | { kind: 'lesson'; title: Text; body: Text; tip?: Text; emoji: string }
  | { kind: 'flashcards'; title: Text; cards: { front: Text; back: Text }[] }
  | { kind: 'quiz'; question: Text; options: Text[]; answer: number; explain: Text }
  | { kind: 'match'; title: Text; pairs: { left: Text; right: Text }[] }
  | { kind: 'order'; title: Text; items: Text[] }
  | { kind: 'case'; title: Text; story: Text; options: { text: Text; good: boolean; feedback: Text }[] }
  // Animated scenes stand in for footage. Set `src` (and `cues`, in seconds) to play a real video instead.
  | { kind: 'video'; title: Text; scenes: Scene[]; src?: string; cues?: { at: number; question: Question }[] }
  | {
      kind: 'hotspot'
      title: Text
      figure: Figure
      spots: { x: number; y: number; label: Text }[]
      tasks: { prompt: Text; spot: number; explain: Text }[]
    }
  | { kind: 'branch'; title: Text; start: string; nodes: Record<string, BranchNode> }
  // Hands-on guided practice: learn on an animated drawing, then do it yourself.
  | { kind: 'lab'; lab: 'brows'; title: Text }

export type Course = {
  id: string
  emoji: string
  color: string
  title: Text
  summary: Text
  minutes: number
  steps: Step[]
  // Paid course: the first `freeSteps` steps are a free preview.
  premium?: { eur: number; usd: number }
  freeSteps?: number
  certificate?: boolean
}

const FREE_COURSES: Course[] = [
  {
    id: 'tipos-de-piel',
    emoji: '🌸',
    color: '#c2577a',
    title: {
      es: 'Diagnóstico facial: tipos de piel',
      en: 'Facial analysis: skin types',
    },
    summary: {
      es: 'Aprende a reconocer cada tipo de piel y a elegir la rutina correcta en cabina.',
      la: 'Aprende a reconocer cada tipo de piel y a elegir la rutina correcta en el gabinete.',
      en: 'Learn to recognise each skin type and choose the right routine in the treatment room.',
    },
    minutes: 14,
    steps: [
      {
        kind: 'video',
        title: tx('Vídeo: el diagnóstico en 1 minuto', 'Video: skin analysis in 1 minute', 'Video: el diagnóstico en 1 minuto'),
        scenes: [
          {
            emoji: '💡',
            props: ['🪞', '🧴'],
            anim: 'zoom',
            title: tx('Buena luz, piel limpia', 'Good light, clean skin'),
            caption: tx(
              'Antes de tocar nada, limpia la piel y obsérvala con luz natural o una lupa con luz fría.',
              'Before touching anything, cleanse the skin and look at it in natural light or under a cold-light magnifier.',
            ),
          },
          {
            emoji: '✨',
            props: ['👃', '🧠'],
            anim: 'pulse',
            title: tx('Mira la zona T', 'Check the T-zone'),
            caption: tx(
              'Frente, nariz y barbilla te dicen mucho: si brillan y los poros se ven abiertos, hay exceso de sebo.',
              'Forehead, nose and chin tell you a lot: if they shine and pores look open, there is excess sebum.',
              'Frente, nariz y mentón te dicen mucho: si brillan y los poros se ven abiertos, hay exceso de sebo.',
            ),
            question: {
              question: tx('Si solo brilla la zona T, ¿qué piel sospechas?', 'If only the T-zone shines, which skin do you suspect?'),
              options: [tx('Seca', 'Dry'), tx('Mixta', 'Combination'), tx('Sensible', 'Sensitive')],
              answer: 1,
              explain: tx('Brillo solo en la zona T apunta a piel mixta.', 'Shine only in the T-zone points to combination skin.'),
            },
          },
          {
            emoji: '🤏',
            props: ['🫧'],
            anim: 'float',
            title: tx('Tacto y textura', 'Touch and texture'),
            caption: tx(
              'Pasa la yema de los dedos: aspereza o descamación indican sequedad; granitos y rugosidad, exceso de grasa.',
              'Run your fingertips over it: roughness or flaking means dryness; bumps and uneven texture mean excess oil.',
              'Pasa la yema de los dedos: aspereza o descamación indican resequedad; barritos y rugosidad, exceso de grasa.',
            ),
          },
          {
            emoji: '🗣️',
            props: ['📝'],
            anim: 'slide',
            title: tx('Pregunta siempre', 'Always ask'),
            caption: tx(
              'Completa la ficha: rutina, medicación, alergias y cómo reacciona su piel al sol y a los productos nuevos.',
              'Fill in the record card: routine, medication, allergies and how the skin reacts to sun and new products.',
            ),
            question: {
              question: tx('¿Qué dato NO es necesario en la ficha?', 'Which detail is NOT needed on the record card?'),
              options: [tx('Medicación actual', 'Current medication'), tx('Alergias', 'Allergies'), tx('Su signo del zodiaco', 'Star sign')],
              answer: 2,
              explain: tx('Medicación y alergias pueden cambiar el tratamiento. El zodiaco, no.', 'Medication and allergies can change the treatment. Star signs cannot.'),
            },
          },
        ],
      },
      {
        kind: 'hotspot',
        title: tx('Localiza las zonas del rostro', 'Find the areas of the face'),
        figure: 'face',
        spots: [
          { x: 50, y: 27, label: tx('Frente', 'Forehead') },
          { x: 50, y: 52, label: tx('Nariz', 'Nose') },
          { x: 50, y: 82, label: tx('Barbilla', 'Chin', 'Mentón') },
          { x: 30, y: 60, label: tx('Mejilla', 'Cheek') },
          { x: 72, y: 46, label: tx('Contorno de ojos', 'Eye area') },
        ],
        tasks: [
          {
            prompt: tx('¿Dónde suele brillar primero una piel mixta? Toca la frente.', 'Where does combination skin usually shine first? Tap the forehead.'),
            spot: 0,
            explain: tx('La frente forma parte de la zona T, con más glándulas sebáceas.', 'The forehead is part of the T-zone, with more sebaceous glands.'),
          },
          {
            prompt: tx('Toca la zona donde una piel mixta suele estar normal o seca.', 'Tap the area where combination skin is usually normal or dry.'),
            spot: 3,
            explain: tx('Las mejillas tienen menos glándulas sebáceas que la zona T.', 'The cheeks have fewer sebaceous glands than the T-zone.'),
          },
          {
            prompt: tx('Toca la zona más fina y delicada, que necesita productos específicos.', 'Tap the thinnest, most delicate area, which needs specific products.'),
            spot: 4,
            explain: tx('La piel del contorno de ojos es mucho más fina: usa productos específicos y sin frotar.', 'Skin around the eyes is much thinner: use dedicated products and never rub.'),
          },
        ],
      },
      {
        kind: 'lesson',
        emoji: '🔍',
        title: { es: 'Por qué empezar por el diagnóstico', en: 'Why start with analysis' },
        body: {
          es: 'Un buen tratamiento empieza mirando la piel con buena luz, la cara limpia y sin maquillaje. Observa el brillo, el tamaño de los poros, la textura y la sensibilidad. Pregunta a la clienta por su rutina y por los productos que usa.',
          la: 'Un buen tratamiento empieza mirando la piel con buena luz, el rostro limpio y sin maquillaje. Observa el brillo, el tamaño de los poros, la textura y la sensibilidad. Pregúntale a tu clienta por su rutina y por los productos que usa.',
          en: 'A good treatment starts by looking at the skin in good light, with the face cleansed and make-up free. Look at shine, pore size, texture and sensitivity. Ask the client about her routine and the products she uses.',
        },
        tip: {
          es: 'Truco: espera 20-30 minutos después de limpiar para ver cómo se comporta la piel de verdad.',
          en: 'Tip: wait 20–30 minutes after cleansing to see how the skin really behaves.',
        },
      },
      {
        kind: 'flashcards',
        title: { es: 'Los 5 tipos de piel', en: 'The 5 skin types' },
        cards: [
          {
            front: { es: 'Piel normal', en: 'Normal skin' },
            back: {
              es: 'Equilibrada, poros finos, textura uniforme, ni brillo ni tirantez.',
              en: 'Balanced, fine pores, even texture, neither shiny nor tight.',
            },
          },
          {
            front: { es: 'Piel seca', en: 'Dry skin' },
            back: {
              es: 'Poca grasa, sensación de tirantez, puede descamarse y marcar líneas finas.',
              en: 'Low oil, feels tight, may flake and show fine lines.',
            },
          },
          {
            front: { es: 'Piel grasa', en: 'Oily skin' },
            back: {
              es: 'Brillo generalizado, poros dilatados, tendencia a granos y puntos negros.',
              la: 'Brillo generalizado, poros dilatados, tendencia a barros y espinillas.',
              en: 'Overall shine, enlarged pores, prone to breakouts and blackheads.',
            },
          },
          {
            front: { es: 'Piel mixta', en: 'Combination skin' },
            back: {
              es: 'Zona T (frente, nariz, barbilla) grasa y mejillas normales o secas.',
              la: 'Zona T (frente, nariz, mentón) grasa y mejillas normales o secas.',
              en: 'Oily T-zone (forehead, nose, chin) with normal or dry cheeks.',
            },
          },
          {
            front: { es: 'Piel sensible', en: 'Sensitive skin' },
            back: {
              es: 'Se enrojece con facilidad, pica o arde con productos nuevos o cambios de temperatura.',
              en: 'Reddens easily, stings or burns with new products or temperature changes.',
            },
          },
        ],
      },
      {
        kind: 'quiz',
        question: {
          es: 'Una clienta tiene brillo en la frente y la nariz, pero las mejillas le tiran. ¿Qué tipo de piel es?',
          en: 'A client is shiny on the forehead and nose, but her cheeks feel tight. Which skin type is it?',
        },
        options: [
          { es: 'Grasa', en: 'Oily' },
          { es: 'Mixta', en: 'Combination' },
          { es: 'Seca', en: 'Dry' },
          { es: 'Normal', en: 'Normal' },
        ],
        answer: 1,
        explain: {
          es: 'Grasa en la zona T y sequedad en las mejillas es la señal clásica de la piel mixta.',
          en: 'Oil in the T-zone and dryness on the cheeks is the classic sign of combination skin.',
        },
      },
      {
        kind: 'match',
        title: { es: 'Une cada piel con su activo estrella', en: 'Match each skin with its hero ingredient' },
        pairs: [
          { left: { es: 'Seca', en: 'Dry' }, right: { es: 'Ácido hialurónico y ceramidas', en: 'Hyaluronic acid and ceramides' } },
          { left: { es: 'Grasa', en: 'Oily' }, right: { es: 'Ácido salicílico', en: 'Salicylic acid' } },
          { left: { es: 'Sensible', en: 'Sensitive' }, right: { es: 'Centella asiática', en: 'Centella asiatica' } },
          { left: { es: 'Apagada', en: 'Dull' }, right: { es: 'Vitamina C', en: 'Vitamin C' } },
        ],
      },
      {
        kind: 'order',
        title: { es: 'Ordena los pasos de una limpieza facial básica', en: 'Put the steps of a basic facial cleanse in order' },
        items: [
          { es: 'Desmaquillar ojos y labios', en: 'Remove eye and lip make-up' },
          { es: 'Limpieza con el producto adecuado', en: 'Cleanse with the right product' },
          { es: 'Tonificar', en: 'Tone' },
          { es: 'Exfoliar', en: 'Exfoliate' },
          { es: 'Mascarilla', en: 'Mask' },
          {
            es: 'Hidratación y protección solar',
            la: 'Humectación y protector solar',
            en: 'Moisturise and apply sunscreen',
          },
        ],
      },
      {
        kind: 'case',
        title: { es: 'Caso real de cabina', la: 'Caso real de gabinete', en: 'Real treatment-room case' },
        story: {
          es: 'Lucía, 34 años, viene por primera vez. Nota la piel tirante y roja después de usar un exfoliante nuevo que compró en internet. ¿Qué haces?',
          la: 'Valentina, 34 años, viene por primera vez. Siente la piel tirante y roja después de usar un exfoliante nuevo que compró por internet. ¿Qué haces?',
          en: 'Lucy, 34, is a first-time client. Her skin feels tight and red after using a new scrub she bought online. What do you do?',
        },
        options: [
          {
            text: {
              es: 'Hacer un peeling para "renovar" la piel',
              en: 'Do a peel to "renew" the skin',
            },
            good: false,
            feedback: {
              es: 'Cuidado: la barrera cutánea está alterada y un peeling la irritaría todavía más.',
              en: 'Careful: the skin barrier is compromised and a peel would irritate it even more.',
            },
          },
          {
            text: {
              es: 'Suspender el exfoliante y hacer un tratamiento calmante y reparador',
              en: 'Stop the scrub and do a soothing, barrier-repair treatment',
            },
            good: true,
            feedback: {
              es: 'Perfecto. Primero calmar y reparar la barrera; después, rediseñar su rutina en casa.',
              en: 'Perfect. First soothe and repair the barrier, then redesign her home routine.',
            },
          },
          {
            text: {
              es: 'Recomendarle un limpiador más fuerte',
              en: 'Recommend a stronger cleanser',
            },
            good: false,
            feedback: {
              es: 'Un limpiador agresivo empeoraría la tirantez. Busca fórmulas suaves y sin perfume.',
              en: 'A harsh cleanser would make the tightness worse. Look for gentle, fragrance-free formulas.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'higiene-cabina',
    emoji: '🧼',
    color: '#3f8f86',
    title: {
      es: 'Higiene y seguridad en cabina',
      la: 'Higiene y bioseguridad en el gabinete',
      en: 'Hygiene and safety in the treatment room',
    },
    summary: {
      es: 'Desinfección, esterilización y protocolos para trabajar con seguridad.',
      en: 'Disinfection, sterilisation and protocols to work safely.',
    },
    minutes: 15,
    steps: [],
  },
  {
    id: 'depilacion',
    emoji: '✨',
    color: '#b07a2a',
    title: {
      es: 'Depilación con cera paso a paso',
      la: 'Depilación con cera paso a paso',
      en: 'Waxing step by step',
    },
    summary: {
      es: 'Ceras, temperaturas, zonas y cuidados posteriores.',
      en: 'Wax types, temperatures, body areas and aftercare.',
    },
    minutes: 20,
    steps: [],
  },
]

export const COURSES: Course[] = [...FREE_COURSES, ...PREMIUM_COURSES]
