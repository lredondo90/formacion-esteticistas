import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { COURSES, type Course, type Step } from './courses'
import { LOCALES, t, tr, type Locale } from './i18n'

type Progress = { points: number; courses: Record<string, { step: number; done: boolean }> }

const EMPTY: Progress = { points: 0, courses: {} }

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage may be blocked (private mode); progress just won't persist.
  }
}

function detectLocale(): Locale {
  const lang = navigator.language || 'es-ES'
  if (lang.startsWith('en')) return 'en'
  if (lang.startsWith('es') && lang !== 'es-ES' && lang !== 'es') return 'es-419'
  return 'es-ES'
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(() => load('locale', detectLocale()))
  const [progress, setProgress] = useState<Progress>(() => load('progress', EMPTY))
  const [courseId, setCourseId] = useState<string | null>(null)

  useEffect(() => {
    save('locale', locale)
    document.documentElement.lang = locale
  }, [locale])
  useEffect(() => save('progress', progress), [progress])

  const course = COURSES.find((c) => c.id === courseId)

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={() => setCourseId(null)}>
          <span className="logo">💧</span> Aula Estética
        </button>
        <div className="topbar-right">
          <span className="points">⭐ {progress.points} {t('points', locale)}</span>
          <select
            aria-label="Idioma / Language"
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
          >
            {LOCALES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main>
        {course ? (
          <Player
            key={course.id}
            course={course}
            locale={locale}
            startAt={progress.courses[course.id]?.done ? 0 : (progress.courses[course.id]?.step ?? 0)}
            onExit={() => setCourseId(null)}
            onProgress={(step, done, gained) =>
              setProgress((p) => ({
                points: p.points + gained,
                courses: { ...p.courses, [course.id]: { step, done: done || !!p.courses[course.id]?.done } },
              }))
            }
          />
        ) : (
          <Catalog locale={locale} progress={progress} onOpen={setCourseId} />
        )}
      </main>

      <footer>{t('footer', locale)}</footer>
    </div>
  )
}

function Catalog({ locale, progress, onOpen }: { locale: Locale; progress: Progress; onOpen: (id: string) => void }) {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">{t('tagline', locale)}</p>
        <h1>{t('heroTitle', locale)}</h1>
        <p>{t('heroBody', locale)}</p>
      </section>
      <h2>{t('courses', locale)}</h2>
      <div className="grid">
        {COURSES.map((c) => {
          const state = progress.courses[c.id]
          const available = c.steps.length > 0
          const pct = state?.done ? 100 : available ? Math.round(((state?.step ?? 0) / c.steps.length) * 100) : 0
          const label = state?.done ? t('review', locale) : state?.step ? t('continue', locale) : t('start', locale)
          return (
            <article key={c.id} className="card" style={{ '--accent': c.color } as CSSProperties}>
              <div className="card-emoji">{c.emoji}</div>
              <h3>{tr(c.title, locale)}</h3>
              <p>{tr(c.summary, locale)}</p>
              <p className="meta">
                {c.minutes} {t('minutes', locale)}
                {available && ` · ${c.steps.length} ${t('steps', locale)}`}
              </p>
              {available && (
                <div className="bar">
                  <div style={{ width: `${pct}%` }} />
                </div>
              )}
              <button className="primary" disabled={!available} onClick={() => onOpen(c.id)}>
                {available ? label : t('soon', locale)}
              </button>
            </article>
          )
        })}
      </div>
    </>
  )
}

function Player({
  course,
  locale,
  startAt,
  onExit,
  onProgress,
}: {
  course: Course
  locale: Locale
  startAt: number
  onExit: () => void
  onProgress: (step: number, done: boolean, gained: number) => void
}) {
  const [index, setIndex] = useState(startAt)
  const [solved, setSolved] = useState(false)
  const finished = index >= course.steps.length
  const step = course.steps[index]
  const needsSolving = step && step.kind !== 'lesson' && step.kind !== 'flashcards'

  const next = () => {
    const nextIndex = index + 1
    onProgress(nextIndex, nextIndex >= course.steps.length, needsSolving ? 10 : 2)
    setIndex(nextIndex)
    setSolved(false)
  }

  return (
    <div className="player" style={{ '--accent': course.color } as CSSProperties}>
      <div className="player-head">
        <button className="ghost" onClick={onExit}>
          ← {t('back', locale)}
        </button>
        <div className="bar">
          <div style={{ width: `${(Math.min(index, course.steps.length) / course.steps.length) * 100}%` }} />
        </div>
      </div>

      {finished ? (
        <div className="panel center">
          <div className="big-emoji">🎉</div>
          <h2>{t('finishTitle', locale)}</h2>
          <p>{t('finishBody', locale)}</p>
          <button className="primary" onClick={onExit}>
            {t('backToCourses', locale)}
          </button>
        </div>
      ) : (
        <div className="panel">
          <StepView key={index} step={step} locale={locale} onSolved={() => setSolved(true)} />
          <div className="actions">
            <button className="primary" disabled={needsSolving && !solved} onClick={next}>
              {t('next', locale)} →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function StepView({ step, locale, onSolved }: { step: Step; locale: Locale; onSolved: () => void }) {
  switch (step.kind) {
    case 'lesson':
      return (
        <div className="lesson">
          <div className="big-emoji">{step.emoji}</div>
          <h2>{tr(step.title, locale)}</h2>
          <p>{tr(step.body, locale)}</p>
          {step.tip && <p className="tip">💡 {tr(step.tip, locale)}</p>}
        </div>
      )
    case 'flashcards':
      return <Flashcards step={step} locale={locale} />
    case 'quiz':
      return <Quiz step={step} locale={locale} onSolved={onSolved} />
    case 'match':
      return <Match step={step} locale={locale} onSolved={onSolved} />
    case 'order':
      return <Order step={step} locale={locale} onSolved={onSolved} />
    case 'case':
      return <Case step={step} locale={locale} onSolved={onSolved} />
  }
}

function Flashcards({ step, locale }: { step: Extract<Step, { kind: 'flashcards' }>; locale: Locale }) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set())
  return (
    <div>
      <h2>{tr(step.title, locale)}</h2>
      <p className="hint">{t('flip', locale)}</p>
      <div className="flash-grid">
        {step.cards.map((card, i) => (
          <button
            key={i}
            className={`flash ${flipped.has(i) ? 'flipped' : ''}`}
            onClick={() =>
              setFlipped((s) => {
                const n = new Set(s)
                if (n.has(i)) n.delete(i)
                else n.add(i)
                return n
              })
            }
          >
            <span className="flash-inner">
              <span className="flash-front">{tr(card.front, locale)}</span>
              <span className="flash-back">{tr(card.back, locale)}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function Quiz({ step, locale, onSolved }: { step: Extract<Step, { kind: 'quiz' }>; locale: Locale; onSolved: () => void }) {
  const [picked, setPicked] = useState<number | null>(null)
  const right = picked === step.answer
  return (
    <div>
      <h2>{tr(step.question, locale)}</h2>
      <div className="options">
        {step.options.map((o, i) => (
          <button
            key={i}
            className={`option ${picked === i ? (right ? 'good' : 'bad') : ''}`}
            disabled={right}
            onClick={() => {
              setPicked(i)
              if (i === step.answer) onSolved()
            }}
          >
            {tr(o, locale)}
          </button>
        ))}
      </div>
      {picked !== null && (
        <p className={`feedback ${right ? 'good' : 'bad'}`}>
          {right ? `✅ ${t('correct', locale)} ${tr(step.explain, locale)}` : `❌ ${t('tryAgain', locale)}`}
        </p>
      )}
    </div>
  )
}

function Match({ step, locale, onSolved }: { step: Extract<Step, { kind: 'match' }>; locale: Locale; onSolved: () => void }) {
  const rights = useMemo(() => shuffle(step.pairs.map((_, i) => i)), [step])
  const [selected, setSelected] = useState<number | null>(null)
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [miss, setMiss] = useState<number | null>(null)

  const pickRight = (i: number) => {
    if (selected === null || matched.has(i)) return
    if (selected === i) {
      const n = new Set(matched).add(i)
      setMatched(n)
      if (n.size === step.pairs.length) onSolved()
    } else {
      setMiss(i)
      setTimeout(() => setMiss(null), 500)
    }
    setSelected(null)
  }

  return (
    <div>
      <h2>{tr(step.title, locale)}</h2>
      <p className="hint">{t('matchHint', locale)}</p>
      <div className="match">
        <div>
          {step.pairs.map((p, i) => (
            <button
              key={i}
              className={`option ${matched.has(i) ? 'good' : selected === i ? 'selected' : ''}`}
              disabled={matched.has(i)}
              onClick={() => setSelected(i)}
            >
              {tr(p.left, locale)}
            </button>
          ))}
        </div>
        <div>
          {rights.map((i) => (
            <button
              key={i}
              className={`option ${matched.has(i) ? 'good' : miss === i ? 'bad shake' : ''}`}
              disabled={matched.has(i)}
              onClick={() => pickRight(i)}
            >
              {tr(step.pairs[i].right, locale)}
            </button>
          ))}
        </div>
      </div>
      {matched.size === step.pairs.length && <p className="feedback good">✅ {t('correct', locale)}</p>}
    </div>
  )
}

function Order({ step, locale, onSolved }: { step: Extract<Step, { kind: 'order' }>; locale: Locale; onSolved: () => void }) {
  const shuffled = useMemo(() => shuffle(step.items.map((_, i) => i)), [step])
  const [chosen, setChosen] = useState<number[]>([])
  const complete = chosen.length === step.items.length
  const right = complete && chosen.every((v, i) => v === i)

  useEffect(() => {
    if (right) onSolved()
  }, [right, onSolved])

  return (
    <div>
      <h2>{tr(step.title, locale)}</h2>
      <p className="hint">{t('orderHint', locale)}</p>
      <ol className="chosen">
        {chosen.map((i, pos) => (
          <li key={i} className={complete ? (i === pos ? 'good' : 'bad') : ''}>
            {tr(step.items[i], locale)}
          </li>
        ))}
      </ol>
      <div className="options">
        {shuffled
          .filter((i) => !chosen.includes(i))
          .map((i) => (
            <button key={i} className="option" onClick={() => setChosen((c) => [...c, i])}>
              {tr(step.items[i], locale)}
            </button>
          ))}
      </div>
      {complete && (
        <p className={`feedback ${right ? 'good' : 'bad'}`}>
          {right ? `✅ ${t('correct', locale)}` : `❌ ${t('wrong', locale)}`}
          {!right && (
            <button className="ghost" onClick={() => setChosen([])}>
              {t('reset', locale)}
            </button>
          )}
        </p>
      )}
    </div>
  )
}

function Case({ step, locale, onSolved }: { step: Extract<Step, { kind: 'case' }>; locale: Locale; onSolved: () => void }) {
  const [picked, setPicked] = useState<number | null>(null)
  const choice = picked === null ? null : step.options[picked]
  return (
    <div>
      <h2>{tr(step.title, locale)}</h2>
      <p className="story">👩 {tr(step.story, locale)}</p>
      <div className="options">
        {step.options.map((o, i) => (
          <button
            key={i}
            className={`option ${picked === i ? (o.good ? 'good' : 'bad') : ''}`}
            disabled={!!choice?.good}
            onClick={() => {
              setPicked(i)
              if (o.good) onSolved()
            }}
          >
            {tr(o.text, locale)}
          </button>
        ))}
      </div>
      {choice && (
        <p className={`feedback ${choice.good ? 'good' : 'bad'}`}>
          {choice.good ? '✅' : '❌'} {tr(choice.feedback, locale)}
        </p>
      )}
    </div>
  )
}
