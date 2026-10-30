import type { Course } from '../courses'
import { tx } from '../i18n'

export const sales: Course = {
  id: 'atencion-venta',
  emoji: '🤝',
  color: '#7a4f9a',
  title: tx('Atención al cliente y venta de tratamientos', 'Customer care and selling treatments'),
  summary: tx(
    'Consulta, recomendación y objeciones, con simulaciones de conversaciones reales.',
    'Consultation, recommendation and objections, with real conversation simulations.',
  ),
  minutes: 30,
  premium: { eur: 29, usd: 35 },
  freeSteps: 2,
  certificate: true,
  steps: [
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
  ],
}
