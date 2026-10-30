import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { COURSES, type Course, type Step } from './courses'
import { ALL_ACCESS_PRICE, formatPrice, LOCALES, t, tr, type Locale } from './i18n'
import { Branch, Hotspot, VideoLesson } from './interactive'
import { BrowLab } from './labs/BrowLab'
import { GuidedLab } from './labs/engine'
import { LABS } from './labs'
import { load, save } from './storage'
import { startCheckout } from './services'
import { AppContext, today, type AppState, type Plan, type Progress } from './state'
import type { CertData } from './services'
import { IssueCertificate, VerifyPage } from './features/certificates'
import { AiPage } from './features/ai'
import { ToolsPage } from './features/tools'
import { CommunityPage } from './features/community'
import { LivePage } from './features/live'
import { PracticePage } from './features/practice'
import { ProfilePage } from './features/profile'
import { PlansPage } from './features/plans'
import { ManagerHome } from './manager/ManagerHome'
import { ManageBooking, PublicBooking } from './manager/booking/PublicBooking'

const EMPTY: Progress = { points: 0, courses: {} }

function isUnlocked(course: Course, purchases: string[]) {
  return !course.premium || purchases.includes('all') || purchases.includes(course.id)
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

const NAV = [
  { id: 'gestor', emoji: '🗓️', label: { es: 'Gestor', en: 'Manager' } },
  { id: 'cursos', emoji: '🎓', label: { es: 'Cursos', en: 'Courses' } },
  { id: 'ia', emoji: '🤖', label: { es: 'IA', en: 'AI' } },
  { id: 'herramientas', emoji: '🧰', label: { es: 'Herramientas', en: 'Tools' } },
  { id: 'comunidad', emoji: '👥', label: { es: 'Comunidad', en: 'Community' } },
  { id: 'directo', emoji: '📺', label: { es: 'Directo', en: 'Live' } },
  { id: 'practicas', emoji: '📸', label: { es: 'Prácticas', en: 'Practice' } },
  { id: 'perfil', emoji: '🏆', label: { es: 'Mi progreso', en: 'Progress' } },
  { id: 'planes', emoji: '💎', label: { es: 'Planes', en: 'Plans' } },
]

function readRoute(): string {
  return location.hash.replace(/^#\/?/, '') || 'cursos'
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(() => load('locale', detectLocale()))
  const [progress, setProgress] = useState<Progress>(() => load('progress', EMPTY))
  const [courseId, setCourseId] = useState<string | null>(null)
  const [purchases, setPurchases] = useState<string[]>(() => load('purchases', []))
  const [plan, setPlan] = useState<Plan>(() => load('plan', null))
  const [certs, setCerts] = useState<CertData[]>(() => load('certs', []))
  const [checkout, setCheckout] = useState<string | null>(null)
  const [route, setRoute] = useState(readRoute)

  useEffect(() => {
    save('locale', locale)
    document.documentElement.lang = locale
  }, [locale])
  useEffect(() => save('progress', progress), [progress])
  useEffect(() => save('purchases', purchases), [purchases])
  useEffect(() => save('plan', plan), [plan])
  useEffect(() => save('certs', certs), [certs])
  useEffect(() => {
    const onHash = () => {
      setRoute(readRoute())
      setCourseId(null)
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Back from Stripe Checkout. The real unlock should come from a Stripe webhook once accounts exist.
  useEffect(() => {
    if (!route.startsWith('pago-ok')) return
    const product = new URLSearchParams(route.split('?')[1]).get('product')
    if (product === 'monthly' || product === 'yearly') setPlan(product)
    else if (product) setPurchases((p) => [...new Set([...p, product])])
    location.hash = product === 'monthly' || product === 'yearly' ? '#/perfil' : '#/cursos'
  }, [route])

  const unlock = (product: string) => setPurchases((p) => [...new Set([...p, product])])
  const state: AppState = {
    locale,
    progress,
    purchases,
    plan,
    pro: plan !== null,
    certs,
    addActivity: (kind, points) =>
      setProgress((p) => ({ ...p, points: p.points + points, log: [...(p.log ?? []), { d: today(), k: kind, p: points }].slice(-500) })),
    addCert: (cert) => setCerts((list) => [...list.filter((c) => c.c !== cert.c), cert]),
    setPlan,
    unlock,
    go: (r) => {
      location.hash = `#/${r}`
    },
  }

  const course = COURSES.find((c) => c.id === courseId)
  const page = route.split(/[/?]/)[0]

  // Public pages for the clients of a center: no academy navigation around them.
  if (page === 'reservar') return <PublicBooking slug={route.split(/[/?]/)[1] ?? ''} />
  if (page === 'cita') return <ManageBooking token={route.split(/[/?]/)[1] ?? ''} />

  let content
  if (page === 'verificar') content = <VerifyPage payload={route.slice('verificar/'.length)} />
  else if (course)
    content = (
      <Player
        key={course.id}
        course={course}
        locale={locale}
        startAt={progress.courses[course.id]?.done ? 0 : (progress.courses[course.id]?.step ?? 0)}
        unlocked={isUnlocked(course, purchases) || plan !== null}
        onBuy={() => setCheckout(course.id)}
        onExit={() => setCourseId(null)}
        onProgress={(step, done, gained, kind) =>
          setProgress((p) => ({
            points: p.points + gained,
            courses: { ...p.courses, [course.id]: { step, done: done || !!p.courses[course.id]?.done } },
            log: [...(p.log ?? []), { d: today(), k: kind, p: gained }].slice(-500),
          }))
        }
      />
    )
  else if (page === 'ia') content = <AiPage />
  else if (page === 'herramientas') content = <ToolsPage />
  else if (page === 'comunidad') content = <CommunityPage />
  else if (page === 'directo') content = <LivePage />
  else if (page === 'practicas') content = <PracticePage />
  else if (page === 'perfil') content = <ProfilePage />
  else if (page === 'planes') content = <PlansPage />
  else if (page === 'gestor') content = <ManagerHome />
  else
    content = (
      <Catalog
        locale={locale}
        progress={progress}
        purchases={plan ? [...purchases, 'all'] : purchases}
        onOpen={setCourseId}
        onBuy={setCheckout}
      />
    )

  return (
    <AppContext.Provider value={state}>
      <div className="app">
        <header className="topbar">
          <button className="brand" onClick={() => state.go('cursos')}>
            <span className="logo">💧</span> Aula Estética
          </button>
          <div className="topbar-right">
            {plan && <span className="badge">💎 Pro</span>}
            <span className="points">⭐ {progress.points} {t('points', locale)}</span>
            <select aria-label="Idioma / Language" value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
              {LOCALES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </header>
        {page !== 'verificar' && (
          <nav className="nav">
            {NAV.map((n) => (
              <a key={n.id} href={`#/${n.id}`} className={`nav-item ${page === n.id || (n.id === 'cursos' && !NAV.some((x) => x.id === page)) ? 'active' : ''}`}>
                <span>{n.emoji}</span> {tr(n.label, locale)}
              </a>
            ))}
          </nav>
        )}

        <main className={page === 'gestor' ? 'wide' : undefined}>{content}</main>

        {checkout && (
          <Checkout
            target={checkout}
            locale={locale}
            onClose={() => setCheckout(null)}
            onPaid={() => {
              unlock(checkout)
              setCheckout(null)
            }}
          />
        )}

        <footer>{t('footer', locale)}</footer>
      </div>
    </AppContext.Provider>
  )
}

function Catalog({
  locale,
  progress,
  purchases,
  onOpen,
  onBuy,
}: {
  locale: Locale
  progress: Progress
  purchases: string[]
  onOpen: (id: string) => void
  onBuy: (target: string) => void
}) {
  const card = (c: Course) => {
    const state = progress.courses[c.id]
    const available = c.steps.length > 0
    const unlocked = isUnlocked(c, purchases)
    const pct = state?.done ? 100 : available ? Math.round(((state?.step ?? 0) / c.steps.length) * 100) : 0
    const label = state?.done
      ? t('review', locale)
      : state?.step
        ? t('continue', locale)
        : unlocked
          ? t('start', locale)
          : t('tryFree', locale)
    return (
      <article key={c.id} className="card" style={{ '--accent': c.color } as CSSProperties}>
        <div className="card-top">
          <div className="card-emoji">{c.emoji}</div>
          {c.premium && (
            <span className={`badge ${unlocked ? 'owned' : ''}`}>
              {unlocked ? `✓ ${t('unlocked', locale)}` : `★ ${t('premium', locale)} · ${formatPrice(c.premium, locale)}`}
            </span>
          )}
        </div>
        <h3>{tr(c.title, locale)}</h3>
        <p>{tr(c.summary, locale)}</p>
        <p className="meta">
          {c.minutes} {t('minutes', locale)}
          {available && ` · ${c.steps.length} ${t('steps', locale)}`}
          {c.premium && !unlocked && ` · ${c.freeSteps ?? 0} ${t('freeLessons', locale)}`}
          {c.certificate && ` · 🎓 ${t('withCertificate', locale)}`}
        </p>
        {available && (
          <div className="bar">
            <div style={{ width: `${pct}%` }} />
          </div>
        )}
        <div className="card-actions">
          <button className="primary" disabled={!available} onClick={() => onOpen(c.id)}>
            {available ? label : t('soon', locale)}
          </button>
          {c.premium && !unlocked && (
            <button className="secondary" onClick={() => onBuy(c.id)}>
              {t('buyCourse', locale)}
            </button>
          )}
        </div>
      </article>
    )
  }

  const free = COURSES.filter((c) => !c.premium)
  const premium = COURSES.filter((c) => c.premium)
  const hasAll = purchases.includes('all')

  return (
    <>
      <section className="hero">
        <p className="eyebrow">{t('tagline', locale)}</p>
        <h1>{t('heroTitle', locale)}</h1>
        <p>{t('heroBody', locale)}</p>
      </section>
      <h2>{t('premiumCourses', locale)}</h2>
      <p className="section-intro">{t('premiumIntro', locale)}</p>
      {!hasAll && (
        <div className="pass">
          <div>
            <strong>🎟️ {t('allAccessTitle', locale)} · {formatPrice(ALL_ACCESS_PRICE, locale)}</strong>
            <p>{t('allAccessBody', locale)}</p>
          </div>
          <button className="primary" onClick={() => onBuy('all')}>
            {t('buyAll', locale)}
          </button>
        </div>
      )}
      <div className="grid">{premium.map(card)}</div>
      <h2 className="section-gap">{t('freeCourses', locale)}</h2>
      <div className="grid">{free.map(card)}</div>
    </>
  )
}

function Checkout({
  target,
  locale,
  onClose,
  onPaid,
}: {
  target: string
  locale: Locale
  onClose: () => void
  onPaid: () => void
}) {
  const course = COURSES.find((c) => c.id === target)
  const title = course ? tr(course.title, locale) : t('allAccessTitle', locale)
  const price = course?.premium ?? ALL_ACCESS_PRICE
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h2>{t('checkoutTitle', locale)}</h2>
        <div className="checkout-line">
          <span>
            {course?.emoji ?? '🎟️'} {title}
          </span>
          <strong>{formatPrice(price, locale)}</strong>
        </div>
        {!course && <p className="hint">{t('allAccessBody', locale)}</p>}
        <p className="demo-note">ℹ️ {t('demoNote', locale)}</p>
        <div className="actions">
          <button className="ghost" onClick={onClose}>
            {t('close', locale)}
          </button>
          <button
            className="primary"
            onClick={async () => {
              if (!(await startCheckout(target, locale))) onPaid()
            }}
          >
            {t('pay', locale)} {formatPrice(price, locale)}
          </button>
        </div>
      </div>
    </div>
  )
}

function Player({
  course,
  locale,
  startAt,
  unlocked,
  onBuy,
  onExit,
  onProgress,
}: {
  course: Course
  locale: Locale
  startAt: number
  unlocked: boolean
  onBuy: () => void
  onExit: () => void
  onProgress: (step: number, done: boolean, gained: number, kind: string) => void
}) {
  const [index, setIndex] = useState(startAt)
  const [solved, setSolved] = useState(false)
  const [showCert, setShowCert] = useState(false)
  const finished = index >= course.steps.length
  const step = course.steps[index]
  const needsSolving = step && step.kind !== 'lesson' && step.kind !== 'flashcards'
  const locked = !unlocked && index >= (course.freeSteps ?? 0)

  const next = () => {
    const nextIndex = index + 1
    onProgress(nextIndex, nextIndex >= course.steps.length, step.kind === 'lab' ? 25 : step.kind === 'video' ? 15 : needsSolving ? 10 : 2, step.kind)
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
          {showCert ? (
            <IssueCertificate course={course} />
          ) : (
            <>
              <div className="big-emoji">🎉</div>
              <h2>{t('finishTitle', locale)}</h2>
              <p>{t('finishBody', locale)}</p>
            </>
          )}
          <div className="center-actions">
            {course.certificate && !showCert && (
              <button className="secondary" onClick={() => setShowCert(true)}>
                🎓 {t('certificate', locale)}
              </button>
            )}
            <button className="primary" onClick={onExit}>
              {t('backToCourses', locale)}
            </button>
          </div>
        </div>
      ) : locked ? (
        <div className="panel center">
          <div className="big-emoji">🔒</div>
          <h2>{t('paywallTitle', locale)}</h2>
          <p>{t('paywallBody', locale)}</p>
          {course.premium && (
            <button className="primary" onClick={onBuy}>
              {t('buyCourse', locale)} · {formatPrice(course.premium, locale)}
            </button>
          )}
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
    case 'video':
      return <VideoLesson step={step} locale={locale} onSolved={onSolved} />
    case 'hotspot':
      return <Hotspot step={step} locale={locale} onSolved={onSolved} />
    case 'branch':
      return <Branch step={step} locale={locale} onSolved={onSolved} />
    case 'lab':
      return step.lab === 'brows' ? <BrowLab locale={locale} onSolved={onSolved} /> : <GuidedLab def={LABS[step.lab]} locale={locale} onSolved={onSolved} />
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
