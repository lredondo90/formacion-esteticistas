import { createContext, useContext } from 'react'
import type { Locale } from './i18n'
import type { CertData } from './services'

export type Activity = { d: string; k: string; p: number }

export type Progress = {
  points: number
  courses: Record<string, { step: number; done: boolean }>
  log?: Activity[]
}

export type Plan = 'monthly' | 'yearly' | 'academy' | null

export type AppState = {
  locale: Locale
  progress: Progress
  purchases: string[]
  plan: Plan
  pro: boolean
  certs: CertData[]
  addActivity: (kind: string, points: number) => void
  addCert: (cert: CertData) => void
  setPlan: (plan: Plan) => void
  unlock: (product: string) => void
  go: (route: string) => void
}

export const AppContext = createContext<AppState | null>(null)

export function useApp(): AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp outside AppContext')
  return ctx
}

export function today(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Monday of the current week, as YYYY-MM-DD.
export function weekStart(date = new Date()): string {
  const d = new Date(date)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return today(d)
}

export function streak(log: Activity[] = []): number {
  const days = new Set(log.map((a) => a.d))
  const d = new Date()
  if (!days.has(today(d))) d.setDate(d.getDate() - 1)
  let n = 0
  while (days.has(today(d))) {
    n++
    d.setDate(d.getDate() - 1)
  }
  return n
}

// Free accounts get a few AI uses to try the feature; Pro is unlimited.
export const FREE_AI_USES = 3
