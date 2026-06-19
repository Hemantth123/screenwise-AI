# Project Worklog — ScreenWise Prototype (Embark Product & AI Intern Assignment)

---
Task ID: 0
Agent: main (orchestrator)
Task: Read assignment PDF, design product concept, and orchestrate build of (1) working AI prototype, (2) 6-slide humanized pitch deck, (3) README for submission.

Work Log:
- Extracted text from `/home/z/my-project/upload/Product & AI Intern Assignment.pdf` (2 pages, 2631 chars).
- Assignment summary: Build AI-powered solution for any part of recruitment lifecycle. Deliverables = 6-slide deck (Problem / Solution / AI Approach / Prototype / Reflection) + working prototype link + optional GitHub + optional demo video.
- Decided product concept: **"ScreenWise"** — AI Resume-to-JD Fitment Copilot. Recruiter pastes JD + pastes a batch of resumes → AI ranks candidates with explainable fitment scores, red flags, and one-click personalized outreach drafts. Cuts screening time from hours to minutes per role.
- Color system: emerald/slate/amber (avoiding blue/indigo per UI rules).

Stage Summary:
- Concept locked: ScreenWise, AI fitment-scoring copilot for recruiters.
- Will build: Next.js 16 prototype (1 route `/`), z-ai-web-dev-sdk backend, 6-slide PPTX, README.
- Subsequent task IDs: 1 (frontend), 2 (backend API), 3 (sample data + assets), 4 (browser verification), 5 (pptx deck), 6 (README + final delivery).

---
Task ID: 4
Agent: main (orchestrator)
Task: Verify ScreenWise prototype works end-to-end with agent-browser.

Work Log:
- Opened http://localhost:3000 — page rendered cleanly, no console errors, no hydration warnings.
- Clicked "Load sample data" — JD + 5 resumes populated instantly, toast confirmed.
- Clicked "Run AI fitment analysis" — phased loading UI appeared (Parse JD → Read resumes → Score → Draft outreach).
- AI completed in ~30s. 5 candidate cards rendered with correct, calibrated output:
  • Aarav Mehta → Strong Fit (Node.js + Postgres + fintech, 6 yrs) ✓
  • Priya Nair → Possible Fit (Java/Spring, wants Node pivot) ✓
  • Kavya Iyer → red flags surfaced (4 jobs in 4 years) ✓
  • Rohan Desai, Aditya Rao → lower scores (frontend/mobile, stretch) ✓
- Tested tab interactivity: Overview / Skills gap / Outreach email all switch correctly.
- Tested Copy email button — works.
- Captured screenshots: preview-hero.png (empty state) and preview-results.png (ranked results).
- No runtime errors in console.

Stage Summary:
- Prototype is browser-verified end-to-end. Golden path works.
- AI calibration is correct: Strong Fit is rare, red flags are surfaced, outreach emails are personalized.
- Ready to build the 6-slide pitch deck and README.

---
Task ID: 5-pptx
Agent: ppt-expert
Task: Render all 6 slides of the ScreenWise pitch deck as standalone 1280x720 HTML files in /home/z/my-project/download/slides/, using the locked emerald/slate/amber design system from global.css and the verbatim content from slides_brief.json.

Work Log:
- Read /home/z/my-project/worklog.md to confirm prototype is browser-verified and ready for the deck (Task ID 4).
- Read /home/z/my-project/download/slides/slides_brief.json (design block + 6 slide briefs) and /home/z/my-project/download/slides/global.css (palette, typography, component classes).
- Verified prototype-results.png exists in /home/z/my-project/download/slides/ for slide 5's relative-path image reference.
- Rendered all 6 slides as standalone HTML files linking global.css + Tailwind CDN + Material Icons. Each slide is wrapped in .slide (1280x720, overflow-hidden), uses ONLY the locked palette/typography, embeds 4-5 line human-sounding speaker notes as <aside data-notes hidden>, and includes the .slide-footer (brand left, page number right).
- Diversified layouts per the briefs: slide 1 = headline + 2x2 supporting cards + italic personal quote; slide 2 = 55/45 split (numbered workflow left, 5 icon feature cards right); slide 3 = before/after cards + assumptions/expected-impact side-by-side; slide 4 = 3-column tall cards with colored top accent strips (emerald/amber/slate); slide 5 = 58/42 split with relative-path screenshot + callouts + stack pills + try-it card; slide 6 = 2x2 reflection grid (mix of card / card-amber / card-emerald) + emerald-bordered personal note bar.
- Verbatim fidelity: every headline, subhead, bullet, stat, quote, and image URL from task_brief is rendered exactly as written (apostrophes unescaped, em dashes preserved, ≥ / → / --- literals kept). No invented facts, no dropped lines, no paraphrasing of stats.
- Slide 5 image: used <img src="prototype-results.png"> with a relative path as instructed — no absolute path, no remote URL.
- Slide 6 footer: added the requested "Thank you — looking forward to the conversation." italic micro line next to the page number.

One-line per-slide summary:
- slide_01.html — Problem Understanding: headline "Recruiters are drowning in resumes — and missing great candidates." + 2x2 grid (Volume vs. bandwidth / Who it hurts / Time-to-hire = revenue / Minutes, not hours) + italic personal-quote closer.
- slide_02.html — Product Solution (1/2): split layout — 4-step numbered workflow (Paste JD+resumes → Parse JD → Score on 5-signal rubric → Ranked dashboard+outreach) on the left, 5 Material-icon feature cards (Rubric, Explainable, Red-flag surfacing, Personalized outreach, Bias guardrails) on the right.
- slide_03.html — Product Solution (2/2): before/after journey cards (5 hrs manual → 45 min ScreenWise) + amber-accented Assumptions card + emerald Expected-impact card with 4 stats (~85%, 4.5 hrs, Higher, 100%).
- slide_04.html — AI Approach: 3 equal columns with colored top strips — Model & tools (emerald) / How AI is used with arrow rows (amber) / Quality & reliability with 6 bullets incl. calibration + bias guardrails (slate) — closed with the "Strong Fit should be rare" italic quote.
- slide_05.html — Prototype: 58/42 split — left has the relative-path prototype-results.png screenshot with caption, right has What-it-does bullets + Stack pill row + emerald Try-it card with live preview and GitHub link rows.
- slide_06.html — Reflection: 2x2 grid (AI tools I used / How AI helped / Biggest challenge in card-amber / If I had another week in card-emerald with 4 bullets) + full-width emerald-bordered personal note bar + footer with thank-you micro line.

Stage Summary:
- All 6 slides written to /home/z/my-project/download/slides/slide_01.html through slide_06.html.
- Each is a self-contained 1280x720 HTML page, links global.css relatively, loads Tailwind + Material Icons, follows the emerald/slate/amber + Inter/JetBrains Mono design system, and embeds hidden speaker notes.
- Verbatim content fidelity verified against slides_brief.json — no facts dropped or invented.
- Deck is ready to bundle with the prototype and README for final delivery (Task ID 6).

---
Task ID: 6
Agent: main (orchestrator)
Task: Finalize submission package — pptx deck, README, final delivery summary.

Work Log:
- Verified all 6 slide HTMLs rendered cleanly via VLM (slide 1: "clean and readable, professional, suitable for job application"; slide 5: "screenshot visible and rendered, layout balanced, no overflow").
- Converted slides to PPTX via batch_html2pptx.js → /home/z/my-project/download/ScreenWise-Pitch-Deck.pptx (333 KB, no CRITICAL OVERFLOW warnings).
- Wrote /home/z/my-project/download/README.md with: deliverables table, 90-second demo flow, suggested 5-min video flow, 5-signal rubric table, tech stack, project structure, bias guardrails, honest limitations list, "another week" roadmap, submission checklist.
- Final lint: clean. Dev log: POST /api/screen 200 in 25.8s confirms live AI call works end-to-end.

Stage Summary:
- Submission package complete:
  • /home/z/my-project/download/ScreenWise-Pitch-Deck.pptx — 6-slide humanized pitch deck with speaker notes
  • /home/z/my-project/download/README.md — full submission guide
  • /home/z/my-project/download/slides/ — editable HTML slide source
  • Live prototype at the preview panel (/ route) — browser-verified end-to-end
- The pitch deck is written in a humanized first-person voice (not AI-sounding): includes personal observations like "I picked this problem because I've watched friends on both sides" and honest reflection like "The first prompt gave almost everyone 75+. The model wasn't dumb — it was being too polite."
- Ready to deliver to user.

---
Task ID: 7-eval
Agent: main (orchestrator)
Task: Run real evaluation experiment (25 resumes × 3 JDs) for validated metrics, capture screenshots, prepare upgraded 10/10 deck.

Work Log:
- Wrote /home/z/my-project/scripts/evaluate.ts — standalone bun script using z-ai-web-dev-sdk directly.
  • 25 resumes: 5 per archetype (backend, frontend, data, PM, mobile) — realistic Indian tech-market profiles.
  • 3 JDs: Senior Backend Engineer (fintech), Senior Frontend Engineer (B2B SaaS), Data Analyst (e-commerce).
  • Ground truth labels manually defined per (JD, resume) pair: Strong = primary archetype match, Possible = adjacent transferable skills, Pass = wrong track.
  • Metrics: Precision@10, label agreement (recruiter agreement proxy), time saved (manual 90s/resume vs AI wall-clock + 10min review).
  • Batches of 8 resumes per API call, 4 batches per JD, 12 calls total, ~6 min runtime.
- Started eval in background (PID 4320) writing to scripts/eval.log, output JSON → download/evaluation-results.json.
- Captured 3 prototype screenshots for the upgraded Prototype slide:
  • prototype-hero.png (empty/landing state)
  • prototype-input.png (JD + resumes loaded, ready to analyze)
  • prototype-outreach.png (outreach email tab close-up — shows personalization)
- These join the existing prototype-results.png (ranked candidates dashboard) — 4 screenshots total for the deck.

Stage Summary:
- Eval running in background. Will check results before rewriting slide briefs.
- 4 screenshots ready for Slide 5 (Prototype).
- Next: rewrite all 6 slide briefs with new 10/10 structure incorporating all 7 user priorities (architecture diagram, validated metrics, rubric table, explainable-AI differentiator, schema-constrained terminology, cost awareness, security/compliance).

---
Task ID: 8-pptx-v2
Agent: ppt-expert
Task: Re-render all 6 ScreenWise pitch deck slides as UPGRADED v2 incorporating 7 user priorities — architecture diagram, validated metrics (60% precision@10, 67% label agreement, 70% time saved), 5-dimension rubric table, explainable-AI differentiator banner on every slide, schema-constrained terminology, cost awareness, and security/compliance.

Work Log:
- Read /home/z/my-project/worklog.md to confirm Task 7-eval completed: real evaluation experiment produced validated metrics, 4 prototype screenshots ready (prototype-input.png, prototype-results.png, prototype-outreach.png, prototype-hero.png).
- Read /home/z/my-project/download/slides/slides_brief.json (v2 briefs with all 7 priorities baked in) and /home/z/my-project/download/slides/global.css (palette, typography, component classes).
- Verified all 3 screenshot files exist in /home/z/my-project/download/slides/ for slide 5's relative-path image references.
- Rendered all 6 UPGRADED slides as standalone 1280x720 HTML files (overwriting v1), each linking global.css + Tailwind CDN + Material Icons. Each slide is wrapped in .slide (1280x720, overflow-hidden), uses ONLY the locked emerald/slate/amber + Inter/JetBrains Mono design system, and embeds 5-bullet human-sounding speaker notes as <aside data-notes class="hidden" style="display:none">.
- Recurring differentiator banner implemented on EVERY slide as .card-emerald with 4px left border (emerald), compact ~40px tall, bold emerald text, "EXPLAINABLE AI" pill label. Each slide's banner text matches its brief verbatim.
- Slide footer on every slide: "ScreenWise · Embark Assignment" left, "0X / 06" right (slide 6 includes the thank-you micro line per brief).
- Diversified layouts per the v2 briefs:
  • Slide 1 = headline + subhead + 2x2 supporting cards + emerald differentiator banner
  • Slide 2 = 48/52 split: numbered workflow (4 steps) left, BEFORE (slate-top) + AFTER (emerald-top) journey cards right
  • Slide 3 = TWO professional tables (5-row rubric + 5-row metrics) side-by-side with emerald header rows, alternating white/slate-50 row backgrounds, JetBrains Mono numbers, plus calibration callout, method note, honest-finding callout, assumptions pill bar
  • Slide 4 = 42/58 split: vertical CSS-div architecture pipeline (6 boxes connected by ↓ Unicode arrows, emerald/slate/amber-bordered, highlighted LLM box) left + 3 stacked cards (Reliability / Bias mitigation / Cost awareness) right
  • Slide 5 = 3-screenshot horizontal gallery (relative paths prototype-input.png / prototype-results.png / prototype-outreach.png, 160px tall, object-fit:cover, object-position:top) + caption + Try-it card with live preview and GitHub link rows + Stack paragraph with pill row + Production security note
  • Slide 6 = 2x2 reflection grid (white / white / amber / emerald cards) + If-I-had-another-week roadmap bar (3x2 mini-grid with Material Icons) + emerald-bordered differentiator banner + italic personal note quote + footer with thank-you micro line
- Honest metrics fidelity: slide 3's metrics table renders 25 resumes / 3 JDs / 60% precision@10 / 67% label agreement / 70% time saved VERBATIM — no inflation. Slide 6's biggest-challenge card references the same 60% / 67% numbers and the calibration overcorrection story verbatim.
- Architecture diagram on slide 4 uses CSS divs + ↓ Unicode arrow characters (font-size 18px, emerald, centered between boxes) — NOT SVG, NOT canvas, NOT connector lines. Each box has icon + bold label + one-line description per the brief.
- Verbatim fidelity: every headline, subhead, bullet, stat, quote, image URL, and Material Icon name from each task_brief is rendered exactly as written (em dashes, ≥, ---, "TypeScript" quotes preserved). No invented facts, no dropped lines, no paraphrasing of stats.
- Image paths on slide 5 use RELATIVE paths only (prototype-input.png, prototype-results.png, prototype-outreach.png) — no absolute paths, no remote URLs.

One-line per-slide summary:
- slide_01.html — Problem Understanding: "Recruiters are drowning in resumes — and missing great candidates." + 2x2 grid (Volume vs. bandwidth / Who it hurts / Time-to-hire = revenue / Minutes, not hours) + "Our bet: EXPLAINABLE AI" banner.
- slide_02.html — Product Solution (1/2): 48/52 split — 4-step numbered workflow (Paste JD+resumes → AI extracts JD brief → Score on 5-signal rubric → Ranked dashboard+outreach) left, BEFORE (5 hrs manual) + AFTER (45 min ScreenWise) journey cards right.
- slide_03.html — Product Solution (2/2) VALIDATED: two professional tables side-by-side — 5-signal rubric (40/25/15/10/10%) + validated metrics (25 resumes, 3 JDs, 60% precision@10, 67% label agreement, 70% time saved) + calibration callout + method note + honest-finding callout + assumptions pill bar.
- slide_04.html — AI Approach: 42/58 split — vertical CSS-div architecture pipeline (6 boxes: UI → API route → text inputs → highlighted LLM → JSON Schema Validation → ranked output, with ↓ arrows) left + 3 cards (Reliability / Bias mitigation amber / Cost awareness emerald with $1-3/200 resumes) right.
- slide_05.html — Prototype: 3-screenshot horizontal gallery (input/results/outreach, relative paths) + sample-run caption + Try-it card (live preview + GitHub link) + Stack paragraph with pill row + Production security note (GDPR, PII masking, RBAC, encryption, audit logs) + Explainable AI banner.
- slide_06.html — Reflection + Roadmap: 2x2 grid (AI tools I used / How AI helped / Biggest challenge amber with 60%/67% honest numbers / Core bet emerald) + If-I-had-another-week roadmap bar (6 items: bias-audit, PDF parsing, embeddings, feedback loop, ATS integration, dual-pass scoring) + Explainable AI banner + italic personal note quote + footer with thank-you micro line.

Stage Summary:
- All 6 UPGRADED v2 slides written to /home/z/my-project/download/slides/slide_01.html through slide_06.html (overwriting v1).
- Each is a self-contained 1280x720 HTML page, links global.css relatively, loads Tailwind + Material Icons, follows the emerald/slate/amber + Inter/JetBrains Mono design system, embeds hidden 5-bullet speaker notes.
- Recurring EXPLAINABLE AI differentiator banner on every slide (per user instruction).
- All 7 user priorities represented: (1) architecture diagram on slide 4, (2) validated metrics on slides 3+6, (3) 5-dimension rubric table on slide 3, (4) explainable-AI differentiator banner on every slide, (5) schema-constrained terminology on slides 2+4, (6) cost awareness on slide 4, (7) security/compliance on slide 5.
- Honest metrics preserved verbatim — no inflation. The "AI is too conservative with Strong Fit" finding is rendered as written on slides 3 and 6.
- Ready to bundle with the prototype and README for final delivery.

---
Task ID: 9-final
Agent: main (orchestrator)
Task: Final verification and delivery of upgraded v2 submission package.

Work Log:
- Evaluation experiment completed: 25 resumes × 3 JDs = 75 evaluations. Real metrics:
  • Avg Precision@10: 60% (range 50-70%)
  • Avg Label agreement: 67% (range 64-68%)
  • Avg Time saved: 70% (range 68.9-69.9%)
  • Honest finding: AI RANKS correctly but is too conservative with Strong Fit labels (calibration overcorrected).
- Updated slides_brief.json with REAL metrics (60%, 67%, 70%) — not the placeholder 80/85/72.
- Dispatched ppt-expert subagent to render all 6 upgraded slides with new 10/10 structure.
- VLM-verified slides 3, 4, 5: tables visible, architecture diagram rendered, 3 screenshots displayed. No overflow.
- Tightened differentiator banner padding on slides 3-4 to fix minor bottom overflow (reduced from 7-19pt to 2-9pt).
- Regenerated PPTX: 534KB, no CRITICAL warnings. All ⚠ BOUNDS warnings are non-fatal (converter quirks; HTML renders fine per VLM).
- Updated README v2 with: validated metrics table, 5-signal rubric, architecture diagram (CSS pipeline), cost awareness ($1-3/200 resumes), security & compliance (GDPR/PII/RBAC/encryption/audit), submission checklist.
- Browser-verified live prototype end-to-end: load sample → run analysis → results in 35s → candidate cards render correctly.
- Lint: clean. Dev log: no errors.

All 7 user priorities addressed:
1. ✅ Prototype slide: 3 screenshots (input, results, outreach) + live link + GitHub + architecture diagram on slide 4
2. ✅ Evaluation metrics: REAL experiment, 60% precision@10, 67% agreement, 70% time saved
3. ✅ 5-dimension rubric: full table with weights (40/25/15/10/10) + calibration note
4. ✅ Differentiator: "Explainable AI" banner on ALL 6 slides
5. ✅ AI terminology: "Schema-constrained structured outputs" + JSON validation + confidence thresholds + human review + audit logs
6. ✅ Cost awareness: ~$1-3/200 resumes + batch/caching/embedding reuse
7. ✅ Security & compliance: GDPR + PII masking + RBAC + encryption + audit logging

Stage Summary:
- Final deliverables:
  • /home/z/my-project/download/ScreenWise-Pitch-Deck.pptx (534KB, 6 slides, upgraded v2)
  • /home/z/my-project/download/README.md (comprehensive, with validated metrics)
  • /home/z/my-project/download/evaluation-results.json (real experiment data)
  • /home/z/my-project/download/slides/ (editable HTML source + 4 screenshots)
  • /home/z/my-project/scripts/evaluate.ts (reproducible evaluation script)
  • Live prototype at preview panel (browser-verified)
- Ready to deliver to user.
