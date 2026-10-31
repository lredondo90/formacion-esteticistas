// Vercel serverless function: lets a platform admin (owner or "solo cursos") create a user account
// from the admin panel (#/admin), optionally with free access to a course or plan.
// The caller sends her Supabase access token; we check her platform role with that token, then use
// the service role (server-only) to create the account. Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
import { randomBytes } from 'node:crypto'

type Body = { email?: string; full_name?: string; password?: string; product?: string | null; days?: number | null }

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } })

const env = () => ({ url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SERVICE_ROLE_KEY })

async function caller(token: string): Promise<{ id: string; role: string | null } | null> {
  const { url, key } = env()
  const userRes = await fetch(`${url}/auth/v1/user`, { headers: { apikey: key!, authorization: `Bearer ${token}` } })
  if (!userRes.ok) return null
  const user = (await userRes.json()) as { id: string }
  // platform_role() reads auth.uid() from the caller's own token.
  const roleRes = await fetch(`${url}/rest/v1/rpc/platform_role`, {
    method: 'POST',
    headers: { apikey: key!, authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: '{}',
  })
  const role = roleRes.ok ? ((await roleRes.json()) as string | null) : null
  return { id: user.id, role }
}

// Readable temporary password: 12 characters without look-alikes (0/O, 1/l).
function tempPassword() {
  const alphabet = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return [...randomBytes(12)].map((b) => alphabet[b % alphabet.length]).join('')
}

export async function POST(request: Request): Promise<Response> {
  const { url, key } = env()
  if (!url || !key) return json({ error: 'not_configured' }, 503)
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return json({ error: 'login_required' }, 401)
  const admin = await caller(token)
  if (!admin) return json({ error: 'login_required' }, 401)
  if (admin.role !== 'owner' && admin.role !== 'courses') return json({ error: 'forbidden' }, 403)

  const body = (await request.json().catch(() => null)) as Body | null
  const email = body?.email?.trim().toLowerCase() ?? ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) return json({ error: 'invalid_email' }, 400)
  const fullName = body?.full_name?.trim().slice(0, 140) || email.split('@')[0]
  const given = body?.password?.trim() ?? ''
  if (given && given.length < 8) return json({ error: 'weak_password' }, 400)
  const password = given || tempPassword()
  const product = body?.product ?? null
  if (product !== null && !/^[a-z0-9-]{2,40}$/.test(product)) return json({ error: 'invalid_product' }, 400)

  const created = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers: { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { full_name: fullName } }),
  })
  if (!created.ok) {
    const detail = await created.text()
    if (created.status === 422 || /already|registered|exists/i.test(detail)) return json({ error: 'user_exists' }, 409)
    return json({ error: 'auth_error', detail }, 502)
  }
  const user = (await created.json()) as { id: string }

  if (product) {
    const days = Number(body?.days) || 0
    const res = await fetch(`${url}/rest/v1/academy_entitlements`, {
      method: 'POST',
      headers: { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json', prefer: 'return=minimal' },
      body: JSON.stringify({
        user_id: user.id,
        product,
        active: true,
        expires_at: days > 0 ? new Date(Date.now() + days * 86400000).toISOString() : null,
        granted_by: admin.id,
        note: 'Alta desde el panel',
      }),
    })
    if (!res.ok) return json({ ok: true, user_id: user.id, password: given ? undefined : password, warning: 'grant_failed' })
  }

  // The temporary password is shown once to the admin so she can pass it on; it is never stored here.
  return json({ ok: true, user_id: user.id, password: given ? undefined : password })
}
