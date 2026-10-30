import type { Step } from '../courses'
import { tx } from '../i18n'
import { modular } from '../modules'

// Activities from the first version of the course, reused inside the modules.
const A: Step[] = [
  {
    kind: 'lab',
    lab: 'business',
    title: tx('Práctica guiada: precios y números del centro', 'Guided practice: pricing and salon numbers'),
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
]

export const business = modular(
  {
    id: 'gestion-marketing',
    emoji: '📈',
    color: '#6b5b2e',
    title: tx('Gestión y marketing de tu centro', 'Running and marketing your salon'),
    summary: tx(
      'Precios rentables, Instagram que trae clientas y fidelización.',
      'Profitable pricing, Instagram that brings clients, and loyalty.',
    ),
    premium: { eur: 39, usd: 45 },
    certificate: true,
    minutes: 100,
  },
  [
    {
      emoji: '🧮',
      title: tx('Los números de tu centro', 'Your salon’s numbers'),
      steps: [
        {
          kind: 'theory',
          emoji: '🧮',
          title: tx('Facturar no es ganar', 'Revenue isn’t profit'),
          blocks: [
            { t: 'p', text: tx('Muchos centros cierran con la agenda llena. ¿El motivo? Cobraban por debajo de lo que les costaba cada servicio. Antes de hacer marketing, hay que saber cuánto cuesta abrir la puerta cada día.', 'Plenty of salons close with a full diary. Why? They charged less than each service actually cost them. Before any marketing, you need to know what it costs to open the door each day.') },
            { t: 'pairs', title: tx('Tipos de coste', 'Types of cost'), items: [{ a: tx('Fijos', 'Fixed'), b: tx('Alquiler, cuota de autónomo, seguros, software, luz base. Los pagas aunque no venga nadie.', 'Rent, self-employment fees, insurance, software, base utilities. You pay them even if nobody comes.', 'Alquiler, impuestos fijos, seguros, software, luz base. Los pagas aunque no venga nadie.') }, { a: tx('Variables', 'Variable'), b: tx('Producto, desechables, comisiones de pago. Suben con cada servicio.', 'Product, disposables, card fees. They rise with every service.') }, { a: tx('Tu tiempo', 'Your time'), b: tx('El coste que más se olvida: también hay que pagarlo.', 'The most forgotten cost: it has to be paid too.') }] },
            { t: 'steps', title: tx('Calcula tu coste por hora', 'Work out your cost per hour'), items: [tx('Suma los costes fijos del mes, incluido tu sueldo.', 'Add up the month’s fixed costs, including your salary.'), tx('Divide entre las horas reales de cabina que vendes (no las que abres).', 'Divide by the treatment hours you actually sell (not opening hours).', 'Divide entre las horas reales de gabinete que vendes (no las que abres).'), tx('Precio mínimo = coste por hora × duración + producto.', 'Minimum price = cost per hour × duration + product.'), tx('Sobre eso, añade tu margen de beneficio.', 'Then add your profit margin on top.')] },
            { t: 'myth', claim: tx('Para tener clientas hay que ser la más barata de la zona.', 'To get clients you have to be the cheapest in the area.'), myth: true, truth: tx('Competir en precio atrae a quien se irá con la siguiente oferta. Se compite en confianza, resultados y experiencia.', 'Competing on price attracts people who’ll leave for the next deal. You compete on trust, results and experience.') },
            { t: 'fact', text: tx('El punto de equilibrio es la facturación mínima para cubrir todos los costes. Todo lo que entra por encima es beneficio.', 'Break-even is the minimum revenue that covers all costs. Everything above it is profit.') },
          ],
        },
        A[0],
        {
          kind: 'quiz',
          question: tx('¿Entre qué horas se reparte el coste fijo?', 'Which hours do you spread fixed costs over?'),
          options: [tx('Todas las horas que abres', 'Every hour you’re open'), tx('Las horas de servicio que realmente vendes', 'The treatment hours you actually sell'), tx('8 horas al día siempre', 'Always 8 hours a day')],
          answer: 1,
          explain: tx('Si usas horas de apertura, el coste por hora sale más bajo de lo real.', 'Using opening hours makes the cost per hour look lower than it really is.'),
        },
      ],
    },
    {
      emoji: '🗓️',
      title: tx('Precios y agenda', 'Pricing and the diary'),
      steps: [
        {
          kind: 'theory',
          emoji: '🗓️',
          title: tx('Una agenda que trabaja para ti', 'A diary that works for you'),
          blocks: [
            { t: 'key', title: tx('Estrategias de precio', 'Pricing strategies'), items: [tx('Carta corta: pocos servicios bien explicados venden más que una lista eterna.', 'A short menu: a few well-explained services sell more than an endless list.'), tx('Tres niveles (básico, completo, premium): la mayoría elige el del medio.', 'Three tiers (basic, full, premium): most people choose the middle one.'), tx('Bonos con un pequeño descuento a cambio de pago por adelantado.', 'Packages with a small discount in exchange for paying upfront.')] },
            { t: 'pairs', title: tx('Problemas de agenda y soluciones', 'Diary problems and fixes'), items: [{ a: tx('Huecos entre semana', 'Midweek gaps'), b: tx('Oferta solo para esas franjas.', 'An offer only for those slots.') }, { a: tx('Clientas que no vienen', 'No-shows'), b: tx('Recordatorio 24 h antes y señal para servicios largos.', 'Reminder 24 h before and a deposit for long services.') }, { a: tx('Citas que se alargan', 'Overrunning appointments'), b: tx('Tiempos reales por servicio y 10 minutos de margen.', 'Realistic times per service and a 10-minute buffer.') }] },
            { t: 'myth', claim: tx('Pedir señal para reservar espanta a las clientas.', 'Asking for a deposit scares clients off.'), myth: true, truth: tx('Explicado con naturalidad (“reservo tu hora en exclusiva”), las clientas serias lo entienden y las ausencias caen en picado.', 'Explained naturally (“I’m holding this time just for you”), serious clients understand and no-shows plummet.') },
            { t: 'fact', text: tx('Subir precios un 10 % suele hacerte perder menos clientas de las que crees, y compensa con creces. Avisa con antelación y explica qué mejora.', 'Raising prices by 10% usually loses fewer clients than you fear, and more than pays off. Give notice and explain what’s improved.') },
          ],
        },
        A[5],
        {
          kind: 'quiz',
          question: tx('Ofreces tres niveles de tratamiento facial. ¿Cuál suele elegir la mayoría?', 'You offer three facial tiers. Which do most people choose?'),
          options: [tx('El más barato', 'The cheapest'), tx('El del medio', 'The middle one'), tx('El más caro', 'The most expensive')],
          answer: 1,
          explain: tx('El premium hace que el intermedio parezca una buena compra.', 'The premium option makes the middle one look like good value.'),
        },
      ],
    },
    {
      emoji: '🎯',
      title: tx('Tu marca y tu clienta ideal', 'Your brand and ideal client'),
      steps: [
        {
          kind: 'theory',
          emoji: '🎯',
          title: tx('Si hablas para todas, no te escucha nadie', 'Talk to everyone and nobody listens'),
          blocks: [
            { t: 'p', text: tx('Tu marca no es tu logo: es lo que dicen de ti cuando no estás. Elegir a quién te diriges te permite hablar su idioma, elegir los servicios correctos y cobrar lo que vales.', 'Your brand isn’t your logo: it’s what people say about you when you’re not there. Choosing who you serve lets you speak their language, pick the right services and charge what you’re worth.') },
            { t: 'steps', title: tx('Define a tu clienta ideal', 'Define your ideal client'), items: [tx('¿Qué edad tiene y a qué se dedica?', 'How old is she and what does she do?'), tx('¿Qué problema quiere resolver (acné, falta de tiempo, una boda)?', 'What problem does she want solved (acne, no time, a wedding)?'), tx('¿Qué le frena a reservar?', 'What stops her from booking?'), tx('¿Dónde busca información: Instagram, Google, amigas?', 'Where does she look: Instagram, Google, friends?')] },
            { t: 'key', title: tx('Tu propuesta de valor en una frase', 'Your value proposition in one sentence'), items: [tx('Ayudo a [quién] a conseguir [resultado] gracias a [lo que te hace diferente].', 'I help [who] achieve [result] thanks to [what makes you different].'), tx('Ejemplo: “Ayudo a mujeres con piel sensible a tener una piel tranquila con tratamientos sin irritación”.', 'Example: “I help women with sensitive skin get calm skin with irritation-free treatments.”')] },
            { t: 'myth', claim: tx('Especializarse hace que pierdas clientas.', 'Specialising makes you lose clients.'), myth: true, truth: tx('Especializarse te convierte en la referencia de algo. Puedes seguir haciendo otros servicios, pero te recordarán por uno.', 'Specialising makes you the go-to for something. You can still offer other services, but you’ll be remembered for one.') },
          ],
        },
        {
          kind: 'match',
          title: tx('Une cada clienta con el mensaje que le llega', 'Match each client with the message that lands'),
          pairs: [
            { left: tx('Madre con poco tiempo', 'Busy mum'), right: tx('“Resultados visibles en 45 minutos”', '“Visible results in 45 minutes”') },
            { left: tx('Novia', 'Bride'), right: tx('“Tu piel perfecta para el gran día, con plan a 3 meses”', '“Perfect skin for the big day, with a 3-month plan”') },
            { left: tx('Adolescente con acné', 'Teen with acne'), right: tx('“Rutina sencilla y sin juicios”', '“A simple routine, no judgement”') },
            { left: tx('Mujer de 55 años', 'Woman aged 55'), right: tx('“Firmeza y luminosidad con técnicas suaves”', '“Firmness and glow with gentle techniques”') },
          ],
        },
        {
          kind: 'quiz',
          question: tx('¿Qué es tu marca?', 'What is your brand?'),
          options: [tx('Tu logo y tus colores', 'Your logo and colours'), tx('Lo que dicen de ti cuando no estás', 'What people say about you when you’re not there'), tx('Tu nombre comercial', 'Your business name')],
          answer: 1,
          explain: tx('El logo ayuda, pero la marca se construye con cada experiencia.', 'The logo helps, but the brand is built with every experience.'),
        },
      ],
    },
    {
      emoji: '📱',
      title: tx('Instagram y contenido', 'Instagram and content'),
      steps: [
        {
          kind: 'theory',
          emoji: '📱',
          title: tx('Contenido que llena la agenda', 'Content that fills the diary'),
          blocks: [
            { t: 'pairs', title: tx('Los 4 tipos de publicación', 'The 4 types of post'), items: [{ a: tx('Educar', 'Educate'), b: tx('Consejos y mitos: te posicionan como experta.', 'Tips and myths: position you as the expert.') }, { a: tx('Demostrar', 'Prove'), b: tx('Antes y después reales y reseñas.', 'Real before-and-afters and reviews.') }, { a: tx('Conectar', 'Connect'), b: tx('Tu equipo, tu día a día, por qué haces esto.', 'Your team, your day, why you do this.') }, { a: tx('Vender', 'Sell'), b: tx('Oferta clara con enlace de reserva.', 'A clear offer with a booking link.') }] },
            { t: 'key', title: tx('Reglas de oro', 'Golden rules'), items: [tx('Los reels del proceso llegan a gente nueva; los carruseles educan a tus seguidoras.', 'Process reels reach new people; carousels educate your followers.'), tx('Los primeros 2 segundos deciden si se quedan.', 'The first 2 seconds decide if they stay.'), tx('Mejor 3 publicaciones constantes por semana que 10 un mes y nada al siguiente.', 'Three steady posts a week beat ten one month and none the next.'), tx('Responde mensajes rápido: la primera que contesta, reserva.', 'Reply to messages fast: whoever answers first gets the booking.')] },
            { t: 'warn', text: tx('Antes de publicar una foto de una clienta, pide su consentimiento por escrito. Y nada de filtros en un antes y después: es engañoso.', 'Before posting a client’s photo, get her written consent. And no filters on before-and-afters: it’s misleading.') },
            { t: 'myth', claim: tx('Lo importante es tener muchos seguidores.', 'What matters is having lots of followers.'), myth: true, truth: tx('Para un centro local importan las seguidoras de tu zona que reservan. 800 vecinas valen más que 20.000 desconocidos.', 'For a local salon, what matters is local followers who book. 800 neighbours are worth more than 20,000 strangers.') },
          ],
        },
        A[1],
        {
          kind: 'quiz',
          question: tx('¿Qué formato llega mejor a gente que todavía no te sigue?', 'Which format best reaches people who don’t follow you yet?'),
          options: [tx('Reels cortos del proceso', 'Short process reels'), tx('Historias', 'Stories'), tx('Fotos del producto', 'Product photos')],
          answer: 0,
          explain: tx('Las historias las ven sobre todo quienes ya te siguen.', 'Stories are mostly seen by existing followers.'),
        },
      ],
    },
    {
      emoji: '💞',
      title: tx('Captar y fidelizar', 'Attract and retain'),
      steps: [
        {
          kind: 'theory',
          emoji: '💞',
          title: tx('Que vuelvan y que te recomienden', 'Bring them back and get them talking'),
          blocks: [
            { t: 'p', text: tx('Una clienta fiel que viene una vez al mes durante tres años vale mucho más que su primera cita. Por eso la experiencia empieza al reservar y termina con la siguiente cita ya puesta.', 'A loyal client who comes monthly for three years is worth far more than her first visit. That’s why the experience starts at booking and ends with the next appointment already in the diary.') },
            { t: 'steps', title: tx('El ciclo de la clienta', 'The client cycle'), items: [tx('Te encuentra: Google, Instagram o una amiga.', 'She finds you: Google, Instagram or a friend.'), tx('Reserva fácil, con confirmación y recordatorio.', 'Easy booking with confirmation and reminder.'), tx('Experiencia: diagnóstico, explicación y cuidado del detalle.', 'Experience: assessment, explanation and attention to detail.'), tx('Cierre: rutina en casa y próxima cita reservada.', 'Close: home routine and next appointment booked.'), tx('Seguimiento: mensaje a los días y reseña.', 'Follow-up: a message a few days later and a review.')] },
            { t: 'fact', text: tx('Las reseñas de Google son de lo que más pesa para aparecer en el mapa cuando alguien busca “centro de estética cerca de mí”.', 'Google reviews are one of the biggest factors in showing up on the map when someone searches “beauty salon near me”.') },
            { t: 'myth', claim: tx('Si la clienta está contenta, ya dejará una reseña sola.', 'If the client is happy, she’ll leave a review on her own.'), myth: true, truth: tx('Casi nadie lo hace sin que se lo pidas. Pídela en el momento de mayor satisfacción y mándale el enlace directo.', 'Hardly anyone does without being asked. Ask at her happiest moment and send the direct link.') },
          ],
        },
        A[2],
        A[3],
      ],
    },
    {
      emoji: '📋',
      title: tx('Plan, datos y legalidad', 'Planning, data and compliance'),
      steps: [
        {
          kind: 'theory',
          emoji: '📋',
          title: tx('Un negocio en orden', 'A business in order'),
          blocks: [
            { t: 'key', title: tx('Protección de datos', 'Data protection'), items: [tx('Las fichas de clientas tienen datos de salud: guárdalas con seguridad y solo el tiempo necesario.', 'Client records contain health data: keep them secure and only as long as needed.'), tx('Para enviar promociones necesitas su permiso expreso.', 'You need explicit permission to send promotions.'), tx('Consentimiento firmado para tratamientos y para usar fotos.', 'Signed consent for treatments and for using photos.')] },
            { t: 'pairs', title: tx('Indicadores para revisar cada mes', 'Numbers to check every month'), items: [{ a: tx('Ocupación', 'Occupancy'), b: tx('Horas vendidas ÷ horas disponibles.', 'Hours sold ÷ hours available.') }, { a: tx('Ticket medio', 'Average ticket'), b: tx('Facturación ÷ número de visitas.', 'Revenue ÷ number of visits.') }, { a: tx('Repetición', 'Return rate'), b: tx('Clientas nuevas que vuelven en 60 días.', 'New clients who come back within 60 days.') }, { a: tx('Venta de producto', 'Retail sales'), b: tx('Qué parte de la facturación viene de la tienda.', 'Share of revenue from retail.') }] },
            { t: 'myth', claim: tx('Los números son cosa de la gestoría.', 'Numbers are the accountant’s job.'), myth: true, truth: tx('La gestoría presenta impuestos; las decisiones las tomas tú. Diez minutos al mes con tus indicadores te dicen qué funciona.', 'The accountant files taxes; you make the decisions. Ten minutes a month with your numbers tells you what works.', 'El contador presenta impuestos; las decisiones las tomas tú. Diez minutos al mes con tus indicadores te dicen qué funciona.') },
            { t: 'warn', text: tx('La normativa cambia según el país (en España, el RGPD). Consulta siempre la de tu zona.', 'Rules vary by country (in the EU, GDPR). Always check your local regulations.', 'La normativa cambia según el país. Consulta siempre la ley de protección de datos de tu zona.') },
          ],
        },
        A[4],
        {
          kind: 'quiz',
          question: tx('Facturas 6.000 € con 200 visitas. ¿Cuál es tu ticket medio?', 'You take €6,000 from 200 visits. What’s your average ticket?'),
          options: [tx('20 €', '€20'), tx('30 €', '€30'), tx('60 €', '€60')],
          answer: 1,
          explain: tx('6.000 ÷ 200 = 30.', '6,000 ÷ 200 = 30.'),
        },
      ],
    },
  ],
  [
    { question: tx('¿Qué es un coste fijo?', 'What is a fixed cost?'), options: [tx('El que pagas aunque no venga nadie', 'One you pay even if nobody comes'), tx('El producto de cada servicio', 'Product for each service'), tx('La comisión de la tarjeta', 'The card fee')], answer: 0, explain: tx('Alquiler, seguros, software…', 'Rent, insurance, software…') },
    { question: tx('¿Qué coste se olvida con más frecuencia?', 'Which cost is most often forgotten?'), options: [tx('El alquiler', 'Rent'), tx('Tu propio tiempo y sueldo', 'Your own time and salary'), tx('La luz', 'Electricity')], answer: 1, explain: tx('Tu tiempo también se paga.', 'Your time must be paid too.') },
    { question: tx('¿Qué es el punto de equilibrio?', 'What is break-even?'), options: [tx('La facturación que cubre todos los costes', 'The revenue that covers all costs'), tx('El precio medio de la zona', 'The area’s average price'), tx('El día con más citas', 'The busiest day')], answer: 0, explain: tx('Por encima, todo es beneficio.', 'Above it, everything is profit.') },
    { question: tx('Agenda vacía los martes por la mañana. ¿Mejor opción?', 'Empty Tuesday mornings. Best option?'), options: [tx('Bajar todos los precios', 'Cut all prices'), tx('Oferta solo para esas franjas', 'An offer just for those slots'), tx('Cerrar ese día', 'Close that day')], answer: 1, explain: tx('Llenas huecos sin devaluar la hora punta.', 'Fill gaps without devaluing peak hours.') },
    { question: tx('¿Cómo reduces las clientas que no se presentan?', 'How do you reduce no-shows?'), options: [tx('Recordatorio 24 h antes y señal', 'A 24 h reminder and a deposit'), tx('Reservar doble', 'Double-booking'), tx('No hacer nada', 'Do nothing')], answer: 0, explain: tx('Compromiso y recordatorio.', 'Commitment plus a reminder.') },
    { question: tx('¿Por qué ofrecer tres niveles de precio?', 'Why offer three price tiers?'), options: [tx('Para confundir', 'To confuse'), tx('Porque la mayoría elige el intermedio', 'Most people choose the middle one'), tx('Por obligación legal', 'It’s legally required')], answer: 1, explain: tx('El premium da valor al intermedio.', 'Premium makes the middle look good value.') },
    { question: tx('¿Qué es una propuesta de valor?', 'What is a value proposition?'), options: [tx('Tu lista de precios', 'Your price list'), tx('A quién ayudas, a conseguir qué y por qué tú', 'Who you help, to achieve what, and why you'), tx('Tu horario', 'Your opening hours')], answer: 1, explain: tx('Una frase que te diferencia.', 'One sentence that sets you apart.') },
    { question: tx('Especializarte en un servicio…', 'Specialising in one service…'), options: [tx('Te hace perder clientas', 'Loses you clients'), tx('Te convierte en referencia', 'Makes you the go-to'), tx('Está prohibido', 'Is forbidden')], answer: 1, explain: tx('Te recordarán por algo concreto.', 'You’ll be remembered for something specific.') },
    { question: tx('¿Qué te trae más clientas locales?', 'What brings you more local clients?'), options: [tx('Comprar seguidores', 'Buying followers'), tx('Antes y después reales con enlace de reserva', 'Real before-and-afters with a booking link'), tx('Publicar solo productos', 'Only posting products')], answer: 1, explain: tx('Demuestras resultados y facilitas reservar.', 'You show results and make booking easy.') },
    { question: tx('¿Qué necesitas antes de publicar la foto de una clienta?', 'What do you need before posting a client’s photo?'), options: [tx('Nada', 'Nothing'), tx('Su consentimiento por escrito', 'Her written consent'), tx('Un filtro bonito', 'A nice filter')], answer: 1, explain: tx('Y sin filtros que engañen.', 'And no misleading filters.') },
    { question: tx('¿Qué suele costar más?', 'What usually costs more?'), options: [tx('Captar una clienta nueva', 'Getting a new client'), tx('Fidelizar a una actual', 'Keeping an existing one'), tx('Lo mismo', 'The same')], answer: 0, explain: tx('Hasta 5 veces más.', 'Up to five times more.') },
    { question: tx('¿Cuál es el mejor momento para cerrar la visita?', 'What’s the best way to close a visit?'), options: [tx('Cobrar y despedirse', 'Take payment and say goodbye'), tx('Rutina en casa y próxima cita reservada', 'Home routine and next appointment booked'), tx('Darle una tarjeta', 'Hand over a business card')], answer: 1, explain: tx('Así vuelve con seguridad.', 'That way she’s sure to return.') },
    { question: tx('¿Cómo consigues más reseñas en Google?', 'How do you get more Google reviews?'), options: [tx('Esperar a que salgan solas', 'Wait for them to appear'), tx('Pedirlas en el mejor momento con el enlace directo', 'Ask at the best moment with the direct link'), tx('Escribirlas tú', 'Write them yourself')], answer: 1, explain: tx('Casi nadie la deja sin que se lo pidas.', 'Hardly anyone leaves one unprompted.') },
    { question: tx('Ocupación es…', 'Occupancy is…'), options: [tx('Horas vendidas ÷ horas disponibles', 'Hours sold ÷ hours available'), tx('Clientas ÷ días', 'Clients ÷ days'), tx('Facturación ÷ visitas', 'Revenue ÷ visits')], answer: 0, explain: tx('Lo último es el ticket medio.', 'The last one is the average ticket.') },
    { question: tx('Para enviar promociones a una clienta necesitas…', 'To send promotions to a client you need…'), options: [tx('Su permiso expreso', 'Her explicit permission'), tx('Solo su teléfono', 'Just her phone number'), tx('Nada si ya vino una vez', 'Nothing if she’s been once')], answer: 0, explain: tx('Lo exige la protección de datos.', 'Data protection requires it.') },
  ],
)
