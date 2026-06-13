"use client";

import { useEffect, useState } from "react";
import { readEnsIdentity, ENS_NAME, type EnsIdentity } from "@/lib/ens";

// Shows Northstar's ENS identity, read live from Sepolia (no hard-coded
// values). The promise text lives inside the ENS name's records, so a
// sealed promise is tied to a human-readable on-chain identity.
export default function EnsBadge() {
  const [ens, setEns] = useState<EnsIdentity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ENS_NAME) {
      setLoading(false);
      return;
    }
    readEnsIdentity()
      .then(setEns)
      .finally(() => setLoading(false));
  }, []);

  if (!ENS_NAME || (!loading && !ens)) return null;

  return (
    <div className="rounded-xl border border-indigo-400/30 bg-indigo-400/5 p-4 flex flex-col gap-1.5 text-left">
      <p className="text-[11px] uppercase tracking-[0.2em] text-indigo-500/80">
        Sealed under your ENS identity
      </p>
      {loading ? (
        <p className="text-sm text-neutral-400 animate-pulse">
          Resolving {ENS_NAME}…
        </p>
      ) : (
        <>
          <p className="text-base font-medium">{ens?.name}</p>
          {ens?.promise && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 italic">
              &ldquo;{ens.promise}&rdquo;
            </p>
          )}
          <p className="text-[11px] text-neutral-400">
            Read live from ENS on-chain records.
          </p>
        </>
      )}
    </div>
  );
}
