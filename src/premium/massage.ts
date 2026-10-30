import type { Step } from '../courses'
import { tx } from '../i18n'
import { modular } from '../modules'

// Activities from the first version of the course, reused inside the modules.
const A: Step[] = [
  {
    kind: 'lab',
    lab: 'massage',
    title: tx('Práctica guiada: drenaje linfático facial', 'Guided practice: facial lymphatic drainage'),
  },
  {
    kind: 'hotspot',
    title: tx('Localiza los grupos de ganglios', 'Find the lymph node groups'),
    figure: 'body',
    spots: [
      { x: 56, y: 21, label: tx('Clavícula (terminus)', 'Collarbone (terminus)') },
      { x: 32, y: 28, label: tx('Axila', 'Armpit') },
      { x: 41, y: 56, label: tx('Ingle', 'Groin') },
      { x: 57, y: 76, label: tx('Rodilla (hueco poplíteo)', 'Back of the knee') },
    ],
    tasks: [
      {
        prompt: tx('¿Por dónde empieza siempre un drenaje? Toca el punto.', 'Where does drainage always begin? Tap the spot.'),
        spot: 0,
        explain: tx('En el terminus, sobre la clavícula, la linfa vuelve a la sangre.', 'At the terminus, above the collarbone, lymph returns to the blood.'),
      },
      {
        prompt: tx('Drenaje de brazos: ¿a qué ganglios llevas la linfa?', 'Arm drainage: which nodes do you move lymph to?'),
        spot: 1,
        explain: tx('El brazo drena a los ganglios axilares.', 'The arm drains into the axillary nodes.'),
      },
      {
        prompt: tx('Drenaje de piernas: ¿qué ganglios vacías antes de trabajar el muslo?', 'Leg drainage: which nodes do you empty before working the thigh?'),
        spot: 2,
        explain: tx('Primero la ingle, después el muslo, la rodilla y la pantorrilla.', 'Groin first, then thigh, knee and calf.'),
      },
    ],
  },
  {
    kind: 'match',
    title: tx('Une cada maniobra con su objetivo', 'Match each stroke with its purpose'),
    pairs: [
      { left: tx('Effleurage (roce)', 'Effleurage'), right: tx('Calentar y relajar al empezar', 'Warm up and relax at the start') },
      { left: tx('Amasamiento', 'Kneading'), right: tx('Trabajar el músculo y la grasa', 'Work muscle and fat tissue') },
      { left: tx('Bombeo', 'Pumping'), right: tx('Mover la linfa en el drenaje', 'Move lymph in drainage') },
      { left: tx('Pinza rodada (palpar-rodar)', 'Skin rolling'), right: tx('Moldear y tratar la celulitis', 'Sculpt and treat cellulite') },
    ],
  },
  {
    kind: 'case',
    title: tx('Caso: pierna hinchada', 'Case: swollen leg'),
    story: tx(
      'Rosa, 58 años, quiere drenaje porque una pierna se le ha hinchado de golpe, está caliente y le duele la pantorrilla.',
      'Rose, 58, wants drainage because one leg suddenly swelled up, feels warm and her calf hurts.',
    ),
    options: [
      {
        text: tx('Hacer el drenaje con más presión en la pantorrilla', 'Do the drainage with more pressure on the calf'),
        good: false,
        feedback: tx('Podría ser una trombosis: el masaje podría soltar un coágulo.', 'It could be a thrombosis: massage could dislodge a clot.'),
      },
      {
        text: tx('No tratar y pedirle que vaya al médico hoy mismo', 'Do not treat and ask her to see a doctor today'),
        good: true,
        feedback: tx(
          'Correcto. Hinchazón en una sola pierna, calor y dolor son señales de alarma de trombosis venosa.',
          'Correct. Swelling in one leg, heat and pain are warning signs of deep vein thrombosis.',
        ),
      },
      {
        text: tx('Hacer solo masaje relajante en la espalda', 'Just do a relaxing back massage'),
        good: false,
        feedback: tx('Lo urgente es que la vea un médico: no lo retrases.', 'The urgent thing is for a doctor to see her: do not delay it.'),
      },
    ],
  },
  {
    kind: 'quiz',
    question: tx('¿Cuál NO es una contraindicación del drenaje linfático?', 'Which is NOT a contraindication for lymphatic drainage?'),
    options: [
      tx('Insuficiencia cardiaca', 'Heart failure'),
      tx('Infección aguda con fiebre', 'Acute infection with fever'),
      tx('Retención de líquidos leve', 'Mild fluid retention'),
      tx('Trombosis', 'Thrombosis'),
    ],
    answer: 2,
    explain: tx('La retención leve es justo una indicación. Las otras tres son contraindicaciones.', 'Mild retention is an indication. The other three are contraindications.'),
  },
]

export const massage = modular(
  {
    id: 'masaje-drenaje',
    emoji: '💆',
    color: '#3f8f5f',
    title: tx('Masaje y drenaje linfático', 'Massage and lymphatic drainage'),
    summary: tx(
      'Drenaje manual, masaje corporal y moldeador: maniobras, presión y contraindicaciones.',
      'Manual lymphatic drainage, body and sculpting massage: strokes, pressure and contraindications.',
    ),
    premium: { eur: 49, usd: 55 },
    certificate: true,
    minutes: 120,
  },
  [
    {
      emoji: '💆',
      title: tx('Fundamentos del masaje', 'Massage fundamentals'),
      steps: [
        {
          kind: 'theory',
          emoji: '💆',
          title: tx('Mucho más que relajar', 'Much more than relaxing'),
          blocks: [
            { t: 'p', text: tx('El masaje mejora la circulación, suelta la tensión muscular, calma el sistema nervioso y hace que la clienta se sienta cuidada. Bien hecho, es uno de los servicios que más fideliza.', 'Massage improves circulation, releases muscle tension, calms the nervous system and makes the client feel cared for. Done well, it is one of the most loyalty-building services.') },
            { t: 'key', title: tx('Antes de poner las manos', 'Before you lay hands on'), items: [tx('Cabina templada (22–24 °C), luz tenue y música suave.', 'Warm room (22–24 °C), soft light and gentle music.', 'Gabinete templado (22–24 °C), luz tenue y música suave.'), tx('Pregunta por lesiones, operaciones y zonas que no quiera que toques.', 'Ask about injuries, surgery and areas she doesn’t want touched.'), tx('Cubre con toallas todo lo que no estés trabajando.', 'Drape everything you are not working on.'), tx('Manos calientes y uñas cortas.', 'Warm hands and short nails.')] },
            { t: 'myth', claim: tx('Si duele, es que el masaje está funcionando.', 'If it hurts, the massage is working.'), myth: true, truth: tx('El dolor hace que el músculo se defienda y se contraiga. La presión correcta es firme pero cómoda: pregunta en una escala del 1 al 10.', 'Pain makes the muscle guard and tighten. The right pressure is firm but comfortable: ask on a 1-to-10 scale.') },
            { t: 'key', title: tx('Cuida tu cuerpo', 'Look after your body'), items: [tx('Camilla a la altura de tus muñecas con los brazos estirados.', 'Couch at wrist height with your arms hanging.'), tx('Usa el peso del cuerpo, no la fuerza de los brazos.', 'Use your body weight, not arm strength.'), tx('Pies separados y rodillas algo flexionadas.', 'Feet apart, knees slightly bent.')] },
            { t: 'fact', text: tx('Las esteticistas que no cuidan la postura acumulan lesiones de muñeca y espalda. Un buen gesto técnico alarga tu carrera.', 'Therapists who neglect posture pile up wrist and back injuries. Good technique lengthens your career.') },
          ],
        },
        A[2],
        {
          kind: 'quiz',
          question: tx('¿A qué altura debe estar la camilla?', 'What height should the couch be?'),
          options: [tx('A la altura de la cintura', 'Waist height'), tx('A la altura de las muñecas con los brazos estirados', 'Wrist height with arms hanging'), tx('Lo más baja posible', 'As low as possible')],
          answer: 1,
          explain: tx('Así trabajas con el peso del cuerpo sin forzar la espalda.', 'That way you work with body weight without straining your back.'),
        },
      ],
    },
    {
      emoji: '✋',
      title: tx('Maniobras del masaje clásico', 'Classic massage strokes'),
      steps: [
        {
          kind: 'theory',
          emoji: '✋',
          title: tx('El abecedario de tus manos', 'The alphabet of your hands'),
          blocks: [
            { t: 'pairs', title: tx('Las cinco maniobras básicas', 'The five basic strokes'), items: [{ a: tx('Roce (effleurage)', 'Effleurage'), b: tx('Deslizamientos amplios. Abre y cierra la sesión.', 'Long gliding strokes. Opens and closes the session.') }, { a: tx('Amasamiento', 'Kneading (petrissage)'), b: tx('Coger y soltar el músculo. Libera tensión.', 'Lift and release the muscle. Releases tension.') }, { a: tx('Fricción', 'Friction'), b: tx('Pequeños círculos en un punto. Contracturas.', 'Small circles on one spot. Knots.') }, { a: tx('Percusión', 'Tapotement'), b: tx('Golpeteos rápidos y ligeros. Estimula.', 'Quick, light tapping. Stimulates.') }, { a: tx('Vibración', 'Vibration'), b: tx('Temblor rápido de la mano. Relaja o activa.', 'Rapid trembling of the hand. Relaxes or activates.') }] },
            { t: 'p', text: tx('Toda sesión sigue el mismo arco: empezar suave, profundizar poco a poco y terminar otra vez suave. El cuerpo necesita entrar en confianza antes de soltar.', 'Every session follows the same arc: start gently, deepen gradually and finish gently again. The body needs to feel safe before it lets go.') },
            { t: 'myth', claim: tx('Da igual hacia dónde deslices las manos.', 'It doesn’t matter which way your hands glide.'), myth: true, truth: tx('En las extremidades se trabaja hacia el corazón para ayudar al retorno venoso, sobre todo con presión.', 'On the limbs you work towards the heart to help venous return, especially with pressure.') },
            { t: 'warn', text: tx('Nunca presiones sobre la columna, las rodillas por detrás, varices o zonas con hematomas.', 'Never press on the spine, the back of the knees, varicose veins or bruised areas.') },
            { t: 'fact', text: tx('No despegues nunca las dos manos a la vez: mantener el contacto da sensación de continuidad y seguridad.', 'Never lift both hands at once: keeping contact gives a sense of continuity and safety.') },
          ],
        },
        {
          kind: 'order',
          title: tx('Ordena una sesión de espalda', 'Put a back massage in order'),
          items: [tx('Roce amplio para extender el aceite', 'Broad effleurage to spread the oil'), tx('Amasamiento de trapecios y lumbares', 'Kneading of traps and lower back'), tx('Fricción en contracturas', 'Friction on knots'), tx('Percusión ligera', 'Light tapotement'), tx('Roce lento para cerrar', 'Slow effleurage to close')],
        },
        {
          kind: 'quiz',
          question: tx('¿Qué maniobra usas para trabajar una contractura localizada?', 'Which stroke do you use for a localised knot?'),
          options: [tx('Percusión', 'Tapotement'), tx('Fricción', 'Friction'), tx('Roce superficial', 'Light effleurage')],
          answer: 1,
          explain: tx('La fricción concentra el trabajo en un punto concreto.', 'Friction focuses the work on one spot.'),
        },
      ],
    },
    {
      emoji: '🫧',
      title: tx('El sistema linfático', 'The lymphatic system'),
      steps: [
        {
          kind: 'theory',
          emoji: '🫧',
          title: tx('El sistema de limpieza del cuerpo', 'The body’s cleaning system'),
          blocks: [
            { t: 'p', text: tx('La linfa es el líquido que recoge los restos y el exceso de agua entre las células. Viaja por vasos linfáticos hasta los ganglios, que la filtran, y vuelve a la sangre cerca de la clavícula.', 'Lymph is the fluid that collects waste and excess water between cells. It travels through lymph vessels to the nodes, which filter it, and returns to the blood near the collarbone.') },
            { t: 'myth', claim: tx('La linfa la bombea el corazón, como la sangre.', 'The heart pumps lymph, like blood.'), myth: true, truth: tx('La linfa no tiene bomba: se mueve con la respiración, la contracción de los músculos y… el drenaje linfático manual.', 'Lymph has no pump: it moves with breathing, muscle contraction and… manual lymphatic drainage.') },
            { t: 'pairs', title: tx('Grupos de ganglios clave', 'Key node groups'), items: [{ a: tx('Supraclaviculares (terminus)', 'Supraclavicular (terminus)'), b: tx('Desagüe final de todo el cuerpo. Siempre se abre primero.', 'Final drain for the whole body. Always opened first.') }, { a: tx('Cervicales', 'Cervical'), b: tx('Cuello: recogen la cabeza y la cara.', 'Neck: drain the head and face.') }, { a: tx('Axilares', 'Axillary'), b: tx('Brazos, pecho y parte alta de la espalda.', 'Arms, chest and upper back.') }, { a: tx('Inguinales', 'Inguinal'), b: tx('Piernas, glúteos y abdomen bajo.', 'Legs, buttocks and lower abdomen.') }, { a: tx('Poplíteos', 'Popliteal'), b: tx('Detrás de la rodilla: piernas desde abajo.', 'Behind the knee: lower legs.') }] },
            { t: 'key', title: tx('Los principios del drenaje (método Vodder)', 'Drainage principles (Vodder method)'), items: [tx('Presión muy suave: movemos piel, no músculo.', 'Very light pressure: we move skin, not muscle.'), tx('Ritmo lento y repetitivo.', 'Slow, repetitive rhythm.'), tx('Primero se vacían los ganglios, luego se drena hacia ellos.', 'First empty the nodes, then drain towards them.'), tx('Nunca produce rojez ni dolor.', 'Never causes redness or pain.')] },
          ],
        },
        A[1],
        {
          kind: 'quiz',
          question: tx('¿Qué ganglios se abren primero en cualquier drenaje?', 'Which nodes are opened first in any drainage?'),
          options: [tx('Los poplíteos', 'Popliteal'), tx('Los supraclaviculares (terminus)', 'Supraclavicular (terminus)'), tx('Los de la zona a tratar', 'The ones in the treatment area')],
          answer: 1,
          explain: tx('Son el desagüe final: si no se abren, la linfa no tiene salida.', 'They are the final drain: if not opened, lymph has nowhere to go.'),
        },
      ],
    },
    {
      emoji: '💧',
      title: tx('Drenaje linfático facial', 'Facial lymphatic drainage'),
      steps: [
        {
          kind: 'theory',
          emoji: '💧',
          title: tx('Deshinchar sin apretar', 'Depuff without pressing'),
          blocks: [
            { t: 'p', text: tx('El drenaje facial reduce bolsas, hinchazón por la mañana y retención tras tratamientos. Es ideal antes de un evento o como complemento de una higiene facial.', 'Facial drainage reduces bags, morning puffiness and post-treatment swelling. It is ideal before an event or as an add-on to a facial.') },
            { t: 'steps', title: tx('El orden en la cara', 'The order on the face'), items: [tx('Terminus: bombeos suaves sobre la clavícula.', 'Terminus: gentle pumps above the collarbone.'), tx('Cuello: de arriba abajo hacia la clavícula.', 'Neck: from top to bottom towards the collarbone.'), tx('Mandíbula y mentón hacia los ganglios submandibulares.', 'Jaw and chin towards the submandibular nodes.'), tx('Mejillas y nariz hacia el ángulo de la mandíbula.', 'Cheeks and nose towards the angle of the jaw.'), tx('Ojos y frente hacia las sienes y la oreja.', 'Eyes and forehead towards the temples and ear.'), tx('Cierre: de nuevo cuello y terminus.', 'Close: neck and terminus again.')] },
            { t: 'myth', claim: tx('El drenaje facial adelgaza la cara.', 'Facial drainage slims the face.'), myth: true, truth: tx('Elimina líquido retenido, no grasa. La cara se ve más definida porque se deshincha.', 'It removes retained fluid, not fat. The face looks more defined because it is less puffy.') },
            { t: 'fact', text: tx('Con el rodillo de jade o la gua sha en casa, la clienta puede mantener el efecto si sigue las mismas direcciones.', 'With a jade roller or gua sha at home, the client can keep the effect if she follows the same directions.') },
          ],
        },
        A[0],
        {
          kind: 'quiz',
          question: tx('¿Hacia dónde drenas la zona de los ojos?', 'Which way do you drain the eye area?'),
          options: [tx('Hacia la nariz', 'Towards the nose'), tx('Hacia las sienes y la oreja', 'Towards the temples and ear'), tx('Hacia la frente', 'Towards the forehead')],
          answer: 1,
          explain: tx('Los ganglios preauriculares están delante de la oreja.', 'The preauricular nodes are in front of the ear.'),
        },
      ],
    },
    {
      emoji: '🦵',
      title: tx('Drenaje corporal y celulitis', 'Body drainage and cellulite'),
      steps: [
        {
          kind: 'theory',
          emoji: '🦵',
          title: tx('Piernas ligeras', 'Light legs'),
          blocks: [
            { t: 'p', text: tx('En el cuerpo la lógica es la misma: abrir de arriba abajo (terminus, abdomen, ingles, rodillas) y luego drenar de abajo arriba, del tobillo hacia la ingle.', 'On the body the logic is the same: open from the top down (terminus, abdomen, groin, knees), then drain from the bottom up, from ankle to groin.') },
            { t: 'pairs', title: tx('Grados de celulitis', 'Cellulite grades'), items: [{ a: tx('Grado 1', 'Grade 1'), b: tx('Solo se ve al pellizcar la piel.', 'Only visible when you pinch the skin.') }, { a: tx('Grado 2', 'Grade 2'), b: tx('Se ve de pie, sin pellizcar.', 'Visible standing, without pinching.') }, { a: tx('Grado 3', 'Grade 3'), b: tx('Se ve también tumbada. Piel de naranja marcada.', 'Visible lying down too. Marked orange-peel skin.') }] },
            { t: 'myth', claim: tx('La celulitis es exceso de grasa y solo la tienen las personas con sobrepeso.', 'Cellulite is excess fat and only overweight people have it.'), myth: true, truth: tx('La tiene hasta el 90 % de las mujeres, con cualquier peso. Influyen hormonas, retención y la estructura del tejido.', 'Up to 90% of women have it, at any weight. Hormones, fluid retention and tissue structure all play a role.') },
            { t: 'key', title: tx('Un tratamiento completo combina', 'A complete treatment combines'), items: [tx('Drenaje para la retención.', 'Drainage for fluid retention.'), tx('Pinza rodada o maderoterapia para el tejido.', 'Skin rolling or wood therapy for the tissue.'), tx('Hábitos: agua, movimiento y menos sal.', 'Habits: water, movement and less salt.')] },
            { t: 'warn', text: tx('Una pierna hinchada, caliente, roja y dolorosa de un solo lado puede ser una trombosis. Nada de masaje: derívala a urgencias.', 'A swollen, hot, red, painful leg on one side can be a thrombosis. No massage: send her to A&E.', 'Una pierna hinchada, caliente, roja y dolorosa de un solo lado puede ser una trombosis. Nada de masaje: derívala a urgencias.') },
          ],
        },
        A[3],
        {
          kind: 'quiz',
          question: tx('En el drenaje de piernas, ¿en qué dirección se drena?', 'In leg drainage, which direction do you drain?'),
          options: [tx('De la ingle al tobillo', 'From groin to ankle'), tx('Del tobillo hacia la ingle', 'From ankle towards the groin'), tx('En círculos sin dirección', 'In directionless circles')],
          answer: 1,
          explain: tx('Siempre hacia los ganglios inguinales y, de ahí, hacia arriba.', 'Always towards the inguinal nodes and from there upwards.'),
        },
      ],
    },
    {
      emoji: '🩺',
      title: tx('Contraindicaciones y casos especiales', 'Contraindications and special cases'),
      steps: [
        {
          kind: 'theory',
          emoji: '🩺',
          title: tx('Cuándo decir que no', 'When to say no'),
          blocks: [
            { t: 'p', text: tx('El drenaje mueve líquidos por todo el cuerpo. En algunas situaciones eso puede ser peligroso, así que la entrevista previa es obligatoria.', 'Drainage moves fluid around the whole body. In some situations that can be dangerous, so the intake interview is a must.') },
            { t: 'pairs', title: tx('Contraindicaciones', 'Contraindications'), items: [{ a: tx('Nunca', 'Never'), b: tx('Trombosis, infección aguda o fiebre, insuficiencia cardiaca, cáncer sin autorización médica.', 'Thrombosis, acute infection or fever, heart failure, cancer without medical clearance.') }, { a: tx('Con autorización médica', 'With medical clearance'), b: tx('Embarazo, postoperatorio, problemas de tiroides, tensión muy baja, asma.', 'Pregnancy, post-op, thyroid issues, very low blood pressure, asthma.') }] },
            { t: 'myth', claim: tx('Después de una liposucción, cuanto antes y más fuerte el masaje, mejor.', 'After liposuction, the sooner and harder the massage, the better.'), myth: true, truth: tx('El drenaje postquirúrgico se hace cuando lo indica el cirujano y siempre muy suave. Es un trabajo en equipo con el médico.', 'Post-surgical drainage starts when the surgeon says so and is always very gentle. It is teamwork with the doctor.') },
            { t: 'key', title: tx('Después de la sesión', 'After the session'), items: [tx('Ofrece agua: es normal tener ganas de orinar.', 'Offer water: needing to urinate is normal.'), tx('Que se incorpore despacio: puede marearse.', 'She should sit up slowly: she may feel dizzy.'), tx('Anota la respuesta en la ficha.', 'Note her response on the record.')] },
          ],
        },
        A[4],
        {
          kind: 'case',
          title: tx('Caso: embarazada de 5 meses', 'Case: five months pregnant'),
          story: tx('Ana está embarazada de 5 meses, tiene los tobillos muy hinchados y quiere drenaje de piernas.', 'Anna is five months pregnant, has very swollen ankles and wants leg drainage.'),
          options: [
            { text: tx('Hacerlo igual que a cualquier clienta', 'Do it as for any client'), good: false, feedback: tx('El embarazo cambia la circulación y la postura. Necesita adaptación y autorización.', 'Pregnancy changes circulation and positioning. It needs adapting and clearance.') },
            { text: tx('Pedir autorización médica y trabajar de lado, sin abdomen', 'Ask for medical clearance and work side-lying, avoiding the abdomen'), good: true, feedback: tx('Correcto: con el visto bueno de su médico, en decúbito lateral y sin trabajar el abdomen.', 'Correct: with her doctor’s OK, side-lying and without working the abdomen.') },
            { text: tx('Negarse para siempre', 'Refuse for good'), good: false, feedback: tx('Con autorización y adaptaciones puede aliviarla mucho.', 'With clearance and adaptations it can bring real relief.') },
          ],
        },
      ],
    },
  ],
  [
    { question: tx('¿Cuál es la presión correcta en un masaje relajante?', 'What is the right pressure in a relaxing massage?'), options: [tx('Tan fuerte que duela', 'Hard enough to hurt'), tx('Firme pero cómoda', 'Firm but comfortable'), tx('Sin contacto', 'No contact')], answer: 1, explain: tx('El dolor hace que el músculo se contraiga.', 'Pain makes the muscle tighten.') },
    { question: tx('¿Qué maniobra abre y cierra la sesión?', 'Which stroke opens and closes the session?'), options: [tx('Percusión', 'Tapotement'), tx('Roce (effleurage)', 'Effleurage'), tx('Fricción', 'Friction')], answer: 1, explain: tx('Deslizamientos amplios y envolventes.', 'Broad, enveloping glides.') },
    { question: tx('En las extremidades, ¿hacia dónde se trabaja con presión?', 'On the limbs, which way do you work with pressure?'), options: [tx('Hacia el corazón', 'Towards the heart'), tx('Hacia los pies y manos', 'Towards hands and feet'), tx('Da igual', 'It doesn’t matter')], answer: 0, explain: tx('Ayuda al retorno venoso.', 'It helps venous return.') },
    { question: tx('¿Qué zona nunca se presiona?', 'Which area is never pressed?'), options: [tx('Los trapecios', 'The traps'), tx('La columna y las varices', 'The spine and varicose veins'), tx('Los gemelos', 'The calves')], answer: 1, explain: tx('Riesgo de lesión.', 'Risk of injury.') },
    { question: tx('¿Qué mueve la linfa?', 'What moves lymph?'), options: [tx('El corazón', 'The heart'), tx('Respiración, músculos y drenaje manual', 'Breathing, muscles and manual drainage'), tx('Nada', 'Nothing')], answer: 1, explain: tx('No tiene bomba propia.', 'It has no pump of its own.') },
    { question: tx('¿Qué ganglios son el desagüe final?', 'Which nodes are the final drain?'), options: [tx('Inguinales', 'Inguinal'), tx('Supraclaviculares (terminus)', 'Supraclavicular (terminus)'), tx('Poplíteos', 'Popliteal')], answer: 1, explain: tx('Por eso siempre se abren primero.', 'That is why they are always opened first.') },
    { question: tx('¿Cómo es la presión en el drenaje linfático?', 'What is the pressure like in lymphatic drainage?'), options: [tx('Muy suave, moviendo solo la piel', 'Very light, moving only the skin'), tx('Profunda', 'Deep'), tx('Con golpeteos', 'With tapping')], answer: 0, explain: tx('Los vasos linfáticos son superficiales.', 'Lymph vessels are superficial.') },
    { question: tx('Si la piel se enrojece durante el drenaje…', 'If the skin reddens during drainage…'), options: [tx('Vas bien', 'You’re doing well'), tx('Estás apretando demasiado', 'You’re pressing too hard'), tx('Hay que ir más rápido', 'Go faster')], answer: 1, explain: tx('El drenaje nunca enrojece.', 'Drainage never causes redness.') },
    { question: tx('En el drenaje facial, ¿hacia dónde va la mejilla?', 'In facial drainage, where does the cheek go?'), options: [tx('Hacia el ángulo de la mandíbula', 'Towards the angle of the jaw'), tx('Hacia la frente', 'Towards the forehead'), tx('Hacia la nariz', 'Towards the nose')], answer: 0, explain: tx('Hacia los ganglios submandibulares.', 'Towards the submandibular nodes.') },
    { question: tx('¿El drenaje facial elimina grasa?', 'Does facial drainage remove fat?'), options: [tx('Sí', 'Yes'), tx('No, elimina líquido retenido', 'No, it removes retained fluid'), tx('Solo con aceite', 'Only with oil')], answer: 1, explain: tx('Deshincha, no adelgaza.', 'It depuffs, it doesn’t slim.') },
    { question: tx('Celulitis visible estando de pie pero no tumbada. ¿Qué grado?', 'Cellulite visible standing but not lying down. Which grade?'), options: [tx('Grado 1', 'Grade 1'), tx('Grado 2', 'Grade 2'), tx('Grado 3', 'Grade 3')], answer: 1, explain: tx('En grado 3 se ve también tumbada.', 'In grade 3 it shows lying down too.') },
    { question: tx('Pierna hinchada, roja, caliente y dolorosa de un lado. ¿Qué haces?', 'One swollen, red, hot, painful leg. What do you do?'), options: [tx('Drenaje suave', 'Gentle drainage'), tx('Derivar a urgencias sin masaje', 'Refer to A&E, no massage'), tx('Masaje fuerte', 'Strong massage')], answer: 1, explain: tx('Puede ser una trombosis.', 'It may be a thrombosis.') },
    { question: tx('¿Cuál es una contraindicación absoluta del drenaje?', 'Which is an absolute contraindication for drainage?'), options: [tx('Retención de líquidos', 'Fluid retention'), tx('Infección aguda con fiebre', 'Acute infection with fever'), tx('Piernas cansadas', 'Tired legs')], answer: 1, explain: tx('Movería la infección por el cuerpo.', 'It would spread the infection around the body.') },
    { question: tx('Una embarazada pide drenaje. ¿Cómo trabajas?', 'A pregnant client wants drainage. How do you work?'), options: [tx('Boca abajo', 'Face down'), tx('Con autorización médica, de lado y sin abdomen', 'With clearance, side-lying, no abdomen'), tx('Igual que siempre', 'As usual')], answer: 1, explain: tx('Adaptación y visto bueno del médico.', 'Adaptation and the doctor’s OK.') },
    { question: tx('¿Qué recomiendas tras un drenaje?', 'What do you recommend after drainage?'), options: [tx('Levantarse de golpe', 'Jump up quickly'), tx('Beber agua e incorporarse despacio', 'Drink water and sit up slowly'), tx('Hacer deporte intenso', 'Do intense exercise')], answer: 1, explain: tx('Puede marearse y tendrá ganas de orinar.', 'She may feel dizzy and need to urinate.') },
  ],
)
