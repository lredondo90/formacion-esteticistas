import { useEffect, type ReactNode } from 'react'

export function Modal({ title, kicker, onClose, children, wide }: { title: string; kicker?: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="mgr-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`mgr-modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="mgr-modal-head">
          <div>
            {kicker && <span className="mgr-kicker">{kicker}</span>}
            <h2>{title}</h2>
          </div>
          <button type="button" className="mgr-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Notice({ text, error, onClose }: { text: string; error?: boolean; onClose?: () => void }) {
  if (!text) return null
  return (
    <div className={`mgr-notice ${error ? 'mgr-error' : ''}`} role={error ? 'alert' : 'status'}>
      <span>{text}</span>
      {onClose && (
        <button type="button" className="mgr-link" onClick={onClose}>
          Cerrar
        </button>
      )}
    </div>
  )
}

export function Empty({ icon, title, text, children }: { icon: string; title: string; text?: string; children?: ReactNode }) {
  return (
    <div className="mgr-empty">
      <span>{icon}</span>
      <strong>{title}</strong>
      {text && <p>{text}</p>}
      {children}
    </div>
  )
}

export function SectionHead({ title, text, children }: { title: string; text?: string; children?: ReactNode }) {
  return (
    <div className="mgr-section-head">
      <div>
        <h2>{title}</h2>
        {text && <p>{text}</p>}
      </div>
      {children && <div className="mgr-actions">{children}</div>}
    </div>
  )
}

export function StatusPill({ status, label }: { status: string; label: string }) {
  return <span className={`mgr-status s-${status}`}>{label}</span>
}
