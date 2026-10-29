import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { dispatchNotifications, ROLE_LABEL, run } from './api'
import { WorkspaceContext, type Workspace } from './context'
import type { Center, Link, OpeningHour, Resource, Role, Service, Staff } from './types'
import { Notice } from './ui'
import { Dashboard } from './dashboard/Dashboard'
import { Agenda } from './calendar/Agenda'
import { Clients } from './clients/Clients'
import { Services } from './services/Services'
import { Team } from './staff/Team'
import { Cash } from './payments/Cash'
import { Settings } from './settings/Settings'

type Tab = { id: string; icon: string; label: string; roles: Role[]; soon?: string }

const TABS: Tab[] = [
  { id: 'inicio', icon: '🏠', label: 'Inicio', roles: ['owner', 'admin', 'reception', 'professional'] },
  { id: 'agenda', icon: '🗓️', label: 'Agenda', roles: ['owner', 'admin', 'reception', 'professional'] },
  { id: 'clientes', icon: '👩', label: 'Clientes', roles: ['owner', 'admin', 'reception', 'professional'] },
  { id: 'servicios', icon: '✨', label: 'Servicios', roles: ['owner', 'admin', 'reception', 'professional'] },
  { id: 'equipo', icon: '👥', label: 'Equipo', roles: ['owner', 'admin'] },
  { id: 'caja', icon: '💶', label: 'Caja', roles: ['owner', 'admin', 'reception'] },
  { id: 'inventario', icon: '📦', label: 'Inventario', roles: ['owner', 'admin'], soon: 'Etapa 4' },
  { id: 'informes', icon: '📊', label: 'Informes', roles: ['owner', 'admin'], soon: 'Etapa 4' },
  { id: 'whatsapp', icon: '💬', label: 'WhatsApp IA', roles: ['owner', 'admin', 'reception'], soon: 'Etapa 3' },
  { id: 'configuracion', icon: '⚙️', label: 'Configuración', roles: ['owner', 'admin'] },
]

function readTab() {
  const [path, query] = location.hash.replace(/^#\/?/, '').split('?')
  return { tab: path.split('/')[1] || 'inicio', params: new URLSearchParams(query ?? '') }
}

export function ManagerWorkspace({
  initialCenter,
  role,
  userId,
  email,
  welcome,
  onSignOut,
}: {
  initialCenter: Center
  role: Role
  userId: string
  email: string
  welcome: string
  onSignOut: () => void
}) {
  const [center, setCenter] = useState(initialCenter)
  const [route, setRoute] = useState(readTab)
  const [staff, setStaff] = useState<Staff[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [staffServices, setStaffServices] = useState<Link[]>([])
  const [serviceResources, setServiceResources] = useState<Link[]>([])
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(welcome)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onHash = () => {
      setRoute(readTab())
      setMenuOpen(false)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const reloadCatalog = useCallback(async () => {
    try {
      const id = center.id
      const [st, sv, rs, ss, sr, oh] = await Promise.all([
        run(supabase.from('staff').select('*').eq('center_id', id).order('display_name')),
        run(supabase.from('services').select('*').eq('center_id', id).order('category').order('name')),
        run(supabase.from('resources').select('*').eq('center_id', id).order('name')),
        run(supabase.from('staff_services').select('service_id, staff_id').eq('center_id', id)),
        run(supabase.from('service_resources').select('service_id, resource_id').eq('center_id', id)),
        run(supabase.from('center_opening_hours').select('*').eq('center_id', id).order('weekday').order('opens_at')),
      ])
      setStaff(st as Staff[])
      setServices(sv as Service[])
      setResources(rs as Resource[])
      setStaffServices(ss as Link[])
      setServiceResources(sr as Link[])
      setOpeningHours(oh as OpeningHour[])
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoaded(true)
    }
  }, [center.id])

  useEffect(() => {
    void reloadCatalog()
    dispatchNotifications()
  }, [reloadCatalog])

  const visibleTabs = TABS.filter((t) => t.roles.includes(role))
  const active = visibleTabs.find((t) => t.id === route.tab && !t.soon) ? route.tab : 'inicio'

  const ws: Workspace = useMemo(
    () => ({
      center,
      role,
      userId,
      email,
      me: staff.find((s) => s.user_id === userId) ?? null,
      staff,
      services,
      resources,
      staffServices,
      serviceResources,
      openingHours,
      reloadCatalog,
      setCenter,
      can: (...roles: Role[]) => roles.includes(role),
      go: (tab: string, extra?: Record<string, string>) => {
        const query = extra ? `?${new URLSearchParams(extra)}` : ''
        location.hash = `#/gestor/${tab}${query}`
      },
    }),
    [center, role, userId, email, staff, services, resources, staffServices, serviceResources, openingHours, reloadCatalog],
  )

  return (
    <WorkspaceContext.Provider value={ws}>
      <div className="mgr mgr-shell">
        <aside className={`mgr-side ${menuOpen ? 'open' : ''}`}>
          <div className="mgr-side-brand">
            <span className="mgr-kicker">AULA ESTÉTICA</span>
            <strong>{center.name}</strong>
            <small>
              {ROLE_LABEL[role]} · {email}
            </small>
          </div>
          <nav aria-label="Gestor">
            {visibleTabs.map((t) =>
              t.soon ? (
                <span key={t.id} className="mgr-side-item soon" title={`Llega en la ${t.soon}`}>
                  <span>{t.icon}</span> {t.label} <em>Pronto</em>
                </span>
              ) : (
                <a key={t.id} href={`#/gestor/${t.id}`} className={`mgr-side-item ${active === t.id ? 'active' : ''}`}>
                  <span>{t.icon}</span> {t.label}
                </a>
              ),
            )}
          </nav>
          <button className="mgr-link mgr-signout" onClick={onSignOut}>
            Cerrar sesión
          </button>
        </aside>
        <div className="mgr-main">
          <button className="mgr-menu" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen}>
            ☰ {visibleTabs.find((t) => t.id === active)?.label}
          </button>
          <Notice text={notice} onClose={() => setNotice('')} />
          <Notice text={error} error />
          {!loaded ? (
            <p role="status" className="mgr-loading">
              Cargando tu centro…
            </p>
          ) : active === 'agenda' ? (
            <Agenda params={route.params} />
          ) : active === 'clientes' ? (
            <Clients params={route.params} />
          ) : active === 'servicios' ? (
            <Services />
          ) : active === 'equipo' ? (
            <Team />
          ) : active === 'caja' ? (
            <Cash />
          ) : active === 'configuracion' ? (
            <Settings />
          ) : (
            <Dashboard />
          )}
        </div>
      </div>
    </WorkspaceContext.Provider>
  )
}
