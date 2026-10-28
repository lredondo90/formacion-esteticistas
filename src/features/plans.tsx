import { useState } from 'react'
import { formatPrice, sayer, t, type Locale } from '../i18n'
import { startCheckout } from '../services'
import { useApp, type Plan } from '../state'
import { DemoNote, Modal, PageHead } from './ui'

const PLAN_PRICES = {
  monthly: { eur: 19.9, usd: 21.9 },
  yearly: { eur: 179, usd: 199 },
  seat: { eur: 12, usd: 13 },
}

function price(p: { eur: number; usd: number }, locale: Locale) {
  const currency = locale === 'es-ES' ? 'EUR' : 'USD'
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 }).format(
    currency === 'EUR' ? p.eur : p.usd,
  )
}

export function PlansPage() {
  const { locale, plan, setPlan, go } = useApp()
  const s = sayer(locale)
  const [demo, setDemo] = useState<Exclude<Plan, null> | null>(null)
  const [academySent, setAcademySent] = useState(false)

  const subscribe = async (p: 'monthly' | 'yearly') => {
    if (!(await startCheckout(p, locale))) setDemo(p)
  }

  const proFeatures = [
    s('Los 10 cursos premium y los nuevos', 'All 10 premium courses and new ones'),
    s('Certificados verificables con QR', 'Verifiable QR certificates'),
    s('Analizador de piel y tutor con IA sin límite', 'Unlimited AI skin analyser and tutor'),
    s('Biblioteca completa de protocolos y fichas', 'Full library of protocols and forms'),
    s('Masterclasses en directo y grabaciones', 'Live masterclasses and recordings'),
    s('1 corrección de prácticas por experta al mes', '1 expert practice review per month'),
  ]

  return (
    <>
      <PageHead
        emoji="💎"
        title={s('Planes', 'Plans')}
        intro={s(
          'Empieza gratis, compra un curso suelto o hazte Pro para tenerlo todo.',
          'Start free, buy a single course, or go Pro to get everything.',
        )}
      />
      {plan && (
        <div className="pass">
          <div>
            <strong>✓ {s('Tienes Aula Pro', 'You have Aula Pro')}</strong>
            <p>
              {plan === 'monthly'
                ? s('Plan mensual', 'Monthly plan')
                : plan === 'yearly'
                  ? s('Plan anual', 'Yearly plan')
                  : s('Plan academia', 'Academy plan')}
            </p>
          </div>
          <button className="ghost" onClick={() => setPlan(null)}>
            {s('Cancelar suscripción (demo)', 'Cancel subscription (demo)')}
          </button>
        </div>
      )}
      <div className="plans">
        <article className="plan">
          <h3>{s('Gratis', 'Free')}</h3>
          <p className="plan-price">{formatPrice({ eur: 0, usd: 0 }, locale)}</p>
          <ul>
            <li>{s('Curso de diagnóstico facial completo', 'Full skin analysis course')}</li>
            <li>{s('2 lecciones gratis de cada curso premium', '2 free lessons of every premium course')}</li>
            <li>{s('3 usos de prueba de la IA', '3 trial uses of the AI')}</li>
            <li>{s('Comunidad y bolsa de empleo', 'Community and job board')}</li>
          </ul>
          <button className="secondary" onClick={() => go('cursos')}>
            {s('Ver cursos', 'See courses')}
          </button>
        </article>
        <article className="plan">
          <h3>{s('Curso suelto', 'Single course')}</h3>
          <p className="plan-price">
            {s('desde', 'from')} {formatPrice({ eur: 29, usd: 35 }, locale)}
          </p>
          <ul>
            <li>{s('Acceso para siempre a ese curso', 'Lifetime access to that course')}</li>
            <li>{s('Certificado verificable', 'Verifiable certificate')}</li>
          </ul>
          <button className="secondary" onClick={() => go('cursos')}>
            {s('Elegir curso', 'Choose a course')}
          </button>
        </article>
        <article className="plan featured">
          <span className="badge">{s('El más elegido', 'Most popular')}</span>
          <h3>Aula Pro</h3>
          <p className="plan-price">
            {price(PLAN_PRICES.monthly, locale)}
            <small>/{s('mes', 'month')}</small>
          </p>
          <p className="hint">
            {s('o', 'or')} {price(PLAN_PRICES.yearly, locale)}/{s('año', 'year')} ({s('2 meses gratis', '2 months free')})
          </p>
          <ul>
            {proFeatures.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <div className="card-actions">
            <button className="primary" disabled={plan === 'monthly'} onClick={() => subscribe('monthly')}>
              {s('Mensual', 'Monthly')}
            </button>
            <button className="secondary" disabled={plan === 'yearly'} onClick={() => subscribe('yearly')}>
              {s('Anual', 'Yearly')}
            </button>
          </div>
        </article>
        <article className="plan">
          <h3>{s('Academias y centros', 'Academies and salons')}</h3>
          <p className="plan-price">
            {price(PLAN_PRICES.seat, locale)}
            <small>/{s('alumna/mes', 'seat/month')}</small>
          </p>
          <ul>
            <li>{s('Todo lo de Pro para cada alumna o empleada', 'Everything in Pro for each student or employee')}</li>
            <li>{s('Panel con el progreso del equipo', 'Team progress dashboard')}</li>
            <li>{s('Certificados con el logo de tu centro', 'Certificates with your salon logo')}</li>
            <li>{s('Desde 5 plazas', 'From 5 seats')}</li>
          </ul>
          {academySent ? (
            <p className="feedback good">✅ {s('¡Gracias! Te escribiremos en 24 horas.', "Thanks! We'll write to you within 24 hours.")}</p>
          ) : (
            <AcademyForm onSent={() => setAcademySent(true)} />
          )}
        </article>
      </div>

      {demo && (
        <Modal onClose={() => setDemo(null)}>
          <h2>{t('checkoutTitle', locale)}</h2>
          <div className="checkout-line">
            <span>💎 Aula Pro · {demo === 'monthly' ? s('mensual', 'monthly') : s('anual', 'yearly')}</span>
            <strong>{price(demo === 'monthly' ? PLAN_PRICES.monthly : PLAN_PRICES.yearly, locale)}</strong>
          </div>
          <DemoNote>{t('demoNote', locale)}</DemoNote>
          <div className="actions">
            <button className="ghost" onClick={() => setDemo(null)}>
              {t('close', locale)}
            </button>
            <button
              className="primary"
              onClick={() => {
                setPlan(demo)
                setDemo(null)
              }}
            >
              {s('Suscribirme', 'Subscribe')}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}

function AcademyForm({ onSent }: { onSent: () => void }) {
  const { locale } = useApp()
  const s = sayer(locale)
  const [form, setForm] = useState({ center: '', seats: '5', email: '' })
  const valid = form.center && /.+@.+\..+/.test(form.email) && Number(form.seats) >= 5
  const contact = import.meta.env.VITE_CONTACT_EMAIL as string | undefined
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault()
        if (contact) {
          const body = `${form.center} · ${form.seats} · ${form.email}`
          window.open(`mailto:${contact}?subject=${encodeURIComponent('Plan academia')}&body=${encodeURIComponent(body)}`)
        }
        onSent()
      }}
    >
      <input placeholder={s('Nombre del centro', 'Salon or academy name')} value={form.center} onChange={(e) => setForm({ ...form, center: e.target.value })} />
      <input type="number" min={5} placeholder={s('Nº de plazas', 'Seats')} value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} />
      <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <button className="primary" disabled={!valid}>
        {s('Pedir presupuesto', 'Request a quote')}
      </button>
    </form>
  )
}
