import { useState } from 'react'
import { sayer, tr, type Locale } from '../i18n'
import { useApp } from '../state'
import { LIBRARY, type Doc } from './library'
import { CopyButton, Modal, PageHead, ProLock, Tabs } from './ui'

type Tab = 'library' | 'price' | 'instagram' | 'scripts'

export function ToolsPage() {
  const { locale } = useApp()
  const s = sayer(locale)
  const [tab, setTab] = useState<Tab>('library')
  return (
    <>
      <PageHead
        emoji="🧰"
        title={s('Herramientas', 'Tools')}
        intro={s(
          'Fichas y protocolos listos para imprimir, y herramientas para ganar más con tu centro.',
          'Print-ready forms and protocols, plus tools to earn more from your salon.',
        )}
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'library', label: `📚 ${s('Protocolos y fichas', 'Protocols and forms')}` },
          { id: 'price', label: `🧮 ${s('Calculadora de precios', 'Price calculator')}` },
          { id: 'instagram', label: `📱 ${s('Plantillas Instagram', 'Instagram templates')}` },
          { id: 'scripts', label: `🗣️ ${s('Guiones de venta', 'Sales scripts')}` },
        ]}
      />
      {tab === 'library' && <Library />}
      {tab === 'price' && <PriceCalculator />}
      {tab === 'instagram' && <Instagram />}
      {tab === 'scripts' && <Scripts />}
    </>
  )
}

function Library() {
  const { locale, pro } = useApp()
  const s = sayer(locale)
  const [open, setOpen] = useState<Doc | null>(null)
  const [locked, setLocked] = useState(false)
  return (
    <>
      <div className="grid">
        {LIBRARY.map((doc) => (
          <article key={doc.id} className="card doc-card">
            <div className="card-top">
              <div className="card-emoji">{doc.emoji}</div>
              {doc.pro && <span className={`badge ${pro ? 'owned' : ''}`}>{pro ? '✓ Pro' : '💎 Pro'}</span>}
            </div>
            <h3>{tr(doc.title, locale)}</h3>
            <p className="meta">{doc.kind === 'form' ? s('Ficha para rellenar', 'Fill-in form') : s('Documento para entregar', 'Hand-out document')}</p>
            <button
              className="secondary"
              onClick={() => {
                if (doc.pro && !pro) setLocked(true)
                else setOpen(doc)
              }}
            >
              {s('Abrir e imprimir', 'Open and print')}
            </button>
          </article>
        ))}
      </div>
      {locked && (
        <Modal onClose={() => setLocked(false)}>
          <ProLock what={s('Consentimientos específicos y hojas de cuidados para cada tratamiento.', 'Treatment-specific consents and aftercare sheets.')} />
        </Modal>
      )}
      {open && (
        <Modal onClose={() => setOpen(null)} wide>
          <DocView doc={open} locale={locale} />
          <div className="actions">
            <button className="ghost" onClick={() => setOpen(null)}>
              {s('Cerrar', 'Close')}
            </button>
            <button className="primary" onClick={() => window.print()}>
              🖨️ {s('Imprimir o guardar en PDF', 'Print or save as PDF')}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}

function DocView({ doc, locale }: { doc: Doc; locale: Locale }) {
  const s = sayer(locale)
  return (
    <div className="doc printable">
      <div className="doc-head">
        <span>💧 Aula Estética</span>
        <span>{s('Centro', 'Salon')}: ____________________</span>
      </div>
      <h2>{tr(doc.title, locale)}</h2>
      {doc.intro && <p>{tr(doc.intro, locale)}</p>}
      {doc.sections.map((sec, i) => (
        <section key={i}>
          <h3>{tr(sec.heading, locale)}</h3>
          {doc.kind === 'form' ? (
            <div className="doc-fields">
              {sec.items.map((item, j) => (
                <div key={j} className="doc-field">
                  <span>{tr(item, locale)}</span>
                  <span className="line" />
                </div>
              ))}
            </div>
          ) : (
            <ul>
              {sec.items.map((item, j) => (
                <li key={j}>{tr(item, locale)}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
      {doc.sign && (
        <div className="doc-sign">
          <span>{s('Nombre y firma de la clienta', 'Client name and signature')}</span>
          <span>{s('Fecha', 'Date')}</span>
        </div>
      )}
    </div>
  )
}

function PriceCalculator() {
  const { locale } = useApp()
  const s = sayer(locale)
  const [v, setV] = useState({
    fixed: 2500,
    hours: 120,
    minutes: 60,
    product: 6,
    margin: 30,
    tax: locale === 'es-ES' ? 21 : 0,
  })
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: Number(e.target.value) })
  const currency = locale === 'es-ES' ? 'EUR' : 'USD'
  const money = (n: number) => new Intl.NumberFormat(locale, { style: 'currency', currency }).format(Number.isFinite(n) ? n : 0)

  const perHour = v.fixed / Math.max(1, v.hours)
  const cost = perHour * (v.minutes / 60) + v.product
  const base = cost * (1 + v.margin / 100)
  const final = base * (1 + v.tax / 100)
  const profitPerService = base - cost
  const breakEven = Math.ceil(v.fixed / Math.max(0.01, base - v.product))

  const field = (k: keyof typeof v, label: string, hint?: string) => (
    <label className="field">
      <span>{label}</span>
      <input type="number" min={0} value={v[k]} onChange={set(k)} />
      {hint && <small>{hint}</small>}
    </label>
  )

  return (
    <div className="panel calc">
      <div className="form">
        {field('fixed', s('Costes fijos al mes', 'Monthly fixed costs'), s('Alquiler, luz, seguros, cuotas y tu sueldo', 'Rent, utilities, insurance, fees and your salary'))}
        {field('hours', s('Horas al mes con clientas', 'Hours per month with clients'))}
        {field('minutes', s('Duración del tratamiento (min)', 'Treatment length (min)'))}
        {field('product', s('Coste de producto por servicio', 'Product cost per service'))}
        {field('margin', s('Margen de beneficio (%)', 'Profit margin (%)'))}
        {field('tax', s('Impuestos (%)', 'Tax (%)'), locale === 'es-ES' ? s('IVA general: 21 %', 'Standard VAT: 21%') : undefined)}
      </div>
      <div className="calc-result">
        <p>
          {s('Tu coste por hora', 'Your cost per hour')}: <strong>{money(perHour)}</strong>
        </p>
        <p>
          {s('Coste del servicio', 'Service cost')}: <strong>{money(cost)}</strong>
        </p>
        <p>
          {s('Precio sin impuestos', 'Price before tax')}: <strong>{money(base)}</strong>
        </p>
        <p className="calc-final">
          {s('Precio recomendado', 'Recommended price')}: <strong>{money(final)}</strong>
        </p>
        <p>
          {s('Beneficio por servicio', 'Profit per service')}: <strong>{money(profitPerService)}</strong>
        </p>
        <p className="hint">
          {s('Necesitas', 'You need')} <strong>{breakEven}</strong> {s('servicios al mes para cubrir tus costes fijos.', 'services a month to cover your fixed costs.')}
        </p>
      </div>
    </div>
  )
}

function Instagram() {
  const { locale } = useApp()
  const s = sayer(locale)
  const [treatment, setTreatment] = useState(s('lifting de pestañas', 'lash lift'))
  const [salon, setSalon] = useState(s('tu centro', 'your salon'))
  const templates = [
    {
      title: s('Antes y después', 'Before and after'),
      text: s(
        `✨ Antes y después de un ${treatment} en ${salon}.\n\nSin filtros, resultado real. ¿Te imaginas despertarte así cada mañana?\n\n📅 Reserva en el enlace de la bio\n#${treatment.replace(/\s/g, '')} #antesydespues #estetica`,
        `✨ Before and after a ${treatment} at ${salon}.\n\nNo filters, real results. Imagine waking up like this every morning?\n\n📅 Book via the link in bio\n#${treatment.replace(/\s/g, '')} #beforeandafter #beauty`,
      ),
    },
    {
      title: s('Consejo profesional', 'Pro tip'),
      text: s(
        `💡 Consejo de esteticista: después de tu ${treatment}, sigue los cuidados al pie de la letra durante 48 h. Es lo que más alarga el resultado.\n\nGuarda este post para no olvidarlo 📌`,
        `💡 Esthetician tip: after your ${treatment}, follow the aftercare to the letter for 48 h. It's what makes results last longest.\n\nSave this post so you don't forget 📌`,
      ),
    },
    {
      title: s('Promoción de huecos', 'Fill quiet slots'),
      text: s(
        `⏰ ¡Martes y miércoles por la mañana tenemos huecos!\n\n${treatment} con un 15 % de descuento solo en esas franjas. Plazas limitadas.\n\n👉 Escríbenos por mensaje directo`,
        `⏰ We have free slots on Tuesday and Wednesday mornings!\n\n${treatment} 15% off in those slots only. Limited spaces.\n\n👉 Send us a DM`,
      ),
    },
    {
      title: s('Testimonio', 'Testimonial'),
      text: s(
        `💬 "Salí encantada, y lo mejor es lo bien que me explicaron todo." Así nos lo contó una clienta después de su ${treatment}.\n\nGracias por confiar en ${salon} 💗`,
        `💬 "I loved it, and the best part was how well everything was explained." That's what a client told us after her ${treatment}.\n\nThank you for trusting ${salon} 💗`,
      ),
    },
    {
      title: s('Detrás de las cámaras', 'Behind the scenes'),
      text: s(
        `🧼 Lo que no se ve: antes de cada ${treatment} desinfectamos todo y usamos material de un solo uso. Tu seguridad es lo primero.\n\n¿Sabías que es obligatorio? Cuéntanos en comentarios 👇`,
        `🧼 What you don't see: before every ${treatment} we disinfect everything and use single-use tools. Your safety comes first.\n\nDid you know it's mandatory? Tell us in the comments 👇`,
      ),
    },
  ]
  return (
    <div className="panel">
      <div className="form inline">
        <label className="field">
          <span>{s('Tratamiento', 'Treatment')}</span>
          <input value={treatment} onChange={(e) => setTreatment(e.target.value)} />
        </label>
        <label className="field">
          <span>{s('Nombre de tu centro', 'Salon name')}</span>
          <input value={salon} onChange={(e) => setSalon(e.target.value)} />
        </label>
      </div>
      <div className="list">
        {templates.map((tpl) => (
          <div key={tpl.title} className="list-item">
            <div className="row">
              <strong>{tpl.title}</strong>
              <CopyButton text={tpl.text} />
            </div>
            <pre className="template">{tpl.text}</pre>
          </div>
        ))}
      </div>
    </div>
  )
}

function Scripts() {
  const { locale, pro } = useApp()
  const s = sayer(locale)
  const scripts = [
    {
      title: s('Primera consulta', 'First consultation'),
      free: true,
      lines: [
        s('"Cuéntame, ¿qué es lo que más te gustaría mejorar?"', '"Tell me, what would you most like to improve?"'),
        s('"¿Desde cuándo lo notas? ¿Qué has probado hasta ahora?"', '"How long have you noticed it? What have you tried so far?"'),
        s('"Por lo que me cuentas, te propongo…"', '"From what you\'ve told me, I suggest…"'),
        s('"¿Te reservo ya la primera sesión?"', '"Shall I book your first session now?"'),
      ],
    },
    {
      title: s('Objeción: "es caro"', 'Objection: "it\'s expensive"'),
      free: true,
      lines: [
        s('"Te entiendo. ¿Lo comparas con algo en concreto?"', '"I understand. Are you comparing it with something specific?"'),
        s('"El precio incluye diagnóstico, producto profesional y el seguimiento."', '"The price includes assessment, professional products and follow-up."'),
        s('"Si te ayuda, puedes pagar sesión a sesión o el bono en dos plazos."', '"If it helps, you can pay per session or the package in two instalments."'),
      ],
    },
    {
      title: s('Vender un bono', 'Selling a package'),
      free: false,
      lines: [
        s('"Para el resultado que buscas, lo ideal son 6 sesiones."', '"For the result you want, 6 sessions are ideal."'),
        s('"Con el bono te ahorras una sesión y aseguras tus citas."', '"With the package you save one session and secure your dates."'),
        s('"¿Prefieres empezar esta semana o la que viene?"', '"Would you rather start this week or next?"'),
      ],
    },
    {
      title: s('Recomendar producto para casa', 'Recommending home care'),
      free: false,
      lines: [
        s('"Lo que hacemos aquí dura más si en casa lo acompañas con…"', '"What we do here lasts longer if at home you use…"'),
        s('"Es el mismo activo que acabo de usar, pero en versión diaria."', '"It\'s the same active I just used, in a daily version."'),
        s('"Con un frasco tienes para unos dos meses."', '"One bottle lasts about two months."'),
      ],
    },
    {
      title: s('Recuperar a una clienta', 'Winning back a client'),
      free: false,
      lines: [
        s('"¡Hola, [nombre]! Hace tiempo que no te vemos y nos acordamos de ti."', '"Hi [name]! We haven\'t seen you in a while and wanted to say hi."'),
        s('"Este mes tenemos [tratamiento] y he pensado que te encantaría."', '"This month we have [treatment] and I thought you\'d love it."'),
        s('"¿Te guardo un hueco esta semana?"', '"Shall I save you a slot this week?"'),
      ],
    },
  ]
  return (
    <div className="list">
      {scripts.map((sc) => (
        <div key={sc.title} className="list-item">
          <div className="row">
            <strong>{sc.title}</strong>
            {(sc.free || pro) && <CopyButton text={sc.lines.join('\n')} />}
          </div>
          {sc.free || pro ? (
            <ol>
              {sc.lines.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ol>
          ) : (
            <ProLock what={s('Todos los guiones de venta.', 'All sales scripts.')} />
          )}
        </div>
      ))}
    </div>
  )
}
