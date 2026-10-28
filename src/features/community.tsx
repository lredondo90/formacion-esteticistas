import { useEffect, useState } from 'react'
import { sayer, tx, tr, type Text } from '../i18n'
import { useApp, today } from '../state'
import { load, save } from '../storage'
import { DemoNote, PageHead, Tabs } from './ui'

type Reply = { author: string; text: string; d: string }
type Post = { id: string; author: string; title: string; body: string; cat: string; d: string; likes: number; replies: Reply[]; example?: boolean }
type Job = { id: string; title: string; place: string; city: string; country: string; type: string; contact: string; d: string; example?: boolean }

const CATS: { id: string; label: Text }[] = [
  { id: 'cases', label: tx('Casos reales', 'Real cases') },
  { id: 'technique', label: tx('Técnica', 'Technique') },
  { id: 'business', label: tx('Negocio', 'Business') },
  { id: 'products', label: tx('Productos', 'Products') },
]

const COUNTRIES = ['España', 'México', 'Argentina', 'Colombia', 'Chile', 'Perú', 'United States', 'United Kingdom']

function seedPosts(s: ReturnType<typeof sayer>): Post[] {
  return [
    {
      id: 'ex1',
      example: true,
      author: 'Marta G.',
      cat: 'cases',
      d: '2026-10-20',
      likes: 12,
      title: s('Clienta con rojeces tras un peeling suave, ¿qué hago?', 'Client red after a gentle peel, what do I do?'),
      body: s(
        'Le hice un mandélico al 10 % y a las 24 h sigue roja y le tira. Le he dicho que no use nada más que su hidratante. ¿Algo más?',
        "I did a 10% mandelic peel and after 24 h she's still red and tight. I told her to use only her moisturiser. Anything else?",
      ),
      replies: [
        {
          author: 'Lucía R.',
          d: '2026-10-20',
          text: s('Compresas frías y una crema con centella o pantenol. Si a las 72 h sigue igual, que la vea un médico.', 'Cold compresses and a centella or panthenol cream. If it is the same at 72 h, she should see a doctor.'),
        },
      ],
    },
    {
      id: 'ex2',
      example: true,
      author: 'Valentina P.',
      cat: 'business',
      d: '2026-10-18',
      likes: 8,
      title: s('¿Cuánto cobráis por un lifting de pestañas?', 'How much do you charge for a lash lift?'),
      body: s('Estoy empezando y no sé si cobrar lo mismo que el centro de al lado.', "I'm starting out and not sure whether to charge the same as the salon next door."),
      replies: [
        {
          author: 'Ana M.',
          d: '2026-10-19',
          text: s('Usa la calculadora de precios de Herramientas: a mí me salía que estaba cobrando por debajo de mis costes.', 'Use the price calculator in Tools: it showed I was charging below my costs.'),
        },
      ],
    },
    {
      id: 'ex3',
      example: true,
      author: 'Sofía L.',
      cat: 'technique',
      d: '2026-10-15',
      likes: 15,
      title: s('Truco para aislar pestañas en el lagrimal', 'Tip for isolating inner-corner lashes'),
      body: s(
        'Giro un poco la cabeza de la clienta hacia mí y uso pinzas en L. Me ha cambiado la vida. ¿Vosotras cómo lo hacéis?',
        'I tilt the client\'s head slightly towards me and use L-shaped tweezers. Game changer. How do you do it?',
        'Giro un poco la cabeza de la clienta hacia mí y uso pinzas en L. Me cambió la vida. ¿Ustedes cómo lo hacen?',
      ),
      replies: [],
    },
  ]
}

const SEED_JOBS: Job[] = [
  { id: 'j1', example: true, title: 'Esteticista con experiencia en láser', place: 'Centro de estética (ejemplo)', city: 'Madrid', country: 'España', type: 'Jornada completa', contact: 'empleo@example.com', d: '2026-10-22' },
  { id: 'j2', example: true, title: 'Técnica en extensiones de pestañas', place: 'Studio de pestañas (ejemplo)', city: 'Valencia', country: 'España', type: 'Media jornada', contact: 'empleo@example.com', d: '2026-10-21' },
  { id: 'j3', example: true, title: 'Cosmetóloga para spa de hotel', place: 'Spa (ejemplo)', city: 'Cancún', country: 'México', type: 'Tiempo completo', contact: 'empleo@example.com', d: '2026-10-20' },
  { id: 'j4', example: true, title: 'Manicurista y nail artist', place: 'Salón de uñas (ejemplo)', city: 'Buenos Aires', country: 'Argentina', type: 'Por comisión', contact: 'empleo@example.com', d: '2026-10-19' },
  { id: 'j5', example: true, title: 'Cosmetóloga para clínica dermoestética', place: 'Clínica (ejemplo)', city: 'Bogotá', country: 'Colombia', type: 'Tiempo completo', contact: 'empleo@example.com', d: '2026-10-18' },
  { id: 'j6', example: true, title: 'Licensed esthetician (facials & waxing)', place: 'Day spa (example)', city: 'Miami', country: 'United States', type: 'Full time', contact: 'jobs@example.com', d: '2026-10-17' },
  { id: 'j7', example: true, title: 'Beauty therapist', place: 'Salon (example)', city: 'London', country: 'United Kingdom', type: 'Part time', contact: 'jobs@example.com', d: '2026-10-16' },
]

export function CommunityPage() {
  const { locale } = useApp()
  const s = sayer(locale)
  const [tab, setTab] = useState<'forum' | 'jobs'>('forum')
  return (
    <>
      <PageHead
        emoji="👥"
        title={s('Comunidad', 'Community')}
        intro={s('Comparte casos, resuelve dudas con otras profesionales y encuentra trabajo.', 'Share cases, ask other professionals, and find work.')}
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'forum', label: `💬 ${s('Foro', 'Forum')}` },
          { id: 'jobs', label: `💼 ${s('Bolsa de empleo', 'Job board')}` },
        ]}
      />
      <DemoNote>
        {s(
          'Vista previa: lo que publiques se guarda en este dispositivo. Los mensajes marcados como "Ejemplo" son de muestra.',
          'Preview: what you post is saved on this device. Posts marked "Example" are samples.',
        )}
      </DemoNote>
      {tab === 'forum' ? <Forum /> : <Jobs />}
    </>
  )
}

function Forum() {
  const { locale, addActivity } = useApp()
  const s = sayer(locale)
  const [mine, setMine] = useState<Post[]>(() => load('forum', []))
  const [liked, setLiked] = useState<string[]>(() => load('forumLikes', []))
  const [cat, setCat] = useState('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const [writing, setWriting] = useState(false)
  const [draft, setDraft] = useState({ title: '', body: '', cat: 'cases' })
  const [reply, setReply] = useState('')
  const author = load('certName', '') || s('Tú', 'You')

  useEffect(() => save('forum', mine), [mine])
  useEffect(() => save('forumLikes', liked), [liked])

  const posts = [...mine, ...seedPosts(s)].filter((p) => cat === 'all' || p.cat === cat)
  const open = posts.find((p) => p.id === openId)

  const update = (id: string, fn: (p: Post) => Post) => setMine((list) => list.map((p) => (p.id === id ? fn(p) : p)))

  if (open) {
    return (
      <div className="panel">
        <button className="ghost" onClick={() => setOpenId(null)}>
          ← {s('Volver al foro', 'Back to forum')}
        </button>
        <h2>{open.title}</h2>
        <p className="hint">
          {open.author} · {open.d} {open.example && <span className="badge">{s('Ejemplo', 'Example')}</span>}
        </p>
        <p>{open.body}</p>
        <div className="chat">
          {open.replies.map((r, i) => (
            <p key={i} className="bubble">
              <strong>{r.author}</strong>: {r.text}
            </p>
          ))}
        </div>
        {!open.example && (
          <form
            className="chat-input"
            onSubmit={(e) => {
              e.preventDefault()
              if (!reply.trim()) return
              update(open.id, (p) => ({ ...p, replies: [...p.replies, { author, text: reply.trim(), d: today() }] }))
              setReply('')
              addActivity('community', 3)
            }}
          >
            <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder={s('Escribe una respuesta…', 'Write a reply…')} />
            <button className="primary" disabled={!reply.trim()}>
              {s('Responder', 'Reply')}
            </button>
          </form>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="row wrap">
        <div className="chips">
          <button className={`chip ${cat === 'all' ? 'on' : ''}`} onClick={() => setCat('all')}>
            {s('Todo', 'All')}
          </button>
          {CATS.map((c) => (
            <button key={c.id} className={`chip ${cat === c.id ? 'on' : ''}`} onClick={() => setCat(c.id)}>
              {tr(c.label, locale)}
            </button>
          ))}
        </div>
        <button className="primary" onClick={() => setWriting(!writing)}>
          ✏️ {s('Nuevo tema', 'New topic')}
        </button>
      </div>
      {writing && (
        <form
          className="panel form"
          onSubmit={(e) => {
            e.preventDefault()
            const post: Post = { id: `p${Date.now()}`, author, d: today(), likes: 0, replies: [], ...draft }
            setMine((list) => [post, ...list])
            setDraft({ title: '', body: '', cat: 'cases' })
            setWriting(false)
            addActivity('community', 5)
          }}
        >
          <input placeholder={s('Título', 'Title')} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <select value={draft.cat} onChange={(e) => setDraft({ ...draft, cat: e.target.value })}>
            {CATS.map((c) => (
              <option key={c.id} value={c.id}>
                {tr(c.label, locale)}
              </option>
            ))}
          </select>
          <textarea rows={4} placeholder={s('Cuenta tu caso o tu duda…', 'Describe your case or question…')} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
          <p className="hint">{s('No publiques fotos ni datos que identifiquen a tus clientas.', "Don't post photos or details that identify your clients.")}</p>
          <button className="primary" disabled={!draft.title.trim() || !draft.body.trim()}>
            {s('Publicar', 'Post')}
          </button>
        </form>
      )}
      <div className="list">
        {posts.map((p) => (
          <div key={p.id} className="list-item">
            <button className="post-link" onClick={() => setOpenId(p.id)}>
              <strong>{p.title}</strong>
              <span className="hint">
                {p.author} · {tr(CATS.find((c) => c.id === p.cat)!.label, locale)} · 💬 {p.replies.length}
                {p.example && ` · ${s('Ejemplo', 'Example')}`}
              </span>
            </button>
            <button
              className={`chip ${liked.includes(p.id) ? 'on' : ''}`}
              onClick={() => setLiked((l) => (l.includes(p.id) ? l.filter((x) => x !== p.id) : [...l, p.id]))}
            >
              ❤️ {p.likes + (liked.includes(p.id) ? 1 : 0)}
            </button>
          </div>
        ))}
      </div>
    </>
  )
}

function Jobs() {
  const { locale } = useApp()
  const s = sayer(locale)
  const [mine, setMine] = useState<Job[]>(() => load('jobs', []))
  const [country, setCountry] = useState(locale === 'es-ES' ? 'España' : locale === 'es-419' ? 'México' : 'all')
  const [writing, setWriting] = useState(false)
  const empty = { title: '', place: '', city: '', country: COUNTRIES[0], type: '', contact: '' }
  const [draft, setDraft] = useState(empty)
  useEffect(() => save('jobs', mine), [mine])

  const jobs = [...mine, ...SEED_JOBS].filter((j) => country === 'all' || j.country === country)
  const valid = draft.title && draft.place && draft.city && /.+@.+\..+/.test(draft.contact)

  return (
    <>
      <div className="row wrap">
        <select value={country} onChange={(e) => setCountry(e.target.value)} aria-label={s('País', 'Country')}>
          <option value="all">🌍 {s('Todos los países', 'All countries')}</option>
          {COUNTRIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button className="primary" onClick={() => setWriting(!writing)}>
          ➕ {s('Publicar oferta', 'Post a job')}
        </button>
      </div>
      {writing && (
        <form
          className="panel form"
          onSubmit={(e) => {
            e.preventDefault()
            setMine((list) => [{ id: `j${Date.now()}`, d: today(), ...draft }, ...list])
            setDraft(empty)
            setWriting(false)
          }}
        >
          <input placeholder={s('Puesto', 'Job title')} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <input placeholder={s('Centro', 'Salon')} value={draft.place} onChange={(e) => setDraft({ ...draft, place: e.target.value })} />
          <div className="form inline">
            <input placeholder={s('Ciudad', 'City')} value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
            <select value={draft.country} onChange={(e) => setDraft({ ...draft, country: e.target.value })}>
              {COUNTRIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <input placeholder={s('Jornada', 'Hours')} value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} />
          <input type="email" placeholder={s('Email de contacto', 'Contact email')} value={draft.contact} onChange={(e) => setDraft({ ...draft, contact: e.target.value })} />
          <button className="primary" disabled={!valid}>
            {s('Publicar', 'Post')}
          </button>
        </form>
      )}
      <div className="list">
        {jobs.length === 0 && <p className="hint">{s('Todavía no hay ofertas en este país.', 'No jobs in this country yet.')}</p>}
        {jobs.map((j) => (
          <div key={j.id} className="list-item">
            <div>
              <strong>{j.title}</strong>
              <p className="hint">
                {j.place} · 📍 {j.city}, {j.country} · {j.type}
                {j.example && ` · ${s('Ejemplo', 'Example')}`}
              </p>
            </div>
            <a className="secondary small" href={`mailto:${j.contact}?subject=${encodeURIComponent(j.title)}`}>
              {s('Me interesa', "I'm interested")}
            </a>
          </div>
        ))}
      </div>
    </>
  )
}
