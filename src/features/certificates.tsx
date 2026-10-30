import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { COURSES, type Course } from '../courses'
import { sayer, t, tr } from '../i18n'
import { certificateCode, certificateUrl, parseCertificate, type CertData } from '../services'
import { useApp, today } from '../state'
import { load, save } from '../storage'
import { CopyButton } from './ui'

function useQr(url: string) {
  const [src, setSrc] = useState('')
  useEffect(() => {
    QRCode.toDataURL(url, { margin: 1, width: 240, color: { dark: '#2b2228', light: '#fffaf6' } }).then(setSrc)
  }, [url])
  return src
}

const hours = (minutes: number, locale: string) => (Math.round((minutes / 60) * 2) / 2).toLocaleString(locale)

function CertificateSheet({ cert, course }: { cert: CertData; course: Course }) {
  const { locale } = useApp()
  const s = sayer(locale)
  const url = certificateUrl(cert)
  const qr = useQr(url)
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(cert.d))
  return (
    <div className="certificate printable">
      <div className="cert-logo">💧 Aula Estética</div>
      <p className="cert-kicker">{t('certTitle', locale)}</p>
      <h2 className="cert-name">{cert.n}</h2>
      <p>{t('certBody', locale)}</p>
      <h3>
        {course.emoji} {tr(course.title, locale)}
      </h3>
      <p className="cert-meta">
        {hours(course.minutes + (course.practiceMinutes ?? 0), locale)} h{' '}
        {course.practiceMinutes ? s(`(${hours(course.practiceMinutes, locale)} h de práctica)`, `(${hours(course.practiceMinutes, locale)} h of practice)`) : ''} · {date}
      </p>
      {course.modules && (
        <p className="cert-modules">
          {course.modules.map((m) => tr(m.title, locale)).join(' · ')}
        </p>
      )}
      <div className="cert-verify">
        {qr && <img src={qr} alt="QR" width={96} height={96} />}
        <div>
          <p className="cert-code">{cert.k}</p>
          <p className="cert-small">{s('Escanea el código para verificar este certificado', 'Scan the code to verify this certificate')}</p>
        </div>
      </div>
    </div>
  )
}

// Shown at the end of a course: the student types her name and issues the certificate.
export function IssueCertificate({ course }: { course: Course }) {
  const { locale, certs, addCert } = useApp()
  const s = sayer(locale)
  const existing = certs.find((c) => c.c === course.id)
  const [name, setName] = useState(() => load('certName', ''))
  useEffect(() => save('certName', name), [name])

  if (existing) {
    return (
      <div className="certificate-wrap">
        <CertificateSheet cert={existing} course={course} />
        <div className="center-actions">
          <button className="primary" onClick={() => window.print()}>
            🖨️ {t('print', locale)}
          </button>
          <CopyButton text={certificateUrl(existing)} />
        </div>
        <p className="hint">{s('Comparte el enlace o el QR con tus clientas o en tu web.', 'Share the link or QR with clients or on your website.')}</p>
      </div>
    )
  }

  return (
    <div className="certificate-wrap">
      <p>{s('Escribe tu nombre tal y como quieres que aparezca en el certificado.', 'Type your name exactly as it should appear on the certificate.')}</p>
      <input className="name-input" placeholder={t('certName', locale)} value={name} onChange={(e) => setName(e.target.value)} />
      <button
        className="primary"
        disabled={name.trim().length < 3}
        onClick={() => {
          const d = today()
          addCert({ n: name.trim(), c: course.id, d, k: certificateCode(name, course.id, d) })
        }}
      >
        🎓 {s('Emitir certificado', 'Issue certificate')}
      </button>
    </div>
  )
}

export function MyCertificates() {
  const { locale, certs } = useApp()
  const s = sayer(locale)
  const [open, setOpen] = useState<string | null>(null)
  if (!certs.length) return <p className="hint">{s('Termina un curso premium para conseguir tu primer certificado.', 'Finish a premium course to earn your first certificate.')}</p>
  return (
    <div className="list">
      {certs.map((cert) => {
        const course = COURSES.find((c) => c.id === cert.c)
        if (!course) return null
        return (
          <div key={cert.k} className="list-item">
            <div className="row">
              <span>
                🎓 <strong>{tr(course.title, locale)}</strong> · <code>{cert.k}</code>
              </span>
              <button className="secondary small" onClick={() => setOpen(open === cert.k ? null : cert.k)}>
                {open === cert.k ? s('Ocultar', 'Hide') : s('Ver', 'View')}
              </button>
            </div>
            {open === cert.k && (
              <div className="certificate-wrap">
                <CertificateSheet cert={cert} course={course} />
                <div className="center-actions">
                  <button className="primary" onClick={() => window.print()}>
                    🖨️ {t('print', locale)}
                  </button>
                  <CopyButton text={certificateUrl(cert)} />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Public page reached from the QR code.
export function VerifyPage({ payload }: { payload: string }) {
  const { locale, go } = useApp()
  const s = sayer(locale)
  const cert = parseCertificate(payload)
  const course = cert && COURSES.find((c) => c.id === cert.c)
  return (
    <div className="panel center verify">
      {cert && course ? (
        <>
          <div className="big-emoji">✅</div>
          <h2>{s('Certificado válido', 'Valid certificate')}</h2>
          <p>
            <strong>{cert.n}</strong> {t('certBody', locale)} <strong>{tr(course.title, locale)}</strong>
          </p>
          <p className="hint">
            {new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(cert.d))} · <code>{cert.k}</code>
          </p>
        </>
      ) : (
        <>
          <div className="big-emoji">⚠️</div>
          <h2>{s('No hemos podido verificar este certificado', "We couldn't verify this certificate")}</h2>
          <p>{s('El enlace está incompleto o se ha modificado.', 'The link is incomplete or has been altered.')}</p>
        </>
      )}
      <button className="secondary" onClick={() => go('cursos')}>
        {s('Conoce Aula Estética', 'Discover Aula Estética')}
      </button>
    </div>
  )
}
