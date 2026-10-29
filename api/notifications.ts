// Vercel serverless function: sends the queued client emails (confirmations, reminders,
// cancellations, team invitations). The database decides WHAT to send and guarantees each message
// is handed out once (claim_due_notifications); this function only delivers it.
// Needs SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, NOTIFY_FROM and APP_URL (see README).
// Called by the Vercel cron (vercel.json), and by the app right after a booking. Calling it more
// often is harmless: messages that are not due yet stay in the queue.
type Job = {
  id: string
  kind: 'confirmation' | 'pending' | 'reminder' | 'cancellation' | 'rescheduled' | 'invitation'
  channel: string
  recipient: string
  payload: { token?: string; role?: string; center_name?: string }
  center: { name: string; timezone: string; locale: string; phone: string | null; address: string | null; slug: string; cancellation_hours: number }
  appointment: { starts_at: string; service: string; status: string; token: string; staff: string; client: string } | null
}

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } })

function rpc(name: string, body: unknown) {
  return fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

const ROLE: Record<string, { es: string; en: string }> = {
  owner: { es: 'propietaria', en: 'owner' },
  admin: { es: 'administración', en: 'admin' },
  reception: { es: 'recepción', en: 'reception' },
  professional: { es: 'profesional', en: 'professional' },
}

function escape(text: string) {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

function compose(job: Job, appUrl: string) {
  const en = job.center.locale === 'en'
  const center = job.center.name
  const a = job.appointment
  const when = a
    ? new Intl.DateTimeFormat(en ? 'en-GB' : 'es-ES', {
        timeZone: job.center.timezone,
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(a.starts_at))
    : ''
  const manage = a ? `${appUrl}/#/cita/${a.token}` : ''
  const contact = [job.center.address, job.center.phone].filter(Boolean).join(' · ')

  const t = (es: string, english: string) => (en ? english : es)
  let subject = ''
  let lines: string[] = []
  let button: { label: string; url: string } | null = null

  switch (job.kind) {
    case 'confirmation':
      subject = t(`Cita confirmada en ${center}`, `Appointment confirmed at ${center}`)
      lines = [t(`Hola ${a!.client},`, `Hi ${a!.client},`), t(`Tu cita de ${a!.service} está confirmada para el ${when}.`, `Your ${a!.service} appointment is confirmed for ${when}.`)]
      button = { label: t('Ver o cancelar la cita', 'View or cancel'), url: manage }
      break
    case 'pending':
      subject = t(`Hemos recibido tu solicitud · ${center}`, `We received your request · ${center}`)
      lines = [
        t(`Hola ${a!.client},`, `Hi ${a!.client},`),
        t(`Hemos recibido tu solicitud de ${a!.service} para el ${when}. Te confirmaremos en breve.`, `We received your ${a!.service} request for ${when}. We will confirm shortly.`),
      ]
      button = { label: t('Ver la solicitud', 'View request'), url: manage }
      break
    case 'reminder':
      subject = t(`Recordatorio: tu cita en ${center}`, `Reminder: your appointment at ${center}`)
      lines = [t(`Hola ${a!.client},`, `Hi ${a!.client},`), t(`Te recordamos tu cita de ${a!.service} el ${when} con ${a!.staff}.`, `A reminder of your ${a!.service} appointment on ${when} with ${a!.staff}.`)]
      button = { label: t('¿No puedes venir? Cancela aquí', "Can't make it? Cancel here"), url: manage }
      break
    case 'rescheduled':
      subject = t(`Tu cita en ${center} ha cambiado`, `Your appointment at ${center} has changed`)
      lines = [t(`Hola ${a!.client},`, `Hi ${a!.client},`), t(`Tu cita de ${a!.service} es ahora el ${when}.`, `Your ${a!.service} appointment is now on ${when}.`)]
      button = { label: t('Ver la cita', 'View appointment'), url: manage }
      break
    case 'cancellation':
      subject = t(`Cita cancelada · ${center}`, `Appointment cancelled · ${center}`)
      lines = [t(`Hola ${a!.client},`, `Hi ${a!.client},`), t(`Tu cita de ${a!.service} del ${when} ha sido cancelada.`, `Your ${a!.service} appointment on ${when} has been cancelled.`)]
      button = { label: t('Reservar otra cita', 'Book again'), url: `${appUrl}/#/reservar/${job.center.slug}` }
      break
    case 'invitation': {
      const role = ROLE[job.payload.role ?? 'professional'] ?? ROLE.professional
      subject = t(`Te han invitado a ${center} en Aula Estética`, `You're invited to ${center} on Aula Estética`)
      lines = [
        t(`Te han invitado a unirte al equipo de ${center} como ${role.es}.`, `You have been invited to join ${center} as ${role.en}.`),
        t('Entra o crea tu cuenta con este mismo correo. La invitación caduca en 7 días.', 'Sign in or sign up with this same email. The invitation expires in 7 days.'),
      ]
      button = { label: t('Aceptar invitación', 'Accept invitation'), url: `${appUrl}/#/gestor?invitacion=${job.payload.token}` }
      break
    }
  }

  const html = `<!doctype html><html><body style="margin:0;background:#fbf7f5;font-family:Arial,sans-serif;color:#31242c">
<div style="max-width:520px;margin:0 auto;padding:28px 20px">
<p style="font-size:12px;letter-spacing:2px;color:#b64f78;font-weight:bold;margin:0 0 16px">${escape(center.toUpperCase())}</p>
<div style="background:#fff;border:1px solid #efe3e8;border-radius:16px;padding:24px">
${lines.map((l) => `<p style="margin:0 0 12px;line-height:1.5">${escape(l)}</p>`).join('')}
${button ? `<p style="margin:20px 0 0"><a href="${escape(button.url)}" style="background:#b64f78;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:bold;display:inline-block">${escape(button.label)}</a></p>` : ''}
</div>
${contact ? `<p style="font-size:12px;color:#82737b;margin:16px 0 0">${escape(contact)}</p>` : ''}
</div></body></html>`
  const text = [...lines, button ? `${button.label}: ${button.url}` : '', contact].filter(Boolean).join('\n\n')
  return { subject, html, text }
}

async function handle(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET
  const isCron = request.method === 'GET'
  if (isCron && secret && request.headers.get('authorization') !== `Bearer ${secret}`) return json({ error: 'unauthorized' }, 401)
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, NOTIFY_FROM } = process.env
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RESEND_API_KEY || !NOTIFY_FROM) return json({ demo: true })
  const appUrl = (process.env.APP_URL || new URL(request.url).origin).replace(/\/$/, '')

  const claimed = await rpc('claim_due_notifications', { p_limit: 25 })
  if (!claimed.ok) return json({ error: 'claim_failed' }, 502)
  const jobs = (await claimed.json()) as Job[]
  let sent = 0
  for (const job of jobs) {
    try {
      if (job.channel !== 'email') throw new Error(`channel ${job.channel} not supported yet`)
      const { subject, html, text } = compose(job, appUrl)
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { authorization: `Bearer ${RESEND_API_KEY}`, 'content-type': 'application/json', 'idempotency-key': job.id },
        body: JSON.stringify({ from: `${job.center.name} <${NOTIFY_FROM}>`, to: [job.recipient], subject, html, text }),
      })
      const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string }
      if (!res.ok) throw new Error(body.message ?? `resend ${res.status}`)
      await rpc('complete_notification', { p_id: job.id, p_ok: true, p_provider_id: body.id ?? null })
      sent++
    } catch (error) {
      await rpc('complete_notification', { p_id: job.id, p_ok: false, p_error: error instanceof Error ? error.message : String(error) })
    }
  }
  return json({ claimed: jobs.length, sent })
}

export const GET = handle
export const POST = handle
