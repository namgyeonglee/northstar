# 🌟 Northstar

**A daily AI companion that keeps founders pointed at their North Star, and a community that backs them with real support.**

> Built at ETH Global New York 2026. Live: **https://whatisyournorthstar.vercel.app**

---

## The problem

Founders carry a big dream, their *North Star*. But the daily noise buries it, and the journey is lonely. There's no companion asking, every day, "did you move toward it?", and no easy way for people who believe in you to actually back you.

## What Northstar does

1. **Name your North Star.** The one goal that matters. (Log in with email, no seed phrase.)
2. **Answer one AI question a day.** Claude asks a short, pointed question tailored to your goal and your whole history of answers, then encourages you. Reflections accumulate into a growing **constellation** (7 stars per constellation; complete one and a new one begins) and a **"My Universe"** view of your journey.
3. **Join the community feed.** Every founder's North Star, how diligently they reflect (their stars), what they're building, and the problem they're facing right now. New founders get a 🌱 badge.
4. **Back a founder with USDC.** Send any founder USDC on **Arc** (Circle's stablecoin L1) plus a message of encouragement or an offer to help. Support shows up on their feed. The daily reflection is the heart; backing is how the community rallies around it.

## Why on-chain?

Support that crosses borders instantly, in stablecoin, with no middleman, is something only crypto makes easy. A founder in any country can be backed by anyone, in seconds, in USDC.

## Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript + Tailwind
- **Auth / wallet**: Dynamic embedded wallets (email login, no seed phrase)
- **AI**: Anthropic Claude (`claude-opus-4-8`) for daily questions, encouragement, and trajectory analysis, fed the founder's full reflection history
- **Payments**: USDC on **Arc Testnet** (Circle L1). Donations use the ERC-20 USDC interface; new wallets are auto-funded with gas + USDC so onboarding is frictionless
- **Storage**: Upstash Redis (single source of truth, so the same email sees the same data on any device)
- **Also**: an optional on-chain "promise to your future self" sealed on Base Sepolia + IPFS, and an ENS identity (`northstar.eth`)

## Sponsor tracks

- **Dynamic — Best Money App**: embedded-wallet onboarding + peer-to-peer USDC backing of founders
- **Arc (Circle) — Extend the Arc Ecosystem**: USDC donations settled on Arc, with auto gas/USDC onboarding

## Demo flow (≈3 min)

1. Land on the page, type your North Star, log in with email.
2. Answer today's AI question, get encouragement, watch a star light up.
3. Open **"See the community"**, view other founders, their products, and the problems they're facing.
4. **Back a founder with 1 USDC** + a message. See it confirmed on Arc and appear on their feed.
5. (Bonus) Seal a promise to your future self on-chain.

## Run locally

```bash
npm install
# .env.local needs: NEXT_PUBLIC_DYNAMIC_ENV_ID, NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
# NEXT_PUBLIC_PROMISES_CONTRACT, NEXT_PUBLIC_ENS_NAME, ANTHROPIC_API_KEY,
# FAUCET_PRIVATE_KEY, BASE_SEPOLIA_RPC, KV_REST_API_URL, KV_REST_API_TOKEN
npm run dev
```

## Status

✅ Built solo at ETH Global NY 2026. See the commit history for the block-by-block build.
