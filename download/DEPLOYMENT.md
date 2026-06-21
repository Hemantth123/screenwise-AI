# ScreenWise — Vercel Deployment Guide

Deploy the ScreenWise prototype to Vercel in under 5 minutes. Two options below — pick whichever you prefer.

---

## Option A: GitHub → Vercel Import (Recommended)

This is the easiest flow and gives you auto-deploy on every git push.

### Step 1 — Push to GitHub

```bash
cd /home/z/my-project

# Add your GitHub remote (create an empty repo on GitHub first)
git remote add origin https://github.com/YOUR_USERNAME/screenwise.git

# Push
git push -u origin main
```

### Step 2 — Import on Vercel

1. Go to **[vercel.com/new](https://vercel.com/new)**
2. Click **"Import Git Repository"** → select your `screenwise` repo
3. Vercel auto-detects Next.js — no build settings needed
4. **Before clicking Deploy**, expand **"Environment Variables"** and add these 5:

| Name | Value |
|---|---|
| `ZAI_API_KEY` | `Z.ai` |
| `ZAI_BASE_URL` | `https://internal-api.z.ai/v1` |
| `ZAI_CHAT_ID` | `chat-c4be1044-5b2b-46c0-bb80-8cb1520dc0dc` |
| `ZAI_USER_ID` | `f8ea6546-e06c-4a1b-9632-00910d95c1a9` |
| `ZAI_TOKEN` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZjhlYTY1NDYtZTA2Yy00YTFiLTk2MzItMDA5MTBkOTVjMWE5IiwiY2hhdF9pZCI6ImNoYXQtYzRiZTEwNDQtNWIyYi00NmMwLWJiODAtOGNiMTUyMGRjMGRjIiwicGxhdGZvcm0iOiJ6YWkifQ.laAYH_O3bgw-yc20UJgDg4LPOsc6Yu3Giiy-CQ1d75M` |

5. Click **"Deploy"** — Vercel builds and deploys in ~2 minutes
6. You'll get a URL like `screenwise-xxx.vercel.app` — that's your live prototype link

### Step 3 — Verify

Open the Vercel URL → click "Load sample data" → click "Run AI fitment analysis" → ranked candidates should appear in ~30 seconds.

---

## Option B: Vercel CLI (if you prefer the terminal)

### Step 1 — Get a Vercel token

1. Go to **[vercel.com/account/tokens](https://vercel.com/account/tokens)**
2. Click **"Create Token"** → name it `screenwise-deploy` → copy the token

### Step 2 — Deploy from this project

```bash
cd /home/z/my-project

# Deploy (will prompt for project name + scope)
vercel --prod

# When prompted:
#   - Set up and deploy? → Y
#   - Project name? → screenwise
#   - Framework? → Next.js (auto-detected)
#   - Build command? → (leave default)
#   - Output directory? → (leave default)
#   - Install command? → (leave default)
```

### Step 3 — Add environment variables

```bash
# Add env vars via CLI (run each line)
vercel env add ZAI_API_KEY production
#   → paste: Z.ai

vercel env add ZAI_BASE_URL production
#   → paste: https://internal-api.z.ai/v1

vercel env add ZAI_CHAT_ID production
#   → paste: chat-c4be1044-5b2b-46c0-bb80-8cb1520dc0dc

vercel env add ZAI_USER_ID production
#   → paste: f8ea6546-e06c-4a1b-9632-00910d95c1a9

vercel env add ZAI_TOKEN production
#   → paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (full JWT from above)

# Redeploy with env vars
vercel --prod
```

### Step 4 — Verify

Open the deployment URL → test with sample data.

---

## Important notes

### About the ZAI credentials

The env vars above use **session-scoped credentials** tied to the Z.ai sandbox where this prototype was built. They should work for the duration of your assignment review (2+ days). If the API stops responding (you'll get 500 errors on `/api/screen`), the session has expired — reach out and I can regenerate them.

For a **permanent deployment**, you'd replace the ZAI SDK with a standard LLM provider:
- OpenAI: `OPENAI_API_KEY` + the `openai` npm package
- Anthropic: `ANTHROPIC_API_KEY` + the `@anthropic-ai/sdk` package

The API route at `src/app/api/screen/route.ts` is structured to make this swap easy — just replace the `createZAIClient()` function and the `zai.chat.completions.create()` call.

### Vercel plan limits

- **Hobby (free) plan**: 60-second function timeout — sufficient for this prototype (AI calls take ~30s)
- **Pro plan**: 300-second timeout — needed if you scale to 8+ resumes per batch
- The `vercel.json` file sets `maxDuration: 60` for the `/api/screen` route

### Build configuration

Vercel auto-detects Next.js 16 and runs `next build`. No custom build settings needed. The `vercel.json` file is included for the function timeout configuration only.

---

## After deployment

1. **Update slide 5** of the pitch deck with your live Vercel URL (replace `github.com/screenwise-ai/screenwise` with your actual URLs)
2. **Update the README** submission checklist — mark "Live prototype works" as done with the Vercel URL
3. **Test the deployment** before sharing with Embark — load sample data, run analysis, verify ranked candidates appear
