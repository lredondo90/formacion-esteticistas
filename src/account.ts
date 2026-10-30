// Student accounts for the academy: sign-in (Google or email), what she has paid for and her
// progress, all in Supabase so she can continue on any device. Paid access is only ever written by
// the Stripe webhook (api/stripe-webhook.ts); RLS lets each student read only her own rows.
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, supabaseConfigured } from './lib/supabase'
import type { Plan, Progress } from './state'
import type { CertData } from './services'

export { supabaseConfigured as accountsEnabled }

// undefined while checking, null when signed out.
export function useSession(): Session | null | undefined {
  const [session, setSession] = useState<Session | null | undefined>(supabaseConfigured ? undefined : null)
  useEffect(() => {
    if (!supabaseConfigured) return
    void supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])
  return session
}

export type Entitlements = { purchases: string[]; plan: Plan }

export async function fetchEntitlements(): Promise<Entitlements> {
  const { data, error } = await supabase.from('academy_entitlements').select('product, expires_at').eq('active', true)
  if (error || !data) return { purchases: [], plan: null }
  const now = Date.now()
  const current = data.filter((e) => !e.expires_at || new Date(e.expires_at).getTime() > now).map((e) => e.product as string)
  const plan: Plan = current.includes('yearly') ? 'yearly' : current.includes('monthly') ? 'monthly' : null
  return { purchases: current.filter((p) => p !== 'monthly' && p !== 'yearly'), plan }
}

export type SavedProgress = { progress: Progress; certs: CertData[] }

export async function fetchProgress(userId: string): Promise<SavedProgress | null> {
  const { data } = await supabase.from('academy_progress').select('progress, certs').eq('user_id', userId).maybeSingle()
  return data ? { progress: data.progress as Progress, certs: data.certs as CertData[] } : null
}

export async function saveProgress(userId: string, saved: SavedProgress): Promise<void> {
  await supabase
    .from('academy_progress')
    .upsert({ user_id: userId, progress: saved.progress, certs: saved.certs, updated_at: new Date().toISOString() })
}

// Joins what was done on this device before signing in with what the account already had.
export function mergeProgress(a: Progress, b: Progress): Progress {
  const courses = { ...a.courses }
  for (const [id, c] of Object.entries(b.courses)) {
    const mine = courses[id]
    courses[id] = mine ? { step: Math.max(mine.step, c.step), done: mine.done || c.done } : c
  }
  const seen = new Set<string>()
  const log = [...(a.log ?? []), ...(b.log ?? [])]
    .filter((x) => {
      const key = `${x.d}|${x.k}|${x.p}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((x, y) => x.d.localeCompare(y.d))
    .slice(-500)
  return { points: Math.max(a.points, b.points), courses, log }
}

export function mergeCerts(a: CertData[], b: CertData[]): CertData[] {
  const byCourse = new Map(a.map((c) => [c.c, c]))
  for (const c of b) if (!byCourse.has(c.c)) byCourse.set(c.c, c)
  return [...byCourse.values()]
}

export function signOut() {
  void supabase.auth.signOut()
}
