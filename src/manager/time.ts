// Date helpers that work in the center's time zone, whatever the browser's zone is.

const pad = (n: number) => String(n).padStart(2, '0')

function parts(date: Date, timeZone: string) {
  const out: Record<string, string> = {}
  for (const p of new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date))
    out[p.type] = p.value
  return out
}

/** Local date (YYYY-MM-DD) and time (HH:MM) of an instant in a time zone. */
export function toZoned(iso: string | Date, timeZone: string) {
  const p = parts(typeof iso === 'string' ? new Date(iso) : iso, timeZone)
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}`, minutes: Number(p.hour) * 60 + Number(p.minute) }
}

/** Instant (ISO, UTC) of a wall-clock date and time in a time zone. */
export function fromZoned(date: string, time: string, timeZone: string): string {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  const guess = Date.UTC(y, m - 1, d, hh, mm)
  // Two passes handle the daylight-saving change correctly.
  let ts = guess
  for (let i = 0; i < 2; i++) {
    const p = parts(new Date(ts), timeZone)
    const shown = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute))
    ts += guess - shown
  }
  return new Date(ts).toISOString()
}

export function todayIn(timeZone: string) {
  return toZoned(new Date(), timeZone).date
}

export function addDays(date: string, days: number) {
  const [y, m, d] = date.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d + days))
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`
}

/** 0 = Sunday … 6 = Saturday, same convention as the database. */
export function weekday(date: string) {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

export function startOfWeek(date: string) {
  return addDays(date, -((weekday(date) + 6) % 7))
}

export function minutesOf(time: string) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function hhmm(minutes: number) {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
}

export function formatDay(date: string, opts: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }) {
  const [y, m, d] = date.split('-').map(Number)
  return new Intl.DateTimeFormat('es-ES', { ...opts, timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d)))
}

export function formatDateTime(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat('es-ES', { timeZone, weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

export function formatTime(iso: string, timeZone: string) {
  return toZoned(iso, timeZone).time
}

export const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
/** Monday-first order for editors and week views. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]
