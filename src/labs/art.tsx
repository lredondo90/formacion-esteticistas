import type { ReactNode } from 'react'
import type { P } from './engine'

// Shared drawings for the labs. The front face lives in a 100 × 130 view: face from y 14 to 100,
// neck below it and the collarbones at the bottom edge.

export const FACE = {
  forehead: { x: 50, y: 28 },
  templeL: { x: 24, y: 40 },
  templeR: { x: 76, y: 40 },
  browL: { x: 36, y: 41 },
  browR: { x: 64, y: 41 },
  eyeL: { x: 36, y: 49 },
  eyeR: { x: 64, y: 49 },
  bridge: { x: 50, y: 50 },
  noseTip: { x: 50, y: 66 },
  cheekboneL: { x: 28, y: 58 },
  cheekboneR: { x: 72, y: 58 },
  appleL: { x: 34, y: 68 },
  appleR: { x: 66, y: 68 },
  cupid: { x: 50, y: 76.5 },
  mouth: { x: 50, y: 80 },
  chin: { x: 50, y: 93 },
  jawL: { x: 25, y: 82 },
  jawR: { x: 75, y: 82 },
  earL: { x: 17, y: 56 },
  earR: { x: 83, y: 56 },
} satisfies Record<string, P>

export const FACE_OUTLINE = 'M50 14 C 74 14, 82 32, 81 52 C 80 70, 70 88, 58 96 C 54 99, 46 99, 42 96 C 30 88, 20 70, 19 52 C 18 32, 26 14, 50 14 Z'

function Eye({ cx, flip }: { cx: number; flip?: boolean }) {
  const d = flip ? -1 : 1
  const y = 49
  return (
    <g>
      <path d={`M ${cx - 8 * d} ${y} C ${cx - 4 * d} ${y - 5}, ${cx + 4 * d} ${y - 5}, ${cx + 8 * d} ${y} C ${cx + 4 * d} ${y + 3.6}, ${cx - 4 * d} ${y + 3.6}, ${cx - 8 * d} ${y} Z`} fill="#fff" stroke="#7a4e3e" strokeWidth="0.45" />
      <circle cx={cx} cy={y - 0.3} r="2.6" fill="#6b8f71" />
      <circle cx={cx} cy={y - 0.3} r="1.15" fill="#1f1a1c" />
      <circle cx={cx + 0.8} cy={y - 1.1} r="0.45" fill="#fff" />
      <path d={`M ${cx - 8 * d} ${y} C ${cx - 4 * d} ${y - 5}, ${cx + 4 * d} ${y - 5}, ${cx + 8 * d} ${y}`} fill="none" stroke="#2b2228" strokeWidth="0.9" />
      <path d={`M ${cx - 7.5 * d} ${y - 2.6} C ${cx - 3 * d} ${y - 7.4}, ${cx + 4 * d} ${y - 7}, ${cx + 8 * d} ${y - 2.4}`} fill="none" stroke="#c39079" strokeWidth="0.45" opacity="0.7" />
    </g>
  )
}

export function FrontFace({ children, neck = true, hair = '#5a3a2c', skin = ['#f6d9c8', '#e8bba3'] }: { children?: ReactNode; neck?: boolean; hair?: string; skin?: [string, string] }) {
  return (
    <>
      <defs>
        <radialGradient id="ff-skin" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor={skin[0]} />
          <stop offset="100%" stopColor={skin[1]} />
        </radialGradient>
        <linearGradient id="ff-neck" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#d9a68f" />
          <stop offset="35%" stopColor={skin[1]} />
        </linearGradient>
      </defs>
      <rect width="100" height="130" fill="#f3e7e1" />
      {neck && (
        <>
          <path d="M38 88 L 38 108 C 30 114, 12 116, 0 120 L 0 130 L 100 130 L 100 120 C 88 116, 70 114, 62 108 L 62 88 Z" fill="url(#ff-neck)" />
          <path d="M14 124 C 24 120, 34 120, 44 123" fill="none" stroke="#c9917a" strokeWidth="0.6" />
          <path d="M86 124 C 76 120, 66 120, 56 123" fill="none" stroke="#c9917a" strokeWidth="0.6" />
        </>
      )}
      {/* ears */}
      <path d="M20 48 C 14 46, 13 60, 21 64" fill={skin[1]} stroke="#c9917a" strokeWidth="0.5" />
      <path d="M80 48 C 86 46, 87 60, 79 64" fill={skin[1]} stroke="#c9917a" strokeWidth="0.5" />
      <path d={FACE_OUTLINE} fill="url(#ff-skin)" stroke="#c9917a" strokeWidth="0.4" />
      {/* hair */}
      <path d="M17 52 C 13 22, 30 5, 50 5 C 70 5, 87 22, 83 52 C 81 36, 74 20, 50 19 C 26 20, 19 36, 17 52 Z" fill={hair} />
      {/* brows */}
      <path d="M43 42 C 39 39, 33 38.5, 28 41" fill="none" stroke="#6b4636" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M57 42 C 61 39, 67 38.5, 72 41" fill="none" stroke="#6b4636" strokeWidth="1.6" strokeLinecap="round" />
      <Eye cx={36} />
      <Eye cx={64} flip />
      {/* nose */}
      <path d="M47.5 50 C 47 56, 46 61, 44.5 64.5 C 46 67, 48 67.5, 50 67" fill="none" stroke="#b98472" strokeWidth="0.55" strokeLinecap="round" />
      <path d="M52.5 50 C 53 56, 54 61, 55.5 64.5 C 54 67, 52 67.5, 50 67" fill="none" stroke="#b98472" strokeWidth="0.55" strokeLinecap="round" />
      <ellipse cx="46.6" cy="66" rx="1.3" ry="0.7" fill="#a46f5d" opacity="0.5" />
      <ellipse cx="53.4" cy="66" rx="1.3" ry="0.7" fill="#a46f5d" opacity="0.5" />
      {/* lips */}
      <path d="M42 80 C 45 77, 48 76.5, 50 77.6 C 52 76.5, 55 77, 58 80 C 54 83.5, 46 83.5, 42 80 Z" fill="#c76b6f" />
      <path d="M42 80 C 46 81, 54 81, 58 80" fill="none" stroke="#8f3f45" strokeWidth="0.45" />
      {children}
    </>
  )
}

// Small label used inside the drawings.
export function Tag({ p, children, color = '#2b2228', size = 3.2, dy = 0 }: { p: P; children: ReactNode; color?: string; size?: number; dy?: number }) {
  return (
    <text x={p.x} y={p.y + dy} textAnchor="middle" fontSize={size} fontWeight="700" fill={color} stroke="#fff" strokeWidth="0.8" paintOrder="stroke">
      {children}
    </text>
  )
}

export function Arrow({ pts, color = '#c2577a', animate, width = 0.6 }: { pts: P[]; color?: string; animate?: boolean; width?: number }) {
  const a = pts[pts.length - 2]
  const b = pts[pts.length - 1]
  const ang = Math.atan2(b.y - a.y, b.x - a.x)
  const h = 2.2
  const head = `M ${b.x - h * Math.cos(ang - 0.45)} ${b.y - h * Math.sin(ang - 0.45)} L ${b.x} ${b.y} L ${b.x - h * Math.cos(ang + 0.45)} ${b.y - h * Math.sin(ang + 0.45)}`
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ')
  return (
    <g className={animate ? 'pop-in' : ''}>
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" className={animate ? 'draw-line' : ''} pathLength={animate ? 1 : undefined} />
      <path d={head} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  )
}

export function Pulse({ p, r = 3, color = '#3f6f8a' }: { p: P; r?: number; color?: string }) {
  return <circle cx={p.x} cy={p.y} r={r} fill="none" stroke={color} strokeWidth="0.6" className="pulse-ring" />
}

// Point on a cubic Bézier curve.
export function bez(p0: P, p1: P, p2: P, p3: P, t: number): P {
  const u = 1 - t
  return {
    x: u ** 3 * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t ** 3 * p3.x,
    y: u ** 3 * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t ** 3 * p3.y,
  }
}
