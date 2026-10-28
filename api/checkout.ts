// Vercel serverless function: creates a Stripe Checkout session for a plan or a single course.
// Needs STRIPE_SECRET_KEY and one Stripe Price id per product (see README). Without them it answers
// { demo: true } and the app unlocks the content in demo mode.
type Body = { product: string; locale: string; origin: string }

const PRICE_ENV: Record<string, string> = {
  monthly: 'STRIPE_PRICE_MONTHLY',
  yearly: 'STRIPE_PRICE_YEARLY',
  all: 'STRIPE_PRICE_ALL_ACCESS',
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } })

export async function POST(request: Request): Promise<Response> {
  const key = process.env.STRIPE_SECRET_KEY
  const body = (await request.json().catch(() => null)) as Body | null
  if (!body) return json({ error: 'invalid_json' }, 400)

  // Single courses use STRIPE_PRICE_COURSE_<ID>, e.g. STRIPE_PRICE_COURSE_MICROBLADING.
  const envName = PRICE_ENV[body.product] ?? `STRIPE_PRICE_COURSE_${body.product.toUpperCase().replace(/-/g, '_')}`
  const price = process.env[envName]
  if (!key || !price) return json({ demo: true })

  const subscription = body.product === 'monthly' || body.product === 'yearly'
  const params = new URLSearchParams({
    mode: subscription ? 'subscription' : 'payment',
    'line_items[0][price]': price,
    'line_items[0][quantity]': '1',
    success_url: `${body.origin}/#/pago-ok?product=${encodeURIComponent(body.product)}&session={CHECKOUT_SESSION_ID}`,
    cancel_url: `${body.origin}/#/planes`,
    locale: body.locale === 'en' ? 'en' : 'es',
    'metadata[product]': body.product,
  })
  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/x-www-form-urlencoded' },
    body: params,
  })
  if (!res.ok) return json({ error: 'stripe_error' }, 502)
  const session = (await res.json()) as { url: string }
  return json({ url: session.url })
}
