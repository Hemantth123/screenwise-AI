/**
 * ScreenWise — Real Evaluation Experiment
 *
 * Runs 25 sample resumes × 3 job descriptions through the same AI screening
 * pipeline used by the live prototype, then computes validated metrics:
 *   - Precision@10 (vs. manually-defined ground truth)
 *   - Recruiter agreement (label match rate: Strong/Possible/Pass)
 *   - Screening time saved (AI wall-clock vs. manual estimate)
 *
 * Output: /home/z/my-project/download/evaluation-results.json
 */
import ZAI from 'z-ai-web-dev-sdk'
import { writeFileSync } from 'fs'

// ───────────────────────────────────────────────────────────────────────────
// 25 RESUMES — 5 per archetype: backend, frontend, data, PM, mobile
// ───────────────────────────────────────────────────────────────────────────

const RESUMES: { id: number; archetype: string; text: string }[] = [
  // ── BACKEND ENGINEERS (0–4) ──
  { id: 0, archetype: 'backend', text: `Aarav Mehta | Bengaluru | 6 yrs
Senior Backend Engineer — Razorpay (2021–Present)
- Lead for Routing service: Node.js + TypeScript, 4M+ payment events/day
- Migrated monolith to event-driven microservices on AWS ECS + SNS/SQS; p99 latency -38%
- Owned Postgres sharding for 2TB ledger table; introduced CDC pipeline
Software Engineer — PhonePe (2018–2021)
- Built UPI intent APIs in Go; rewrote critical paths in Node.js
- Reconciliation jobs handling 50M+ daily settlements
Skills: Node.js, TypeScript, PostgreSQL, AWS (ECS, RDS, SNS/SQS, Lambda), Kafka, Docker, Terraform
Education: B.E. CS, BITS Pilani (2018)` },

  { id: 1, archetype: 'backend', text: `Vikram Reddy | Hyderabad | 7 yrs
Senior Software Engineer — Swiggy (2022–Present)
- Backend services for order platform in Java + Spring Boot
- Migrated to AWS ECS; introduced Kafka for event-driven order flow
SDE-2 — Flipkart (2019–2022)
- Catalog ingestion pipeline in Java; Postgres + DynamoDB
SDE-1 — Myntra (2017–2019)
- Search backend in Java
Skills: Java, Spring Boot, PostgreSQL, AWS (ECS, RDS, SNS/SQS), Kafka, Docker
Education: B.Tech CS, IIIT Hyderabad (2017)` },

  { id: 2, archetype: 'backend', text: `Sneha Kulkarni | Bengaluru | 5 yrs
Backend Engineer — CRED (2021–Present)
- Payments service in Go; built reconciliation engine for card settlements
- GCP Cloud Run + Pub/Sub; Postgres on Cloud SQL
Software Engineer — Gojek (2018–2021)
- Go microservices for the ride-hailing dispatch system
Skills: Go, PostgreSQL, GCP (Cloud Run, Pub/Sub, Cloud SQL), Kafka, Docker
Education: B.E. CS, COEP Pune (2018)` },

  { id: 3, archetype: 'backend', text: `Arjun Nair | Bengaluru | 8 yrs
SDE-3 — Amazon (2020–Present)
- Payments team: Java + AWS Lambda + DynamoDB; high-throughput ledger
SDE-2 — Zomato (2017–2020)
- Order backend in Java; later Node.js BFF for the diner app
Skills: Java, Node.js, PostgreSQL, AWS (Lambda, DynamoDB, ECS, SNS/SQS), Kafka, Terraform
Education: B.Tech CS, NIT Trichy (2016)` },

  { id: 4, archetype: 'backend', text: `Pooja Bhat | Bengaluru | 5 yrs
Senior Backend Engineer — Razorpay (2021–Present)
- Node.js + TypeScript for payment gateway integration service
- Postgres + AWS RDS; built SNS/SQS event pipeline for webhooks
Software Engineer — PhonePe (2019–2021)
- Backend for UPI collect API in Node.js
Skills: Node.js, TypeScript, PostgreSQL, AWS (ECS, RDS, SNS/SQS), Docker
Education: B.E. CS, RVCE Bangalore (2019)` },

  // ── FRONTEND ENGINEERS (5–9) ──
  { id: 5, archetype: 'frontend', text: `Riya Sharma | Bengaluru | 5 yrs
Senior Frontend Engineer — Atlassian (2022–Present)
- Jira Cloud frontend in React + TypeScript; led design system migration
- Next.js for marketing pages; SSR + ISR optimization
Frontend Engineer — Freshworks (2019–2022)
- CRM dashboard in React + Redux; component library in Storybook
Skills: React, TypeScript, Next.js, Redux, Tailwind, Storybook, Webpack
Education: B.Tech CS, BITS Goa (2019)` },

  { id: 6, archetype: 'frontend', text: `Karthik Rao | Bengaluru | 6 yrs
Senior Frontend Engineer — Swiggy (2021–Present)
- Diner web app in React + TypeScript; performance budgeting + Core Web Vitals
Frontend Engineer — Flipkart (2018–2021)
- Product page in React + Redux; A/B testing framework
Skills: React, TypeScript, Redux, Webpack, Tailwind, Jest, Cypress
Education: B.E. CS, NIT Surathkal (2018)` },

  { id: 7, archetype: 'frontend', text: `Ananya Das | Bengaluru | 4 yrs
Frontend Engineer — Zomato (2021–Present)
- React + Next.js for the diner web app; migrated to App Router
- Tailwind CSS design system; accessibility (WCAG AA) audit lead
Frontend Engineer — Myntra (2019–2021)
- Product listing in React; SEO optimization
Skills: React, Next.js, TypeScript, Tailwind, Jest, Playwright
Education: B.Tech CS, IIIT Bangalore (2021)` },

  { id: 8, archetype: 'frontend', text: `Devansh Malhotra | Bengaluru | 7 yrs
Senior Software Engineer — Google (2020–Present)
- Google Pay web frontend in React + TypeScript; cross-browser compat
Software Engineer — Razorpay (2017–2020)
- Dashboard in Angular; later migrated to React
Skills: React, TypeScript, Angular, Vue, Webpack, Bazel
Education: B.Tech CS, IIT Madras (2017)` },

  { id: 9, archetype: 'frontend', text: `Meera Krishnan | Bengaluru | 5 yrs
Senior Frontend Engineer — PhonePe (2021–Present)
- Merchant dashboard in React + TypeScript + GraphQL (Apollo)
Frontend Engineer — Swiggy (2018–2021)
- React Native for the partner app; shared components with web
Skills: React, TypeScript, GraphQL, Apollo, React Native, Tailwind
Education: B.E. CS, Anna University (2018)` },

  // ── DATA ANALYSTS (10–14) ──
  { id: 10, archetype: 'data', text: `Rohan Gupta | Bengaluru | 4 yrs
Senior Data Analyst — Swiggy (2022–Present)
- SQL + Python for funnel analysis; Looker dashboards for the growth team
- A/B testing analysis; regression models in Python (pandas, statsmodels)
Data Analyst — Meesho (2020–2022)
- SQL queries on BigQuery; Tableau dashboards for the catalog team
Skills: SQL (BigQuery, Postgres), Python (pandas, statsmodels), Tableau, Looker, A/B testing
Education: B.Stat, ISI Kolkata (2020)` },

  { id: 11, archetype: 'data', text: `Ishita Verma | Bengaluru | 5 yrs
Senior Data Analyst — Flipkart (2021–Present)
- SQL + Python for supply chain analytics; PowerBI dashboards
- Statistical modeling for demand forecasting (ARIMA, Prophet)
Data Analyst — Myntra (2019–2021)
- SQL on Hive; Excel + Tableau for category reporting
Skills: SQL (Hive, Postgres), Python (pandas, scikit-learn), PowerBI, Tableau, Statistics
Education: M.Sc Statistics, IIT Kanpur (2019)` },

  { id: 12, archetype: 'data', text: `Aditya Singh | Bengaluru | 3 yrs
Data Analyst — CRED (2022–Present)
- SQL + dbt for data modeling; Metabase dashboards for the product team
- Experimentation platform; A/B test analysis in Python
Junior Data Analyst — Meesho (2021–2022)
- SQL queries; Excel reporting
Skills: SQL (Postgres, Redshift), Python, dbt, Metabase, A/B testing
Education: B.Tech CS, IIIT Delhi (2021)` },

  { id: 13, archetype: 'data', text: `Neha Joshi | Bengaluru | 6 yrs
Senior Data Analyst — Amazon (2020–Present)
- SQL + R for retail analytics; Tableau dashboards for category managers
- A/B testing at scale; causal inference for pricing experiments
Data Analyst — Flipkart (2017–2020)
- SQL on Hive; Python for churn prediction
Skills: SQL (Redshift, Postgres), R, Python (pandas, statsmodels), Tableau, A/B testing, Causal inference
Education: M.Sc Statistics, ISI Bangalore (2017)` },

  { id: 14, archetype: 'data', text: `Saurabh Mishra | Bengaluru | 4 yrs
Data Analyst — Meesho (2021–Present)
- SQL + Python for seller analytics; Looker dashboards
- Experimentation analysis; cohort analysis in Python
Data Analyst — Swiggy (2019–2021)
- SQL queries on BigQuery; Tableau for ops team
Skills: SQL (BigQuery, Postgres), Python (pandas), Looker, Tableau, A/B testing
Education: B.Tech CS, NIT Warangal (2019)` },

  // ── PRODUCT MANAGERS (15–19) ──
  { id: 15, archetype: 'pm', text: `Tanvi Agarwal | Bengaluru | 5 yrs
Senior Product Manager — Razorpay (2021–Present)
- Payments product team: led the UPI Autopay launch (10M+ users)
Associate PM — Swiggy (2018–2021)
- Discovery and search product
Skills: Product strategy, Roadmapping, SQL, A/B testing, User research, Figma
Education: B.Tech CS, IIT Bombay + MBA IIM Bangalore (2018)` },

  { id: 16, archetype: 'pm', text: `Akash Pillai | Bengaluru | 6 yrs
Senior Product Manager — Freshworks (2020–Present)
- CRM product team; led the AI-assisted email draft feature
Product Manager — Zoho (2017–2020)
- Sales pipeline product
Skills: Product strategy, Roadmapping, SQL, B2B SaaS, User research
Education: B.E. CS, BITS Pilani + MBA ISB (2017)` },

  { id: 17, archetype: 'pm', text: `Divya Menon | Bengaluru | 4 yrs
Product Manager — CRED (2021–Present)
- Consumer product: rewards and gamification
Associate PM — Swiggy (2019–2021)
- Subscription product (Swiggy One)
Skills: Product strategy, Roadmapping, SQL, A/B testing, User research
Education: B.Tech CS, NIT Surathkal (2019)` },

  { id: 18, archetype: 'pm', text: `Rahul Saxena | Bengaluru | 7 yrs
Senior Product Manager — Atlassian (2020–Present)
- Platform product team; API and integration marketplace
Product Manager — Freshworks (2017–2020)
- IT service management product
Skills: Product strategy, Roadmapping, SQL, Platform product, API design
Education: B.Tech CS, IIT Delhi + MBA IIM Ahmedabad (2017)` },

  { id: 19, archetype: 'pm', text: `Shreya Kapoor | Bengaluru | 5 yrs
Senior Product Manager — PhonePe (2021–Present)
- Payments product team; led merchant onboarding redesign
Associate PM — Flipkart (2018–2021)
- Checkout and payments product
Skills: Product strategy, Roadmapping, SQL, A/B testing, Payments domain
Education: B.E. CS, BITS Pilani (2018)` },

  // ── MOBILE ENGINEERS (20–24) ──
  { id: 20, archetype: 'mobile', text: `Nikhil Deshpande | Bengaluru | 5 yrs
Senior Android Engineer — Dream11 (2021–Present)
- Kotlin + Java for the Dream11 app; 50M+ MAU
- Jetpack Compose migration; Coroutines + Flow
Android Engineer — ShareChat (2018–2021)
- Java + Kotlin; video feed optimization
Skills: Kotlin, Java, Android, Jetpack Compose, Coroutines, Firebase
Education: B.E. CS, VIT Pune (2018)` },

  { id: 21, archetype: 'mobile', text: `Anjali Iyengar | Bengaluru | 4 yrs
iOS Engineer — Swiggy (2021–Present)
- Swift + UIKit for the Swiggy app; 20M+ MAU
- SwiftUI adoption; Combine framework
iOS Engineer — Zomato (2019–2021)
- Swift + Objective-C; order tracking
Skills: Swift, Objective-C, iOS, SwiftUI, Combine, Firebase
Education: B.Tech CS, BITS Goa (2019)` },

  { id: 22, archetype: 'mobile', text: `Manish Tiwari | Bengaluru | 6 yrs
Senior Mobile Engineer — ShareChat (2020–Present)
- Kotlin + Flutter for cross-platform features
- Performance optimization; 100M+ MAU
Android Engineer — Swiggy (2017–2020)
- Java + Kotlin; partner app
Skills: Kotlin, Flutter, Dart, Java, Android, Firebase
Education: B.E. CS, MNNIT Allahabad (2017)` },

  { id: 23, archetype: 'mobile', text: `Pavithra Sridhar | Bengaluru | 5 yrs
Senior Mobile Engineer — Zomato (2021–Present)
- React Native for the Zomato app; shared 70% code across iOS + Android
- Swift bridges for native modules
Mobile Engineer — PhonePe (2018–2021)
- React Native; TypeScript for shared logic
Skills: React Native, TypeScript, Swift, iOS, Android, Firebase
Education: B.Tech CS, Anna University (2018)` },

  { id: 24, archetype: 'mobile', text: `Yash Aggarwal | Bengaluru | 4 yrs
Mobile Engineer — CRED (2021–Present)
- Flutter + Dart for the CRED app; 5M+ MAU
- Native platform channel integration
Mobile Engineer — Dunzo (2019–2021)
- Flutter; delivery partner app
Skills: Flutter, Dart, Android, iOS, Firebase
Education: B.E. CS, Delhi College of Engineering (2019)` },
]

// ───────────────────────────────────────────────────────────────────────────
// 3 JOB DESCRIPTIONS
// ───────────────────────────────────────────────────────────────────────────

const JDS: { key: string; text: string }[] = [
  {
    key: 'backend',
    text: `Senior Backend Engineer — Embark Pay (Fintech)

About the role:
We are building the next-generation payments platform powering Embark's Global Capability Centers. As a Senior Backend Engineer, you will own core services that move money across borders, handle reconciliation at scale, and integrate with banking partners.

What you'll do:
- Design and operate event-driven microservices in Node.js + TypeScript
- Own Postgres schemas, migrations, and query performance for high-throughput tables
- Build reliable integrations with payment gateways and bank APIs
- Partner with QA and SRE on observability, on-call, and incident response
- Mentor 1-2 mid-level engineers

Must have:
- 5+ years building production backend systems
- Strong Node.js + TypeScript + PostgreSQL
- Hands-on AWS (ECS, RDS, SNS/SQS)
- Event-driven architecture (Kafka / SNS-SQS / EventBridge)
- Comfortable with CI/CD and infra-as-code

Nice to have:
- Fintech / payments domain exposure
- Experience with reconciliation or ledger systems
- Open-source contributions

Location: Hybrid, Bengaluru.`,
  },
  {
    key: 'frontend',
    text: `Senior Frontend Engineer — Embark Console (B2B SaaS)

About the role:
We are building the Embark Console — the dashboard where our enterprise customers manage their Global Capability Center operations. As a Senior Frontend Engineer, you will own the design system, performance, and accessibility of a complex data-heavy application.

What you'll do:
- Build and maintain the React + TypeScript frontend for the Embark Console
- Own the component library and design system (Storybook)
- Drive Core Web Vitals performance budgets and accessibility (WCAG AA)
- Partner with design on a unified visual language across products
- Mentor 1-2 mid-level frontend engineers

Must have:
- 5+ years building production web applications
- Strong React + TypeScript + Next.js
- State management (Redux / Zustand / React Query)
- Testing (Jest + Playwright or Cypress)
- Understanding of SSR, ISR, and edge rendering

Nice to have:
- Design system experience (Storybook, Figma-to-code)
- B2B SaaS or dashboard-heavy product experience
- GraphQL experience

Location: Hybrid, Bengaluru.`,
  },
  {
    key: 'data',
    text: `Data Analyst — Embark Insights (E-commerce / GCC Analytics)

About the role:
We are building the analytics layer for Embark's Global Capability Centers, helping enterprise customers measure and optimize their operations. As a Data Analyst, you will own dashboards, experiments, and ad-hoc analyses that drive business decisions.

What you'll do:
- Build and maintain dashboards in Looker / Tableau / Metabase
- Write complex SQL on BigQuery / Postgres / Redshift
- Design and analyze A/B tests; communicate results to stakeholders
- Partner with product and engineering on metrics definitions and data quality
- Self-serve analytics enablement for non-technical teams

Must have:
- 3+ years in an analytics or data science role
- Strong SQL (window functions, CTEs, query optimization)
- Python (pandas, statsmodels or scikit-learn)
- BI tool proficiency (Looker / Tableau / PowerBI / Metabase)
- Statistics fundamentals (hypothesis testing, regression, experimentation)

Nice to have:
- dbt for data modeling
- Causal inference experience
- E-commerce or marketplace analytics exposure

Location: Hybrid, Bengaluru.`,
  },
]

// ───────────────────────────────────────────────────────────────────────────
// GROUND TRUTH — manually defined based on archetype match to each JD
// ───────────────────────────────────────────────────────────────────────────
// For each JD, we label each resume as Strong / Possible / Pass.
// "Strong" = primary archetype matches the JD.
// "Possible" = adjacent archetype (has transferable skills).
// "Pass" = wrong track entirely.
//
// JD1 (Backend):    Strong = backend(0-4); Possible = data(10-14, SQL/Python backend-adjacent); Pass = frontend/PM/mobile
// JD2 (Frontend):   Strong = frontend(5-9); Possible = mobile(20-24, cross-platform/RN); Pass = backend/data/PM
// JD3 (Data):       Strong = data(10-14); Possible = backend(0-4, SQL/data-adjacent); Pass = frontend/PM/mobile
// ───────────────────────────────────────────────────────────────────────────

const GROUND_TRUTH: Record<string, Record<number, 'Strong Fit' | 'Possible Fit' | 'Pass'>> = {
  backend: {
    0: 'Strong Fit', 1: 'Strong Fit', 2: 'Strong Fit', 3: 'Strong Fit', 4: 'Strong Fit',
    10: 'Possible Fit', 11: 'Possible Fit', 12: 'Possible Fit', 13: 'Possible Fit', 14: 'Possible Fit',
    5: 'Pass', 6: 'Pass', 7: 'Pass', 8: 'Pass', 9: 'Pass',
    15: 'Pass', 16: 'Pass', 17: 'Pass', 18: 'Pass', 19: 'Pass',
    20: 'Pass', 21: 'Pass', 22: 'Pass', 23: 'Pass', 24: 'Pass',
  },
  frontend: {
    5: 'Strong Fit', 6: 'Strong Fit', 7: 'Strong Fit', 8: 'Strong Fit', 9: 'Strong Fit',
    20: 'Possible Fit', 21: 'Possible Fit', 22: 'Possible Fit', 23: 'Possible Fit', 24: 'Possible Fit',
    0: 'Pass', 1: 'Pass', 2: 'Pass', 3: 'Pass', 4: 'Pass',
    10: 'Pass', 11: 'Pass', 12: 'Pass', 13: 'Pass', 14: 'Pass',
    15: 'Pass', 16: 'Pass', 17: 'Pass', 18: 'Pass', 19: 'Pass',
  },
  data: {
    10: 'Strong Fit', 11: 'Strong Fit', 12: 'Strong Fit', 13: 'Strong Fit', 14: 'Strong Fit',
    0: 'Possible Fit', 1: 'Possible Fit', 2: 'Possible Fit', 3: 'Possible Fit', 4: 'Possible Fit',
    5: 'Pass', 6: 'Pass', 7: 'Pass', 8: 'Pass', 9: 'Pass',
    15: 'Pass', 16: 'Pass', 17: 'Pass', 18: 'Pass', 19: 'Pass',
    20: 'Pass', 21: 'Pass', 22: 'Pass', 23: 'Pass', 24: 'Pass',
  },
}

// ───────────────────────────────────────────────────────────────────────────
// AI SCREENING — reuses the same prompt as the live prototype
// ───────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are ScreenWise, an AI recruiting copilot used by talent-acquisition teams at fast-growing companies. Your job is to evaluate candidate resumes against a job description and produce structured, honest, explainable fitment assessments.

You are not a cheerleader. You are a calibrated evaluator. Most candidates are NOT a strong fit. Be specific, evidence-based, and useful to a busy recruiter who has 90 seconds per candidate.

Bias guardrails:
- Judge on skills, experience, scope, and trajectory ONLY.
- Never let name, gender, age, religion, caste, or university prestige inflate or deflate a score.
- If you cannot tell something from the resume, say so. Do not invent facts.`

function buildUserPrompt(jdText: string, resumeTexts: string[]): string {
  const resumesBlock = resumeTexts
    .map((r, i) => `### CANDIDATE ${i + 1}\n${r.trim()}`)
    .join('\n\n')
  return `JOB DESCRIPTION:
${jdText.trim()}

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
  "jobSummary": "1-2 sentence summary",
  "evaluations": [
    {
      "candidateName": "name",
      "candidateId": "cand-1",
      "fitmentScore": 0-100,
      "recommendation": "Strong Fit | Possible Fit | Pass",
      "skillsMatched": ["..."],
      "skillsMissing": ["..."],
      "experienceRelevance": "Direct | Adjacent | Stretch",
      "seniorityAlignment": "Match | Junior | Senior",
      "yearsOfExperience": 0,
      "keyStrengths": ["..."],
      "redFlags": ["..."],
      "oneLineSummary": "...",
      "outreachEmail": { "subject": "...", "body": "..." }
    }
  ]
}

HARD RULES:
1. Output ONLY the JSON object. No prose. No code fences.
2. evaluations array MUST have exactly ${resumeTexts.length} entries, same order as input.
3. candidateId MUST be "cand-1", "cand-2", ... matching position.
4. Be calibrated: Strong Fit (≥80) should be RARE. Most candidates land in Possible (60-79) or Pass (<60).
5. outreachEmail.body MUST reference a specific detail from that candidate's resume.`
}

interface AIEvaluation {
  candidateName: string
  candidateId: string
  fitmentScore: number
  recommendation: string
}

function normalizeRec(v: unknown): 'Strong Fit' | 'Possible Fit' | 'Pass' {
  const s = String(v ?? '').toLowerCase()
  if (s.includes('strong')) return 'Strong Fit'
  if (s.includes('possible') || s.includes('maybe')) return 'Possible Fit'
  return 'Pass'
}

function safeParse(raw: string): any {
  let cleaned = raw.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  }
  return JSON.parse(cleaned)
}

async function screenBatch(zai: any, jdText: string, batch: string[]): Promise<AIEvaluation[]> {
  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'assistant', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(jdText, batch) },
    ],
    thinking: { type: 'disabled' },
  })
  const raw = completion.choices?.[0]?.message?.content ?? ''
  const parsed = safeParse(raw)
  const evals: AIEvaluation[] = (parsed.evaluations || []).map((e: any, i: number) => ({
    candidateName: String(e.candidateName ?? `Candidate ${i + 1}`),
    candidateId: `cand-${i + 1}`,
    fitmentScore: Math.max(0, Math.min(100, Math.round(Number(e.fitmentScore ?? 0)))),
    recommendation: normalizeRec(e.recommendation),
  }))
  return evals
}

// ───────────────────────────────────────────────────────────────────────────
// MAIN
// ───────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('  ScreenWise Evaluation Experiment')
  console.log('  25 resumes × 3 JDs = 75 evaluations')
  console.log('═══════════════════════════════════════════════════════════════\n')

  const zai = await ZAI.create()
  const BATCH_SIZE = 5

  const allResults: Record<string, {
    aiEvaluations: { resumeId: number; archetype: string; score: number; recommendation: string }[]
    aiTimeMs: number
  }> = {}

  for (const jd of JDS) {
    console.log(`\n▶ JD: ${jd.key.toUpperCase()}`)
    const started = Date.now()
    const aiEvals: { resumeId: number; archetype: string; score: number; recommendation: string }[] = []

    // Process resumes in batches of BATCH_SIZE
    for (let i = 0; i < RESUMES.length; i += BATCH_SIZE) {
      const batch = RESUMES.slice(i, i + BATCH_SIZE)
      const batchTexts = batch.map((r) => r.text)
      console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(RESUMES.length / BATCH_SIZE)} — resumes #${batch[0].id}–${batch[batch.length - 1].id}...`)
      const t0 = Date.now()
      const evals = await screenBatch(zai, jd.text, batchTexts)
      console.log(`    ✓ ${evals.length} evaluations in ${((Date.now() - t0) / 1000).toFixed(1)}s`)
      evals.forEach((e, idx) => {
        const resume = batch[idx]
        aiEvals.push({
          resumeId: resume.id,
          archetype: resume.archetype,
          score: e.fitmentScore,
          recommendation: e.recommendation,
        })
      })
    }

    const aiTimeMs = Date.now() - started
    allResults[jd.key] = { aiEvals, aiTimeMs }
    console.log(`  ✅ ${jd.key} complete in ${(aiTimeMs / 1000).toFixed(1)}s`)
  }

  // ── COMPUTE METRICS ──
  console.log('\n═══════════════════════════════════════════════════════════════')
  console.log('  METRICS')
  console.log('═══════════════════════════════════════════════════════════════\n')

  const perJD: any[] = []
  let totalAgreement = 0
  let totalEvaluated = 0
  let totalPrecisionHits = 0
  let totalManualTimeSec = 0
  let totalAITimeSec = 0

  for (const jd of JDS) {
    const { aiEvals, aiTimeMs } = allResults[jd.key]
    const truth = GROUND_TRUTH[jd.key]

    // Sort by AI score desc to get AI ranking
    const ranked = [...aiEvals].sort((a, b) => b.score - a.score)
    const aiTop10 = new Set(ranked.slice(0, 10).map((e) => e.resumeId))

    // Ground-truth "relevant" set = Strong + Possible
    const relevant = new Set(
      Object.entries(truth)
        .filter(([, label]) => label !== 'Pass')
        .map(([id]) => Number(id))
    )

    // Precision@10: of AI's top 10, how many are in the relevant set
    let hits = 0
    for (const id of aiTop10) {
      if (relevant.has(id)) hits++
    }
    const precisionAt10 = (hits / 10) * 100

    // Recruiter agreement: does AI's label match ground-truth label?
    let agree = 0
    for (const e of aiEvals) {
      const truthLabel = truth[e.resumeId]
      if (e.recommendation === truthLabel) agree++
    }
    const agreement = (agree / aiEvals.length) * 100

    // Time: manual = 90s per resume; AI = wall-clock + 10 min review
    const manualTimeSec = aiEvals.length * 90
    const reviewTimeSec = 600 // 10 min recruiter review of AI output
    const aiTotalSec = aiTimeMs / 1000 + reviewTimeSec
    const timeSaved = ((manualTimeSec - aiTotalSec) / manualTimeSec) * 100

    totalAgreement += agree
    totalEvaluated += aiEvals.length
    totalPrecisionHits += hits
    totalManualTimeSec += manualTimeSec
    totalAITimeSec += aiTotalSec

    console.log(`  ${jd.key.toUpperCase()}:`)
    console.log(`    Precision@10:   ${precisionAt10.toFixed(1)}%  (${hits}/10 relevant in AI top-10)`)
    console.log(`    Label agreement:${agreement.toFixed(1)}%  (${agree}/${aiEvals.length} labels match ground truth)`)
    console.log(`    Manual time:    ${(manualTimeSec / 60).toFixed(1)} min`)
    console.log(`    AI+review time: ${(aiTotalSec / 60).toFixed(1)} min`)
    console.log(`    Time saved:     ${timeSaved.toFixed(1)}%`)
    console.log()

    perJD.push({
      jd: jd.key,
      precisionAt10: Number(precisionAt10.toFixed(1)),
      precisionHits: hits,
      labelAgreement: Number(agreement.toFixed(1)),
      agreementCount: agree,
      totalCandidates: aiEvals.length,
      manualTimeMin: Number((manualTimeSec / 60).toFixed(1)),
      aiTimeMin: Number((aiTotalSec / 60).toFixed(1)),
      timeSavedPct: Number(timeSaved.toFixed(1)),
      aiRanking: ranked.map((e) => ({ id: e.resumeId, archetype: e.archetype, score: e.score, recommendation: e.recommendation, truth: truth[e.resumeId] })),
    })
  }

  const overall = {
    totalResumes: 25,
    totalJDs: 3,
    totalEvaluations: totalEvaluated,
    avgPrecisionAt10: Number(((totalPrecisionHits / (3 * 10)) * 100).toFixed(1)),
    avgLabelAgreement: Number(((totalAgreement / totalEvaluated) * 100).toFixed(1)),
    avgTimeSavedPct: Number((((totalManualTimeSec - totalAITimeSec) / totalManualTimeSec) * 100).toFixed(1)),
  }

  console.log('  ─────────────────────────────────────────')
  console.log(`  OVERALL (pooled across 3 JDs):`)
  console.log(`    Avg Precision@10:    ${overall.avgPrecisionAt10}%`)
  console.log(`    Avg Label agreement: ${overall.avgLabelAgreement}%`)
  console.log(`    Avg Time saved:      ${overall.avgTimeSavedPct}%`)
  console.log('═══════════════════════════════════════════════════════════════\n')

  const output = {
    experiment: {
      resumes: 25,
      jobDescriptions: 3,
      totalEvaluations: 75,
      archetypes: ['backend (5)', 'frontend (5)', 'data (5)', 'pm (5)', 'mobile (5)'],
      groundTruthMethod: 'Manual label per (JD, resume) pair based on archetype match. Strong = primary match, Possible = adjacent transferable skills, Pass = wrong track.',
      manualScreeningAssumption: '90 seconds per resume (industry standard for first-pass)',
      reviewAssumption: '10 minutes recruiter review of AI output per JD',
    },
    overall,
    perJD,
    generatedAt: new Date().toISOString(),
  }

  const outPath = '/home/z/my-project/download/evaluation-results.json'
  writeFileSync(outPath, JSON.stringify(output, null, 2))
  console.log(`✅ Results saved to ${outPath}`)
}

main().catch((err) => {
  console.error('❌ Evaluation failed:', err)
  process.exit(1)
})
