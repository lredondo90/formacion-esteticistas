import { tx, type Text } from '../i18n'

export type Doc = {
  id: string
  emoji: string
  title: Text
  pro: boolean
  // 'form' sections render as fields to fill in; 'text' sections as bullet points.
  kind: 'form' | 'text'
  intro?: Text
  sections: { heading: Text; items: Text[] }[]
  sign?: boolean
}

const aftercareCommon = [
  tx('Protector solar SPF 50 a diario', 'SPF 50 sunscreen every day'),
  tx('Ante cualquier reacción fuera de lo normal, contacta con el centro', 'If anything unusual happens, contact the salon'),
]

export const LIBRARY: Doc[] = [
  {
    id: 'anamnesis',
    emoji: '📋',
    title: tx('Ficha de cliente y anamnesis', 'Client record and health questionnaire'),
    pro: false,
    kind: 'form',
    sections: [
      {
        heading: tx('Datos personales', 'Personal details'),
        items: [tx('Nombre y apellidos', 'Full name'), tx('Fecha de nacimiento', 'Date of birth'), tx('Teléfono', 'Phone'), tx('Email', 'Email')],
      },
      {
        heading: tx('Salud', 'Health'),
        items: [
          tx('Alergias (productos, látex, metales…)', 'Allergies (products, latex, metals…)'),
          tx('Medicación actual', 'Current medication'),
          tx('Embarazo o lactancia', 'Pregnancy or breastfeeding'),
          tx('Enfermedades de la piel, diabetes, problemas circulatorios', 'Skin conditions, diabetes, circulation problems'),
          tx('Marcapasos, implantes o prótesis metálicas', 'Pacemaker, implants or metal prostheses'),
          tx('Tratamientos con retinoides o isotretinoína (últimos 6 meses)', 'Retinoid or isotretinoin treatment (last 6 months)'),
        ],
      },
      {
        heading: tx('Piel y hábitos', 'Skin and habits'),
        items: [
          tx('Tipo de piel y fototipo', 'Skin type and phototype'),
          tx('Rutina en casa', 'Home routine'),
          tx('Exposición solar reciente', 'Recent sun exposure'),
          tx('Objetivo del tratamiento', 'Treatment goal'),
        ],
      },
    ],
    sign: true,
  },
  {
    id: 'consent-general',
    emoji: '✍️',
    title: tx('Consentimiento informado general', 'General informed consent'),
    pro: false,
    kind: 'text',
    intro: tx(
      'Declaro que he sido informada del tratamiento, sus beneficios, riesgos y cuidados, y que los datos de mi ficha son ciertos.',
      'I confirm I have been informed about the treatment, its benefits, risks and aftercare, and that the details on my record are true.',
    ),
    sections: [
      {
        heading: tx('Acepto que', 'I accept that'),
        items: [
          tx('Los resultados pueden variar de una persona a otra', 'Results vary from person to person'),
          tx('Debo seguir los cuidados posteriores indicados', 'I must follow the aftercare instructions'),
          tx('Comunicaré cualquier cambio en mi salud antes de cada sesión', 'I will report any health change before each session'),
          tx('Se pueden tomar fotos del antes y después para mi historial (opcional)', 'Before-and-after photos may be taken for my records (optional)'),
        ],
      },
    ],
    sign: true,
  },
  {
    id: 'consent-pmu',
    emoji: '✒️',
    title: tx('Consentimiento de micropigmentación', 'Permanent make-up consent'),
    pro: true,
    kind: 'text',
    intro: tx(
      'La micropigmentación introduce pigmento en la capa superficial de la dermis. El resultado es semipermanente y necesita retoque.',
      'Micropigmentation places pigment in the upper dermis. The result is semi-permanent and needs a touch-up.',
    ),
    sections: [
      {
        heading: tx('He sido informada de', 'I have been informed that'),
        items: [
          tx('Puede haber enrojecimiento, inflamación y descamación los primeros días', 'Redness, swelling and flaking may occur in the first days'),
          tx('El color se aclara durante la cicatrización y se ajusta en el retoque', 'The colour lightens while healing and is adjusted at the touch-up'),
          tx('No es recomendable en embarazo, lactancia, queloides o con anticoagulantes', 'It is not advised in pregnancy, breastfeeding, keloids or with blood thinners'),
          tx('He aprobado el diseño antes de empezar', 'I approved the design before starting'),
        ],
      },
    ],
    sign: true,
  },
  {
    id: 'consent-laser',
    emoji: '🔦',
    title: tx('Consentimiento de depilación láser', 'Laser hair removal consent'),
    pro: true,
    kind: 'text',
    sections: [
      {
        heading: tx('Confirmo que', 'I confirm that'),
        items: [
          tx('No me he expuesto al sol ni a rayos UVA en las últimas 4 semanas', 'I have had no sun or sunbed exposure in the last 4 weeks'),
          tx('No tomo medicación fotosensibilizante', 'I am not taking photosensitising medication'),
          tx('Me he rasurado y no he usado cera ni pinzas en 4 semanas', 'I have shaved and not waxed or plucked for 4 weeks'),
          tx('Entiendo que hacen falta varias sesiones', 'I understand several sessions are needed'),
        ],
      },
    ],
    sign: true,
  },
  {
    id: 'after-brows',
    emoji: '🪶',
    title: tx('Cuidados después de microblading', 'Microblading aftercare'),
    pro: true,
    kind: 'text',
    sections: [
      {
        heading: tx('Los primeros 10 días', 'First 10 days'),
        items: [
          tx('No mojes las cejas las primeras 24-48 horas', 'Keep brows dry for the first 24–48 hours'),
          tx('Aplica una capa muy fina de la crema indicada', 'Apply a very thin layer of the recommended balm'),
          tx('No rasques ni arranques las costritas', 'Do not scratch or pick the scabs'),
          tx('Evita maquillaje, sauna, piscina y sol directo', 'Avoid make-up, sauna, swimming pools and direct sun'),
          ...aftercareCommon,
        ],
      },
    ],
  },
  {
    id: 'after-lashes',
    emoji: '👁️',
    title: tx('Cuidados de extensiones de pestañas', 'Lash extension aftercare'),
    pro: true,
    kind: 'text',
    sections: [
      {
        heading: tx('Para que duren más', 'To make them last longer'),
        items: [
          tx('No mojes las pestañas en las primeras 24 horas', 'Keep lashes dry for the first 24 hours'),
          tx('Lávalas a diario con espuma específica y cepíllalas', 'Wash daily with lash foam and brush them'),
          tx('Evita desmaquillantes con aceite', 'Avoid oil-based make-up removers'),
          tx('No uses rizador ni máscara de pestañas', "Don't use curlers or mascara"),
          tx('Relleno cada 2-3 semanas', 'Refill every 2–3 weeks'),
        ],
      },
    ],
  },
  {
    id: 'after-peel',
    emoji: '🧪',
    title: tx('Cuidados después de un peeling', 'Chemical peel aftercare'),
    pro: true,
    kind: 'text',
    sections: [
      {
        heading: tx('Durante una semana', 'For one week'),
        items: [
          tx('Limpieza suave, sin exfoliantes ni ácidos', 'Gentle cleansing, no scrubs or acids'),
          tx('Hidratación abundante con cremas reparadoras', 'Plenty of hydration with barrier-repair creams', 'Humectación abundante con cremas reparadoras'),
          tx('No arranques la piel que se descama', "Don't peel off flaking skin"),
          ...aftercareCommon,
        ],
      },
    ],
  },
  {
    id: 'after-wax',
    emoji: '✨',
    title: tx('Cuidados después de la depilación con cera', 'Waxing aftercare'),
    pro: false,
    kind: 'text',
    sections: [
      {
        heading: tx('Las primeras 24-48 horas', 'First 24–48 hours'),
        items: [
          tx('Evita sol, sauna y deporte intenso', 'Avoid sun, sauna and intense exercise'),
          tx('No uses desodorante ni perfume en la zona', 'No deodorant or perfume on the area'),
          tx('Ropa holgada', 'Loose clothing'),
          tx('Exfolia suavemente 2 veces por semana a partir del tercer día', 'Exfoliate gently twice a week from day three'),
        ],
      },
    ],
  },
  {
    id: 'hygiene',
    emoji: '🧼',
    title: tx('Checklist diario de higiene en cabina', 'Daily treatment-room hygiene checklist', 'Checklist diario de bioseguridad en el gabinete'),
    pro: false,
    kind: 'form',
    sections: [
      {
        heading: tx('Antes de cada clienta', 'Before each client'),
        items: [
          tx('Camilla desinfectada y papel nuevo', 'Couch disinfected and fresh paper'),
          tx('Material estéril o de un solo uso preparado', 'Sterile or single-use tools ready'),
          tx('Lavado de manos y guantes', 'Hand washing and gloves'),
        ],
      },
      {
        heading: tx('Al final del día', 'End of day'),
        items: [
          tx('Instrumental limpio, desinfectado y esterilizado', 'Instruments cleaned, disinfected and sterilised'),
          tx('Contenedor de objetos punzantes revisado', 'Sharps container checked'),
          tx('Superficies y suelo desinfectados', 'Surfaces and floor disinfected'),
          tx('Registro de esterilización firmado', 'Sterilisation log signed'),
        ],
      },
    ],
  },
]
