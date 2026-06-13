"use client";

import { useState } from "react";
import { useIsLoggedIn, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import Dashboard from "@/components/Dashboard";
import { setPendingNorthStar } from "@/lib/store";

const EXAMPLE_NORTH_STARS = [
  "Launch my SaaS and reach $10k MRR within a year",
  "Quit my job and go full-time on my own product",
  "Ship something 1,000 people genuinely love",
  "Grow my newsletter to 50k engaged readers",
  "Raise a pre-seed round for my climate startup",
];

export default function Home() {
  const isLoggedIn = useIsLoggedIn();
  const { setShowAuthFlow } = useDynamicContext();
  const [draft, setDraft] = useState("");

  // Once logged in, the dashboard takes over (and claims any pending draft).
  if (isLoggedIn) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl flex flex-col items-center text-center gap-8">
          <Dashboard />
        </div>
      </main>
    );
  }

  function commitAndLogin() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setPendingNorthStar(trimmed); // claimed by Dashboard after login
    setShowAuthFlow(true); // open Dynamic login (email — no seed phrase)
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl flex flex-col items-center text-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <span className="text-5xl" aria-hidden>
            🌟
          </span>
          <h1 className="text-4xl font-semibold tracking-tight">Northstar</h1>
          <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-md">
            Your daily companion toward the one goal that matters. Start by
            naming your north star.
          </p>
        </div>

        {/* Type your north star first — login comes only when you save. */}
        <div className="w-full flex flex-col gap-3 text-left">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="What's the one big goal you're moving toward?"
            className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent p-4 text-base outline-none focus:border-black/30 dark:focus:border-white/30"
          />
          <button
            onClick={commitAndLogin}
            disabled={!draft.trim()}
            className="self-stretch rounded-full bg-foreground text-background px-6 py-3 text-base font-medium disabled:opacity-40 transition-opacity"
          >
            Set my north star →
          </button>
          <p className="text-xs text-neutral-400 text-center">
            We&apos;ll ask for your email to save it — no seed phrase, no
            wallet to install.
          </p>
        </div>

        {/* Example north stars for inspiration — tap to use. */}
        <div className="w-full flex flex-col gap-2 text-left">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Need inspiration? Tap one
          </p>
          <div className="flex flex-col gap-2">
            {EXAMPLE_NORTH_STARS.map((ex) => (
              <button
                key={ex}
                onClick={() => setDraft(ex)}
                className="text-left rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 text-sm hover:border-black/30 dark:hover:border-white/30 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
