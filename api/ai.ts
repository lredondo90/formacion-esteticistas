// Vercel serverless function: AI skin analyser, practice pre-review and 24/7 tutor.
// Needs ANTHROPIC_API_KEY in the Vercel project settings. Without it, it answers { demo: true }
// and the app shows an example result instead.
import Anthropic from '@anthropic-ai/sdk'

type Task = 'skin' | 'practice' | 'tutor'
type ChatTurn = { role: 'user' | 'assistant'; content: string }
type Body = {
  task: Task
  locale: string
  image?: { data: string; mediaType: 'image/jpeg' | 'image/png' | 'image/webp' }
  notes?: string
  course?: string
  messages?: ChatTurn[]
}

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5-5'

const LANG: Record<string, string> = {
  'es-ES': 'Spanish from Spain (use "cabina", "hidratación")',
  'es-419': 'Latin American Spanish (use "gabinete", "humectación", "barros")',
  en: 'English',
}

const SAFETY =
  'You are part of a training app for estheticians. This is educational practice, not a medical diagnosis. ' +
  'If you see signs that need a doctor (suspicious moles, infection, severe acne, burns), say so clearly and recommend referral. ' +
  'Never identify the person in the photo.'

const ANALYSIS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'skinType', 'observations', 'protocol', 'homeCare', 'referral'],
  properties: {
    summary: { type: 'string' },
    skinType: { type: 'string' },
    observations: { type: 'array', items: { type: 'string' } },
    protocol: { type: 'array', items: { type: 'string' } },
    homeCare: { type: 'array', items: { type: 'string' } },
    referral: { type: 'string', description: 'Empty string if no referral is needed' },
  },
}

const REVIEW_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['score', 'strengths', 'improvements', 'nextExercise'],
  properties: {
    score: { type: 'integer', description: '1 to 10' },
    strengths: { type: 'array', items: { type: 'string' } },
    improvements: { type: 'array', items: { type: 'string' } },
    nextExercise: { type: 'string' },
  },
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } })

export async function POST(request: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) return json({ demo: true })

  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }
  const lang = LANG[body.locale] ?? LANG['es-ES']
  const client = new Anthropic()

  try {
    if (body.task === 'tutor') {
      const messages = (body.messages ?? []).slice(-20)
      if (!messages.length || messages[0].role !== 'user') return json({ error: 'no_messages' }, 400)
      const response = await client.beta.messages.create({
        model: MODEL,
        max_tokens: 16000,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: { effort: 'low' },
        system:
          `${SAFETY} You are a friendly expert tutor for beauty therapists (skin care, facials, waxing, lashes, brows, nails, ` +
          `laser, massage, make-up, cosmetic chemistry, salon business). Answer in ${lang}. Be practical and concise: ` +
          'short paragraphs or a short list. If a question is outside esthetics, say so briefly.',
        messages,
      })
      if (response.stop_reason === 'refusal') return json({ refusal: true })
      const text = response.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('\n')
      return json({ text })
    }

    if (!body.image) return json({ error: 'no_image' }, 400)
    const skin = body.task === 'skin'
    const prompt = skin
      ? `Analyse this face photo as practice for an esthetician student. Notes from the student: "${body.notes ?? ''}". ` +
        `Give the likely skin type, visible observations, a step-by-step in-salon protocol and home care. Write in ${lang}.`
      : `This is a photo of a student's practical work for the course "${body.course ?? ''}". Notes: "${body.notes ?? ''}". ` +
        `Review the technique like a demanding but kind teacher. Write in ${lang}.`

    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'medium', format: { type: 'json_schema', schema: skin ? ANALYSIS_SCHEMA : REVIEW_SCHEMA } },
      system: SAFETY,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: body.image.mediaType, data: body.image.data } },
            { type: 'text', text: prompt },
          ],
        },
      ],
    })
    if (response.stop_reason === 'refusal') return json({ refusal: true })
    const text = response.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('')
    return json({ result: JSON.parse(text) })
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return json({ error: 'rate_limited' }, 429)
    if (error instanceof Anthropic.APIError) return json({ error: 'api_error', status: error.status }, 502)
    return json({ error: 'unexpected' }, 500)
  }
}
