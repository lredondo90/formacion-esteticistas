import { useEffect, useState } from 'react'
import { sayer, tx, tr, type Text } from '../i18n'
import { useApp } from '../state'
import { load, save } from '../storage'
import { DemoNote, PageHead } from './ui'

type Session = { id: string; title: Text; host: Text; emoji: string; start: Date; minutes: number; pro: boolean }

// Upcoming sessions: Tuesdays and Thursdays at 18:00 UTC (19:00 in Spain in winter, 12:00 in Mexico City).
const TOPICS: Omit<Session, 'id' | 'start'>[] = [
  { emoji: '✒️', title: tx('Masterclass: diseño de cejas en directo', 'Masterclass: live brow mapping'), host: tx('Especialista invitada en micropigmentación', 'Guest micropigmentation specialist'), minutes: 60, pro: true },
  { emoji: '❓', title: tx('Dudas abiertas: tu primer año como esteticista', 'Open Q&A: your first year as an esthetician'), host: tx('Equipo docente de Belaura', 'Belaura teaching team'), minutes: 45, pro: false },
  { emoji: '👁️', title: tx('Volumen ruso paso a paso', 'Russian volume step by step'), host: tx('Lash artist invitada', 'Guest lash artist'), minutes: 60, pro: true },
  { emoji: '📈', title: tx('Instagram que llena la agenda', 'Instagram that fills your diary'), host: tx('Experta en marketing para centros', 'Salon marketing expert'), minutes: 45, pro: true },
  { emoji: '🧪', title: tx('Peelings: cómo elegir el ácido', 'Peels: choosing the right acid'), host: tx('Cosmetóloga invitada', 'Guest cosmetic scientist'), minutes: 60, pro: true },
  { emoji: '💅', title: tx('Nail art de temporada', 'Seasonal nail art'), host: tx('Nail artist invitada', 'Guest nail artist'), minutes: 45, pro: false },
]

function upcoming(): Session[] {
  const out: Session[] = []
  const d = new Date()
  d.setUTCHours(18, 0, 0, 0)
  while (out.length < TOPICS.length) {
    d.setUTCDate(d.getUTCDate() + 1)
    const day = d.getUTCDay()
    if (day === 2 || day === 4) {
      const topic = TOPICS[out.length]
      out.push({ ...topic, id: `${d.toISOString().slice(0, 10)}-${out.length}`, start: new Date(d) })
    }
  }
  return out
}

function icsFile(session: Session, title: string, host: string) {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')
  const end = new Date(session.start.getTime() + session.minutes * 60000)
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Belaura//ES',
    'BEGIN:VEVENT',
    `UID:${session.id}@belaura`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(session.start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${host} · ${location.origin}/#/directo`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
  a.download = 'belaura.ics'
  a.click()
}

export function LivePage() {
  const { locale, pro, go } = useApp()
  const s = sayer(locale)
  const [booked, setBooked] = useState<string[]>(() => load('booked', []))
  useEffect(() => save('booked', booked), [booked])
  const sessions = upcoming()
  const liveUrl = import.meta.env.VITE_LIVE_URL as string | undefined
  const fmt = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })

  return (
    <>
      <PageHead
        emoji="📺"
        title={s('Clases en directo', 'Live classes')}
        intro={s(
          'Masterclasses con profesionales del sector, con turno de preguntas. Horario en tu zona horaria.',
          'Masterclasses with industry professionals, with live Q&A. Times shown in your time zone.',
        )}
      />
      <DemoNote>
        {s(
          'Calendario de muestra. El enlace para entrar aparece 15 minutos antes de empezar.',
          'Sample schedule. The join link appears 15 minutes before the start.',
        )}
      </DemoNote>
      <div className="list">
        {sessions.map((session) => {
          const title = tr(session.title, locale)
          const host = tr(session.host, locale)
          const isBooked = booked.includes(session.id)
          const soon = session.start.getTime() - Date.now() < 15 * 60000
          const locked = session.pro && !pro
          return (
            <div key={session.id} className="list-item live">
              <div className="live-date">
                <span className="live-emoji">{session.emoji}</span>
              </div>
              <div className="live-info">
                <strong>{title}</strong>
                <p className="hint">
                  {fmt.format(session.start)} · {session.minutes} min · {host}
                </p>
                {session.pro ? <span className="badge">💎 Pro</span> : <span className="badge owned">{s('Gratis', 'Free')}</span>}
              </div>
              <div className="live-actions">
                {locked ? (
                  <button className="secondary small" onClick={() => go('planes')}>
                    💎 {s('Incluida en Aula Pro', 'Included in Aula Pro')}
                  </button>
                ) : soon && liveUrl ? (
                  <a className="primary" href={liveUrl} target="_blank" rel="noreferrer">
                    🔴 {s('Entrar', 'Join')}
                  </a>
                ) : (
                  <>
                    <button
                      className={isBooked ? 'secondary small' : 'primary'}
                      onClick={() => setBooked((b) => (isBooked ? b.filter((x) => x !== session.id) : [...b, session.id]))}
                    >
                      {isBooked ? `✓ ${s('Plaza reservada', 'Booked')}` : s('Reservar plaza', 'Book a seat')}
                    </button>
                    {isBooked && (
                      <button className="ghost" onClick={() => icsFile(session, title, host)}>
                        📅 {s('Añadir al calendario', 'Add to calendar')}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
