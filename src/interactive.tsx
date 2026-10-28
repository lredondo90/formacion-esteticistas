import { useEffect, useRef, useState } from 'react'
import type { Figure, Question, Step } from './courses'
import { t, tr, type Locale } from './i18n'
import { load, save } from './storage'

type Solvable<K extends Step['kind']> = { step: Extract<Step, { kind: K }>; locale: Locale; onSolved: () => void }

const SPEECH_LANG: Record<Locale, string> = { 'es-ES': 'es-ES', 'es-419': 'es-MX', en: 'en-US' }

function speak(text: string, locale: Locale) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = SPEECH_LANG[locale]
  window.speechSynthesis.speak(u)
}

function stopSpeaking() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}

// Long captions stay on screen long enough to read (and to be narrated).
function sceneMs(caption: string, seconds?: number) {
  const words = caption.split(/\s+/).length
  return Math.max((seconds ?? 5) * 1000, words * 380 + 1200)
}

function QuestionBox({ q, locale, onCorrect }: { q: Question; locale: Locale; onCorrect: () => void }) {
  const [picked, setPicked] = useState<number | null>(null)
  const right = picked === q.answer
  return (
    <div className="video-question">
      <p className="eyebrow">⏸ {t('videoQuestion', locale)}</p>
      <h3>{tr(q.question, locale)}</h3>
      <div className="options">
        {q.options.map((o, i) => (
          <button
            key={i}
            className={`option ${picked === i ? (right ? 'good' : 'bad') : ''}`}
            disabled={right}
            onClick={() => setPicked(i)}
          >
            {tr(o, locale)}
          </button>
        ))}
      </div>
      {picked !== null && (
        <p className={`feedback ${right ? 'good' : 'bad'}`}>
          {right ? `✅ ${tr(q.explain, locale)}` : `❌ ${t('tryAgain', locale)}`}
        </p>
      )}
      {right && (
        <button className="primary" onClick={onCorrect}>
          ▶ {t('continue', locale)}
        </button>
      )}
    </div>
  )
}

export function VideoLesson(props: Solvable<'video'>) {
  return props.step.src ? <RealVideo {...props} /> : <AnimatedVideo {...props} />
}

function AnimatedVideo({ step, locale, onSolved }: Solvable<'video'>) {
  const [scene, setScene] = useState(0)
  const [reached, setReached] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [asking, setAsking] = useState(false)
  const [answered, setAnswered] = useState<Set<number>>(new Set())
  const [ended, setEnded] = useState(false)
  const [narrate, setNarrate] = useState<boolean>(() => load('narration', false))

  const current = step.scenes[scene]
  const caption = tr(current.caption, locale)
  const duration = sceneMs(caption, current.seconds)

  useEffect(() => save('narration', narrate), [narrate])
  useEffect(() => stopSpeaking, [])

  useEffect(() => {
    if (!playing || asking) return
    const id = setInterval(() => setElapsed((e) => e + 100), 100)
    return () => clearInterval(id)
  }, [playing, asking])

  useEffect(() => {
    if (playing && narrate && !asking) speak(caption, locale)
    else stopSpeaking()
    // Speak once per scene; pausing restarts the scene's narration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, playing, narrate, asking])

  const goTo = (i: number) => {
    setScene(i)
    setReached((r) => Math.max(r, i))
    setElapsed(0)
    setAsking(false)
  }

  const advance = () => {
    if (scene + 1 < step.scenes.length) goTo(scene + 1)
    else {
      setPlaying(false)
      setEnded(true)
      onSolved()
    }
  }

  useEffect(() => {
    if (elapsed < duration) return
    if (current.question && !answered.has(scene)) {
      setAsking(true)
      setElapsed(duration)
    } else advance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, duration])

  const togglePlay = () => {
    if (ended) {
      setEnded(false)
      goTo(0)
      setPlaying(true)
      return
    }
    if (playing && narrate) setElapsed(0)
    setPlaying((p) => !p)
  }

  const fill = (i: number) => (i < scene || ended ? 100 : i > scene ? 0 : Math.min(100, (elapsed / duration) * 100))

  return (
    <div>
      <h2>🎬 {tr(step.title, locale)}</h2>
      <div className="stage">
        <div key={scene} className="scene">
          {current.title && <div className="scene-title">{tr(current.title, locale)}</div>}
          <div className={`scene-hero anim-${current.anim ?? 'zoom'}`}>{current.emoji}</div>
          {current.props?.map((p, i) => (
            <span key={i} className={`scene-prop prop-${i % 4}`} style={{ animationDelay: `${0.4 + i * 0.35}s` }}>
              {p}
            </span>
          ))}
          <div className="caption">{caption}</div>
        </div>

        {!playing && !asking && !ended && elapsed === 0 && scene === 0 && (
          <button className="stage-overlay" onClick={togglePlay}>
            <span className="big-play">▶</span>
            <span>{t('videoStart', locale)}</span>
          </button>
        )}
        {asking && current.question && (
          <div className="stage-overlay solid">
            <QuestionBox
              key={scene}
              q={current.question}
              locale={locale}
              onCorrect={() => {
                setAnswered((a) => new Set(a).add(scene))
                setAsking(false)
                advance()
              }}
            />
          </div>
        )}
        {ended && (
          <div className="stage-overlay solid">
            <div className="big-emoji">✅</div>
            <h3>{t('videoDone', locale)}</h3>
            <button className="secondary" onClick={togglePlay}>
              ↺ {t('replay', locale)}
            </button>
          </div>
        )}
      </div>

      <div className="video-controls">
        <button className="ctrl" onClick={togglePlay} aria-label={playing ? t('pause', locale) : t('play', locale)}>
          {playing ? '⏸' : '▶'}
        </button>
        <div className="timeline">
          {step.scenes.map((s, i) => (
            <button
              key={i}
              className={`segment ${s.question ? 'has-q' : ''}`}
              disabled={i > reached}
              onClick={() => goTo(i)}
              aria-label={`${i + 1} / ${step.scenes.length}`}
            >
              <span style={{ width: `${fill(i)}%` }} />
            </button>
          ))}
        </div>
        <span className="scene-count">
          {scene + 1}/{step.scenes.length}
        </span>
        <button
          className={`ctrl ${narrate ? 'on' : ''}`}
          onClick={() => setNarrate((n) => !n)}
          title={t('narration', locale)}
          aria-pressed={narrate}
        >
          {narrate ? '🔊' : '🔇'}
        </button>
      </div>
    </div>
  )
}

// Real footage: pauses at each cue (in seconds) until the question is answered.
function RealVideo({ step, locale, onSolved }: Solvable<'video'>) {
  const ref = useRef<HTMLVideoElement>(null)
  const cues = step.cues ?? []
  const [answered, setAnswered] = useState<Set<number>>(new Set())
  const [asking, setAsking] = useState<number | null>(null)

  const onTime = () => {
    const v = ref.current
    if (!v || asking !== null) return
    const due = cues.findIndex((c, i) => !answered.has(i) && v.currentTime >= c.at)
    if (due >= 0) {
      v.pause()
      setAsking(due)
    }
  }

  return (
    <div>
      <h2>🎬 {tr(step.title, locale)}</h2>
      <div className="stage">
        <video ref={ref} src={step.src} controls playsInline onTimeUpdate={onTime} onEnded={onSolved} />
        {asking !== null && (
          <div className="stage-overlay solid">
            <QuestionBox
              key={asking}
              q={cues[asking].question}
              locale={locale}
              onCorrect={() => {
                setAnswered((a) => new Set(a).add(asking))
                setAsking(null)
                ref.current?.play()
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export function Hotspot({ step, locale, onSolved }: Solvable<'hotspot'>) {
  const [task, setTask] = useState(0)
  const [miss, setMiss] = useState<number | null>(null)
  const [found, setFound] = useState<Set<number>>(new Set())
  const [note, setNote] = useState<string | null>(null)
  const done = task >= step.tasks.length

  const tap = (i: number) => {
    if (done) {
      setNote(tr(step.spots[i].label, locale))
      return
    }
    const current = step.tasks[task]
    if (i === current.spot) {
      setFound((f) => new Set(f).add(i))
      setNote(`✅ ${tr(current.explain, locale)}`)
      setTask(task + 1)
      if (task + 1 >= step.tasks.length) onSolved()
    } else {
      setMiss(i)
      setNote(`❌ ${tr(step.spots[i].label, locale)}. ${t('tryAgain', locale)}`)
      setTimeout(() => setMiss(null), 500)
    }
  }

  return (
    <div>
      <h2>👆 {tr(step.title, locale)}</h2>
      <p className="hint">{t('hotspotHint', locale)}</p>
      <p className="task">{done ? `🎯 ${t('hotspotDone', locale)}` : tr(step.tasks[task].prompt, locale)}</p>
      <div className="figure">
        <FigureArt figure={step.figure} />
        {step.spots.map((s, i) => (
          <button
            key={i}
            className={`spot ${found.has(i) ? 'found' : ''} ${miss === i ? 'bad shake' : ''}`}
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            onClick={() => tap(i)}
            aria-label={done || found.has(i) ? tr(s.label, locale) : `${i + 1}`}
          >
            {found.has(i) ? '✓' : i + 1}
            {(done || found.has(i)) && <span className="spot-label">{tr(s.label, locale)}</span>}
          </button>
        ))}
      </div>
      {note && <p className={`feedback ${note.startsWith('❌') ? 'bad' : 'good'}`}>{note}</p>}
    </div>
  )
}

export function Branch({ step, locale, onSolved }: Solvable<'branch'>) {
  const [nodeId, setNodeId] = useState(step.start)
  const [history, setHistory] = useState<{ who?: string; text: string; mine?: boolean }[]>([])
  const [outcome, setOutcome] = useState<{ good: boolean; feedback?: string } | null>(null)
  const node = step.nodes[nodeId]

  const choose = (i: number) => {
    const c = node.choices[i]
    const lines = [
      ...history,
      { who: node.who, text: tr(node.text, locale) },
      { text: tr(c.text, locale), mine: true },
    ]
    if (c.feedback && !c.end) lines.push({ who: '💬', text: tr(c.feedback, locale) })
    setHistory(lines)
    if (c.end) {
      setOutcome({ good: c.end === 'good', feedback: c.feedback && tr(c.feedback, locale) })
      if (c.end === 'good') onSolved()
    } else if (c.next) setNodeId(c.next)
  }

  const restart = () => {
    setNodeId(step.start)
    setHistory([])
    setOutcome(null)
  }

  return (
    <div>
      <h2>🔀 {tr(step.title, locale)}</h2>
      <div className="chat">
        {history.map((h, i) => (
          <p key={i} className={`bubble ${h.mine ? 'mine' : ''}`}>
            {!h.mine && h.who && <span className="who">{h.who}</span>}
            {h.text}
          </p>
        ))}
        {!outcome && (
          <p className="bubble current">
            {node.who && <span className="who">{node.who}</span>}
            {tr(node.text, locale)}
          </p>
        )}
      </div>
      {outcome ? (
        <div className={`feedback ${outcome.good ? 'good' : 'bad'}`}>
          <p>
            {outcome.good ? '✅' : '❌'} {outcome.feedback}
          </p>
          {!outcome.good && (
            <button className="secondary" onClick={restart}>
              ↺ {t('restart', locale)}
            </button>
          )}
        </div>
      ) : (
        <div className="options">
          {node.choices.map((c, i) => (
            <button key={`${nodeId}-${i}`} className="option" onClick={() => choose(i)}>
              {tr(c.text, locale)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function FigureArt({ figure }: { figure: Figure }) {
  switch (figure) {
    case 'face':
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <ellipse className="skin" cx="17" cy="52" rx="4" ry="8" />
          <ellipse className="skin" cx="83" cy="52" rx="4" ry="8" />
          <ellipse className="skin" cx="50" cy="52" rx="32" ry="40" />
          <path className="hair" d="M17 46 C12 4 88 4 83 46 C81 30 74 20 50 19 C26 20 19 30 17 46Z" />
          <path className="line thick" d="M30 37 Q38 32 45 36" />
          <path className="line thick" d="M55 36 Q62 32 70 37" />
          <ellipse className="eye" cx="38" cy="45" rx="6" ry="3" />
          <ellipse className="eye" cx="62" cy="45" rx="6" ry="3" />
          <circle className="iris" cx="38" cy="45" r="2" />
          <circle className="iris" cx="62" cy="45" r="2" />
          <path className="line" d="M50 46 L46 60 Q50 63 54 60" />
          <path className="lips" d="M41 72 Q50 67 59 72 Q50 78 41 72Z" />
        </svg>
      )
    case 'eye':
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <rect className="skin" x="0" y="0" width="100" height="100" rx="8" />
          <path className="line thick" d="M14 28 Q50 12 88 26" />
          <path className="eye" d="M12 56 Q50 22 88 56 Q50 80 12 56Z" />
          <circle className="iris" cx="50" cy="54" r="13" />
          <circle className="pupil" cx="50" cy="54" r="5" />
          <path className="line" d="M12 56 Q50 22 88 56" />
          {Array.from({ length: 13 }, (_, i) => {
            const x = 16 + i * 5.8
            const y = 56 - Math.sin((i / 12) * Math.PI) * 17 - 1
            return <line key={i} className="lash" x1={x} y1={y} x2={x + (i - 6) * 0.9} y2={y - 9} />
          })}
        </svg>
      )
    case 'nail':
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <rect className="skin" x="26" y="8" width="48" height="96" rx="24" />
          <path className="nail" d="M34 30 Q34 18 50 16 Q66 18 66 30 L66 66 Q50 72 34 66Z" />
          <path className="free-edge" d="M34 30 Q34 18 50 16 Q66 18 66 30 Q50 25 34 30Z" />
          <path className="lunula" d="M38 66 Q50 54 62 66 Q50 70 38 66Z" />
          <path className="line thick" d="M34 67 Q50 74 66 67" />
        </svg>
      )
    case 'body':
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle className="skin" cx="50" cy="10" r="7" />
          <rect className="skin" x="46" y="16" width="8" height="5" />
          <path className="skin" d="M34 21 L66 21 L64 54 L36 54Z" />
          <path className="skin" d="M34 21 L26 23 L20 52 L25 53 L31 30Z" />
          <path className="skin" d="M66 21 L74 23 L80 52 L75 53 L69 30Z" />
          <path className="skin" d="M36 54 L49 54 L47 96 L40 96Z" />
          <path className="skin" d="M51 54 L64 54 L60 96 L53 96Z" />
        </svg>
      )
  }
}
