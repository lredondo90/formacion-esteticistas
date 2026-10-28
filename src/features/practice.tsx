import { useEffect, useState } from 'react'
import { COURSES } from '../courses'
import { sayer, tr, type Locale } from '../i18n'
import { callApi, readImage } from '../services'
import { useApp, today } from '../state'
import { load, save } from '../storage'
import { DemoNote, PageHead, ProLock } from './ui'

type Review = { score: number; strengths: string[]; improvements: string[]; nextExercise: string }
type Submission = {
  id: string
  course: string
  notes: string
  thumb?: string
  fileName?: string
  d: string
  ai?: Review & { demo?: boolean }
  expert: 'none' | 'pending'
}

function exampleReview(locale: Locale): Review {
  const s = sayer(locale)
  return {
    score: 7,
    strengths: [s('Buena simetría general', 'Good overall symmetry'), s('Trazos limpios y bien espaciados', 'Clean, well-spaced strokes')],
    improvements: [
      s('El inicio está demasiado marcado: aligéralo para un efecto más natural', 'The start is too heavy: lighten it for a more natural look'),
      s('Algunos trazos se cruzan en la cola', 'Some strokes cross over at the tail'),
    ],
    nextExercise: s('Practica 20 trazos de inicio en piel sintética, de más claro a más intenso.', 'Practise 20 start strokes on practice skin, from lightest to strongest.'),
  }
}

export function PracticePage() {
  const { locale, pro, addActivity } = useApp()
  const s = sayer(locale)
  const [subs, setSubs] = useState<Submission[]>(() => load('practice', []))
  const [course, setCourse] = useState(COURSES.find((c) => c.premium)!.id)
  const [notes, setNotes] = useState('')
  const [image, setImage] = useState<{ data: string; preview: string } | null>(null)
  const [video, setVideo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [usedExpert, setUsedExpert] = useState<string>(() => load('expertMonth', ''))
  useEffect(() => save('practice', subs), [subs])

  const month = today().slice(0, 7)
  const expertLeft = pro && usedExpert !== month

  const submit = async (expert: boolean) => {
    setLoading(true)
    let ai: Submission['ai']
    if (image) {
      const res = await callApi<{ result?: Review }>('/api/ai', {
        task: 'practice',
        locale,
        notes,
        course: tr(COURSES.find((c) => c.id === course)!.title, locale),
        image: { data: image.data, mediaType: 'image/jpeg' },
      })
      if ('demo' in res && res.demo) ai = { ...exampleReview(locale), demo: true }
      else if ('result' in res && res.result) ai = res.result
    }
    // Keep a small thumbnail only, so the list fits in browser storage.
    const thumb = image ? await shrink(image.preview) : undefined
    setSubs((list) => [
      { id: `s${Date.now()}`, course, notes, thumb, fileName: video ?? undefined, d: today(), ai, expert: expert ? 'pending' : 'none' },
      ...list,
    ])
    if (expert) {
      setUsedExpert(month)
      save('expertMonth', month)
    }
    setImage(null)
    setVideo(null)
    setNotes('')
    setLoading(false)
    addActivity('practice', 10)
  }

  return (
    <>
      <PageHead
        emoji="📸"
        title={s('Corrección de prácticas', 'Practice review')}
        intro={s(
          'Sube una foto o un vídeo de tu trabajo. La IA te da una primera valoración al momento y una experta te corrige en 48 horas.',
          'Upload a photo or video of your work. The AI gives instant first feedback and an expert reviews it within 48 hours.',
        )}
      />
      <div className="panel">
        <div className="upload-row">
          <label className="upload">
            {image ? <img src={image.preview} alt="" /> : video ? <span>🎞️ {video}</span> : <span>📷 {s('Foto o vídeo', 'Photo or video')}</span>}
            <input
              type="file"
              accept="image/*,video/*"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                if (file.type.startsWith('image/')) {
                  setImage(await readImage(file))
                  setVideo(null)
                } else {
                  setVideo(file.name)
                  setImage(null)
                }
              }}
            />
          </label>
          <div className="form">
            <select value={course} onChange={(e) => setCourse(e.target.value)} aria-label={s('Curso', 'Course')}>
              {COURSES.filter((c) => c.premium).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {tr(c.title, locale)}
                </option>
              ))}
            </select>
            <textarea rows={3} placeholder={s('¿Qué quieres que revisemos?', 'What would you like us to look at?')} value={notes} onChange={(e) => setNotes(e.target.value)} />
            <button className="primary" disabled={!image || loading} onClick={() => submit(false)}>
              {loading ? s('Revisando…', 'Reviewing…') : `✨ ${s('Pre-revisión con IA', 'AI pre-review')}`}
            </button>
            {expertLeft ? (
              <button className="secondary" disabled={(!image && !video) || loading} onClick={() => submit(true)}>
                👩‍🏫 {s('Enviar a una experta (1 incluida este mes)', 'Send to an expert (1 included this month)')}
              </button>
            ) : pro ? (
              <p className="hint">{s('Ya has usado tu corrección de este mes.', "You've used this month's expert review.")}</p>
            ) : (
              <ProLock what={s('Una corrección por experta al mes incluida.', 'One expert review per month included.')} />
            )}
            {video && <p className="hint">{s('Los vídeos solo se pueden enviar a una experta.', 'Videos can only be sent to an expert.')}</p>}
          </div>
        </div>
      </div>

      <h2 className="section-gap">{s('Mis prácticas', 'My practice work')}</h2>
      {subs.length === 0 && <p className="hint">{s('Todavía no has enviado ninguna práctica.', "You haven't submitted any work yet.")}</p>}
      <div className="list">
        {subs.map((sub) => (
          <div key={sub.id} className="list-item practice">
            {sub.thumb ? <img src={sub.thumb} alt="" className="thumb" /> : <span className="thumb">🎞️</span>}
            <div className="practice-body">
              <strong>{tr(COURSES.find((c) => c.id === sub.course)!.title, locale)}</strong>
              <p className="hint">
                {sub.d} {sub.expert === 'pending' && `· ⏳ ${s('Experta: pendiente (48 h)', 'Expert: pending (48 h)')}`}
              </p>
              {sub.ai && (
                <div className="review">
                  {sub.ai.demo && <DemoNote>{s('Valoración de ejemplo: la IA no está conectada.', 'Example feedback: the AI is not connected.')}</DemoNote>}
                  <p>
                    <strong>{s('Nota', 'Score')}: {sub.ai.score}/10</strong>
                  </p>
                  <p>✅ {sub.ai.strengths.join(' · ')}</p>
                  <p>🔧 {sub.ai.improvements.join(' · ')}</p>
                  <p>🎯 {sub.ai.nextExercise}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function shrink(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale = 160 / Math.max(img.width, img.height)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }
    img.src = dataUrl
  })
}
