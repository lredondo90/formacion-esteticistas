import { createContext, useContext } from 'react'
import type { Center, Link, OpeningHour, Resource, Role, Service, Staff } from './types'

export type Workspace = {
  center: Center
  role: Role
  userId: string
  email: string
  /** The staff record of the signed-in user, if they are a professional of the center. */
  me: Staff | null
  staff: Staff[]
  services: Service[]
  resources: Resource[]
  staffServices: Link[]
  serviceResources: Link[]
  openingHours: OpeningHour[]
  reloadCatalog: () => Promise<void>
  setCenter: (center: Center) => void
  can: (...roles: Role[]) => boolean
  go: (tab: string, extra?: Record<string, string>) => void
}

export const WorkspaceContext = createContext<Workspace | null>(null)

export function useWorkspace(): Workspace {
  const ws = useContext(WorkspaceContext)
  if (!ws) throw new Error('useWorkspace outside the manager')
  return ws
}
