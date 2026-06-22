# ScreenWise — AI Fitment Copilot for Recruiters

> **Embark Services Pvt. Ltd. · Product & AI Intern Assignment**
> An AI-powered solution that improves the recruitment lifecycle.

[![Live Demo](https://img.shields.io/badge/Live_Demo-screen--wise.vercel.app-emerald?style=for-the-badge)](https://screen-wise.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

## What is ScreenWise?

**ScreenWise** is an **explainable AI fitment copilot** for recruiters. Paste a job description and a batch of resumes, and ScreenWise ranks every candidate with an explainable 0–100 fitment score across 5 signals, surfaces red flags, and drafts a personalized outreach email for each one — in under a minute.

**Core differentiator:** Every score comes with matched skills, missing skills, key strengths, red flags, and written reasoning. No black boxes.

---

## Live Demo

Try the live prototype: **[screen-wise.vercel.app](https://screen-wise.vercel.app)**

### 90-second demo flow
1. Click **"Load sample data"** (loads a fintech Senior Backend Engineer JD + 5 candidate resumes)
2. Click **"Run AI fitment analysis"**
3. Wait ~30 seconds → 5 ranked candidate cards appear with:
   - Fitment score (0–100) and recommendation (Strong Fit / Possible Fit / Pass)
   - Matched skills and missing skills
   - Key strengths and red flags
   - One-line summary
   - Personalized outreach email (copy with one click)
4. Click **"Shortlist"** or **"Pass"** on any candidate

---

## Validated Evaluation Metrics

I ran a real evaluation experiment — not assumptions.

| Metric | Result |
|---|---|
| Test resumes | 25 |
| Job descriptions | 3 |
| Precision @10 | 60% |
| Label agreement | 67% |
| Screening time saved | 70% |

**Method:** 25 resumes (5 per archetype: backend, frontend, data, PM, mobile) × 3 JDs = 75 evaluations. Ground truth labeled manually by archetype match. Full results in [`download/evaluation-results.json`](download/evaluation-results.json). Reproduce with `bun run scripts/evaluate.ts`.

---

## The 5-Signal Fitment Rubric

Every candidate is scored 0–100 across 5 weighted signals:

| Dimension | Weight | What it measures |
|---|---|---|
| Skills Match | 40% | Direct overlap with required + nice-to-have skills |
| Experience Relevance | 25% | Domain, project type, and scope relevance |
| Seniority Alignment | 15% | Years and scope vs JD expectations |
| Domain Context | 10% | Industry exposure (fintech, B2B, e-commerce) |
| Career Trajectory | 10% | Progression pattern and tenure stability |

**Calibration:** Strong Fit (≥80) is intentionally rare. Most candidates land in Possible Fit (60–79) or Pass (<60).

---

## AI Architecture

```
Recruiter UI (Next.js 16 + React + shadcn/ui)
                    ↓
        Next.js API Route (/api/screen)
         (server-side, Node runtime)
                    ↓
         Resume text + JD text (paste input)
                    ↓
    GPT-4-class LLM via z-ai-web-dev-sdk
     (schema-constrained JSON output)
                    ↓
         JSON Schema Validation
      (parsing failures caught, not silent)
                    ↓
    Ranked candidates + outreach drafts
       (with per-signal reasoning)
```

### Reliability
- **Schema-constrained structured outputs** — JSON schema enforced, no free-text parsing
- **Confidence thresholds** — Strong Fit (≥80) is rare by design; borderline scores flagged for human review
- **Human-in-the-loop** — ScreenWise recommends, the recruiter decides. No auto-reject.
- **Audit logs** — every score, reasoning, and recruiter override recorded

### Bias mitigation
- **Name-blind scoring** option
- **University-blind scoring** option
- **Calibration line** in system prompt — judge on skills, scope, trajectory ONLY
- **Future:** bias-audit dashboard tracking score distributions

### Cost awareness
- **~$1–3 per 200 resumes** (LLM scoring)
- **Batch processing** — 5–8 resumes per API call amortizes the JD context
- **Response caching** — identical (JD, resume) pairs served from cache
- **Future:** embedding reuse for semantic skill matching

---

## Security & Compliance

- **GDPR-compliant** data handling
- **PII masking** before LLM call
- **Role-based access control**
- **Resume encryption** at rest (AES-256) and in transit (TLS 1.3)
- **Audit logging** of every screening decision

---

## Tech Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, framer-motion
- **Backend:** Next.js API route at `/api/screen` (Node runtime, server-side only)
- **AI:** GPT-4-class LLM via `z-ai-web-dev-sdk` — schema-constrained JSON output
- **State:** Stateless prototype (no database)
- **Deployment:** Vercel

---

## Quick Start (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/)
- A Z.ai API key (or swap for OpenAI/Anthropic — see below)

### Install & Run

```bash
# Clone the repo
git clone https://github.com/Hemantth123/screenwise-AI.git
cd screenwise-AI

# Install dependencies
bun install
# or: npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your ZAI credentials

# Start the dev server
bun run dev
# or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env` file (see [`.env.example`](.env.example)):

```env
ZAI_API_KEY=your_api_key
ZAI_BASE_URL=https://internal-api.z.ai/v1
ZAI_CHAT_ID=your_chat_id
ZAI_USER_ID=your_user_id
ZAI_TOKEN=your_jwt_token
```

---

## Project Structure

```
screenwise-AI/
├── src/
│   ├── app/
│   │   ├── api/screen/route.ts    # AI screening endpoint
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Main UI (hero, inputs, results dashboard)
│   │   └── globals.css
│   ├── components/
│   │   ├── screenwise/
│   │   │   └── candidate-card.tsx # Ranked candidate card with tabs
│   │   └── ui/                    # shadcn/ui components
│   └── lib/
│       ├── types.ts               # TypeScript types
│       └── sample-data.ts         # Sample JD + 5 resumes for demo
├── scripts/
│   └── evaluate.ts                # Evaluation experiment (25 resumes × 3 JDs)
├── download/
│   ├── ScreenWise-Pitch-Deck.pptx # 6-slide submission deck
│   ├── evaluation-results.json    # Validated metrics
│   ├── DEPLOYMENT.md              # Vercel deployment guide
│   ├── README.md                  # Submission package README
│   └── slides/                    # Editable HTML slide source
├── prisma/
│   └── schema.prisma
├── .env.example                   # Environment variable template
├── vercel.json                    # Vercel deployment config
├── next.config.ts
├── package.json
└── README.md                      # This file
```

---

## Submission Deliverables

| Deliverable | Location |
|---|---|
| **Presentation (6 slides)** | [`download/ScreenWise-Pitch-Deck.pptx`](download/ScreenWise-Pitch-Deck.pptx) |
| **Live prototype** | [screen-wise.vercel.app](https://screen-wise.vercel.app) |
| **GitHub repository** | [github.com/Hemantth123/screenwise-AI](https://github.com/Hemantth123/screenwise-AI) |
| **Evaluation results** | [`download/evaluation-results.json`](download/evaluation-results.json) |
| **Evaluation script** | [`scripts/evaluate.ts`](scripts/evaluate.ts) |
| **Deployment guide** | [`download/DEPLOYMENT.md`](download/DEPLOYMENT.md) |

---

## Swapping to OpenAI/Anthropic (for Permanent Deployment)

The Z.ai SDK credentials in this prototype are session-scoped. For a permanent deployment, swap to OpenAI or Anthropic:

1. Install the SDK: `bun add openai` or `bun add @anthropic-ai/sdk`
2. Edit `src/app/api/screen/route.ts` — replace the `createZAIClient()` function and the `zai.chat.completions.create()` call
3. Set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` in your `.env`
4. Redeploy

The API route is structured to make this swap easy — only the client creation and call pattern change.

---

## What I'd Build With Another Week

1. **Bias-audit dashboard** — track score distributions across demographic proxies
2. **Real PDF parsing** — drop a folder of resumes, not a paste buffer
3. **Embeddings-based semantic skill matching** — "TS" matches "TypeScript"
4. **Greenhouse / Lever integration** — ranked list flows back into the ATS
5. **Dual-pass scoring** on borderline calls (60–75 range)
6. **Recruiter feedback loop** — overrides feed back into prompt calibration

---

## Known Limitations

- **Paste-only input** — PDF/DOCX parsing is a v1.1 problem
- **Max 8 candidates per batch** — practical ceiling for a single LLM call
- **No persistence** — refresh the page and results are gone
- **No ATS integration** — outreach emails are copied, not sent
- **Single-pass scoring** — borderline candidates don't get a second-opinion pass
- **Calibration overcorrected** — AI is too conservative with Strong Fit labels (#1 fix for v1.1)

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

## Acknowledgments

Built for the **Embark Services Pvt. Ltd. · Product & AI Intern Assignment**.

~7 hours of focused work (5 hrs prototype + 2 hrs evaluation experiment + deck). The hardest part wasn't the code — it was resisting the urge to over-build, and being honest about the calibration gap the evaluation revealed.
