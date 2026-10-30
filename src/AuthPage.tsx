// Sign-in page for students: Google or email and password (Supabase Auth, PKCE flow).
import { useState, type FormEvent } from 'react'
import { supabase, supabaseConfigured } from './lib/supabase'
import { sayer, type Locale } from './i18n'

function authError(message: string, s: ReturnType<typeof sayer>): string {
  if (/invalid login/i.test(message)) return s('Correo o contraseña incorrectos.', 'Wrong email or password.')
  if (/already registered/i.test(message)) return s('Ya hay una cuenta con ese correo. Inicia sesión.', 'There is already an account with that email. Sign in.')
  if (/email not confirmed/i.test(message)) return s('Confirma tu correo con el enlace que te enviamos.', 'Confirm your email with the link we sent you.')
  if (/password/i.test(message)) return s('La contraseña debe tener al menos 8 caracteres.', 'The password must be at least 8 characters long.')
  return s('No se pudo completar. Inténtalo de nuevo.', 'Something went wrong. Please try again.')
}

export function AuthPage({ locale, next = 'cursos' }: { locale: Locale; next?: string }) {
  const s = sayer(locale)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ text: string; good?: boolean } | null>(() => {
    // A cancelled or failed Google sign-in comes back with ?error_description=… in the URL.
    const error = new URLSearchParams(location.search).get('error_description')
    if (!error) return null
    history.replaceState(null, '', `${location.pathname}${location.hash}`)
    return { text: `${s('No se pudo entrar con Google', 'Could not sign in with Google')}: ${error}` }
  })
  const redirectTo = `${location.origin}/#/${next}`

  async function google() {
    setBusy(true)
    setMessage(null)
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo, queryParams: { prompt: 'select_account' } } })
    // On success the browser leaves for Google, so only errors come back here.
    if (error) {
      setMessage({ text: authError(error.message, s) })
      setBusy(false)
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMessage(null)
    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: redirectTo } })
      if (error) setMessage({ text: authError(error.message, s) })
      else if (!data.session)
        setMessage({ text: s('Te hemos enviado un correo para confirmar la cuenta.', 'We sent you an email to confirm your account.'), good: true })
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) setMessage({ text: authError(error.message, s) })
    }
    setBusy(false)
  }

  async function reset() {
    if (!email.trim()) {
      setMessage({ text: s('Escribe tu correo para enviarte el enlace.', 'Type your email so we can send you the link.') })
      return
    }
    setBusy(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${location.origin}/#/gestor` })
    setMessage(error ? { text: authError(error.message, s) } : { text: s('Revisa tu correo para cambiar la contraseña.', 'Check your email to reset your password.'), good: true })
    setBusy(false)
  }

  if (!supabaseConfigured)
    return (
      <div className="panel center auth">
        <h1>{s('Cuentas no configuradas', 'Accounts not configured')}</h1>
        <p className="hint">VITE_SUPABASE_URL · VITE_SUPABASE_PUBLISHABLE_KEY</p>
      </div>
    )

  return (
    <div className="panel auth">
      <h1>{mode === 'login' ? s('Inicia sesión', 'Sign in') : s('Crea tu cuenta gratis', 'Create your free account')}</h1>
      <p className="hint">
        {s(
          'Con tu cuenta ves los cursos profesionales, guardas tu progreso y sigues desde cualquier dispositivo.',
          'With an account you can see the professional courses, save your progress and continue on any device.',
        )}
      </p>
      <button className="google-btn" type="button" onClick={() => void google()} disabled={busy}>
        <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
        </svg>
        {s('Continuar con Google', 'Continue with Google')}
      </button>
      <div className="divider">
        <span>{s('o con tu correo', 'or with your email')}</span>
      </div>
      <form className="form" onSubmit={(e) => void submit(e)}>
        <input type="email" required autoComplete="email" placeholder={s('Correo electrónico', 'Email')} value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          type="password"
          required
          minLength={8}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          placeholder={s('Contraseña', 'Password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="primary" type="submit" disabled={busy}>
          {mode === 'login' ? s('Entrar', 'Sign in') : s('Crear cuenta', 'Create account')}
        </button>
      </form>
      {message && <p className={`feedback ${message.good ? 'good' : 'bad'}`}>{message.text}</p>}
      <div className="auth-links">
        <button className="ghost" type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? s('¿No tienes cuenta? Créala gratis', "Don't have an account? Create one") : s('¿Ya tienes cuenta? Inicia sesión', 'Already have an account? Sign in')}
        </button>
        {mode === 'login' && (
          <button className="ghost" type="button" onClick={() => void reset()} disabled={busy}>
            {s('He olvidado mi contraseña', 'I forgot my password')}
          </button>
        )}
      </div>
    </div>
  )
}
