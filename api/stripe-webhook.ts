// Vercel serverless function: Stripe calls it after each payment and subscription change, and it
// writes what the student bought into public.academy_entitlements. This is the only place that
// unlocks paid content. Needs STRIPE_WEBHOOK_SECRET, SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
// In Stripe → Developers → Webhooks, point an endpoint to https://<your-site>/api/stripe-webhook
// with the events checkout.session.completed, customer.subscription.updated and
// customer.subscription.deleted.
import { createHmac, timingSafeEqual } from 'node:crypto'

type CheckoutSession = {
  id: string
  mode: 'payment' | 'subscription'
  payment_status: string
  client_reference_id: string | null
  customer: string | null
  subscription: string | null
  metadata: Record<string, string>
}

type Subscription = {
  id: string
  status: string
  customer: string
  metadata: Record<string, string>
  current_period_end?: number
  items?: { data: { current_period_end?: number }[] }
}

type StripeEvent = { type: string; data: { object: unknown } }

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } })

// Stripe-Signature: t=<timestamp>,v1=<hmac>[,v1=<hmac>…]; the HMAC is over "<t>.<raw body>".
function validSignature(payload: string, header: string | null, secret: string): boolean {
  if (!header) return false
  const parts = header.split(',').map((p) => p.split('='))
  const t = parts.find(([k]) => k === 't')?.[1]
  const signatures = parts.filter(([k]) => k === 'v1').map(([, v]) => v)
  if (!t || signatures.length === 0) return false
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false
  const expected = Buffer.from(createHmac('sha256', secret).update(`${t}.${payload}`).digest('hex'))
  return signatures.some((s) => {
    const given = Buffer.from(s)
    return given.length === expected.length && timingSafeEqual(given, expected)
  })
}

function rest(path: string, init: { method: string; body?: unknown; prefer?: string }) {
  return fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, {
    method: init.method,
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'content-type': 'application/json',
      ...(init.prefer ? { prefer: init.prefer } : {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  })
}

const periodEnd = (sub: Subscription) => {
  const end = sub.items?.data[0]?.current_period_end ?? sub.current_period_end
  return end ? new Date(end * 1000).toISOString() : null
}

async function onCheckoutCompleted(session: CheckoutSession): Promise<Response> {
  const userId = session.client_reference_id ?? session.metadata.user_id
  const product = session.metadata.product
  if (!userId || !product) return json({ ignored: 'missing_user_or_product' })
  if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') return json({ ignored: 'unpaid' })

  const yearFromNow = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString()
  let expires: string | null = product === 'all' ? yearFromNow : null
  if (session.mode === 'subscription' && session.subscription) {
    // Ask Stripe for the period end so access lasts exactly as long as what was paid.
    const res = await fetch(`https://api.stripe.com/v1/subscriptions/${session.subscription}`, {
      headers: { authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
    })
    expires = res.ok ? periodEnd((await res.json()) as Subscription) : null
  }
  // Stripe may send the same event twice: the unique session id makes the insert idempotent.
  const res = await rest('academy_entitlements?on_conflict=stripe_session_id', {
    method: 'POST',
    prefer: 'resolution=merge-duplicates,return=minimal',
    body: {
      user_id: userId,
      product,
      active: true,
      expires_at: expires,
      stripe_session_id: session.id,
      stripe_subscription_id: session.subscription,
      stripe_customer_id: session.customer,
    },
  })
  if (!res.ok) return json({ error: 'db_error', detail: await res.text() }, 500)
  return json({ ok: true })
}

async function onSubscriptionChanged(sub: Subscription, deleted: boolean): Promise<Response> {
  const active = !deleted && ['active', 'trialing', 'past_due'].includes(sub.status)
  const res = await rest(`academy_entitlements?stripe_subscription_id=eq.${encodeURIComponent(sub.id)}`, {
    method: 'PATCH',
    prefer: 'return=minimal',
    body: { active, expires_at: periodEnd(sub), updated_at: new Date().toISOString() },
  })
  if (!res.ok) return json({ error: 'db_error', detail: await res.text() }, 500)
  return json({ ok: true })
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return json({ error: 'not_configured' }, 503)
  const payload = await request.text()
  if (!validSignature(payload, request.headers.get('stripe-signature'), secret)) return json({ error: 'bad_signature' }, 400)

  const event = JSON.parse(payload) as StripeEvent
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
      return onCheckoutCompleted(event.data.object as CheckoutSession)
    case 'customer.subscription.updated':
      return onSubscriptionChanged(event.data.object as Subscription, false)
    case 'customer.subscription.deleted':
      return onSubscriptionChanged(event.data.object as Subscription, true)
    default:
      return json({ ignored: event.type })
  }
}
