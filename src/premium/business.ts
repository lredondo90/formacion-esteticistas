import type { Course } from '../courses'
import { tx } from '../i18n'

export const business: Course = {
  id: 'gestion-marketing',
  emoji: '📈',
  color: '#6b5b2e',
  title: tx('Gestión y marketing de tu centro', 'Running and marketing your salon'),
  summary: tx(
    'Precios rentables, Instagram que trae clientas y fidelización.',
    'Profitable pricing, Instagram that brings clients, and loyalty.',
  ),
  minutes: 35,
  premium: { eur: 39, usd: 45 },
  freeSteps: 2,
  certificate: true,
  steps: [
    {
      kind: 'video',
      title: tx('Cómo calcular un precio rentable', 'How to price for profit'),
      scenes: [
        {
          emoji: '🧾',
          props: ['💶'],
          anim: 'zoom',
          title: tx('No copies precios', "Don't copy prices"),
          caption: tx(
            'Copiar el precio de la competencia es la forma más rápida de perder dinero. Empieza por tus costes.',
            "Copying competitors' prices is the fastest way to lose money. Start with your costs.",
          ),
        },
        {
          emoji: '⏱️',
          props: ['🏠', '💡'],
          anim: 'spin',
          title: tx('Tu coste por hora', 'Your cost per hour'),
          caption: tx(
            'Suma alquiler, luz, seguros, cuotas y tu sueldo, y divídelo entre las horas que realmente atiendes al mes.',
            'Add rent, utilities, insurance, fees and your own salary, and divide by the hours you actually treat clients each month.',
          ),
          question: {
            question: tx('Costes fijos: 3.000 al mes. Atiendes 100 horas. ¿Coste por hora?', 'Fixed costs: 3,000 a month. You treat clients 100 hours. Cost per hour?'),
            options: [tx('3', '3'), tx('30', '30'), tx('300', '300')],
            answer: 1,
            explain: tx('3.000 ÷ 100 = 30 por hora, antes de producto y beneficio.', '3,000 ÷ 100 = 30 per hour, before products and profit.'),
          },
        },
        {
          emoji: '🧮',
          props: ['➕'],
          anim: 'pulse',
          title: tx('La fórmula', 'The formula'),
          caption: tx(
            'Precio = (coste por hora × duración) + producto + margen de beneficio. Y después, los impuestos.',
            'Price = (cost per hour × duration) + products + profit margin. Then add tax.',
          ),
          question: {
            question: tx('Tratamiento de 1 h, coste 30/h, producto 5, margen 30 %. ¿Precio sin impuestos?', '1 h treatment, cost 30/h, products 5, 30% margin. Price before tax?'),
            options: [tx('35', '35'), tx('45,50', '45.50'), tx('60', '60')],
            answer: 1,
            explain: tx('(30 + 5) × 1,3 = 45,50.', '(30 + 5) × 1.3 = 45.50.'),
          },
        },
        {
          emoji: '💎',
          props: ['⭐'],
          anim: 'float',
          title: tx('Vende valor', 'Sell value'),
          caption: tx(
            'Si tu precio sale más alto que el de la competencia, comunica lo que te hace diferente: resultados, trato y experiencia.',
            'If your price is higher than competitors, communicate what makes you different: results, care and experience.',
          ),
        },
      ],
    },
    {
      kind: 'branch',
      title: tx('Simulación: tu Instagram no crece', "Simulation: your Instagram isn't growing"),
      start: 'a',
      nodes: {
        a: {
          who: '📱',
          text: tx(
            'Publicas 3 fotos de productos a la semana y casi nadie reserva por Instagram. ¿Qué cambias primero?',
            'You post 3 product photos a week and almost nobody books from Instagram. What do you change first?',
          ),
          choices: [
            {
              text: tx('Comprar seguidores', 'Buy followers'),
              end: 'bad',
              feedback: tx('Los seguidores falsos no reservan y hunden tu alcance real.', 'Fake followers do not book and they sink your real reach.'),
            },
            {
              text: tx('Publicar antes y después reales y reels del proceso', 'Post real before-and-afters and process reels'),
              next: 'b',
            },
          ],
        },
        b: {
          who: '📱',
          text: tx(
            'Tus reels tienen más visitas, pero la gente pregunta "¿precio?" por mensaje y no reserva.',
            'Your reels get more views, but people DM "price?" and never book.',
          ),
          choices: [
            {
              text: tx(
                'Poner un enlace de reserva en la biografía y contestar con precio + enlace + una pregunta',
                'Add a booking link to your bio and reply with price + link + a question',
              ),
              end: 'good',
              feedback: tx(
                'Eso es: facilita el siguiente paso y abre conversación ("¿Qué te gustaría mejorar?").',
                'That\'s it: make the next step easy and open a conversation ("What would you like to improve?").',
              ),
            },
            {
              text: tx('No contestar a los que preguntan precio', 'Ignore people who ask about price'),
              end: 'bad',
              feedback: tx('Cada mensaje es una clienta potencial: responde rápido y con enlace.', 'Every message is a potential client: reply fast, with a link.'),
            },
          ],
        },
      },
    },
    {
      kind: 'match',
      title: tx('Une cada acción con su objetivo', 'Match each action with its goal'),
      pairs: [
        { left: tx('Bono de 5 sesiones', '5-session package'), right: tx('Asegurar que vuelve', 'Make sure she comes back') },
        { left: tx('Mensaje a los 30 días', 'Message after 30 days'), right: tx('Recuperar clientas dormidas', 'Win back lapsed clients') },
        { left: tx('Programa "trae a una amiga"', 'Refer-a-friend scheme'), right: tx('Conseguir clientas nuevas', 'Get new clients') },
        { left: tx('Reseñas en Google', 'Google reviews'), right: tx('Aparecer en búsquedas locales', 'Show up in local search') },
      ],
    },
    {
      kind: 'quiz',
      question: tx('¿Qué cuesta más, normalmente?', 'What usually costs more?'),
      options: [
        tx('Conseguir una clienta nueva', 'Getting a new client'),
        tx('Que una clienta actual vuelva', 'Getting an existing client to return'),
        tx('Cuestan lo mismo', 'They cost the same'),
      ],
      answer: 0,
      explain: tx('Captar puede costar 5 veces más que fidelizar. Cuida a las que ya tienes.', 'Acquiring can cost five times more than retaining. Look after the ones you have.'),
    },
    {
      kind: 'order',
      title: tx('Ordena el plan de un mes', 'Put a one-month plan in order'),
      items: [
        tx('Calcular costes y revisar precios', 'Calculate costs and review prices'),
        tx('Elegir 1 tratamiento estrella del mes', 'Choose 1 star treatment of the month'),
        tx('Crear contenido: antes/después y reels', 'Create content: before/after and reels'),
        tx('Publicar con enlace de reserva', 'Post with a booking link'),
        tx('Pedir reseña tras cada cita', 'Ask for a review after every appointment'),
        tx('Medir reservas y ajustar', 'Measure bookings and adjust'),
      ],
    },
    {
      kind: 'case',
      title: tx('Caso: agenda vacía los martes', 'Case: empty Tuesdays'),
      story: tx(
        'Los martes y miércoles por la mañana casi no tienes citas, y el viernes está a reventar.',
        'Tuesday and Wednesday mornings are almost empty, and Friday is packed.',
      ),
      options: [
        {
          text: tx('Bajar todos los precios un 30 %', 'Cut all prices by 30%'),
          good: false,
          feedback: tx('Pierdes margen también en los días llenos.', 'You lose margin on the busy days too.'),
        },
        {
          text: tx('Crear una promoción solo para esas franjas y avisar a tus clientas', 'Create an offer just for those slots and tell your clients'),
          good: true,
          feedback: tx('Llenas huecos sin devaluar tus precios en hora punta.', 'You fill gaps without devaluing peak-time prices.'),
        },
        {
          text: tx('Cerrar esos días', 'Close on those days'),
          good: false,
          feedback: tx('Los costes fijos siguen ahí: mejor llenar esas horas.', 'Fixed costs are still there: better to fill those hours.'),
        },
      ],
    },
  ],
}
