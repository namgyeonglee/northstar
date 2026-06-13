"use client";

import { useState } from "react";

const EXAMPLE_NORTH_STARS = [
  "Launch my SaaS and reach $10k MRR within a year",
  "Quit my job and go full-time on my own product",
  "Ship something 1,000 people genuinely love",
  "Grow my newsletter to 50k engaged readers",
  "Raise a pre-seed round for my climate startup",
];

type Props = {
  // Called with the entered North Star when the user commits.
  onCommit: (northStar: string) => void;
  // Optional "Already started? Log in" affordance (landing only).
  onLogin?: () => void;
  // Footnote under the button (e.g. the email/no-seed-phrase note).
  footnote?: string;
};

export default function NorthStarInput({ onCommit, onLogin, footnote }: Props) {
  const [draft, setDraft] = useState("");

  return (
    <div className="w-full max-w-xl flex flex-col items-center text-center gap-8">
      <div className="flex flex-col items-center gap-4">
        <span className="text-6xl" aria-hidden>
          🌟
        </span>
        <h1 className="text-5xl font-semibold tracking-tight">Northstar</h1>
        <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-md">
          A daily companion toward the one goal that matters. Name your North
          Star, answer a question a day, and watch yourself get closer.
        </p>
        {onLogin && (
          <p className="text-sm text-neutral-400">
            Already started?{" "}
            <button
              onClick={onLogin}
              className="underline font-medium text-foreground/80 hover:text-foreground"
            >
              Log in
            </button>
          </p>
        )}
      </div>

      <div className="w-full flex flex-col gap-3 text-left">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="What's the one big goal you're moving toward?"
          className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent p-4 text-base outline-none focus:border-black/30 dark:focus:border-white/30"
        />
        <button
          onClick={() => {
            const t = draft.trim();
            if (t) onCommit(t);
          }}
          disabled={!draft.trim()}
          className="self-stretch rounded-full bg-foreground text-background px-6 py-3 text-base font-medium disabled:opacity-40 transition-opacity"
        >
          Set my North Star →
        </button>
        {footnote && (
          <p className="text-xs text-neutral-400 text-center">{footnote}</p>
        )}
      </div>

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
  );
}
