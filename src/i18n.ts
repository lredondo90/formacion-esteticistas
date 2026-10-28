export type Locale = 'es-ES' | 'es-419' | 'en'

export const LOCALES: { id: Locale; label: string; short: string }[] = [
  { id: 'es-ES', label: 'España', short: 'ES' },
  { id: 'es-419', label: 'Latinoamérica', short: 'LATAM' },
  { id: 'en', label: 'English', short: 'EN' },
]

// Text that varies by market. `la` falls back to `es` when Spain and LatAm say the same thing.
export type Text = { es: string; la?: string; en: string }

export function tr(text: Text, locale: Locale): string {
  if (locale === 'en') return text.en
  if (locale === 'es-419') return text.la ?? text.es
  return text.es
}

const ui = {
  tagline: {
    es: 'Formación interactiva para esteticistas',
    la: 'Formación interactiva para cosmetólogas y esteticistas',
    en: 'Interactive training for estheticians',
  },
  heroTitle: {
    es: 'Aprende jugando, trabaja con seguridad',
    en: 'Learn by doing, work with confidence',
  },
  heroBody: {
    es: 'Lecciones cortas, retos prácticos y casos reales de cabina. Sin vídeos eternos ni teoría aburrida.',
    la: 'Lecciones cortas, retos prácticos y casos reales de gabinete. Sin videos eternos ni teoría aburrida.',
    en: 'Bite-sized lessons, hands-on challenges and real treatment-room cases. No endless videos, no boring theory.',
  },
  courses: { es: 'Cursos', en: 'Courses' },
  start: { es: 'Empezar', en: 'Start' },
  continue: { es: 'Continuar', en: 'Continue' },
  review: { es: 'Repasar', en: 'Review' },
  soon: { es: 'Próximamente', en: 'Coming soon' },
  minutes: { es: 'min', en: 'min' },
  steps: { es: 'pasos', en: 'steps' },
  back: { es: 'Volver', en: 'Back' },
  next: { es: 'Siguiente', en: 'Next' },
  check: { es: 'Comprobar', en: 'Check' },
  correct: { es: '¡Correcto!', en: 'Correct!' },
  wrong: { es: 'No exactamente', en: 'Not quite' },
  tryAgain: { es: 'Inténtalo de nuevo', en: 'Try again' },
  flip: { es: 'Toca la tarjeta para darle la vuelta', en: 'Tap the card to flip it' },
  matchHint: {
    es: 'Toca un elemento de la izquierda y después su pareja de la derecha',
    en: 'Tap an item on the left, then its match on the right',
  },
  orderHint: { es: 'Toca los pasos en el orden correcto', en: 'Tap the steps in the right order' },
  reset: { es: 'Reiniciar', en: 'Reset' },
  points: { es: 'puntos', en: 'points' },
  streak: { es: 'racha', en: 'streak' },
  finishTitle: { es: '¡Curso completado!', en: 'Course completed!' },
  finishBody: {
    es: 'Has terminado el curso. Tu progreso se guarda en este dispositivo.',
    en: 'You finished the course. Your progress is saved on this device.',
  },
  backToCourses: { es: 'Volver a los cursos', en: 'Back to courses' },
  footer: {
    es: 'Aula Estética · Versión de demostración',
    en: 'Aula Estética · Demo version',
  },
} satisfies Record<string, Text>

export type UiKey = keyof typeof ui

export function t(key: UiKey, locale: Locale): string {
  return tr(ui[key], locale)
}
