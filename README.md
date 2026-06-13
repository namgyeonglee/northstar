# 🌟 Northstar

**A daily AI companion that keeps founders moving toward their north star — and lets them seal a promise to their future self, on-chain.**

> Built at ETH Global New York 2026.

---

## The problem

Founders and side-project builders carry a big dream — their *north star*. But daily noise buries it. There's no companion asking, every single day: *"Did you move toward it today?"*

Goals don't fail from lack of ambition. They fail from lack of a daily, honest check-in.

## What Northstar does

1. **Set your north star** — your one big goal.
2. **Answer one question a day** — the AI asks a short, pointed question that pulls you toward your north star. You answer briefly.
3. **See your trajectory** — answers accumulate; the AI shows you where you are on the path.
4. **Seal a promise to your future self — on-chain** — write a promise to who you want to be in 1 year. It's sealed as a tamper-proof, self-owned time capsule. Even if this app disappears, your promise and your journey live forever in your own wallet.

## Why on-chain?

The most personal data you own — your dreams, your honest daily reflections, your promise to your future self — shouldn't live on a platform that can vanish or change the terms. Northstar makes that promise **tamper-proof, timestamped, and owned by you**, not us.

## Stack

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind
- **Auth / Wallet**: Dynamic (email/social embedded wallet — frictionless daily login, no seed phrase)
- **AI**: LLM-generated daily questions + trajectory analysis
- **Contract**: `sealPromise(uri, unlockTime)` on **Base Sepolia**
- **Storage**: IPFS (promise content) → URI sealed on-chain

## Sponsor tracks

- **Dynamic** — AI + Consumer (embedded wallet onboarding)
- **ENS** — future-self identity *(stretch)*

## Live on-chain

- **Contract** (`NorthstarPromises`) on **Base Sepolia**:
  [`0xB30cAf465a6d944F90C4C131803541bcE235B926`](https://sepolia.basescan.org/address/0xB30cAf465a6d944F90C4C131803541bcE235B926)
- Promise content lives on **IPFS**; only the URI + unlock time are sealed on-chain.

## Demo flow (≈3 min)

1. **Sign in** with email — Dynamic embedded wallet, no seed phrase.
2. **Set your north star** — the one big goal.
3. **Answer today's question** — AI-generated, specific to your goal; watch reflections accumulate.
4. **"Where am I?"** — AI reads your trajectory and tells you where you are on the path.
5. **Seal a promise to your future self** — write it → uploaded to IPFS → `sealPromise()` signed in your embedded wallet → confirmed on BaseScan. Tamper-proof, owned by you.

## Run locally

```bash
npm install
# .env.local needs: NEXT_PUBLIC_DYNAMIC_ENV_ID, NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
# NEXT_PUBLIC_PROMISES_CONTRACT, and (optional) ANTHROPIC_API_KEY for live AI.
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without `ANTHROPIC_API_KEY` the
daily question and trajectory fall back to built-in prompts, so the full flow still demos.

## Status

✅ Built in 1 day, solo, at ETH Global NY 2026. Block-by-block in the commit history:
login → daily AI question → trajectory → contract → on-chain promise.
