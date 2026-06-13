"use client";

import { useEffect, useState } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { loadUser, saveUser, emptyUser, type UserData } from "@/lib/store";

export default function Dashboard() {
  const { primaryWallet, handleLogOut } = useDynamicContext();
  const address = primaryWallet?.address ?? "";

  const [data, setData] = useState<UserData>(emptyUser());
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState("");

  // Load this wallet's data once we know the address.
  useEffect(() => {
    if (!address) return;
    const u = loadUser(address);
    setData(u);
    setDraft(u.northStar);
    setLoaded(true);
  }, [address]);

  function saveNorthStar() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const next = { ...data, northStar: trimmed };
    setData(next);
    saveUser(address, next);
  }

  if (!loaded) {
    return <p className="text-sm text-neutral-500">Loading your journey…</p>;
  }

  // No north star yet → ask for it.
  if (!data.northStar) {
    return (
      <div className="w-full flex flex-col gap-4 text-left">
        <h2 className="text-xl font-medium text-center">
          What's your north star?
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
          The one big goal you're moving toward. Be specific — this is what
          every daily question will pull you back to.
        </p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="e.g. Launch my SaaS and reach $10k MRR within a year"
          className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent p-3 text-base outline-none focus:border-black/30 dark:focus:border-white/30"
        />
        <button
          onClick={saveNorthStar}
          disabled={!draft.trim()}
          className="self-center rounded-full bg-foreground text-background px-6 py-2.5 text-sm font-medium disabled:opacity-40 transition-opacity"
        >
          Set my north star →
        </button>
      </div>
    );
  }

  // North star is set → placeholder for block 2 (daily question loop).
  return (
    <div className="w-full flex flex-col gap-6 text-left">
      <div className="rounded-xl border border-black/10 dark:border-white/15 p-5">
        <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
          Your north star
        </p>
        <p className="text-lg font-medium">{data.northStar}</p>
      </div>

      <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
        ✅ North star set. Your daily question loop comes next.
      </p>

      <div className="flex items-center justify-center gap-4 text-xs text-neutral-400">
        <span className="font-mono">
          {address.slice(0, 6)}…{address.slice(-4)}
        </span>
        <button onClick={handleLogOut} className="underline hover:text-neutral-600">
          Log out
        </button>
      </div>
    </div>
  );
}
