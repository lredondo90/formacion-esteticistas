import type { Step } from '../courses'
import { tx } from '../i18n'
import { modular } from '../modules'

// Activities from the first version of the course, reused inside the modules.
const A: Step[] = [
  {
    kind: 'lab',
    lab: 'sales',
    title: tx('Práctica guiada: una consulta que vende', 'Guided practice: a consultation that sells'),
  },
  {
    kind: 'branch',
    title: tx('Simulación: primera consulta', 'Simulation: first consultation'),
    start: 'a',
    nodes: {
      a: {
        who: '👩',
        text: tx('"Hola, venía a preguntar por las manchas de la cara..."', '"Hi, I wanted to ask about the dark spots on my face..."'),
        choices: [
          {
            text: tx('"Tenemos un bono de 8 peelings a 400. ¿Te lo apunto?"', '"We have an 8-peel package for 400. Shall I book you in?"'),
            end: 'bad',
            feedback: tx('Has vendido antes de escuchar. La clienta se siente presionada y se va.', 'You sold before listening. She feels pressured and leaves.'),
          },
          {
            text: tx('"Claro. Cuéntame, ¿desde cuándo las tienes y qué has probado?"', '"Of course. Tell me, how long have you had them and what have you tried?"'),
            next: 'b',
          },
        ],
      },
      b: {
        who: '👩',
        text: tx(
          '"Desde el verano. He probado cremas del súper, pero nada. Tengo una boda en tres meses."',
          '"Since the summer. I\'ve tried supermarket creams, but nothing. I have a wedding in three months."',
        ),
        choices: [
          {
            text: tx(
              '"Para la boda te propongo 4 sesiones de peeling cada 2 semanas y una rutina en casa con SPF. ¿Lo vemos?"',
              '"For the wedding I suggest 4 peel sessions every 2 weeks and a home routine with SPF. Shall we go through it?"',
            ),
            next: 'c',
          },
          {
            text: tx('"Las manchas no se quitan nunca, lo siento."', '"Dark spots never go away, sorry."'),
            end: 'bad',
            feedback: tx('Se pueden mejorar mucho. Le has quitado la esperanza y una clienta.', 'They can improve a lot. You took away her hope and lost a client.'),
          },
        ],
      },
      c: {
        who: '👩',
        text: tx('"Me encanta, pero ahora mismo no puedo pagarlo todo de golpe..."', '"I love it, but I can\'t pay for it all at once right now..."'),
        choices: [
          {
            text: tx('"Puedes pagar sesión a sesión, o el bono en dos plazos. ¿Qué te viene mejor?"', '"You can pay per session, or the package in two instalments. What works best for you?"'),
            end: 'good',
            feedback: tx(
              'Perfecto: escuchaste, propusiste un plan con objetivo y diste opciones. ¡Venta cerrada!',
              'Perfect: you listened, proposed a goal-based plan and gave options. Sale closed!',
            ),
          },
          {
            text: tx('"Entonces mejor vuelve cuando tengas dinero."', '"Then come back when you have the money."'),
            end: 'bad',
            feedback: tx('Siempre hay una alternativa: pago por sesión, plazos o un plan más corto.', 'There is always an alternative: pay per session, instalments or a shorter plan.'),
          },
        ],
      },
    },
  },
  {
    kind: 'order',
    title: tx('Ordena los pasos de una consulta', 'Put the consultation steps in order'),
    items: [
      tx('Recibir con calma y ofrecer algo de beber', 'Welcome calmly and offer a drink'),
      tx('Preguntas abiertas y ficha', 'Open questions and record card'),
      tx('Diagnóstico y explicación', 'Assessment and explanation'),
      tx('Proponer un plan con resultados', 'Propose a results-based plan'),
      tx('Resolver dudas y objeciones', 'Answer questions and objections'),
      tx('Reservar la siguiente cita', 'Book the next appointment'),
    ],
  },
  {
    kind: 'flashcards',
    title: tx('Frases que funcionan', 'Phrases that work'),
    cards: [
      { front: tx('"¿Qué te gustaría conseguir?"', '"What would you like to achieve?"'), back: tx('Descubre el objetivo real.', 'Reveals the real goal.') },
      { front: tx('"Por lo que me cuentas..."', '"From what you\'ve told me..."'), back: tx('Demuestra que escuchaste antes de recomendar.', 'Shows you listened before recommending.') },
      { front: tx('"¿Qué te frena?"', '"What\'s holding you back?"'), back: tx('Saca a la luz la objeción para resolverla.', 'Brings the objection into the open so you can solve it.') },
      { front: tx('"¿Te reservo ya la próxima?"', '"Shall I book your next one now?"'), back: tx('Cierra con un paso concreto.', 'Closes with a clear next step.') },
    ],
  },
  {
    kind: 'case',
    title: tx('Caso: clienta enfadada', 'Case: unhappy client'),
    story: tx(
      'Una clienta llama enfadada: dice que el tratamiento no le ha hecho nada y quiere que le devuelvas el dinero.',
      'A client calls, upset: she says the treatment did nothing and wants her money back.',
    ),
    options: [
      {
        text: tx('Discutir y explicar que ella no siguió los cuidados', 'Argue that she did not follow the aftercare'),
        good: false,
        feedback: tx('Aunque tengas razón, discutir escala el conflicto.', 'Even if you are right, arguing escalates the conflict.'),
      },
      {
        text: tx('Escuchar sin interrumpir, empatizar y proponer revisarla en cabina', 'Listen without interrupting, empathise and offer to see her in the salon', 'Escuchar sin interrumpir, empatizar y proponer revisarla en el gabinete'),
        good: true,
        feedback: tx(
          'Bien: primero emoción, después solución. Al verla puedes valorar resultados y ofrecer una sesión de ajuste.',
          'Good: emotion first, then solution. Seeing her lets you assess results and offer a follow-up session.',
        ),
      },
      {
        text: tx('Colgar y bloquear el número', 'Hang up and block the number'),
        good: false,
        feedback: tx('Una clienta enfadada bien atendida puede convertirse en tu mejor embajadora.', 'An unhappy client who is well handled can become your best ambassador.'),
      },
    ],
  },
]

export const sales = modular(
  {
    id: 'atencion-venta',
    emoji: '🤝',
    color: '#7a4f9a',
    title: tx('Atención al cliente y venta de tratamientos', 'Customer care and selling treatments'),
    summary: tx(
      'Consulta, recomendación y objeciones, con simulaciones de conversaciones reales.',
      'Consultation, recommendation and objections, with real conversation simulations.',
    ),
    premium: { eur: 29, usd: 35 },
    certificate: true,
    minutes: 100,
  },
  [
    {
      emoji: '🚪',
      title: tx('La experiencia empieza en la puerta', 'The experience starts at the door'),
      steps: [
        {
          kind: 'theory',
          emoji: '🚪',
          title: tx('Los primeros 7 segundos', 'The first 7 seconds'),
          blocks: [
            { t: 'p', text: tx('Vender en estética no es convencer a nadie: es ayudar a una persona a tomar una buena decisión sobre su piel. Y esa confianza empieza a construirse antes de tocarla, desde que te escribe o cruza la puerta.', 'Selling in beauty isn’t about convincing anyone: it’s helping someone make a good decision about their skin. That trust starts building before you ever touch her, from her first message or step through the door.') },
            { t: 'key', title: tx('Lo que la clienta nota sin decirlo', 'What the client notices without saying'), items: [tx('Que la saludes por su nombre y la mires a los ojos.', 'That you greet her by name and look her in the eye.'), tx('Orden, olor y temperatura del centro.', 'Tidiness, smell and temperature of the salon.'), tx('Puntualidad: si te retrasas, avisa antes de que llegue.', 'Punctuality: if you’re running late, tell her before she arrives.'), tx('Tu imagen: uniforme limpio, uñas y pelo cuidados.', 'Your image: clean uniform, groomed nails and hair.')] },
            { t: 'pairs', title: tx('Comunicación no verbal', 'Body language'), items: [{ a: tx('Brazos cruzados', 'Crossed arms'), b: tx('Distancia. Mejor manos visibles y abiertas.', 'Distance. Better visible, open hands.') }, { a: tx('Mirar el móvil', 'Checking your phone', 'Mirar el celular'), b: tx('“No me importas”. Guárdalo en cabina.', '“You don’t matter.” Put it away during treatments.', '“No me importas”. Guárdalo en el gabinete.') }, { a: tx('Sentarte a su altura', 'Sitting at her level'), b: tx('Conversación entre iguales, no un interrogatorio.', 'A conversation between equals, not an interrogation.') }] },
            { t: 'myth', claim: tx('Vender es de comerciales; una buena esteticista no necesita vender.', 'Selling is for salespeople; a good therapist doesn’t need to sell.'), myth: true, truth: tx('Si no recomiendas lo que la clienta necesita, se lo comprará en otro sitio o se quedará sin resultado. Recomendar bien es parte del tratamiento.', 'If you don’t recommend what she needs, she’ll buy it elsewhere or go without results. Recommending well is part of the treatment.') },
          ],
        },
        {
          kind: 'quiz',
          question: tx('Vas 15 minutos tarde con la clienta anterior. ¿Qué haces?', 'You’re 15 minutes behind with the previous client. What do you do?'),
          options: [tx('Nada, ya esperará', 'Nothing, she’ll wait'), tx('Avisarla antes de que llegue y ofrecerle alternativa', 'Let her know before she arrives and offer an alternative'), tx('Acortar su tratamiento sin decir nada', 'Shorten her treatment without saying')],
          answer: 1,
          explain: tx('Avisar a tiempo convierte un fallo en una muestra de respeto.', 'A timely heads-up turns a slip into a sign of respect.'),
        },
        {
          kind: 'quiz',
          question: tx('¿Qué transmite sentarte a su altura en la consulta?', 'What does sitting at her level during the consultation convey?'),
          options: [tx('Falta de profesionalidad', 'Unprofessionalism'), tx('Conversación entre iguales y cercanía', 'A conversation between equals, and warmth'), tx('Prisa', 'Hurry')],
          answer: 1,
          explain: tx('De pie y con una carpeta parece un interrogatorio.', 'Standing with a clipboard feels like an interrogation.'),
        },
      ],
    },
    {
      emoji: '👂',
      title: tx('Escuchar antes de recomendar', 'Listen before you recommend'),
      steps: [
        {
          kind: 'theory',
          emoji: '👂',
          title: tx('Dos orejas y una boca', 'Two ears, one mouth'),
          blocks: [
            { t: 'p', text: tx('La regla de oro de la consulta: la clienta habla el 70 % del tiempo. Cuanto mejor entiendas qué quiere y por qué, más fácil será proponerle algo que acepte.', 'The golden rule of a consultation: the client talks 70% of the time. The better you understand what she wants and why, the easier it is to propose something she’ll say yes to.') },
            { t: 'pairs', title: tx('Preguntas cerradas y abiertas', 'Closed vs open questions'), items: [{ a: tx('¿Usas crema?', 'Do you use cream?'), b: tx('Cerrada: “sí” y fin de la conversación.', 'Closed: “yes” and the conversation ends.') }, { a: tx('¿Cómo es tu rutina por la mañana?', 'What’s your morning routine like?'), b: tx('Abierta: te da toda la información.', 'Open: gives you the full picture.') }, { a: tx('¿Qué te gustaría ver distinto en tu piel?', 'What would you like to see change in your skin?'), b: tx('Descubre el objetivo y la emoción.', 'Reveals the goal and the emotion.') }] },
            { t: 'steps', title: tx('Escucha activa', 'Active listening'), items: [tx('No interrumpas ni completes sus frases.', 'Don’t interrupt or finish her sentences.'), tx('Resume lo que ha dicho: “Entonces lo que más te molesta es…”.', 'Summarise what she said: “So what bothers you most is…”.'), tx('Pregunta por el motivo: muchas veces hay una fecha (una boda, un viaje).', 'Ask why: often there’s a date (a wedding, a trip).'), tx('Anótalo en la ficha para la próxima visita.', 'Note it on her record for next time.')] },
            { t: 'myth', claim: tx('Cuanto más hables de tus tratamientos, más venderás.', 'The more you talk about your treatments, the more you’ll sell.'), myth: true, truth: tx('Hablar sin parar abruma. Una buena pregunta vende más que diez minutos de explicación.', 'Non-stop talking overwhelms. One good question sells more than ten minutes of explanation.') },
          ],
        },
        A[2],
        A[3],
      ],
    },
    {
      emoji: '🗺️',
      title: tx('Proponer un plan', 'Proposing a plan'),
      steps: [
        {
          kind: 'theory',
          emoji: '🗺️',
          title: tx('Beneficios, no características', 'Benefits, not features'),
          blocks: [
            { t: 'p', text: tx('A la clienta no le interesa la máquina, le interesa cómo se va a ver y sentir. Traduce siempre lo técnico a lo que gana ella.', 'The client doesn’t care about the machine; she cares how she’ll look and feel. Always translate the technical into what she gets.') },
            { t: 'pairs', title: tx('De característica a beneficio', 'From feature to benefit'), items: [{ a: tx('“Lleva ácido hialurónico”', '“It contains hyaluronic acid”'), b: tx('“Vas a notar la piel jugosa y sin tirantez”', '“Your skin will feel plump and comfortable”') }, { a: tx('“Son 6 sesiones”', '“It’s 6 sessions”'), b: tx('“En 3 meses llegas a la boda con la piel lista”', '“In 3 months you’ll arrive at the wedding with your skin ready”') }] },
            { t: 'steps', title: tx('Un plan que se acepta', 'A plan that gets a yes'), items: [tx('Recuerda su objetivo con sus palabras.', 'Restate her goal in her own words.'), tx('Propón un plan con número de sesiones, frecuencia y rutina en casa.', 'Propose a plan with number of sessions, frequency and home routine.'), tx('Sé honesta con lo que se puede conseguir.', 'Be honest about what can be achieved.'), tx('Da el precio con seguridad, sin disculparte, y opciones de pago.', 'State the price confidently, without apologising, and offer payment options.')] },
            { t: 'myth', claim: tx('Si prometes más resultados, venderás más.', 'Promise bigger results and you’ll sell more.'), myth: true, truth: tx('Vendes una vez y pierdes a la clienta para siempre. Promete un poco menos y entrega un poco más.', 'You sell once and lose the client forever. Under-promise and over-deliver.') },
          ],
        },
        A[0],
        {
          kind: 'match',
          title: tx('Traduce cada característica a beneficio', 'Turn each feature into a benefit'),
          pairs: [
            { left: tx('Radiofrecuencia', 'Radiofrequency'), right: tx('“Notarás el óvalo más definido”', '“You’ll see a more defined jawline”') },
            { left: tx('SPF 50 con color', 'Tinted SPF 50'), right: tx('“Protege y unifica en un solo paso”', '“Protects and evens tone in one step”') },
            { left: tx('Bono de 6 sesiones', '6-session package'), right: tx('“Llegas a tu objetivo con un plan claro”', '“You reach your goal with a clear plan”') },
            { left: tx('Limpiador sin perfume', 'Fragrance-free cleanser'), right: tx('“Tu piel sensible no se va a irritar”', '“Your sensitive skin won’t flare up”') },
          ],
        },
      ],
    },
    {
      emoji: '🤝',
      title: tx('Objeciones y cierre', 'Objections and closing'),
      steps: [
        {
          kind: 'theory',
          emoji: '🤝',
          title: tx('Un “no” suele ser un “todavía no”', 'A “no” is often a “not yet”'),
          blocks: [
            { t: 'p', text: tx('Una objeción no es un rechazo: es una duda que la clienta te deja resolver. Si no dice nada y se va “a pensárselo”, eso sí es una venta perdida.', 'An objection isn’t a rejection: it’s a doubt she’s letting you resolve. If she says nothing and leaves “to think about it”, that’s the lost sale.') },
            { t: 'steps', title: tx('Método para cualquier objeción', 'A method for any objection'), items: [tx('Escucha hasta el final.', 'Listen to the end.'), tx('Valida: “Es normal que te lo plantees”.', 'Validate: “It makes sense to think about that.”'), tx('Pregunta para entender: “¿Qué es lo que más te preocupa?”.', 'Ask to understand: “What worries you most?”'), tx('Responde a esa preocupación concreta.', 'Answer that specific concern.'), tx('Propón un siguiente paso pequeño.', 'Propose a small next step.')] },
            { t: 'pairs', title: tx('Objeciones típicas', 'Typical objections'), items: [{ a: tx('“Es caro”', '“It’s expensive”'), b: tx('Pago por sesión, plazos o un plan más corto.', 'Pay per session, instalments or a shorter plan.') }, { a: tx('“No tengo tiempo”', '“I don’t have time”'), b: tx('Sesiones express o en su franja preferida.', 'Express sessions or her preferred time slot.') }, { a: tx('“Me da miedo que duela”', '“I’m scared it’ll hurt”'), b: tx('Explica qué sentirá y ofrece una prueba.', 'Explain what she’ll feel and offer a patch or trial.') }] },
            { t: 'myth', claim: tx('Si pregunta el precio es que no tiene interés.', 'If she asks the price, she isn’t interested.'), myth: true, truth: tx('Preguntar el precio es una señal de compra: se está imaginando haciéndolo.', 'Asking the price is a buying signal: she’s picturing herself doing it.') },
          ],
        },
        A[1],
        {
          kind: 'quiz',
          question: tx('La clienta dice “me lo pienso”. ¿Qué respondes?', 'The client says “I’ll think about it”. What do you say?'),
          options: [tx('“Vale, ya me dirás”', '“OK, let me know”'), tx('“Claro. ¿Hay algo que te genere dudas y que pueda aclararte?”', '“Of course. Is there anything I can clear up for you?”'), tx('“Si no reservas hoy pierdes la oferta”', '“If you don’t book today you lose the offer”')],
          answer: 1,
          explain: tx('Sacas a la luz la duda real sin presionar.', 'You bring out the real doubt without pressure.'),
        },
      ],
    },
    {
      emoji: '🛍️',
      title: tx('Recomendar producto para casa', 'Recommending home care'),
      steps: [
        {
          kind: 'theory',
          emoji: '🛍️',
          title: tx('La cabina dura una hora; la casa, todo el mes', 'The treatment lasts an hour; home care, all month', 'El gabinete dura una hora; la casa, todo el mes'),
          blocks: [
            { t: 'p', text: tx('Sin una rutina en casa, el resultado del tratamiento dura poco y la clienta piensa que no funciona. Recomendar producto protege tu trabajo.', 'Without a home routine, results fade fast and the client thinks the treatment doesn’t work. Recommending products protects your work.') },
            { t: 'key', title: tx('Cómo recomendar sin parecer vendedora', 'How to recommend without sounding salesy'), items: [tx('Usa en el tratamiento los productos que vas a recomendar y deja que los sienta.', 'Use the products you’ll recommend during the treatment and let her feel them.'), tx('Pregunta qué usa ahora y aprovecha lo que le funcione.', 'Ask what she uses now and keep what works.'), tx('Empieza por 1–3 productos clave, no por una rutina de 8.', 'Start with 1–3 key products, not an 8-step routine.'), tx('Apunta la rutina en una tarjeta para que no se le olvide.', 'Write the routine on a card so she remembers.')] },
            { t: 'myth', claim: tx('Si la clienta no compra el producto hoy, la venta está perdida.', 'If she doesn’t buy today, the sale is lost.'), myth: true, truth: tx('Con la rutina apuntada y un mensaje de seguimiento, muchas vuelven a por él. La confianza vende a medio plazo.', 'With the routine written down and a follow-up message, many come back for it. Trust sells over time.') },
            { t: 'fact', text: tx('Una buena referencia: que alrededor de un 20 % de la facturación venga de producto. Si es mucho menos, tus clientas probablemente compran en otra parte.', 'A good benchmark: about 20% of revenue from retail. Much less and your clients are probably buying elsewhere.') },
          ],
        },
        {
          kind: 'quiz',
          question: tx('¿Cuál es la mejor forma de presentar un producto para casa?', 'What’s the best way to introduce a home-care product?'),
          options: [tx('Enseñarle la estantería al final', 'Show her the shelf at the end'), tx('Usarlo en el tratamiento y explicarle qué notará', 'Use it during the treatment and explain what she’ll notice'), tx('Ponerlo en la factura directamente', 'Add it straight to the bill')],
          answer: 1,
          explain: tx('Si lo siente en su piel, la recomendación se vuelve natural.', 'Once she feels it on her skin, the recommendation feels natural.'),
        },
        {
          kind: 'quiz',
          question: tx('Clienta nueva con poco presupuesto. ¿Cuántos productos le recomiendas?', 'New client on a tight budget. How many products do you recommend?'),
          options: [tx('La rutina completa de 8 pasos', 'The full 8-step routine'), tx('1–3 productos clave, empezando por el SPF o el limpiador', '1–3 key products, starting with SPF or cleanser'), tx('Ninguno', 'None')],
          answer: 1,
          explain: tx('Lo esencial primero; se amplía cuando vea resultados.', 'Essentials first; build up once she sees results.'),
        },
      ],
    },
    {
      emoji: '🧯',
      title: tx('Quejas y situaciones difíciles', 'Complaints and tough moments'),
      steps: [
        {
          kind: 'theory',
          emoji: '🧯',
          title: tx('Primero la emoción, después la solución', 'Emotion first, then the solution'),
          blocks: [
            { t: 'p', text: tx('Toda profesional recibe quejas. Lo que marca la diferencia es cómo responde: una queja bien resuelta crea una clienta más fiel que una que nunca tuvo problemas.', 'Every professional gets complaints. What matters is the response: a well-handled complaint creates a more loyal client than one who never had a problem.') },
            { t: 'steps', title: tx('Cómo atender una queja', 'How to handle a complaint'), items: [tx('Escucha sin interrumpir ni justificarte.', 'Listen without interrupting or justifying.'), tx('Agradece que te lo cuente y empatiza: “Entiendo que te sientas así”.', 'Thank her for telling you and empathise: “I understand why you feel that way.”'), tx('Revisa en persona antes de decidir.', 'Check in person before deciding.'), tx('Propón una solución concreta y cumple.', 'Offer a specific solution and follow through.'), tx('Apunta qué pasó para que no se repita.', 'Note what happened so it doesn’t happen again.')] },
            { t: 'pairs', title: tx('Situaciones y respuesta', 'Situations and responses'), items: [{ a: tx('Reseña negativa', 'Negative review'), b: tx('Responde en público con calma y ofrece hablar en privado.', 'Reply publicly and calmly and offer to talk privately.') }, { a: tx('Reacción en la piel', 'Skin reaction'), b: tx('Valora, documenta con fotos y deriva al médico si hace falta.', 'Assess, document with photos and refer to a doctor if needed.') }, { a: tx('Clienta que pide descuentos siempre', 'Client who always asks for discounts'), b: tx('Ofrece valor (bono, fidelidad) sin rebajar tu precio base.', 'Offer value (packages, loyalty) without cutting your base price.') }] },
            { t: 'myth', claim: tx('El cliente siempre tiene razón.', 'The customer is always right.'), myth: true, truth: tx('No siempre tiene razón, pero siempre merece respeto y ser escuchada. Puedes poner límites con amabilidad.', 'She isn’t always right, but she always deserves respect and to be heard. You can set boundaries kindly.') },
          ],
        },
        A[4],
        {
          kind: 'quiz',
          question: tx('Te dejan una reseña de una estrella. ¿Qué haces?', 'You get a one-star review. What do you do?'),
          options: [tx('Responder con calma y ofrecer hablar en privado', 'Reply calmly and offer to talk privately'), tx('Contestar explicando que miente', 'Reply saying she’s lying'), tx('Ignorarla', 'Ignore it')],
          answer: 0,
          explain: tx('Quien lee la respuesta juzga más tu reacción que la queja.', 'People reading judge your response more than the complaint.'),
        },
      ],
    },
  ],
  [
    { question: tx('Vender bien en estética es…', 'Selling well in beauty is…'), options: [tx('Convencer a toda costa', 'Convincing at all costs'), tx('Ayudar a tomar una buena decisión', 'Helping someone make a good decision'), tx('Ofrecer siempre descuentos', 'Always offering discounts')], answer: 1, explain: tx('Recomendar bien es parte del tratamiento.', 'Recommending well is part of the treatment.') },
    { question: tx('¿Qué porcentaje del tiempo debería hablar la clienta en la consulta?', 'How much of the consultation should the client be talking?'), options: [tx('Alrededor del 30 %', 'About 30%'), tx('Alrededor del 70 %', 'About 70%'), tx('Nada', 'None')], answer: 1, explain: tx('Escuchar te da la información para proponer.', 'Listening gives you what you need to propose.') },
    { question: tx('¿Cuál es una pregunta abierta?', 'Which is an open question?'), options: [tx('¿Usas protector?', 'Do you use sunscreen?'), tx('¿Cómo es tu rutina de mañana?', 'What’s your morning routine like?'), tx('¿Tienes la piel grasa?', 'Is your skin oily?')], answer: 1, explain: tx('No se puede responder con sí o no.', 'It can’t be answered yes or no.') },
    { question: tx('¿Qué es la escucha activa?', 'What is active listening?'), options: [tx('Asentir mientras piensas en otra cosa', 'Nodding while thinking of something else'), tx('No interrumpir y resumir lo que ha dicho', 'Not interrupting and summarising what she said'), tx('Tomar notas sin mirarla', 'Taking notes without looking at her')], answer: 1, explain: tx('Demuestra que has entendido.', 'It shows you understood.') },
    { question: tx('“Vas a notar la piel jugosa” es…', '“Your skin will feel plump” is…'), options: [tx('Una característica', 'A feature'), tx('Un beneficio', 'A benefit'), tx('Una objeción', 'An objection')], answer: 1, explain: tx('Habla de lo que gana ella.', 'It’s about what she gains.') },
    { question: tx('¿Cómo das el precio?', 'How do you state the price?'), options: [tx('Disculpándote', 'Apologetically'), tx('Con seguridad y con opciones de pago', 'Confidently, with payment options'), tx('Lo más tarde posible', 'As late as possible')], answer: 1, explain: tx('Si dudas tú, duda ella.', 'If you hesitate, so will she.') },
    { question: tx('Prometer más resultados de los reales…', 'Promising more than you can deliver…'), options: [tx('Vende más a largo plazo', 'Sells more long term'), tx('Hace perder a la clienta', 'Loses you the client'), tx('Es obligatorio', 'Is mandatory')], answer: 1, explain: tx('Promete un poco menos y entrega un poco más.', 'Under-promise, over-deliver.') },
    { question: tx('¿Qué es una objeción?', 'What is an objection?'), options: [tx('Un rechazo definitivo', 'A final rejection'), tx('Una duda que puedes resolver', 'A doubt you can resolve'), tx('Una queja', 'A complaint')], answer: 1, explain: tx('Es una oportunidad de aclarar.', 'It’s a chance to clarify.') },
    { question: tx('Ante “es caro”, ¿qué ofreces?', 'When she says “it’s expensive”, what do you offer?'), options: [tx('Un 50 % de descuento', 'A 50% discount'), tx('Pago por sesión, plazos o un plan más corto', 'Pay per session, instalments or a shorter plan'), tx('Nada', 'Nothing')], answer: 1, explain: tx('Opciones sin devaluar el servicio.', 'Options without devaluing the service.') },
    { question: tx('Que la clienta pregunte el precio indica…', 'A client asking the price signals…'), options: [tx('Falta de interés', 'Lack of interest'), tx('Interés de compra', 'Buying interest'), tx('Que quiere irse', 'She wants to leave')], answer: 1, explain: tx('Se está imaginando haciéndolo.', 'She’s picturing herself doing it.') },
    { question: tx('¿Cuál es el mejor cierre de una consulta?', 'What’s the best way to close a consultation?'), options: [tx('“Ya me dirás”', '“Let me know”'), tx('“¿Te reservo ya la próxima?”', '“Shall I book your next one now?”'), tx('“Oferta solo hoy”', '“Today only”')], answer: 1, explain: tx('Un paso concreto y sin presión.', 'A clear step, no pressure.') },
    { question: tx('¿Por qué recomendar producto para casa?', 'Why recommend home care?'), options: [tx('Solo para facturar más', 'Just to earn more'), tx('Para que el resultado dure y proteger tu trabajo', 'So results last and your work is protected'), tx('Porque es obligatorio', 'Because it’s required')], answer: 1, explain: tx('Sin rutina, el resultado se pierde.', 'Without a routine, results fade.') },
    { question: tx('Ante una queja, ¿qué va primero?', 'With a complaint, what comes first?'), options: [tx('La solución', 'The solution'), tx('Escuchar y empatizar', 'Listening and empathising'), tx('Explicar por qué no es culpa tuya', 'Explaining why it isn’t your fault')], answer: 1, explain: tx('Primero emoción, después solución.', 'Emotion first, then solution.') },
    { question: tx('Una clienta tiene una reacción en la piel. ¿Qué haces?', 'A client has a skin reaction. What do you do?'), options: [tx('Decirle que es normal sin verla', 'Tell her it’s normal without seeing her'), tx('Valorar, documentar con fotos y derivar si hace falta', 'Assess, photograph and refer if needed'), tx('Nada', 'Nothing')], answer: 1, explain: tx('Seguridad y registro ante todo.', 'Safety and records first.') },
    { question: tx('¿Cómo respondes a una reseña negativa?', 'How do you respond to a negative review?'), options: [tx('Con calma, en público, y ofreciendo hablar en privado', 'Calmly, publicly, offering to talk privately'), tx('Pidiendo que la borre', 'Asking her to delete it'), tx('Con otra reseña falsa', 'With a fake review')], answer: 0, explain: tx('Tu respuesta la leen las futuras clientas.', 'Future clients read your reply.') },
  ],
)
