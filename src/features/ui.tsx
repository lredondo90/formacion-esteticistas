import { useState, type ReactNode } from 'react'
import { sayer } from '../i18n'
import { useApp } from '../state'

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string }[]
  value: T
  onChange: (id: T) => void
}) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={tab.id === value}
          className={`tab ${tab.id === value ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export function PageHead({ emoji, title, intro }: { emoji: string; title: string; intro: string }) {
  return (
    <section className="page-head">
      <h1>
        {emoji} {title}
      </h1>
      <p>{intro}</p>
    </section>
  )
}

export function ProLock({ what }: { what: string }) {
  const { locale, go } = useApp()
  const s = sayer(locale)
  return (
    <div className="pro-lock">
      <span>💎</span>
      <div>
        <strong>{s('Disponible con Aula Pro', 'Available with Aula Pro')}</strong>
        <p>{what}</p>
      </div>
      <button className="primary" onClick={() => go('planes')}>
        {s('Ver planes', 'See plans')}
      </button>
    </div>
  )
}

export function DemoNote({ children }: { children: ReactNode }) {
  return <p className="demo-note">ℹ️ {children}</p>
}

export function CopyButton({ text }: { text: string }) {
  const { locale } = useApp()
  const s = sayer(locale)
  const [done, setDone] = useState(false)
  return (
    <button
      className="secondary small"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setDone(true)
          setTimeout(() => setDone(false), 1500)
        })
      }}
    >
      {done ? `✓ ${s('Copiado', 'Copied')}` : `📋 ${s('Copiar', 'Copy')}`}
    </button>
  )
}

export function Modal({ onClose, children, wide }: { onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
