import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { supabaseConfigured } from '../../lib/supabase'
import { dispatchNotifications, money, rpc } from '../api'
import { addDays, todayIn, toZoned } from '../time'
import '../manager.css'

type PublicService = { id: string; name: string; description: string | null; category: string | null; duration_minutes: number; price_cents: number }
type PublicStaff = { id: string; name: string; title: string | null; services: string[] }
type PublicCenter = {
  name: string
  slug: string
  address: string | null
  phone: string | null
  timezone: string
  currency: string
  locale: string
  cancellation_hours: number
  cancellation_policy: string | null
  max_advance_days: number
  requires_approval: boolean
  services: PublicService[]
  staff: PublicStaff[]
}
type Slot = { slot_start: string; slot_staff: string }

const TEXT = {
  es: {
    loading: 'Cargando…',
    notFound: 'No encontramos este centro o no tiene la reserva online activada.',
    notConfigured: 'La reserva online todavía no está configurada.',
    service: '1. Elige tratamiento',
    pro: '2. ¿Con quién?',
    anyone: 'Me da igual',
    day: '3. Elige día y hora',
    noSlots: 'No quedan huecos este día. Prueba otro.',
    details: '4. Tus datos',
    name: 'Nombre y apellidos',
    phone: 'Teléfono',
    email: 'Correo electrónico (te enviaremos la confirmación)',
    notes: 'Algo que debamos saber (opcional)',
    notesHint: 'No incluyas datos de salud aquí; te los pediremos en el centro si hacen falta.',
    privacy: 'He leído y acepto que el centro trate mis datos para gestionar la cita.',
    marketing: 'Quiero recibir novedades y promociones del centro.',
    book: 'Confirmar reserva',
    booking: 'Reservando…',
    doneTitle: '¡Reserva hecha!',
    pendingTitle: '¡Solicitud enviada!',
    doneText: 'Te hemos enviado un correo con los detalles.',
    pendingText: 'El centro la revisará y te confirmará por correo.',
    manage: 'Ver o cancelar mi cita',
    policy: 'Política de cancelación',
    cancelUntil: (h: number) => (h ? `Puedes cancelar online hasta ${h} h antes.` : 'Puedes cancelar online hasta la hora de la cita.'),
    min: 'min',
    change: 'Cambiar',
  },
  en: {
    loading: 'Loading…',
    notFound: 'We could not find this salon or online booking is turned off.',
    notConfigured: 'Online booking is not configured yet.',
    service: '1. Choose a treatment',
    pro: '2. With whom?',
    anyone: 'No preference',
    day: '3. Pick a day and time',
    noSlots: 'No times left this day. Try another one.',
    details: '4. Your details',
    name: 'Full name',
    phone: 'Phone',
    email: 'Email (we will send you the confirmation)',
    notes: 'Anything we should know (optional)',
    notesHint: 'Please do not include health information here; we will ask in the salon if needed.',
    privacy: 'I have read and accept that the salon processes my data to manage the appointment.',
    marketing: 'I want to receive news and offers from the salon.',
    book: 'Confirm booking',
    booking: 'Booking…',
    doneTitle: 'You are booked!',
    pendingTitle: 'Request sent!',
    doneText: 'We have emailed you the details.',
    pendingText: 'The salon will review it and confirm by email.',
    manage: 'View or cancel my appointment',
    policy: 'Cancellation policy',
    cancelUntil: (h: number) => (h ? `You can cancel online up to ${h} h before.` : 'You can cancel online up to the appointment time.'),
    min: 'min',
    change: 'Change',
  },
}

export function PublicBooking({ slug }: { slug: string }) {
  const [center, setCenter] = useState<PublicCenter | null | undefined>(undefined)
  const [serviceId, setServiceId] = useState('')
  const [staffId, setStaffId] = useState('')
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState<Slot[] | null>(null)
  const [slot, setSlot] = useState<Slot | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [privacy, setPrivacy] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState<{ token: string; status: string } | null>(null)

  useEffect(() => {
    if (!supabaseConfigured) return setCenter(null)
    rpc<PublicCenter | null>('public_center', { p_slug: slug })
      .then((c) => {
        setCenter(c)
        if (c) {
          setDate(todayIn(c.timezone))
          document.title = c.name
        }
      })
      .catch(() => setCenter(null))
  }, [slug])

  const t = center?.locale === 'en' ? TEXT.en : TEXT.es
  const lang = center?.locale === 'en' ? 'en-GB' : center?.locale ?? 'es-ES'

  useEffect(() => {
    if (!center || !serviceId || !date) return
    let active = true
    setSlots(null)
    setSlot(null)
    rpc<Slot[]>('public_availability', { p_slug: slug, p_service: serviceId, p_date: date, p_staff: staffId || null })
      .then((rows) => active && setSlots(rows))
      .catch(() => active && setSlots([]))
    return () => {
      active = false
    }
  }, [center, slug, serviceId, staffId, date])

  const service = center?.services.find((s) => s.id === serviceId)
  const pros = useMemo(() => center?.staff.filter((s) => !s.services.length || s.services.includes(serviceId)) ?? [], [center, serviceId])
  const days = useMemo(() => (center ? Array.from({ length: Math.min(14, center.max_advance_days + 1) }, (_, i) => addDays(todayIn(center.timezone), i)) : []), [center])

  async function book(e: FormEvent) {
    e.preventDefault()
    if (!slot || !service) return
    setBusy(true)
    setError('')
    try {
      const result = await rpc<{ token: string; status: string }>('public_book', {
        p_slug: slug,
        p_service: service.id,
        p_starts_at: slot.slot_start,
        p_name: name,
        p_phone: phone,
        p_email: email,
        p_privacy_accepted: privacy,
        p_marketing: marketing,
        p_staff: staffId || null,
        p_notes: notes || null,
      })
      dispatchNotifications()
      setDone(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      if (String(err).includes('hueco')) setSlot(null)
    } finally {
      setBusy(false)
    }
  }

  if (center === undefined) return <PublicShell>{TEXT.es.loading}</PublicShell>
  if (center === null) return <PublicShell>{supabaseConfigured ? TEXT.es.notFound : TEXT.es.notConfigured}</PublicShell>

  const fmtDay = (d: string, opts: Intl.DateTimeFormatOptions) => {
    const [y, m, day] = d.split('-').map(Number)
    return new Intl.DateTimeFormat(lang, { ...opts, timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, day)))
  }

  if (done)
    return (
      <PublicShell center={center}>
        <div className="pb-done">
          <span>🌸</span>
          <h2>{done.status === 'pending' ? t.pendingTitle : t.doneTitle}</h2>
          <p>
            {service?.name} · {fmtDay(toZoned(slot!.slot_start, center.timezone).date, { weekday: 'long', day: 'numeric', month: 'long' })} ·{' '}
            {toZoned(slot!.slot_start, center.timezone).time}
          </p>
          <p>{done.status === 'pending' ? t.pendingText : t.doneText}</p>
          <a className="mgr-primary" href={`#/cita/${done.token}`}>
            {t.manage}
          </a>
        </div>
      </PublicShell>
    )

  return (
    <PublicShell center={center}>
      <section className="pb-step">
        <h2>{t.service}</h2>
        {service ? (
          <div className="pb-picked">
            <div>
              <strong>{service.name}</strong>
              <span>
                {service.duration_minutes} {t.min} · {money(service.price_cents, center.currency)}
              </span>
            </div>
            <button className="mgr-link" onClick={() => (setServiceId(''), setStaffId(''))}>
              {t.change}
            </button>
          </div>
        ) : (
          <div className="pb-services">
            {center.services.map((s) => (
              <button key={s.id} onClick={() => setServiceId(s.id)}>
                <strong>{s.name}</strong>
                {s.description && <p>{s.description}</p>}
                <span>
                  {s.duration_minutes} {t.min} · {money(s.price_cents, center.currency)}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {service && pros.length > 1 && (
        <section className="pb-step">
          <h2>{t.pro}</h2>
          <div className="mgr-chips">
            <button className={`mgr-chip ${staffId === '' ? 'on' : ''}`} onClick={() => setStaffId('')}>
              {t.anyone}
            </button>
            {pros.map((p) => (
              <button key={p.id} className={`mgr-chip ${staffId === p.id ? 'on' : ''}`} onClick={() => setStaffId(p.id)}>
                {p.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {service && (
        <section className="pb-step">
          <h2>{t.day}</h2>
          <div className="pb-days">
            {days.map((d) => (
              <button key={d} className={d === date ? 'on' : ''} onClick={() => setDate(d)}>
                <small>{fmtDay(d, { weekday: 'short' })}</small>
                <strong>{Number(d.slice(8))}</strong>
                <small>{fmtDay(d, { month: 'short' })}</small>
              </button>
            ))}
          </div>
          {slots === null ? (
            <p className="mgr-muted">{t.loading}</p>
          ) : slots.length === 0 ? (
            <p className="mgr-muted">{t.noSlots}</p>
          ) : (
            <div className="mgr-slots">
              {slots.map((s) => {
                const time = toZoned(s.slot_start, center.timezone).time
                return (
                  <button key={s.slot_start} className={slot?.slot_start === s.slot_start ? 'selected' : ''} onClick={() => setSlot(s)}>
                    {time}
                  </button>
                )
              })}
            </div>
          )}
        </section>
      )}

      {slot && (
        <section className="pb-step">
          <h2>{t.details}</h2>
          <form className="mgr-form" onSubmit={book}>
            <label>
              {t.name}
              <input required minLength={2} maxLength={120} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <div className="mgr-form-grid">
              <label>
                {t.phone}
                <input required type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </label>
              <label>
                {t.email}
                <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
            </div>
            <label>
              {t.notes}
              <input value={notes} maxLength={500} onChange={(e) => setNotes(e.target.value)} />
              <small className="mgr-muted">{t.notesHint}</small>
            </label>
            <div className="pb-policy">
              <strong>{t.policy}</strong>
              <p>{t.cancelUntil(center.cancellation_hours)}</p>
              {center.cancellation_policy && <p>{center.cancellation_policy}</p>}
            </div>
            <label className="mgr-check">
              <input type="checkbox" required checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} /> {t.privacy}
            </label>
            <label className="mgr-check">
              <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} /> {t.marketing}
            </label>
            {error && (
              <p className="mgr-notice mgr-error" role="alert">
                {error}
              </p>
            )}
            <button className="mgr-primary pb-book" disabled={busy}>
              {busy ? t.booking : `${t.book} · ${toZoned(slot.slot_start, center.timezone).time}`}
            </button>
          </form>
        </section>
      )}
    </PublicShell>
  )
}

type PublicAppointment = {
  center: string
  slug: string
  address: string | null
  phone: string | null
  timezone: string
  service: string
  staff: string
  starts_at: string
  status: string
  price_cents: number
  currency: string
  cancellation_hours: number
  can_cancel: boolean
}

const STATUS_PUBLIC: Record<string, string> = {
  pending: 'Pendiente de confirmar',
  confirmed: 'Confirmada',
  completed: 'Realizada',
  cancelled: 'Cancelada',
  no_show: 'No asistida',
  rejected: 'No confirmada por el centro',
  expired: 'Caducada',
}

/** The client's own page for one appointment (link in the confirmation email). */
export function ManageBooking({ token }: { token: string }) {
  const [appt, setAppt] = useState<PublicAppointment | null | undefined>(undefined)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const load = () =>
    rpc<PublicAppointment | null>('public_appointment', { p_token: token })
      .then(setAppt)
      .catch(() => setAppt(null))
  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  if (appt === undefined) return <PublicShell>Cargando…</PublicShell>
  if (appt === null) return <PublicShell>No encontramos esta cita.</PublicShell>
  const local = toZoned(appt.starts_at, appt.timezone)
  return (
    <PublicShell center={{ name: appt.center, address: appt.address, phone: appt.phone }}>
      <div className="pb-done">
        <span>🗓️</span>
        <h2>{appt.service}</h2>
        <p>
          {new Intl.DateTimeFormat('es-ES', { timeZone: appt.timezone, weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(appt.starts_at))} · {local.time} ·{' '}
          {appt.staff}
        </p>
        <p>
          <strong>{STATUS_PUBLIC[appt.status] ?? appt.status}</strong> · {money(appt.price_cents, appt.currency)}
        </p>
        {appt.can_cancel ? (
          <button
            className="mgr-secondary danger"
            disabled={busy}
            onClick={() => {
              if (!confirm('¿Seguro que quieres cancelar la cita?')) return
              setBusy(true)
              rpc('public_cancel', { p_token: token })
                .then(() => (dispatchNotifications(), load()))
                .catch((e: Error) => setError(e.message))
                .finally(() => setBusy(false))
            }}
          >
            Cancelar mi cita
          </button>
        ) : (
          ['pending', 'confirmed'].includes(appt.status) && <p className="mgr-muted">Para cambiar o cancelar, llama al centro{appt.phone ? `: ${appt.phone}` : ''}.</p>
        )}
        {error && <p className="mgr-notice mgr-error">{error}</p>}
        <a className="mgr-link" href={`#/reservar/${appt.slug}`}>
          Reservar otra cita
        </a>
      </div>
    </PublicShell>
  )
}

function PublicShell({ center, children }: { center?: { name: string; address: string | null; phone: string | null }; children: ReactNode }) {
  return (
    <div className="mgr pb">
      <header className="pb-head">
        <span className="mgr-kicker">RESERVA ONLINE</span>
        {center && (
          <>
            <h1>{center.name}</h1>
            <p>{[center.address, center.phone].filter(Boolean).join(' · ')}</p>
          </>
        )}
      </header>
      <main className="pb-body">{children}</main>
      <footer className="pb-foot">Reservas con Belaura</footer>
    </div>
  )
}
