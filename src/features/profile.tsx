import { useState } from 'react'
import { COURSES } from '../courses'
import { sayer, t, tx, tr, type Text } from '../i18n'
import { streak, useApp, weekStart, type Activity, type Progress } from '../state'
import { load, save } from '../storage'
import type { CertData } from '../services'
import { MyCertificates } from './certificates'
import { PageHead } from './ui'

type Badge = { id: string; emoji: string; name: Text; how: Text; earned: (p: Progress, certs: CertData[]) => boolean }

const count = (log: Activity[] = [], kind: string) => log.filter((a) => a.k === kind).length
const completed = (p: Progress) => Object.values(p.courses).filter((c) => c.done).length

const BADGES: Badge[] = [
  { id: 'start', emoji: '🌱', name: tx('Primer paso', 'First step'), how: tx('Completa tu primera lección', 'Complete your first lesson'), earned: (p) => (p.log?.length ?? 0) > 0 },
  { id: 'lab', emoji: '✋', name: tx('Manos a la obra', 'Hands-on'), how: tx('Termina 5 prácticas guiadas', 'Finish 5 guided practices'), earned: (p) => count(p.log, 'lab') >= 5 },
  { id: 'cases', emoji: '🕵️', name: tx('Detective de cabina', 'Treatment-room detective', 'Detective de gabinete'), how: tx('Resuelve 5 casos o simulaciones', 'Solve 5 cases or simulations'), earned: (p) => count(p.log, 'case') + count(p.log, 'branch') >= 5 },
  { id: 'course1', emoji: '🎓', name: tx('Graduada', 'Graduate'), how: tx('Completa un curso', 'Complete a course'), earned: (p) => completed(p) >= 1 },
  { id: 'course3', emoji: '🏅', name: tx('Especialista', 'Specialist'), how: tx('Completa 3 cursos', 'Complete 3 courses'), earned: (p) => completed(p) >= 3 },
  { id: 'streak3', emoji: '🔥', name: tx('En racha', 'On a roll'), how: tx('3 días seguidos aprendiendo', '3 days in a row'), earned: (p) => streak(p.log) >= 3 },
  { id: 'streak7', emoji: '⚡', name: tx('Imparable', 'Unstoppable'), how: tx('7 días seguidos aprendiendo', '7 days in a row'), earned: (p) => streak(p.log) >= 7 },
  { id: 'points500', emoji: '⭐', name: tx('500 puntos', '500 points'), how: tx('Consigue 500 puntos', 'Earn 500 points'), earned: (p) => p.points >= 500 },
  { id: 'cert', emoji: '📜', name: tx('Certificada', 'Certified'), how: tx('Emite tu primer certificado', 'Issue your first certificate'), earned: (_, certs) => certs.length > 0 },
  { id: 'ai', emoji: '🤖', name: tx('Curiosa', 'Curious mind'), how: tx('Usa el tutor o el analizador con IA', 'Use the AI tutor or analyser'), earned: (p) => count(p.log, 'ai') > 0 },
  { id: 'community', emoji: '🤝', name: tx('Compañera', 'Team player'), how: tx('Publica o responde en el foro', 'Post or reply in the forum'), earned: (p) => count(p.log, 'community') > 0 },
]

type Challenge = { emoji: string; text: Text; goal: number; progress: (week: Activity[]) => number }

const CHALLENGES: Challenge[] = [
  { emoji: '✋', text: tx('Termina 3 prácticas guiadas', 'Finish 3 guided practices'), goal: 3, progress: (w) => count(w, 'lab') },
  { emoji: '🕵️', text: tx('Resuelve 4 casos o simulaciones', 'Solve 4 cases or simulations'), goal: 4, progress: (w) => count(w, 'case') + count(w, 'branch') },
  { emoji: '⭐', text: tx('Gana 100 puntos esta semana', 'Earn 100 points this week'), goal: 100, progress: (w) => w.reduce((n, a) => n + a.p, 0) },
  { emoji: '📅', text: tx('Aprende 4 días distintos', 'Study on 4 different days'), goal: 4, progress: (w) => new Set(w.map((a) => a.d)).size },
]

const RIVALS = ['Lucía', 'Valentina', 'Camila', 'Marta', 'Sofía', 'Daniela', 'Paula', 'Emma', 'Julia']

export function ProfilePage() {
  const { locale, progress, certs, addActivity } = useApp()
  const s = sayer(locale)
  const week = weekStart()
  const weekLog = (progress.log ?? []).filter((a) => a.d >= week)
  const weekPoints = weekLog.reduce((n, a) => n + a.p, 0)
  const weekIndex = Math.floor(new Date(week).getTime() / (7 * 86400000))
  const challenge = CHALLENGES[weekIndex % CHALLENGES.length]
  const challengeValue = Math.min(challenge.goal, challenge.progress(weekLog.filter((a) => a.k !== 'bonus')))
  const [claimed, setClaimed] = useState<string>(() => load('challengeClaimed', ''))

  // Sample ranking that changes every week; a shared ranking needs user accounts.
  const rivals = RIVALS.map((name, i) => ({ name, points: ((weekIndex * 37 + i * 53) % 140) + 20 }))
  const ranking = [...rivals, { name: s('Tú', 'You'), points: weekPoints, me: true }].sort((a, b) => b.points - a.points)

  return (
    <>
      <PageHead emoji="🏆" title={s('Mi progreso', 'My progress')} intro={s('Puntos, rachas, insignias, retos y tus certificados.', 'Points, streaks, badges, challenges and your certificates.')} />
      <div className="stats">
        <div className="stat">
          <span>⭐</span>
          <strong>{progress.points}</strong>
          <small>{t('points', locale)}</small>
        </div>
        <div className="stat">
          <span>🔥</span>
          <strong>{streak(progress.log)}</strong>
          <small>{s('días de racha', 'day streak')}</small>
        </div>
        <div className="stat">
          <span>🎓</span>
          <strong>
            {completed(progress)}/{COURSES.filter((c) => c.steps.length).length}
          </strong>
          <small>{s('cursos', 'courses')}</small>
        </div>
        <div className="stat">
          <span>🏅</span>
          <strong>{BADGES.filter((b) => b.earned(progress, certs)).length}</strong>
          <small>{s('insignias', 'badges')}</small>
        </div>
      </div>

      <div className="two-col">
        <section className="panel">
          <h2>
            {challenge.emoji} {s('Reto de la semana', 'Weekly challenge')}
          </h2>
          <p>{tr(challenge.text, locale)}</p>
          <div className="bar">
            <div style={{ width: `${(challengeValue / challenge.goal) * 100}%` }} />
          </div>
          <p className="hint">
            {challengeValue}/{challenge.goal} · {s('Premio: 50 puntos', 'Reward: 50 points')}
          </p>
          {challengeValue >= challenge.goal &&
            (claimed === week ? (
              <p className="feedback good">✅ {s('¡Reto superado!', 'Challenge complete!')}</p>
            ) : (
              <button
                className="primary"
                onClick={() => {
                  addActivity('bonus', 50)
                  setClaimed(week)
                  save('challengeClaimed', week)
                }}
              >
                🎁 {s('Recoger premio', 'Claim reward')}
              </button>
            ))}
        </section>
        <section className="panel">
          <h2>🥇 {s('Ranking semanal', 'Weekly ranking')}</h2>
          <ol className="ranking">
            {ranking.slice(0, 7).map((r) => (
              <li key={r.name} className={'me' in r ? 'me' : ''}>
                <span>{r.name}</span>
                <strong>{r.points}</strong>
              </li>
            ))}
          </ol>
          {ranking.findIndex((r) => 'me' in r) >= 7 && (
            <p className="hint">
              {s('Tu posición', 'Your position')}: {ranking.findIndex((r) => 'me' in r) + 1}
            </p>
          )}
          <p className="hint">{s('Ranking de ejemplo hasta que activemos las cuentas.', 'Sample ranking until accounts are switched on.')}</p>
        </section>
      </div>

      <h2 className="section-gap">🏅 {s('Insignias', 'Badges')}</h2>
      <div className="badges">
        {BADGES.map((b) => {
          const earned = b.earned(progress, certs)
          return (
            <div key={b.id} className={`badge-card ${earned ? 'earned' : ''}`} title={tr(b.how, locale)}>
              <span>{b.emoji}</span>
              <strong>{tr(b.name, locale)}</strong>
              <small>{tr(b.how, locale)}</small>
            </div>
          )
        })}
      </div>

      <h2 className="section-gap">📜 {s('Mis certificados', 'My certificates')}</h2>
      <MyCertificates />
    </>
  )
}
