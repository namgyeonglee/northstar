# 🌟 Northstar

**A daily AI companion that keeps founders moving toward their north star — and lets them seal a promise to their future self, on-chain.**

> Built at ETH Global New York 2025.

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

## Status

🚧 Built in 1 day, solo. See commit history for the block-by-block build.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
