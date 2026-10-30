import type { Step } from '../courses'
import { tx } from '../i18n'
import { modular } from '../modules'

// Activities from the first version of the course, reused inside the modules.
const A: Step[] = [
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
]

export const cosmetology = modular(
  {
    id: 'cosmetologia',
    emoji: '🧪',
    color: '#4a6fa5',
    title: tx('Cosmetología y química de productos', 'Cosmetic science and product chemistry'),
    summary: tx(
      'Lee etiquetas INCI, entiende el pH y los activos, y recomienda bien a cada cliente.',
      'Read INCI labels, understand pH and actives, and recommend the right products to every client.',
    ),
    premium: { eur: 39, usd: 45 },
    certificate: true,
    minutes: 100,
  },
  [
    {
      emoji: '🧱',
      title: tx('La piel y su barrera', 'The skin and its barrier'),
      steps: [
        {
          kind: 'theory',
          emoji: '🧱',
          title: tx('Ladrillos y cemento', 'Bricks and mortar'),
          blocks: [
            { t: 'p', text: tx('Antes de hablar de cremas, hay que entender dónde las ponemos. La capa más externa de la piel, el estrato córneo, funciona como un muro: las células muertas son los ladrillos y los lípidos (ceramidas, colesterol y ácidos grasos) son el cemento.', 'Before talking about creams, you need to understand where they go. The outermost layer of skin, the stratum corneum, works like a wall: dead cells are the bricks and lipids (ceramides, cholesterol and fatty acids) are the mortar.') },
            { t: 'key', title: tx('Lo que hace la barrera', 'What the barrier does'), items: [tx('Evita que el agua se escape (pérdida transepidérmica de agua).', 'Stops water escaping (transepidermal water loss).'), tx('Frena la entrada de irritantes, alérgenos y microbios.', 'Keeps out irritants, allergens and microbes.'), tx('Mantiene un manto ácido, con pH alrededor de 5.', 'Keeps an acid mantle with a pH around 5.')] },
            { t: 'pairs', title: tx('Señales de barrera dañada', 'Signs of a damaged barrier'), items: [{ a: tx('Tirantez', 'Tightness'), b: tx('Falta de lípidos y agua.', 'Lacking lipids and water.') }, { a: tx('Escozor con cualquier producto', 'Stinging with any product'), b: tx('Los activos penetran demasiado.', 'Actives get in too easily.') }, { a: tx('Rojez y descamación', 'Redness and flaking'), b: tx('Inflamación: toca reparar, no exfoliar.', 'Inflammation: time to repair, not exfoliate.') }] },
            { t: 'myth', claim: tx('Si la piel tira después de lavarla, es que está bien limpia.', 'If skin feels tight after washing, it’s really clean.'), myth: true, truth: tx('La tirantez significa que el limpiador ha arrastrado lípidos de la barrera. Una piel bien limpia se siente cómoda.', 'Tightness means the cleanser stripped barrier lipids. Properly cleansed skin feels comfortable.') },
            { t: 'fact', text: tx('Una cosmética solo actúa en la superficie y las capas altas de la piel. Si un producto llega a la sangre ya no es cosmético, es un medicamento.', 'Cosmetics only act on the surface and upper layers of the skin. If a product reaches the bloodstream it’s no longer a cosmetic, it’s a medicine.') },
          ],
        },
        {
          kind: 'quiz',
          question: tx('¿Qué hacen las ceramidas en la piel?', 'What do ceramides do in the skin?'),
          options: [tx('Exfolian las células muertas', 'Exfoliate dead cells'), tx('Son el “cemento” lipídico de la barrera', 'They are the lipid “mortar” of the barrier'), tx('Dan color', 'Add colour')],
          answer: 1,
          explain: tx('Reponerlas ayuda a reparar pieles secas o sensibilizadas.', 'Replenishing them helps repair dry or sensitised skin.'),
        },
        {
          kind: 'quiz',
          question: tx('Una clienta nota escozor con todo lo que se pone. ¿Qué toca?', 'A client says everything stings. What now?'),
          options: [tx('Un peeling para renovar', 'A peel to renew'), tx('Simplificar y reparar la barrera', 'Simplify and repair the barrier'), tx('Más activos a la vez', 'More actives at once')],
          answer: 1,
          explain: tx('Limpiador suave, hidratante con ceramidas y SPF. Los activos, más adelante.', 'Gentle cleanser, ceramide moisturiser and SPF. Actives come later.'),
        },
      ],
    },
    {
      emoji: '🔎',
      title: tx('Leer una etiqueta INCI', 'Reading an INCI label'),
      steps: [
        {
          kind: 'theory',
          emoji: '🔎',
          title: tx('El DNI de un cosmético', 'A cosmetic’s ID card'),
          blocks: [
            { t: 'p', text: tx('INCI es la nomenclatura internacional de ingredientes. Es igual en todo el mundo, así que si sabes leerla puedes analizar cualquier producto, aunque el envase esté en otro idioma.', 'INCI is the international naming system for ingredients. It’s the same worldwide, so once you can read it you can analyse any product, even if the pack is in another language.') },
            { t: 'steps', title: tx('Cómo se lee', 'How to read it'), items: [tx('Los ingredientes van de mayor a menor concentración.', 'Ingredients are listed from highest to lowest concentration.'), tx('Por debajo del 1 %, pueden ir en cualquier orden.', 'Below 1%, they can appear in any order.'), tx('Los nombres de plantas van en latín (Aloe Barbadensis Leaf Juice).', 'Plant names are in Latin (Aloe Barbadensis Leaf Juice).'), tx('Los colorantes van al final con su código CI.', 'Colourants go last with their CI code.')] },
            { t: 'key', title: tx('Pistas rápidas', 'Quick clues'), items: [tx('“Aqua” primero: base acuosa.', '“Aqua” first: water-based.'), tx('“Parfum” o “Fragrance”: lleva perfume.', '“Parfum” or “Fragrance”: it’s fragranced.'), tx('Linalool, Limonene, Citral, Geraniol…: alérgenos de fragancia que hay que declarar.', 'Linalool, Limonene, Citral, Geraniol…: fragrance allergens that must be declared.'), tx('Si el activo estrella aparece después del perfume, hay muy poco.', 'If the hero active comes after the fragrance, there’s very little of it.')] },
            { t: 'myth', claim: tx('Natural significa que no da alergia.', 'Natural means it won’t cause allergies.'), myth: true, truth: tx('Muchos aceites esenciales son de los alérgenos más frecuentes. Natural o sintético no dice nada sobre la tolerancia.', 'Many essential oils are among the most common allergens. Natural or synthetic says nothing about tolerance.') },
            { t: 'fact', text: tx('El símbolo del tarro abierto con “12M” es el PAO: los meses que dura el producto una vez abierto.', 'The open-jar symbol with “12M” is the PAO: how many months the product lasts once opened.') },
          ],
        },
        A[4],
        {
          kind: 'quiz',
          question: tx('En un sérum “con vitamina C”, el ácido ascórbico aparece después de “Parfum”. ¿Qué te dice?', 'In a “vitamin C” serum, ascorbic acid comes after “Parfum”. What does it tell you?'),
          options: [tx('Que lleva mucha vitamina C', 'It has lots of vitamin C'), tx('Que lleva muy poca', 'It has very little'), tx('Nada, el orden es aleatorio', 'Nothing, the order is random')],
          answer: 1,
          explain: tx('El perfume suele ir por debajo del 1 %: lo que va detrás, todavía menos.', 'Fragrance is usually under 1%: whatever comes after is even less.'),
        },
      ],
    },
    {
      emoji: '⚗️',
      title: tx('pH y emulsiones', 'pH and emulsions'),
      steps: [
        {
          kind: 'theory',
          emoji: '⚗️',
          title: tx('Agua, aceite y acidez', 'Water, oil and acidity'),
          blocks: [
            { t: 'p', text: tx('Casi todas las cremas son emulsiones: agua y aceite mezclados gracias a un emulsionante. Lo que esté por fuera (la fase externa) es lo que notas al tacto.', 'Almost every cream is an emulsion: water and oil held together by an emulsifier. Whatever is on the outside (the external phase) is what you feel.') },
            { t: 'pairs', title: tx('Tipos de emulsión', 'Types of emulsion'), items: [{ a: tx('O/W (aceite en agua)', 'O/W (oil in water)'), b: tx('Ligera, fresca, se absorbe rápido. Pieles grasas y mixtas.', 'Light, fresh, sinks in fast. Oily and combination skin.') }, { a: tx('W/O (agua en aceite)', 'W/O (water in oil)'), b: tx('Rica, protectora, más oclusiva. Pieles secas.', 'Rich, protective, more occlusive. Dry skin.') }] },
            { t: 'steps', title: tx('La escala de pH', 'The pH scale'), items: [tx('0–6: ácido. La piel sana está en torno a 4,5–5,5.', '0–6: acidic. Healthy skin sits around 4.5–5.5.'), tx('7: neutro, como el agua pura.', '7: neutral, like pure water.'), tx('8–14: alcalino. Los jabones clásicos están en 9–10.', '8–14: alkaline. Classic soaps sit at 9–10.')] },
            { t: 'myth', claim: tx('Cuanto más bajo el pH de un ácido, mejor resultado y sin riesgo.', 'The lower an acid’s pH, the better the result, with no risk.'), myth: true, truth: tx('Un pH muy bajo aumenta la penetración pero también la irritación. Por eso los peelings de pH bajo son de uso profesional y con tiempos controlados.', 'Very low pH boosts penetration but also irritation. That’s why low-pH peels are for professional use with controlled timing.') },
            { t: 'warn', text: tx('Un limpiador alcalino altera el manto ácido durante horas. Para pieles sensibles, siempre syndets de pH fisiológico.', 'An alkaline cleanser disrupts the acid mantle for hours. For sensitive skin, always use pH-balanced syndets.') },
          ],
        },
        A[0],
        {
          kind: 'quiz',
          question: tx('Una piel muy seca y madura necesita una crema…', 'Very dry, mature skin needs a cream that is…'),
          options: [tx('O/W ligera en gel', 'A light O/W gel'), tx('W/O rica y protectora', 'A rich, protective W/O'), tx('Con alcohol para que se absorba', 'Alcohol-based so it absorbs')],
          answer: 1,
          explain: tx('La fase externa oleosa sella y reduce la pérdida de agua.', 'The oily external phase seals in and reduces water loss.'),
        },
      ],
    },
    {
      emoji: '💎',
      title: tx('Los activos estrella', 'The hero actives'),
      steps: [
        {
          kind: 'theory',
          emoji: '💎',
          title: tx('Qué hace cada uno (de verdad)', 'What each one really does'),
          blocks: [
            { t: 'pairs', title: tx('Familias de activos', 'Active families'), items: [{ a: tx('Hidratantes', 'Humectants'), b: tx('Hialurónico, glicerina, urea: atraen agua.', 'Hyaluronic acid, glycerin, urea: attract water.') }, { a: tx('Reparadores', 'Repairers'), b: tx('Ceramidas, niacinamida, pantenol, centella.', 'Ceramides, niacinamide, panthenol, centella.') }, { a: tx('Renovadores', 'Renewers'), b: tx('Retinoides, AHA (glicólico, láctico), BHA (salicílico).', 'Retinoids, AHAs (glycolic, lactic), BHA (salicylic).') }, { a: tx('Antioxidantes', 'Antioxidants'), b: tx('Vitamina C, vitamina E, ácido ferúlico.', 'Vitamin C, vitamin E, ferulic acid.') }] },
            { t: 'pairs', title: tx('AHA o BHA', 'AHA or BHA'), items: [{ a: tx('AHA (glicólico)', 'AHA (glycolic)'), b: tx('Hidrosoluble: textura, luminosidad, manchas.', 'Water-soluble: texture, glow, pigmentation.') }, { a: tx('BHA (salicílico)', 'BHA (salicylic)'), b: tx('Liposoluble: entra en el poro. Ideal para grasas y acné.', 'Oil-soluble: gets into pores. Ideal for oily and acne-prone skin.') }] },
            { t: 'myth', claim: tx('El retinol adelgaza la piel.', 'Retinol thins the skin.'), myth: true, truth: tx('Al principio descama, pero a medio plazo engrosa la dermis porque estimula el colágeno. Lo que sí hace es fotosensibilizar: SPF siempre.', 'It flakes at first, but over time it thickens the dermis by boosting collagen. What it does do is increase sun sensitivity: SPF always.') },
            { t: 'warn', text: tx('Retinoides: nada en embarazo ni lactancia. Ante la duda, deriva al médico.', 'Retinoids: never in pregnancy or breastfeeding. When in doubt, refer to a doctor.') },
            { t: 'fact', text: tx('La concentración no lo es todo: un 0,3 % de retinol bien formulado puede funcionar mejor que un 1 % que irrita y hace que la clienta lo abandone.', 'Concentration isn’t everything: a well-formulated 0.3% retinol can work better than a 1% that irritates and makes the client give up.') },
          ],
        },
        A[1],
        A[2],
      ],
    },
    {
      emoji: '☀️',
      title: tx('Protección solar', 'Sun protection'),
      steps: [
        {
          kind: 'theory',
          emoji: '☀️',
          title: tx('El mejor antiedad del mundo', 'The best anti-ageing product in the world'),
          blocks: [
            { t: 'pairs', title: tx('Los rayos que importan', 'The rays that matter'), items: [{ a: tx('UVB', 'UVB'), b: tx('Queman. El SPF mide la protección frente a ellos.', 'They burn. SPF measures protection against them.') }, { a: tx('UVA', 'UVA'), b: tx('Envejecen y manchan. Atraviesan nubes y cristales.', 'They age and pigment. They pass through clouds and glass.') }, { a: tx('Luz visible', 'Visible light'), b: tx('Empeora el melasma. Los filtros con color ayudan.', 'Worsens melasma. Tinted sunscreens help.') }] },
            { t: 'pairs', title: tx('Tipos de filtro', 'Filter types'), items: [{ a: tx('Minerales (físicos)', 'Mineral (physical)'), b: tx('Óxido de zinc y dióxido de titanio. Muy bien tolerados.', 'Zinc oxide and titanium dioxide. Very well tolerated.') }, { a: tx('Orgánicos (químicos)', 'Organic (chemical)'), b: tx('Absorben la radiación. Texturas más ligeras.', 'Absorb radiation. Lighter textures.') }] },
            { t: 'myth', claim: tx('Un SPF 50 protege casi el doble que un SPF 30.', 'SPF 50 protects almost twice as much as SPF 30.'), myth: true, truth: tx('SPF 30 filtra alrededor del 97 % de los UVB y SPF 50 alrededor del 98 %. La diferencia real la marca la cantidad aplicada y reaplicar cada 2 horas.', 'SPF 30 filters about 97% of UVB and SPF 50 about 98%. The real difference is how much you apply and reapplying every 2 hours.') },
            { t: 'key', title: tx('Cómo aplicarlo bien', 'How to apply it properly'), items: [tx('Dos dedos de producto para cara y cuello.', 'Two finger-lengths for face and neck.'), tx('Último paso de la rutina de mañana.', 'Last step of the morning routine.'), tx('Reaplicar al sudar, bañarse o cada 2 horas al sol.', 'Reapply after sweating, swimming or every 2 hours in the sun.')] },
          ],
        },
        {
          kind: 'quiz',
          question: tx('¿Qué radiación atraviesa el cristal de una ventana y envejece la piel?', 'Which radiation passes through window glass and ages the skin?'),
          options: [tx('UVA', 'UVA'), tx('UVB', 'UVB'), tx('Ninguna', 'None')],
          answer: 0,
          explain: tx('Por eso el SPF se usa también en interior junto a ventanas.', 'That’s why SPF is used indoors near windows too.'),
        },
        {
          kind: 'quiz',
          question: tx('Clienta con melasma: ¿qué protector le recomiendas?', 'Client with melasma: which sunscreen do you recommend?'),
          options: [tx('SPF 15 transparente', 'Clear SPF 15'), tx('SPF 50 con color (protege de la luz visible)', 'Tinted SPF 50 (blocks visible light)'), tx('Ninguno, solo vitamina C', 'None, just vitamin C')],
          answer: 1,
          explain: tx('Los óxidos de hierro del color frenan la luz visible que reactiva las manchas.', 'The iron oxides in the tint block the visible light that reactivates pigment.'),
        },
      ],
    },
    {
      emoji: '🧾',
      title: tx('Recomendar con criterio', 'Recommending with judgement'),
      steps: [
        {
          kind: 'theory',
          emoji: '🧾',
          title: tx('De la etiqueta a la rutina', 'From the label to the routine'),
          blocks: [
            { t: 'p', text: tx('Una buena recomendación no es vender el producto más caro: es una rutina que la clienta vaya a cumplir. Tres pasos bien hechos valen más que diez que abandona en una semana.', 'A good recommendation isn’t selling the most expensive product: it’s a routine the client will actually follow. Three steps done well beat ten she gives up on in a week.') },
            { t: 'steps', title: tx('Orden de aplicación', 'Order of application'), items: [tx('De la textura más fina a la más densa.', 'From the thinnest texture to the thickest.'), tx('Los activos (sérum) cerca de la piel limpia.', 'Actives (serum) close to clean skin.'), tx('Mañana: antioxidante y SPF. Noche: renovación y reparación.', 'Morning: antioxidant and SPF. Night: renewal and repair.'), tx('Un activo nuevo cada vez, durante 2–4 semanas.', 'One new active at a time, for 2–4 weeks.')] },
            { t: 'key', title: tx('Lo que dice la ley (UE)', 'What the law says (EU)'), items: [tx('Reglamento 1223/2009: todo cosmético tiene una persona responsable y un expediente de seguridad.', 'Regulation 1223/2009: every cosmetic has a responsible person and a safety dossier.'), tx('Un cosmético no puede prometer curar: “trata el acné” es un mensaje de medicamento.', 'A cosmetic can’t claim to cure: “treats acne” is a medicine claim.'), tx('Las reacciones graves se comunican a la autoridad sanitaria (cosmetovigilancia).', 'Serious reactions are reported to the health authority (cosmetovigilance).')] },
            { t: 'myth', claim: tx('Si un producto pica un poco es que está funcionando.', 'If a product stings a bit, it’s working.'), myth: true, truth: tx('El picor o el ardor persistente es irritación, no eficacia. Se retira y se valora.', 'Persistent stinging or burning is irritation, not effectiveness. Stop it and reassess.') },
          ],
        },
        A[3],
        A[5],
      ],
    },
  ],
  [
    { question: tx('¿Qué es el estrato córneo?', 'What is the stratum corneum?'), options: [tx('La capa más externa de la piel', 'The outermost layer of skin'), tx('Una glándula', 'A gland'), tx('La dermis profunda', 'The deep dermis')], answer: 0, explain: tx('Es la barrera: ladrillos y cemento.', 'It’s the barrier: bricks and mortar.') },
    { question: tx('¿Qué pH tiene la piel sana?', 'What pH does healthy skin have?'), options: [tx('Alrededor de 5', 'Around 5'), tx('7, neutro', '7, neutral'), tx('Alrededor de 9', 'Around 9')], answer: 0, explain: tx('Es el manto ácido.', 'That’s the acid mantle.') },
    { question: tx('En el INCI, los ingredientes van…', 'In INCI, ingredients are listed…'), options: [tx('Por orden alfabético', 'Alphabetically'), tx('De mayor a menor concentración', 'From highest to lowest concentration'), tx('Al azar', 'Randomly')], answer: 1, explain: tx('Por debajo del 1 %, el orden es libre.', 'Below 1%, order is free.') },
    { question: tx('“Linalool” en el INCI es…', '“Linalool” on an INCI list is…'), options: [tx('Un conservante', 'A preservative'), tx('Un alérgeno de fragancia', 'A fragrance allergen'), tx('Un filtro solar', 'A sun filter')], answer: 1, explain: tx('Se declara por ley.', 'It must be declared by law.') },
    { question: tx('¿Qué indica el símbolo del tarro con “12M”?', 'What does the jar symbol with “12M” mean?'), options: [tx('Caduca en 12 meses sin abrir', 'Expires in 12 months unopened'), tx('Dura 12 meses una vez abierto', 'Lasts 12 months once opened'), tx('Para mayores de 12 años', 'For over-12s')], answer: 1, explain: tx('Es el PAO.', 'That’s the PAO.') },
    { question: tx('Una emulsión O/W es…', 'An O/W emulsion is…'), options: [tx('Ligera y fresca', 'Light and fresh'), tx('Rica y oclusiva', 'Rich and occlusive'), tx('Un aceite puro', 'A pure oil')], answer: 0, explain: tx('Fase externa acuosa.', 'Water is the external phase.') },
    { question: tx('¿Por qué evitar jabones alcalinos en piel sensible?', 'Why avoid alkaline soaps on sensitive skin?'), options: [tx('Alteran el manto ácido', 'They disrupt the acid mantle'), tx('Huelen mal', 'They smell bad'), tx('No limpian', 'They don’t cleanse')], answer: 0, explain: tx('Mejor syndets de pH fisiológico.', 'Better to use pH-balanced syndets.') },
    { question: tx('¿Qué ácido entra en el poro y va mejor para piel grasa?', 'Which acid gets into pores and suits oily skin best?'), options: [tx('Glicólico (AHA)', 'Glycolic (AHA)'), tx('Salicílico (BHA)', 'Salicylic (BHA)'), tx('Hialurónico', 'Hyaluronic')], answer: 1, explain: tx('Es liposoluble.', 'It’s oil-soluble.') },
    { question: tx('¿Qué activo está contraindicado en el embarazo?', 'Which active is contraindicated in pregnancy?'), options: [tx('Niacinamida', 'Niacinamide'), tx('Retinoides', 'Retinoids'), tx('Ceramidas', 'Ceramides')], answer: 1, explain: tx('Ante la duda, al médico.', 'When in doubt, see a doctor.') },
    { question: tx('¿Cuándo se usa mejor la vitamina C?', 'When is vitamin C best used?'), options: [tx('Por la mañana, con SPF', 'In the morning, with SPF'), tx('Solo en verano', 'Only in summer'), tx('Mezclada con el limpiador', 'Mixed into the cleanser')], answer: 0, explain: tx('Su efecto antioxidante suma al protector.', 'Its antioxidant effect boosts the sunscreen.') },
    { question: tx('¿Qué radiación quema la piel?', 'Which radiation burns the skin?'), options: [tx('UVA', 'UVA'), tx('UVB', 'UVB'), tx('Infrarroja', 'Infrared')], answer: 1, explain: tx('El SPF mide la protección UVB.', 'SPF measures UVB protection.') },
    { question: tx('¿Qué es lo más importante para que el SPF funcione?', 'What matters most for SPF to work?'), options: [tx('Usar SPF 100', 'Using SPF 100'), tx('Cantidad suficiente y reaplicar', 'Enough product and reapplying'), tx('Ponerlo de noche', 'Applying it at night')], answer: 1, explain: tx('Dos dedos para cara y cuello, cada 2 horas al sol.', 'Two finger-lengths for face and neck, every 2 hours in the sun.') },
    { question: tx('¿En qué orden se aplican los productos?', 'In what order are products applied?'), options: [tx('De la textura más densa a la más fina', 'Thickest to thinnest'), tx('De la más fina a la más densa', 'Thinnest to thickest'), tx('Da igual', 'It doesn’t matter')], answer: 1, explain: tx('Lo fino primero para que penetre.', 'Thin first so it can absorb.') },
    { question: tx('Un cosmético anuncia que “cura el acné”. ¿Es correcto?', 'A cosmetic claims to “cure acne”. Is that OK?'), options: [tx('Sí', 'Yes'), tx('No, es una alegación de medicamento', 'No, that’s a medicine claim'), tx('Solo si es natural', 'Only if natural')], answer: 1, explain: tx('Reglamento 1223/2009.', 'Regulation 1223/2009.') },
    { question: tx('Un producto pica y arde de forma persistente. ¿Qué haces?', 'A product stings and burns persistently. What do you do?'), options: [tx('Seguir, es que funciona', 'Keep going, it’s working'), tx('Retirarlo y valorar', 'Stop it and reassess'), tx('Usar más cantidad', 'Use more')], answer: 1, explain: tx('Es irritación, no eficacia.', 'It’s irritation, not effectiveness.') },
  ],
)
