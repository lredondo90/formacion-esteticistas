// Calls to the serverless functions in /api. They answer { demo: true } when the keys are not
// configured, and do not exist under `npm run dev`; both cases fall back to demo mode.

export async function callApi<T>(path: string, body: unknown): Promise<(T & { demo?: false }) | { demo: true } | { error: string }> {
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    const type = res.headers.get('content-type') ?? ''
    if (!type.includes('application/json')) return { demo: true }
    const data = await res.json()
    if (!res.ok) return { error: data.error ?? 'error' }
    return data
  } catch {
    return { demo: true }
  }
}

// Reads an image file, scales it down and returns base64 JPEG (no data: prefix) plus a preview URL.
export function readImage(file: File, max = 1024): Promise<{ data: string; preview: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      const preview = canvas.toDataURL('image/jpeg', 0.82)
      URL.revokeObjectURL(img.src)
      resolve({ data: preview.split(',')[1], preview })
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

// Short, stable code for a certificate, derived from its data (FNV-1a).
export function certificateCode(name: string, courseId: string, date: string): string {
  let h1 = 0x811c9dc5
  let h2 = 0x01000193
  for (const ch of `${name.trim().toLowerCase()}|${courseId}|${date}`) {
    h1 = Math.imul(h1 ^ ch.charCodeAt(0), 0x01000193) >>> 0
    h2 = Math.imul(h2 ^ ch.charCodeAt(0), 0x5bd1e995) >>> 0
  }
  const part = (n: number) => n.toString(36).toUpperCase().padStart(7, '0').slice(-4)
  return `AE-${part(h1)}-${part(h2)}`
}

export type CertData = { n: string; c: string; d: string; k: string }

export function certificateUrl(cert: CertData): string {
  const bytes = new TextEncoder().encode(JSON.stringify(cert))
  const payload = btoa(String.fromCharCode(...bytes))
  return `${location.origin}/#/verificar/${encodeURIComponent(payload)}`
}

export function parseCertificate(payload: string): CertData | null {
  try {
    const bytes = Uint8Array.from(atob(decodeURIComponent(payload)), (c) => c.charCodeAt(0))
    const cert = JSON.parse(new TextDecoder().decode(bytes)) as CertData
    return cert.k === certificateCode(cert.n, cert.c, cert.d) ? cert : null
  } catch {
    return null
  }
}

// Starts a real Stripe checkout when the server is configured; otherwise returns false (demo mode).
export async function startCheckout(product: string, locale: string): Promise<boolean> {
  const res = await callApi<{ url: string }>('/api/checkout', { product, locale, origin: location.origin })
  if ('url' in res && res.url) {
    location.href = res.url
    return true
  }
  return false
}
