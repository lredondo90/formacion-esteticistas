import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { errorText, ROLE_LABEL, rpc } from './api'
import type { Center, Role } from './types'
import { ManagerWorkspace } from './Workspace'
import './manager.css'

const INVITE_KEY = 'aula-invitation'

function inviteFromUrl(): string | null {
  const match = location.hash.match(/[?&]invitacion=([0-9a-f-]{36})/i)
  if (match) {
    try {
      sessionStorage.setItem(INVITE_KEY, match[1])
    } catch {
      // Private mode: the token still works for this page load.
    }
    return match[1]
  }
  try {
    return sessionStorage.getItem(INVITE_KEY)
  } catch {
    return null
  }
}

type Membership = { center: Center; role: Role }

export function ManagerHome() {
  const [session, setSession] = useState<Session | null>(null)
  const [recoveringPassword, setRecoveringPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [authReady, setAuthReady] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  const [membership, setMembership] = useState<Membership | null>(null)
  const [centerReady, setCenterReady] = useState(false)
  const [centerLoadError, setCenterLoadError] = useState('')
  const [centerRetry, setCenterRetry] = useState(0)
  const [centerName, setCenterName] = useState('')
  const [invite, setInvite] = useState<string | null>(inviteFromUrl)
  const preferredCenter = useRef<string | null>(null)
  const [invitePreview, setInvitePreview] = useState<{ center_name: string; role: Role; email: string; valid: boolean } | null>(null)

  useEffect(() => {
    if (!supabaseConfigured) {
      setAuthReady(true)
      return
    }
    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) setAuthMessage('No se pudo comprobar la sesión. Inténtalo de nuevo.')
      setSession(data.session)
      setAuthReady(true)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession)
      if (event === 'PASSWORD_RECOVERY') setRecoveringPassword(true)
      if (event === 'SIGNED_OUT' || event === 'SIGNED_IN') {
        setMembership(null)
        setCenterReady(!nextSession)
      }
      setAuthMessage('')
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!invite || !supabaseConfigured) return
    rpc<typeof invitePreview>('invitation_preview', { p_token: invite })
      .then((preview) => {
        setInvitePreview(preview)
        if (preview?.email) setEmail((current) => current || preview.email)
      })
      .catch(() => setInvitePreview(null))
  }, [invite])

  const userId = session?.user.id
  useEffect(() => {
    if (!userId) return
    let active = true
    setCenterReady(false)
    setCenterLoadError('')
    void (async () => {
      try {
        if (invite) {
          try {
            preferredCenter.current = await rpc<string>('accept_invitation', { p_token: invite })
            setAuthMessage('Te has unido al centro. ¡Bienvenida al equipo!')
          } catch (e) {
            if (active) setAuthMessage(e instanceof Error ? e.message : String(e))
          }
          try {
            sessionStorage.removeItem(INVITE_KEY)
          } catch {
            // ignore
          }
          if (location.hash.includes('invitacion=')) history.replaceState(null, '', '#/gestor')
          if (active) setInvite(null)
        }
        const { data: members, error } = await supabase
          .from('center_members')
          .select('role, created_at, centers(*)')
          .eq('user_id', userId)
          .eq('active', true)
          .order('created_at')
        if (!active) return
        if (error) throw error
        const list = (members ?? []) as unknown as { role: Role; centers: Center }[]
        const first = list.find((m) => m.centers?.id === preferredCenter.current) ?? list[0]
        setMembership(first?.centers ? { center: first.centers, role: first.role } : null)
      } catch (e) {
        if (active) setCenterLoadError(`No se pudo cargar el centro. ${errorText(e)}`)
      } finally {
        if (active) setCenterReady(true)
      }
    })()
    return () => {
      active = false
    }
  }, [userId, centerRetry, invite])

  async function submitAuth(event: FormEvent) {
    event.preventDefault()
    setAuthBusy(true)
    setAuthMessage('')
    try {
      const redirect = `${window.location.origin}/#/gestor${invite ? `?invitacion=${invite}` : ''}`
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: redirect, data: { full_name: fullName.trim() || undefined } },
        })
        if (error) throw error
        if (!data.session) setAuthMessage('Cuenta creada. Revisa tu correo para confirmar la dirección y después inicia sesión.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (error) throw error
      }
    } catch (error) {
      setAuthMessage(authError(error))
    } finally {
      setAuthBusy(false)
    }
  }

  async function resetPassword() {
    if (!email.trim()) {
      setAuthMessage('Escribe tu correo para enviarte el enlace de recuperación.')
      return
    }
    setAuthBusy(true)
    setAuthMessage('')
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/#/gestor` })
    setAuthMessage(error ? authError(error) : 'Si existe una cuenta con ese correo, recibirá un enlace de recuperación.')
    setAuthBusy(false)
  }

  async function updatePassword(event: FormEvent) {
    event.preventDefault()
    setAuthBusy(true)
    setAuthMessage('')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) setAuthMessage(authError(error))
    else {
      setRecoveringPassword(false)
      setAuthMessage('Contraseña actualizada.')
    }
    setAuthBusy(false)
  }

  async function createCenter(event: FormEvent) {
    event.preventDefault()
    if (!centerName.trim()) return
    setAuthBusy(true)
    setAuthMessage('')
    try {
      await rpc<string>('create_my_first_center', { p_name: centerName.trim() })
      setCenterRetry((value) => value + 1)
    } catch (e) {
      setAuthMessage(e instanceof Error ? e.message : String(e))
    } finally {
      setAuthBusy(false)
    }
  }

  const inviteBanner = invitePreview && (
    <p className="mgr-invite-banner">
      {invitePreview.valid ? (
        <>
          Te han invitado a <strong>{invitePreview.center_name}</strong> como {ROLE_LABEL[invitePreview.role].toLowerCase()}. Entra o crea tu cuenta
          con <strong>{invitePreview.email}</strong> para unirte.
        </>
      ) : (
        'Esta invitación ha caducado o ya se usó. Pide una nueva al centro.'
      )}
    </p>
  )

  if (!supabaseConfigured)
    return (
      <AuthPanel
        title="Conecta Supabase para empezar"
        message="Configura VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY en el entorno (ver supabase/README.md)."
      />
    )
  if (recoveringPassword)
    return (
      <section className="mgr mgr-auth">
        <div className="mgr-auth-card">
          <span className="mgr-kicker">SEGURIDAD DE LA CUENTA</span>
          <h1>Elige una contraseña nueva</h1>
          <form onSubmit={updatePassword}>
            <label>
              Nueva contraseña
              <input required minLength={8} type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </label>
            <button className="mgr-primary" type="submit" disabled={authBusy}>
              Actualizar contraseña
            </button>
          </form>
          {authMessage && <p className="mgr-notice" role="status">{authMessage}</p>}
        </div>
      </section>
    )
  if (!authReady || (session && !centerReady))
    return (
      <div className="mgr">
        <p role="status" className="mgr-loading">
          Comprobando tu sesión…
        </p>
      </div>
    )
  if (!session)
    return (
      <section className="mgr mgr-auth">
        <div className="mgr-auth-card">
          <span className="mgr-kicker">AULA ESTÉTICA · MANAGER</span>
          <h1>{authMode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}</h1>
          <p>Agenda, clientes, equipo y caja de tu centro en un solo lugar.</p>
          {inviteBanner}
          <form onSubmit={submitAuth}>
            {authMode === 'signup' && (
              <label>
                Tu nombre
                <input autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={140} />
              </label>
            )}
            <label>
              Correo electrónico
              <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label>
              Contraseña
              <input
                required
                type="password"
                minLength={8}
                autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <button className="mgr-primary" type="submit" disabled={authBusy}>
              {authBusy ? 'Procesando…' : authMode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>
          </form>
          {authMode === 'login' && (
            <button className="mgr-link" type="button" onClick={() => void resetPassword()} disabled={authBusy}>
              He olvidado mi contraseña
            </button>
          )}
          <button
            className="mgr-link"
            type="button"
            onClick={() => {
              setAuthMode(authMode === 'login' ? 'signup' : 'login')
              setAuthMessage('')
            }}
          >
            {authMode === 'login' ? 'Crear una cuenta' : 'Ya tengo cuenta'}
          </button>
          {authMessage && <p className="mgr-notice" role="status">{authMessage}</p>}
        </div>
      </section>
    )
  if (centerLoadError)
    return (
      <section className="mgr mgr-auth">
        <div className="mgr-auth-card">
          <h1>No se pudo cargar tu centro</h1>
          <p role="alert">{centerLoadError}</p>
          <button className="mgr-primary" onClick={() => setCenterRetry((value) => value + 1)}>
            Reintentar
          </button>
          <button className="mgr-link" onClick={() => void supabase.auth.signOut()}>
            Cerrar sesión
          </button>
        </div>
      </section>
    )
  if (!membership)
    return (
      <section className="mgr mgr-auth">
        <div className="mgr-auth-card">
          <span className="mgr-kicker">PRIMER PASO</span>
          <h1>Configura tu centro</h1>
          <p>Crearemos tu centro con un horario de ejemplo y tu ficha de profesional. Podrás cambiarlo todo después.</p>
          {authMessage && <p className="mgr-notice" role="status">{authMessage}</p>}
          <p className="mgr-footnote">¿Trabajas en un centro que ya usa Aula Estética? Pide a la propietaria que te invite con este correo.</p>
          <form onSubmit={createCenter}>
            <label>
              Nombre del centro
              <input required minLength={2} maxLength={140} value={centerName} onChange={(e) => setCenterName(e.target.value)} placeholder="Ej. Estudio Aura" />
            </label>
            <button className="mgr-primary" type="submit" disabled={authBusy}>
              {authBusy ? 'Guardando…' : 'Crear mi centro'}
            </button>
          </form>
          <button className="mgr-link" type="button" onClick={() => void supabase.auth.signOut()}>
            Cerrar sesión
          </button>
        </div>
      </section>
    )
  return (
    <ManagerWorkspace
      key={membership.center.id}
      initialCenter={membership.center}
      role={membership.role}
      userId={session.user.id}
      email={session.user.email ?? ''}
      welcome={authMessage}
      onSignOut={() => void supabase.auth.signOut()}
    />
  )
}

function AuthPanel({ title, message }: { title: string; message: string }) {
  return (
    <section className="mgr mgr-auth">
      <div className="mgr-auth-card">
        <span className="mgr-kicker">AULA ESTÉTICA · MANAGER</span>
        <h1>{title}</h1>
        <p>{message}</p>
      </div>
    </section>
  )
}

function authError(error: unknown) {
  const text = error instanceof Error ? error.message : ''
  if (text.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.'
  if (text.includes('Email not confirmed')) return 'Confirma tu correo con el enlace que te enviamos antes de entrar.'
  if (text.includes('User already registered')) return 'Ya existe una cuenta con ese correo. Inicia sesión.'
  if (text.includes('Password should be')) return 'La contraseña debe tener al menos 8 caracteres.'
  return text || 'No se pudo completar la operación.'
}
