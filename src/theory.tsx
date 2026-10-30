import { useEffect, useMemo, useState } from 'react'
import type { Block, Question, Step } from './courses'
import { sayer, tr, type Locale } from './i18n'

type Props<K extends Step['kind']> = { step: Extract<Step, { kind: K }>; locale: Locale; onSolved: () => void }

function BlockView({ block, locale, answer, onAnswer }: { block: Block; locale: Locale; answer?: boolean; onAnswer: (saidMyth: boolean) => void }) {
  const s = sayer(locale)
  const T = (t: Parameters<typeof tr>[0]) => tr(t, locale)
  switch (block.t) {
    case 'p':
      return <p className="th-p">{T(block.text)}</p>
    case 'key':
      return (
        <div className="th-box th-key">
          {block.title && <h4>{T(block.title)}</h4>}
          <ul>
            {block.items.map((it, i) => (
              <li key={i}>{T(it)}</li>
            ))}
          </ul>
        </div>
      )
    case 'steps':
      return (
        <div className="th-box th-steps">
          {block.title && <h4>{T(block.title)}</h4>}
          <ol>
            {block.items.map((it, i) => (
              <li key={i}>
                <span>{i + 1}</span>
                {T(it)}
              </li>
            ))}
          </ol>
        </div>
      )
    case 'pairs':
      return (
        <div className="th-box th-pairs">
          {block.title && <h4>{T(block.title)}</h4>}
          <dl>
            {block.items.map((it, i) => (
              <div key={i}>
                <dt>{T(it.a)}</dt>
                <dd>{T(it.b)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )
    case 'fact':
      return (
        <div className="th-box th-fact">
          <strong>💡 {s('¿Sabías que…?', 'Did you know?')}</strong> {T(block.text)}
        </div>
      )
    case 'warn':
      return (
        <div className="th-box th-warn">
          <strong>⚠️ {s('Ojo', 'Watch out')}:</strong> {T(block.text)}
        </div>
      )
    case 'myth': {
      const answered = answer !== undefined
      const right = answered && answer === block.myth
      return (
        <div className="th-box th-myth">
          <p className="eyebrow">{s('¿Mito o realidad?', 'Myth or fact?')}</p>
          <p className="th-claim">«{T(block.claim)}»</p>
          {!answered ? (
            <div className="th-myth-actions">
              <button className="secondary" onClick={() => onAnswer(true)}>
                🙅 {s('Mito', 'Myth')}
              </button>
              <button className="secondary" onClick={() => onAnswer(false)}>
                👍 {s('Realidad', 'Fact')}
              </button>
            </div>
          ) : (
            <p className={`feedback ${right ? 'good' : 'bad'}`}>
              {right ? '✅ ' : '❌ '}
              <strong>{block.myth ? s('Es un mito.', 'It’s a myth.') : s('Es realidad.', 'It’s a fact.')}</strong> {T(block.truth)}
            </p>
          )}
        </div>
      )
    }
  }
}

// Theory as a conversation: one idea at a time, with the occasional myth-or-fact to keep it lively.
export function Theory({ step, locale, onSolved }: Props<'theory'>) {
  const s = sayer(locale)
  const [shown, setShown] = useState(1)
  const [answers, setAnswers] = useState<Record<number, boolean>>({})
  const last = step.blocks[shown - 1]
  const waiting = last?.t === 'myth' && answers[shown - 1] === undefined
  const finished = shown >= step.blocks.length && !waiting

  useEffect(() => {
    if (finished) onSolved()
  }, [finished, onSolved])

  // Keep the newest idea in view as the lesson grows.
  useEffect(() => {
    if (shown > 1) document.querySelector('.th-block:last-of-type')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [shown])

  return (
    <div className="theory">
      <div className="th-head">
        <span className="th-emoji">{step.emoji}</span>
        <h2>{tr(step.title, locale)}</h2>
      </div>
      <div className="th-progress">
        {step.blocks.map((_, i) => (
          <span key={i} className={i < shown ? 'on' : ''} />
        ))}
      </div>
      {step.blocks.slice(0, shown).map((b, i) => (
        <div key={i} className="th-block">
          <BlockView block={b} locale={locale} answer={answers[i]} onAnswer={(v) => setAnswers((a) => ({ ...a, [i]: v }))} />
        </div>
      ))}
      {shown < step.blocks.length && (
        <button className="secondary th-more" disabled={waiting} onClick={() => setShown(shown + 1)}>
          {waiting ? s('Responde para seguir', 'Answer to continue') : `${s('Seguir', 'Continue')} ↓`}
        </button>
      )}
    </div>
  )
}

function shuffled<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// Final multiple-choice test. Answers are only marked at the end, like a real exam.
export function Exam({ step, locale, onSolved }: Props<'exam'>) {
  const s = sayer(locale)
  const [round, setRound] = useState(0)
  const questions = useMemo<Question[]>(() => shuffled(step.questions), [step.questions, round])
  const [index, setIndex] = useState(-1)
  const [picks, setPicks] = useState<number[]>([])
  const done = index >= questions.length
  const score = picks.filter((p, i) => p === questions[i]?.answer).length
  const passed = done && score / questions.length >= step.pass

  useEffect(() => {
    if (passed) onSolved()
  }, [passed, onSolved])

  if (index === -1)
    return (
      <div className="exam center">
        <div className="big-emoji">📝</div>
        <h2>{tr(step.title, locale)}</h2>
        <p>
          {s(
            `${questions.length} preguntas tipo test. Necesitas acertar al menos el ${Math.round(step.pass * 100)} % para obtener tu título. No verás si aciertas hasta el final.`,
            `${questions.length} multiple-choice questions. You need at least ${Math.round(step.pass * 100)}% right to earn your certificate. You’ll only see the results at the end.`,
          )}
        </p>
        <button className="primary" onClick={() => setIndex(0)}>
          {s('Empezar el examen', 'Start the exam')}
        </button>
      </div>
    )

  if (done)
    return (
      <div className="exam">
        <div className="center">
          <div className="big-emoji">{passed ? '🎓' : '📚'}</div>
          <h2>
            {score}/{questions.length} · {Math.round((score / questions.length) * 100)} %
          </h2>
          <p className={`feedback ${passed ? 'good' : 'bad'}`}>
            {passed
              ? s('¡Aprobado! Ya puedes emitir tu certificado.', 'Passed! You can now issue your certificate.')
              : s(`Te falta poco: necesitas un ${Math.round(step.pass * 100)} %. Repasa estas preguntas y vuelve a intentarlo.`, `Almost there: you need ${Math.round(step.pass * 100)}%. Review these questions and try again.`)}
          </p>
        </div>
        <ul className="exam-review">
          {questions.map((q, i) =>
            picks[i] === q.answer ? null : (
              <li key={i}>
                <strong>{tr(q.question, locale)}</strong>
                <span className="bad">❌ {tr(q.options[picks[i]], locale)}</span>
                <span className="good">✅ {tr(q.options[q.answer], locale)}</span>
                <span className="hint">{tr(q.explain, locale)}</span>
              </li>
            ),
          )}
        </ul>
        {!passed && (
          <div className="center">
            <button
              className="primary"
              onClick={() => {
                setRound(round + 1)
                setPicks([])
                setIndex(0)
              }}
            >
              ↺ {s('Repetir el examen', 'Retake the exam')}
            </button>
          </div>
        )}
      </div>
    )

  const q = questions[index]
  return (
    <div className="exam">
      <p className="eyebrow">
        {s('Pregunta', 'Question')} {index + 1}/{questions.length}
      </p>
      <div className="bar exam-bar">
        <div style={{ width: `${(index / questions.length) * 100}%` }} />
      </div>
      <h2>{tr(q.question, locale)}</h2>
      <div className="options">
        {q.options.map((o, i) => (
          <button
            key={i}
            className="option"
            onClick={() => {
              setPicks([...picks, i])
              setIndex(index + 1)
            }}
          >
            {tr(o, locale)}
          </button>
        ))}
      </div>
    </div>
  )
}
