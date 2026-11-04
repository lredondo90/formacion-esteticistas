// Entrada desde el portal "Mis apps" (?entrar=google&email=…): si no hay sesión, entra con Google sin pulsar nada.
import { supabase, supabaseConfigured } from './lib/supabase'

export async function portalLogin(): Promise<void> {
  const q = new URLSearchParams(location.search)
  if (q.get('entrar') !== 'google' || !supabaseConfigured) return
  const hint = q.get('email') ?? ''
  q.delete('entrar')
  q.delete('email')
  const rest = q.toString()
  history.replaceState(null, '', `${location.pathname}${rest ? `?${rest}` : ''}${location.hash}`)
  const { data } = await supabase.auth.getSession()
  if (data.session) return
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${location.origin}/#/cursos`,
      queryParams: /^[^\s@]+@[^\s@]+$/.test(hint) ? { login_hint: hint } : undefined,
    },
  })
}
