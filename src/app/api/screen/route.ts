import { NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import type { CandidateEvaluation, ScreeningRequest, ScreeningResponse } from '@/lib/types'

// Force runtime node so z-ai-web-dev-sdk works server-side.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// Allow up to 60s for the LLM call (Vercel default is 10s on hobby plan)
export const maxDuration = 60

/**
 * Create a ZAI client.
 *
 * Priority:
 *   1. Explicit env vars (ZAI_API_KEY + ZAI_BASE_URL) — used on Vercel and
 *      any external host where the .z-ai-config file isn't available.
 *   2. ZAI.create() — reads .z-ai-config from disk (sandbox / local dev).
 *
 * The ZAI constructor accepts a config object directly, so we can bypass
 * the file-based loadConfig() when env vars are present.
 */
async function createZAIClient() {
  const envKey = process.env.ZAI_API_KEY
  const envBaseUrl = process.env.ZAI_BASE_URL
  if (envKey && envBaseUrl) {
    // Construct directly from env vars — no file read.
    const ZAIClass = ZAI as unknown as { new (config: unknown): InstanceType<typeof ZAI> }
    return new ZAIClass({
      baseUrl: envBaseUrl,
      apiKey: envKey,
      chatId: process.env.ZAI_CHAT_ID || '',
      userId: process.env.ZAI_USER_ID || '',
      token: process.env.ZAI_TOKEN || '',
    })
  }
  // Fall back to file-based config (sandbox / local dev)
  return await ZAI.create()
}

/**
 * Proxy fallback: if the direct ZAI call fails (e.g. on Vercel where the
 * internal-api.z.ai endpoint is unreachable), forward the request to the
 * sandbox preview URL which CAN reach the ZAI API.
 *
 * Set PROXY_FALLBACK_URL env var to the public sandbox URL to enable.
 *
 * Includes retry logic (3 attempts with 2s delay) to handle transient
 * sandbox hiccups (502 Bad Gateway, brief restarts, etc).
 */
async function proxyToSandbox(body: ScreeningRequest): Promise<{ data: ScreeningResponse | null; error?: string }> {
  const proxyUrl = process.env.PROXY_FALLBACK_URL
  if (!proxyUrl) {
    return { data: null, error: 'PROXY_FALLBACK_URL not set' }
  }

  const targetUrl = `${proxyUrl.replace(/\/$/, '')}/api/screen`
  const MAX_ATTEMPTS = 3
  const RETRY_DELAY_MS = 2000
  let lastError = ''

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(45000), // 45s per attempt — leaves room for retries within 60s maxDuration
      })

      if (res.ok) {
        const data = (await res.json()) as ScreeningResponse
        return { data, error: undefined }
      }

      // Non-OK response — check if it's retryable
      const errText = await res.text().catch(() => '')
      lastError = `Proxy HTTP ${res.status}: ${errText.slice(0, 150)}`

      // Retry on 502, 503, 504 (gateway errors = transient sandbox issues)
      const retryable = [502, 503, 504].includes(res.status)
      if (!retryable || attempt === MAX_ATTEMPTS) {
        return { data: null, error: lastError }
      }
      // Wait before retrying
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
    } catch (err: any) {
      const msg = err?.message ?? 'unknown error'
      if (msg.includes('abort') || msg.includes('timeout')) {
        lastError = 'Proxy timed out — the AI took too long to respond. Try with fewer candidates.'
        if (attempt === MAX_ATTEMPTS) {
          return { data: null, error: lastError }
        }
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
      } else {
        // Network error (fetch failed, connection refused, etc.) — retryable
        lastError = `Proxy fetch failed: ${msg}`
        if (attempt === MAX_ATTEMPTS) {
          return { data: null, error: lastError }
        }
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
      }
    }
  }

  return { data: null, error: lastError || 'Proxy failed after all retries' }
}

const SYSTEM_PROMPT = `You are ScreenWise, an AI recruiting copilot used by talent-acquisition teams at fast-growing companies. Your job is to evaluate candidate resumes against a job description and produce structured, honest, explainable fitment assessments.

You are not a cheerleader. You are a calibrated evaluator. Most candidates are NOT a strong fit. Be specific, evidence-based, and useful to a busy recruiter who has 90 seconds per candidate.

Bias guardrails:
- Judge on skills, experience, scope, and trajectory ONLY.
- Never let name, gender, age, religion, caste, or university prestige inflate or deflate a score.
- If you cannot tell something from the resume, say so. Do not invent facts.`

function buildUserPrompt(req: ScreeningRequest): string {
  const resumesBlock = req.resumes
    .map((r, i) => `### CANDIDATE ${i + 1}\n${r.trim() || '(empty)'}`)
    .join('\n\n')

  return `JOB DESCRIPTION:
${req.jobDescription.trim()}

CANDIDATES (evaluate each one, preserve order):
${resumesBlock}

Evaluate every candidate against the JD using this rubric:
- Skills match (40 pts): direct overlap with required / nice-to-have skills
- Experience relevance (25 pts): domain, project type, and scope relevance
- Seniority alignment (15 pts): years and scope vs JD expectations
- Domain context (10 pts): industry exposure relevant to the role
- Trajectory & stability (10 pts): career progression and tenure pattern

Return ONLY a valid JSON object — no markdown fences, no commentary — with EXACTLY this shape:

{
  "jobSummary": "1-2 sentence summary of the role's core requirements",
  "evaluations": [
    {
      "candidateName": "name exactly as written on the resume, or 'Candidate N' if not found",
      "candidateId": "cand-1",
      "fitmentScore": 0-100 integer,
      "recommendation": "Strong Fit | Possible Fit | Pass",
      "skillsMatched": ["concrete skill 1", "..."],
      "skillsMissing": ["concrete missing skill 1", "..."],
      "experienceRelevance": "Direct | Adjacent | Stretch",
      "seniorityAlignment": "Match | Junior | Senior",
      "yearsOfExperience": integer (best estimate from resume, 0 if unknown),
      "keyStrengths": ["evidence-based strength", "..."],
      "redFlags": ["concrete concern, e.g. '4 jobs in 4 years suggests instability' — empty array if none"],
      "oneLineSummary": "one punchy sentence a recruiter can read in 3 seconds",
      "outreachEmail": {
        "subject": "personalized subject line referencing a SPECIFIC detail from this candidate's resume",
        "body": "2 short paragraphs. Paragraph 1: why we reached out + a specific thing from their background that stood out. Paragraph 2: what the role looks like + a soft ask for a 20-min chat. Sign off as 'The Embark Talent Team'. Do NOT mention their score."
      }
    }
  ]
}

HARD RULES:
1. Output ONLY the JSON object. No prose before or after. No code fences.
2. evaluations array MUST have exactly ${req.resumes.length} entries, in the SAME order as input.
3. candidateId MUST be "cand-1", "cand-2", ... matching position.
4. Be calibrated: a Strong Fit (score >= 80) should be rare and clearly justified. Most candidates will land in Possible Fit (60-79) or Pass (<60).
5. If a resume is empty, set fitmentScore = 0, recommendation = "Pass", and put "Resume not provided" in redFlags.
6. outreachEmail.body MUST reference at least one concrete detail pulled from THAT candidate's resume (a project, a metric, a role). No generic templates.
7. Keep oneLineSummary under 110 characters.`
}

function safeParseJSON(raw: string): unknown {
  let cleaned = raw.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  }
  return JSON.parse(cleaned)
}

function normalizeEvaluations(parsed: any, expectedCount: number): CandidateEvaluation[] {
  const list: CandidateEvaluation[] = Array.isArray(parsed?.evaluations) ? parsed.evaluations : []
  const out: CandidateEvaluation[] = []
  for (let i = 0; i < expectedCount; i++) {
    const e = list[i] || {}
    out.push({
      candidateName: String(e.candidateName ?? `Candidate ${i + 1}`),
      candidateId: `cand-${i + 1}`,
      fitmentScore: clamp(Number(e.fitmentScore ?? 0), 0, 100),
      recommendation: normalizeRec(e.recommendation),
      skillsMatched: arrayOfStrings(e.skillsMatched),
      skillsMissing: arrayOfStrings(e.skillsMissing),
      experienceRelevance: normalizeExp(e.experienceRelevance),
      seniorityAlignment: normalizeSen(e.seniorityAlignment),
      yearsOfExperience: clamp(Number(e.yearsOfExperience ?? 0), 0, 60),
      keyStrengths: arrayOfStrings(e.keyStrengths),
      redFlags: arrayOfStrings(e.redFlags),
      oneLineSummary: String(e.oneLineSummary ?? '').slice(0, 220),
      outreachEmail: {
        subject: String(e.outreachEmail?.subject ?? 'Quick hello from Embark'),
        body: String(e.outreachEmail?.body ?? ''),
      },
    })
  }
  out.sort((a, b) => b.fitmentScore - a.fitmentScore)
  return out
}

function clamp(n: number, lo: number, hi: number): number {
  if (Number.isNaN(n)) return lo
  return Math.max(lo, Math.min(hi, Math.round(n)))
}
function arrayOfStrings(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.map((x) => String(x)).filter(Boolean).slice(0, 12)
}
function normalizeRec(v: unknown): CandidateEvaluation['recommendation'] {
  const s = String(v ?? '').toLowerCase()
  if (s.includes('strong')) return 'Strong Fit'
  if (s.includes('possible') || s.includes('maybe')) return 'Possible Fit'
  return 'Pass'
}
function normalizeExp(v: unknown): CandidateEvaluation['experienceRelevance'] {
  const s = String(v ?? '').toLowerCase()
  if (s.includes('adj')) return 'Adjacent'
  if (s.includes('stretch')) return 'Stretch'
  return 'Direct'
}
function normalizeSen(v: unknown): CandidateEvaluation['seniorityAlignment'] {
  const s = String(v ?? '').toLowerCase()
  if (s.includes('jun')) return 'Junior'
  if (s.includes('sen')) return 'Senior'
  return 'Match'
}

export async function POST(req: Request) {
  const started = Date.now()
  let body: ScreeningRequest
  try {
    body = (await req.json()) as ScreeningRequest
  } catch {
    return NextResponse.json<ScreeningResponse>(
      { success: false, jobSummary: '', evaluations: [], error: 'Invalid JSON body.' },
      { status: 400 }
    )
  }

  const jd = (body.jobDescription ?? '').trim()
  const resumes = Array.isArray(body.resumes) ? body.resumes : []

  if (jd.length < 20) {
    return NextResponse.json<ScreeningResponse>(
      { success: false, jobSummary: '', evaluations: [], error: 'Job description is too short. Paste at least a paragraph.' },
      { status: 400 }
    )
  }
  const validResumes = resumes.map((r) => String(r ?? '').trim()).filter((r) => r.length > 0)
  if (validResumes.length === 0) {
    return NextResponse.json<ScreeningResponse>(
      { success: false, jobSummary: '', evaluations: [], error: 'No resumes provided. Add at least one candidate.' },
      { status: 400 }
    )
  }
  if (validResumes.length > 8) {
    return NextResponse.json<ScreeningResponse>(
      { success: false, jobSummary: '', evaluations: [], error: 'Prototype limit: max 8 candidates per batch. Trim the list and try again.' },
      { status: 400 }
    )
  }

  // The request body, reusable if we need to proxy
  const requestBody: ScreeningRequest = { jobDescription: jd, resumes: validResumes }

  // On Vercel, the ZAI internal endpoint (internal-api.z.ai) is unreachable
  // (private IP). Detect Vercel environment and go straight to the proxy.
  const isVercel = !!process.env.VERCEL || !!process.env.VERCEL_ENV

  if (isVercel) {
    // Skip the direct ZAI call — it will fail. Go straight to the proxy.
    const { data: proxied, error: proxyError } = await proxyToSandbox(requestBody)
    if (proxied?.success) {
      return NextResponse.json<ScreeningResponse>(proxied)
    }
    // Return a user-friendly error after all retries failed
    return NextResponse.json<ScreeningResponse>(
      {
        success: false,
        jobSummary: '',
        evaluations: [],
        error: 'The AI screening service is temporarily unavailable. Please try again in a few seconds.',
      },
      { status: 502 }
    )
  }

  try {
    const zai = await createZAIClient()
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt({ jobDescription: jd, resumes: validResumes }) },
      ],
      thinking: { type: 'disabled' },
    })

    const raw = completion.choices?.[0]?.message?.content ?? ''
    if (!raw) {
      return NextResponse.json<ScreeningResponse>(
        { success: false, jobSummary: '', evaluations: [], error: 'AI returned an empty response. Try again.' },
        { status: 502 }
      )
    }

    let parsed: any
    try {
      parsed = safeParseJSON(raw)
    } catch (err) {
      return NextResponse.json<ScreeningResponse>(
        {
          success: false,
          jobSummary: '',
          evaluations: [],
          error: 'AI response was not valid JSON. Retry in a moment.',
        },
        { status: 502 }
      )
    }

    const evaluations = normalizeEvaluations(parsed, validResumes.length)
    const jobSummary = String(parsed?.jobSummary ?? '').slice(0, 400) || 'AI fitment analysis complete.'

    return NextResponse.json<ScreeningResponse>({
      success: true,
      jobSummary,
      evaluations,
      durationMs: Date.now() - started,
    })
  } catch (err: any) {
    return NextResponse.json<ScreeningResponse>(
      {
        success: false,
        jobSummary: '',
        evaluations: [],
        error: err?.message ?? 'Unexpected error during AI screening.',
      },
      { status: 500 }
    )
  }
}
