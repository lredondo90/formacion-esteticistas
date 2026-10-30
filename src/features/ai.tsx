import { useState } from 'react'
import { COURSES, type Step } from '../courses'
import { LABS } from '../labs'
import { sayer, tr, type Locale } from '../i18n'
import { callApi, readImage } from '../services'
import { FREE_AI_USES, useApp } from '../state'
import { load, save } from '../storage'
import { DemoNote, PageHead, ProLock, Tabs } from './ui'

type Analysis = { summary: string; skinType: string; observations: string[]; protocol: string[]; homeCare: string[]; referral: string }
type ChatTurn = { role: 'user' | 'assistant'; content: string }

function useAiQuota() {
  const { pro } = useApp()
  const [uses, setUses] = useState<number>(() => load('aiUses', 0))
  return {
    left: pro ? Infinity : Math.max(0, FREE_AI_USES - uses),
    spend: () => {
      if (pro) return
      setUses((u) => {
        save('aiUses', u + 1)
        return u + 1
      })
    },
  }
}

export function AiPage() {
  const { locale } = useApp()
  const s = sayer(locale)
  const [tab, setTab] = useState<'skin' | 'tutor'>('skin')
  return (
    <>
      <PageHead
        emoji="🤖"
        title={s('Inteligencia artificial', 'AI assistant')}
        intro={s(
          'Practica el diagnóstico con fotos y resuelve dudas técnicas a cualquier hora, en tu idioma.',
          'Practise skin analysis with photos and get technical answers any time, in your language.',
        )}
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'skin', label: `📸 ${s('Analizador de piel', 'Skin analyser')}` },
          { id: 'tutor', label: `💬 ${s('Tutor 24/7', '24/7 tutor')}` },
        ]}
      />
      {tab === 'skin' ? <SkinAnalyzer /> : <Tutor />}
    </>
  )
}

function exampleAnalysis(locale: Locale): Analysis {
  const s = sayer(locale)
  return {
    summary: s(
      'Piel con brillo en la zona T y poros visibles en nariz y frente, mejillas con textura uniforme.',
      'Shine in the T-zone with visible pores on the nose and forehead; cheeks have an even texture.',
    ),
    skinType: s('Mixta con tendencia grasa', 'Combination, leaning oily'),
    observations: [
      s('Poros dilatados en la zona T', 'Enlarged pores in the T-zone'),
      s('Algunos comedones abiertos en la nariz', 'Some open comedones on the nose', 'Algunas espinillas en la nariz'),
      s('Sin rojeces ni signos de sensibilidad', 'No redness or signs of sensitivity'),
    ],
    protocol: [
      s('Doble limpieza con gel suave', 'Double cleanse with a gentle gel'),
      s('Exfoliación enzimática', 'Enzyme exfoliation'),
      s('Extracción de comedones en la zona T', 'Comedone extraction in the T-zone'),
      s('Mascarilla de arcilla en zona T e hidratante en mejillas', 'Clay mask on the T-zone and hydrating mask on the cheeks'),
      s('Sérum de niacinamida y SPF 50', 'Niacinamide serum and SPF 50'),
    ],
    homeCare: [
      s('Limpiador en gel mañana y noche', 'Gel cleanser morning and night'),
      s('Ácido salicílico 2-3 noches por semana', 'Salicylic acid 2–3 nights a week'),
      s('Hidratante ligera oil-free y SPF diario', 'Light oil-free moisturiser and daily SPF', 'Humectante ligera oil-free y SPF diario'),
    ],
    referral: '',
  }
}

function SkinAnalyzer() {
  const { locale, addActivity } = useApp()
  const s = sayer(locale)
  const quota = useAiQuota()
  const [image, setImage] = useState<{ data: string; preview: string } | null>(null)
  const [notes, setNotes] = useState('')
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ analysis: Analysis; demo: boolean } | null>(null)
  const [error, setError] = useState('')

  const analyse = async () => {
    if (!image) return
    setLoading(true)
    setError('')
    const res = await callApi<{ result?: Analysis; refusal?: boolean }>('/api/ai', {
      task: 'skin',
      locale,
      notes,
      image: { data: image.data, mediaType: 'image/jpeg' },
    })
    setLoading(false)
    if ('demo' in res && res.demo) setResult({ analysis: exampleAnalysis(locale), demo: true })
    else if ('result' in res && res.result) setResult({ analysis: res.result, demo: false })
    else return setError(s('No se ha podido analizar la foto. Prueba con otra imagen.', "We couldn't analyse the photo. Try another image."))
    quota.spend()
    addActivity('ai', 5)
  }

  return (
    <div className="panel">
      <p>
        {s(
          'Sube una foto del rostro sin maquillaje, con buena luz y de frente. Recibirás un diagnóstico de práctica y un protocolo recomendado.',
          'Upload a make-up-free, front-facing photo in good light. You will get a practice analysis and a recommended protocol.',
        )}
      </p>
      <div className="upload-row">
        <label className="upload">
          {image ? <img src={image.preview} alt="" /> : <span>📷 {s('Elegir foto', 'Choose photo')}</span>}
          <input
            type="file"
            accept="image/*"
            capture="user"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) {
                setImage(await readImage(file))
                setResult(null)
              }
            }}
          />
        </label>
        <div className="form">
          <textarea
            rows={3}
            placeholder={s('Notas: edad, rutina, lo que le preocupa…', 'Notes: age, routine, main concerns…')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <label className="check">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            {s('Tengo permiso de la persona de la foto', 'I have permission from the person in the photo')}
          </label>
          {quota.left > 0 ? (
            <button className="primary" disabled={!image || !consent || loading} onClick={analyse}>
              {loading ? s('Analizando…', 'Analysing…') : `✨ ${s('Analizar piel', 'Analyse skin')}`}
            </button>
          ) : (
            <ProLock what={s('Has usado tus análisis de prueba.', "You've used your trial analyses.")} />
          )}
          {quota.left !== Infinity && quota.left > 0 && (
            <p className="hint">
              {quota.left} {s('usos de prueba restantes', 'trial uses left')}
            </p>
          )}
        </div>
      </div>
      {error && <p className="feedback bad">{error}</p>}
      {result && (
        <div className="result">
          {result.demo && (
            <DemoNote>
              {s(
                'Resultado de ejemplo: la IA aún no está conectada en este servidor.',
                'Example result: the AI is not connected on this server yet.',
              )}
            </DemoNote>
          )}
          <h3>
            {s('Tipo de piel', 'Skin type')}: {result.analysis.skinType}
          </h3>
          <p>{result.analysis.summary}</p>
          <div className="result-grid">
            <ResultList title={`🔍 ${s('Observaciones', 'Observations')}`} items={result.analysis.observations} />
            <ResultList title={`🧖 ${s('Protocolo en cabina', 'In-salon protocol', 'Protocolo en gabinete')}`} items={result.analysis.protocol} ordered />
            <ResultList title={`🏠 ${s('Cuidados en casa', 'Home care')}`} items={result.analysis.homeCare} />
          </div>
          {result.analysis.referral && <p className="feedback bad">⚠️ {result.analysis.referral}</p>}
          <p className="hint">
            {s(
              'Diagnóstico de práctica para formación. No sustituye la valoración profesional en persona ni la consulta médica.',
              'Practice analysis for training. It does not replace an in-person assessment or medical advice.',
            )}
          </p>
        </div>
      )}
    </div>
  )
}

function ResultList({ title, items, ordered }: { title: string; items: string[]; ordered?: boolean }) {
  const List = ordered ? 'ol' : 'ul'
  return (
    <div className="result-box">
      <h4>{title}</h4>
      <List>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </List>
    </div>
  )
}

// Demo tutor: answers from the course content when the AI is not connected.
function searchCourses(question: string, locale: Locale): string | null {
  const words = question
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/\W+/)
    .filter((w) => w.length > 3)
  if (!words.length) return null
  const snippets: string[] = []
  const add = (...texts: string[]) => snippets.push(texts.join(': '))
  const fromStep = (step: Step) => {
    if (step.kind === 'lesson') add(tr(step.title, locale), tr(step.body, locale))
    if (step.kind === 'flashcards') step.cards.forEach((c) => add(tr(c.front, locale), tr(c.back, locale)))
    if (step.kind === 'quiz') add(tr(step.question, locale), tr(step.explain, locale))
    if (step.kind === 'video') step.scenes.forEach((sc) => add(sc.title ? tr(sc.title, locale) : '', tr(sc.caption, locale)))
    if (step.kind === 'lab' && step.lab !== 'brows') LABS[step.lab].learn.forEach((l) => add(tr(l.title, locale), tr(l.text, locale)))
  }
  COURSES.forEach((c) => c.steps.forEach(fromStep))
  const norm = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const scored = snippets
    .map((text) => ({ text, score: words.filter((w) => norm(text).includes(w)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
  return scored.length ? scored.slice(0, 2).map((x) => `• ${x.text}`).join('\n') : null
}

function Tutor() {
  const { locale, addActivity } = useApp()
  const s = sayer(locale)
  const quota = useAiQuota()
  const [messages, setMessages] = useState<ChatTurn[]>(() => load('tutorChat', []))
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const suggestions = [
    s('¿Puedo hacer un peeling a una clienta embarazada?', 'Can I do a peel on a pregnant client?'),
    s('¿Qué curvatura de pestañas recomiendo para ojos caídos?', 'Which lash curl suits hooded eyes?'),
    s('¿Cómo calculo el precio de un facial?', 'How do I price a facial?'),
  ]

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const next: ChatTurn[] = [...messages, { role: 'user', content: text.trim() }]
    setMessages(next)
    setInput('')
    setLoading(true)
    const res = await callApi<{ text?: string; refusal?: boolean }>('/api/ai', { task: 'tutor', locale, messages: next })
    let answer: string
    if ('demo' in res && res.demo) {
      const found = searchCourses(text, locale)
      answer =
        `(${s('Modo demostración', 'Demo mode')}) ` +
        (found
          ? `${s('Esto es lo que dicen los cursos:', 'This is what the courses say:')}\n${found}`
          : s('No encuentro esa duda en los cursos. Con la IA conectada te respondería al momento.', "I can't find that in the courses. With the AI connected I'd answer right away."))
    } else if ('text' in res && res.text) answer = res.text
    else answer = s('Ahora mismo no puedo responder. Inténtalo en un momento.', "I can't answer right now. Please try again shortly.")
    const final: ChatTurn[] = [...next, { role: 'assistant', content: answer }]
    setMessages(final)
    save('tutorChat', final.slice(-30))
    setLoading(false)
    quota.spend()
    addActivity('ai', 2)
  }

  return (
    <div className="panel">
      <div className="chat tutor">
        <p className="bubble">
          🤖 {s('¡Hola! Soy tu tutora. Pregúntame lo que quieras sobre técnicas, productos o tu negocio.', "Hi! I'm your tutor. Ask me anything about techniques, products or your business.")}
        </p>
        {messages.map((m, i) => (
          <p key={i} className={`bubble ${m.role === 'user' ? 'mine' : ''}`}>
            {m.content}
          </p>
        ))}
        {loading && <p className="bubble typing">…</p>}
      </div>
      {messages.length === 0 && (
        <div className="chips">
          {suggestions.map((q) => (
            <button key={q} className="chip" onClick={() => send(q)}>
              {q}
            </button>
          ))}
        </div>
      )}
      {quota.left > 0 ? (
        <form
          className="chat-input"
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
        >
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={s('Escribe tu duda…', 'Type your question…')} />
          <button className="primary" disabled={!input.trim() || loading}>
            {s('Enviar', 'Send')}
          </button>
        </form>
      ) : (
        <ProLock what={s('Has usado tus preguntas de prueba.', "You've used your trial questions.")} />
      )}
      {messages.length > 0 && (
        <button
          className="ghost"
          onClick={() => {
            setMessages([])
            save('tutorChat', [])
          }}
        >
          {s('Nueva conversación', 'New conversation')}
        </button>
      )}
    </div>
  )
}
