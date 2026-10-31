// Belaura brand: a petal inside a soft halo ("aura"), plus the serif wordmark.
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="logo-mark">
      <defs>
        <linearGradient id="bl-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e2c48f" />
          <stop offset="1" stopColor="#a8834c" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="#3a2230" />
      <circle cx="32" cy="32" r="21" fill="none" stroke="url(#bl-gold)" strokeWidth="1.6" strokeDasharray="104 28" transform="rotate(-62 32 32)" />
      <path d="M32 15c7.5 7.2 11 13.6 11 19.4A11 11 0 0 1 32 45.4 11 11 0 0 1 21 34.4C21 28.6 24.5 22.2 32 15z" fill="#f6ede4" />
      <path d="M32 21.5v22.8" stroke="#3a2230" strokeWidth="1.3" strokeLinecap="round" opacity="0.55" />
    </svg>
  )
}

export function Logo({ size = 32, tagline }: { size?: number; tagline?: string }) {
  return (
    <span className="logo-lockup">
      <LogoMark size={size} />
      <span className="logo-text">
        <span className="logo-word">Belaura</span>
        {tagline && <span className="logo-tag">{tagline}</span>}
      </span>
    </span>
  )
}
