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

// Short form for content files: tx('Hola', 'Hello') or tx('Cabina', 'Treatment room', 'Gabinete').
export function tx(es: string, en: string, la?: string): Text {
  return la === undefined ? { es, en } : { es, la, en }
}

// Spain pays in euros; LatAm and the English market in US dollars.
export function formatPrice(price: { eur: number; usd: number }, locale: Locale): string {
  const currency = locale === 'es-ES' ? 'EUR' : 'USD'
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(
    currency === 'EUR' ? price.eur : price.usd,
  )
}

export const ALL_ACCESS_PRICE = { eur: 199, usd: 219 }

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
  freeCourses: { es: 'Cursos gratuitos', en: 'Free courses' },
  premiumCourses: { es: 'Cursos premium', en: 'Premium courses' },
  premiumIntro: {
    es: 'Formación profesional completa. Las primeras lecciones de cada curso son gratis: pruébalas antes de comprar.',
    en: 'Complete professional training. The first lessons of every course are free, so try before you buy.',
  },
  premium: { es: 'Premium', en: 'Premium' },
  unlocked: { es: 'Desbloqueado', en: 'Unlocked' },
  tryFree: { es: 'Probar gratis', en: 'Try for free' },
  freeLessons: { es: 'lecciones gratis', en: 'free lessons' },
  withCertificate: { es: 'Con certificado', en: 'With certificate' },
  allAccessTitle: { es: 'Pase completo', en: 'All-access pass' },
  allAccessBody: {
    es: 'Los 10 cursos premium y todos los que añadamos durante un año.',
    en: 'All 10 premium courses, plus every new course we add for a year.',
  },
  buyAll: { es: 'Conseguir el pase', en: 'Get the pass' },
  buyCourse: { es: 'Comprar curso', en: 'Buy course' },
  paywallTitle: { es: 'Has terminado la parte gratuita', en: "You've finished the free preview" },
  paywallBody: {
    es: 'Desbloquea el curso para seguir con el resto de lecciones, los casos prácticos y el certificado.',
    en: 'Unlock the course to continue with the remaining lessons, practical cases and the certificate.',
  },
  checkoutTitle: { es: 'Finalizar compra', en: 'Checkout' },
  pay: { es: 'Pagar', en: 'Pay' },
  demoNote: {
    es: 'Versión de demostración: no se realiza ningún cobro. El curso se desbloquea en este dispositivo.',
    en: 'Demo version: no payment is taken. The course is unlocked on this device.',
  },
  close: { es: 'Cerrar', en: 'Close' },
  certificate: { es: 'Ver certificado', en: 'View certificate' },
  certTitle: { es: 'Certificado de finalización', en: 'Certificate of completion' },
  certBody: { es: 'ha completado con éxito el curso', en: 'has successfully completed the course' },
  certName: { es: 'Escribe tu nombre', en: 'Type your name' },
  print: { es: 'Imprimir o guardar en PDF', en: 'Print or save as PDF' },
  play: { es: 'Reproducir', en: 'Play' },
  pause: { es: 'Pausa', en: 'Pause' },
  replay: { es: 'Volver a ver', en: 'Watch again' },
  narration: { es: 'Narración', en: 'Narration' },
  videoQuestion: { es: 'Pausa interactiva: responde para seguir', en: 'Interactive pause: answer to continue' },
  videoDone: { es: '¡Vídeo completado!', la: '¡Video completado!', en: 'Video completed!' },
  videoStart: { es: 'Pulsa play para empezar la lección', la: 'Presiona play para empezar la lección', en: 'Press play to start the lesson' },
  hotspotHint: { es: 'Toca el punto correcto en la imagen', en: 'Tap the right spot on the picture' },
  hotspotDone: { es: '¡Todo localizado! Toca los puntos para repasar.', en: 'All found! Tap the spots to review.' },
  restart: { es: 'Empezar de nuevo', en: 'Start over' },
  footer: {
    es: 'Aula Estética · Versión de demostración',
    en: 'Aula Estética · Demo version',
  },
} satisfies Record<string, Text>

export type UiKey = keyof typeof ui

export function t(key: UiKey, locale: Locale): string {
  return tr(ui[key], locale)
}
