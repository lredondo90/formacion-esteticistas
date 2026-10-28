import type { Course } from '../courses'
import { tx } from '../i18n'

export const facials: Course = {
  id: 'faciales-avanzados',
  emoji: '🧖',
  color: '#2f7f8a',
  title: tx('Tratamientos faciales avanzados', 'Advanced facial treatments'),
  summary: tx(
    'Peeling químico, dermapen y radiofrecuencia: indicaciones, protocolo y seguridad.',
    'Chemical peels, microneedling and radiofrequency: indications, protocol and safety.',
  ),
  minutes: 45,
  premium: { eur: 69, usd: 75 },
  freeSteps: 2,
  certificate: true,
  steps: [
    {
      kind: 'video',
      title: tx('Así trabaja un peeling químico', 'How a chemical peel works'),
      scenes: [
        {
          emoji: '🧪',
          props: ['🍋', '🍎'],
          anim: 'zoom',
          title: tx('Ácidos que renuevan', 'Acids that renew'),
          caption: tx(
            'Un peeling aplica un ácido que separa las células muertas y estimula la renovación de la piel.',
            'A peel applies an acid that loosens dead cells and boosts skin renewal.',
          ),
        },
        {
          emoji: '🔬',
          props: ['💧'],
          anim: 'pulse',
          title: tx('Cada ácido, su piel', 'Each acid, its skin'),
          caption: tx(
            'Glicólico para luminosidad y textura; salicílico para piel grasa o con acné; mandélico para pieles sensibles.',
            'Glycolic for glow and texture; salicylic for oily or acne-prone skin; mandelic for sensitive skin.',
          ),
          question: {
            question: tx('Piel grasa con poros obstruidos: ¿qué ácido eliges?', 'Oily skin with clogged pores: which acid?'),
            options: [tx('Salicílico', 'Salicylic'), tx('Hialurónico', 'Hyaluronic'), tx('Ninguno', 'None')],
            answer: 0,
            explain: tx('El salicílico es liposoluble: entra en el poro y lo limpia por dentro.', 'Salicylic is oil-soluble: it gets into the pore and clears it from inside.'),
          },
        },
        {
          emoji: '⏱️',
          props: ['👀'],
          anim: 'spin',
          title: tx('Tiempo y observación', 'Timing and observation'),
          caption: tx(
            'Controla el tiempo con cronómetro y no quites la vista de la piel: si aparece blanqueo o mucho ardor, neutraliza.',
            'Time it with a stopwatch and keep watching the skin: if it frosts or burns a lot, neutralise.',
          ),
        },
        {
          emoji: '☀️',
          props: ['🧴', '🚫'],
          anim: 'float',
          title: tx('Protección solar obligatoria', 'Sunscreen is a must'),
          caption: tx(
            'Después del peeling la piel es muy sensible al sol: SPF 50 a diario y nada de rayos UVA.',
            'After a peel the skin is very sun-sensitive: SPF 50 every day and no sunbeds.',
          ),
          question: {
            question: tx('¿Cuál es el mejor momento del año para peelings medios?', 'What is the best time of year for medium peels?'),
            options: [tx('Verano', 'Summer'), tx('Otoño e invierno', 'Autumn and winter'), tx('Da igual', 'It does not matter')],
            answer: 1,
            explain: tx('Con menos sol hay menos riesgo de manchas tras el tratamiento.', 'Less sun means less risk of pigmentation after treatment.'),
          },
        },
      ],
    },
    {
      kind: 'flashcards',
      title: tx('Tres tecnologías clave', 'Three key technologies'),
      cards: [
        {
          front: tx('Peeling químico', 'Chemical peel'),
          back: tx('Ácidos que exfolian: manchas, textura, acné y luminosidad.', 'Exfoliating acids: pigmentation, texture, acne and glow.'),
        },
        {
          front: tx('Dermapen (microneedling)', 'Microneedling'),
          back: tx(
            'Microperforaciones que estimulan colágeno: cicatrices de acné, poros y firmeza.',
            'Micro-injuries that boost collagen: acne scars, pores and firmness.',
          ),
        },
        {
          front: tx('Radiofrecuencia', 'Radiofrequency'),
          back: tx('Calor profundo que contrae y regenera el colágeno: flacidez y arrugas.', 'Deep heat that tightens and renews collagen: sagging and wrinkles.'),
        },
        {
          front: tx('Profundidad estética del dermapen', 'Cosmetic microneedling depth'),
          back: tx(
            'En cabina estética, hasta 0,5 mm. Las profundidades mayores son de uso médico.',
            'In a beauty salon, up to 0.5 mm. Deeper needling is a medical procedure.',
          ),
        },
      ],
    },
    {
      kind: 'match',
      title: tx('Une cada problema con su tratamiento', 'Match each concern with its treatment'),
      pairs: [
        { left: tx('Cicatrices de acné', 'Acne scars'), right: tx('Dermapen', 'Microneedling') },
        { left: tx('Flacidez del óvalo', 'Sagging jawline'), right: tx('Radiofrecuencia', 'Radiofrequency') },
        { left: tx('Piel apagada y textura irregular', 'Dull, uneven texture'), right: tx('Peeling glicólico', 'Glycolic peel') },
        { left: tx('Barrera alterada y rojeces', 'Damaged barrier and redness'), right: tx('Tratamiento calmante, sin agresiones', 'Soothing treatment, nothing aggressive') },
      ],
    },
    {
      kind: 'branch',
      title: tx('Simulación: la clienta quiere dermapen', 'Simulation: the client wants microneedling'),
      start: 'a',
      nodes: {
        a: {
          who: '👩',
          text: tx(
            '"Hola, quiero dermapen para las marcas de acné. Mi dermatóloga me ha recetado isotretinoína hace dos meses."',
            '"Hi, I want microneedling for my acne marks. My dermatologist put me on isotretinoin two months ago."',
            '"Hola, quiero dermapen para las marcas de acné. Mi dermatóloga me recetó isotretinoína hace dos meses."',
          ),
          choices: [
            {
              text: tx('"¡Perfecto! Empezamos hoy mismo."', '"Perfect! Let\'s start today."'),
              end: 'bad',
              feedback: tx(
                'Con isotretinoína la piel cicatriza mal: hay riesgo de cicatrices y heridas. Es una contraindicación.',
                'On isotretinoin the skin heals poorly: there is a risk of scarring and wounds. It is a contraindication.',
              ),
            },
            {
              text: tx('"Antes necesito saber más. ¿Sigues tomándola?"', '"I need to know more first. Are you still taking it?"'),
              next: 'b',
            },
          ],
        },
        b: {
          who: '👩',
          text: tx('"Sí, me quedan cuatro meses. Pero yo quiero hacer algo ya..."', '"Yes, four more months. But I want to do something now..."'),
          choices: [
            {
              text: tx(
                '"Haremos un tratamiento hidratante y calmante ahora, y el dermapen cuando lleves 6 meses sin tomarla."',
                '"We\'ll do a hydrating, soothing treatment now, and microneedling once you\'ve been off it for 6 months."',
              ),
              end: 'good',
              feedback: tx(
                'Perfecto: cuidas su piel, mantienes a la clienta y planificas el tratamiento con seguridad.',
                'Perfect: you look after her skin, keep the client and plan the treatment safely.',
              ),
            },
            {
              text: tx('"Hacemos un peeling medio, que es más suave."', '"Let\'s do a medium peel instead, it\'s gentler."'),
              end: 'bad',
              feedback: tx(
                'Los peelings medios también están contraindicados con isotretinoína.',
                'Medium peels are also contraindicated with isotretinoin.',
              ),
            },
          ],
        },
      },
    },
    {
      kind: 'order',
      title: tx('Ordena un protocolo de dermapen', 'Put a microneedling protocol in order'),
      items: [
        tx('Ficha, contraindicaciones y consentimiento', 'Record card, contraindications and consent'),
        tx('Limpieza y desinfección de la piel', 'Cleanse and disinfect the skin'),
        tx('Aplicar el sérum estéril', 'Apply a sterile serum'),
        tx('Pasadas con cartucho estéril de un solo uso', 'Passes with a sterile single-use cartridge'),
        tx('Mascarilla calmante', 'Soothing mask'),
        tx('SPF 50 y cuidados en casa', 'SPF 50 and home care'),
      ],
    },
    {
      kind: 'quiz',
      question: tx('¿Qué es una contraindicación de la radiofrecuencia?', 'Which is a contraindication for radiofrequency?'),
      options: [
        tx('Arrugas finas', 'Fine lines'),
        tx('Marcapasos o implantes metálicos en la zona', 'Pacemaker or metal implants in the area'),
        tx('Piel mixta', 'Combination skin'),
      ],
      answer: 1,
      explain: tx(
        'La corriente puede interferir con marcapasos y calentar los metales. También embarazo y procesos oncológicos.',
        'The current can interfere with pacemakers and heat metal. Pregnancy and active cancer are also contraindications.',
      ),
    },
  ],
}
