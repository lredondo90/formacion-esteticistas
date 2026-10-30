// Vercel serverless function: creates a Stripe Checkout session for a plan or a single course.
// The buyer must be signed in: the browser sends her Supabase access token and the session carries
// her user id, so the Stripe webhook (api/stripe-webhook.ts) can unlock the course on her account.
// Needs STRIPE_SECRET_KEY, one Stripe Price id per product, SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
// (see README). Without Stripe keys it answers { demo: true }.
type Body = { product: string; locale: string; origin: string }

const PRICE_ENV: Record<string, string> = {
  monthly: 'STRIPE_PRICE_MONTHLY',
  yearly: 'STRIPE_PRICE_YEARLY',
  all: 'STRIPE_PRICE_ALL_ACCESS',
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } })

// Checks the Supabase access token and returns the signed-in user.
async function currentUser(request: Request): Promise<{ id: string; email?: string } | null> {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null
  const res = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  return (await res.json()) as { id: string; email?: string }
}

export async function POST(request: Request): Promise<Response> {
  const key = process.env.STRIPE_SECRET_KEY
  const body = (await request.json().catch(() => null)) as Body | null
  if (!body || typeof body.product !== 'string' || !/^[a-z0-9-]{2,40}$/.test(body.product)) return json({ error: 'invalid_json' }, 400)

  // Single courses use STRIPE_PRICE_COURSE_<ID>, e.g. STRIPE_PRICE_COURSE_MICROBLADING.
  const envName = PRICE_ENV[body.product] ?? `STRIPE_PRICE_COURSE_${body.product.toUpperCase().replace(/-/g, '_')}`
  const price = process.env[envName]
  if (!key || !price) return json({ demo: true })

  const user = await currentUser(request)
  if (!user) return json({ error: 'login_required' }, 401)

  // Only send the buyer back to this site (APP_URL in production, or the request's own origin).
  const origin = process.env.APP_URL || new URL(request.url).origin
  const subscription = body.product === 'monthly' || body.product === 'yearly'
  const params = new URLSearchParams({
    mode: subscription ? 'subscription' : 'payment',
    'line_items[0][price]': price,
    'line_items[0][quantity]': '1',
    success_url: `${origin}/#/pago-ok?product=${encodeURIComponent(body.product)}`,
    cancel_url: `${origin}/#/${subscription ? 'planes' : 'cursos'}`,
    locale: body.locale === 'en' ? 'en' : 'es',
    client_reference_id: user.id,
    'metadata[product]': body.product,
    'metadata[user_id]': user.id,
    allow_promotion_codes: 'true',
  })
  if (user.email) params.set('customer_email', user.email)
  if (subscription) {
    params.set('subscription_data[metadata][product]', body.product)
    params.set('subscription_data[metadata][user_id]', user.id)
  }
  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/x-www-form-urlencoded' },
    body: params,
  })
  if (!res.ok) return json({ error: 'stripe_error' }, 502)
  const session = (await res.json()) as { url: string }
  return json({ url: session.url })
}
