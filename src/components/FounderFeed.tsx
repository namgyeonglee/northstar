"use client";

import { useEffect, useState } from "react";
import { isSprout, type FounderProfile } from "@/lib/profile";
import { STARS_PER_CONSTELLATION } from "@/components/Constellation";
import Donate from "@/components/Donate";

// The public community: every founder's North Star, how diligently they
// reflect, what they're building, the problem they face, and the support
// they've received. Others can back them with USDC on Arc.
type Props = {
  myAddress: string; // viewer's own address (hide their own donate button)
  onClose: () => void;
};

export default function FounderFeed({ myAddress, onClose }: Props) {
  const [founders, setFounders] = useState<FounderProfile[] | null>(null);
  const nowMs = Date.now();

  async function load() {
    try {
      const res = await fetch("/api/feed");
      const json = await res.json();
      setFounders(json.founders ?? []);
    } catch {
      setFounders([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-400">
              The Community
            </p>
            <h1 className="text-2xl font-semibold">Founders on the journey</h1>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-black/15 dark:border-white/20 px-4 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/5"
          >
            Close ✕
          </button>
        </div>

        {founders === null ? (
          <p className="text-sm text-neutral-400 animate-pulse">
            Loading the community…
          </p>
        ) : founders.length === 0 ? (
          <p className="text-sm text-neutral-400">
            No founders yet. Be the first to set your North Star.
          </p>
        ) : (
          founders.map((f) => {
            const sprout = isSprout(f.joinedAt, nowMs);
            const isMe = f.address.toLowerCase() === myAddress.toLowerCase();
            const constellations = Math.floor(
              f.starCount / STARS_PER_CONSTELLATION,
            );
            return (
              <div
                key={f.address}
                className="rounded-2xl border border-black/10 dark:border-white/15 p-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-neutral-400">
                        {f.address.slice(0, 6)}…{f.address.slice(-4)}
                      </span>
                      {sprout && (
                        <span className="text-[11px] rounded-full bg-emerald-400/15 text-emerald-600 px-2 py-0.5">
                          🌱 new
                        </span>
                      )}
                      {isMe && (
                        <span className="text-[11px] text-neutral-400">(you)</span>
                      )}
                    </div>
                    <p className="text-lg font-medium leading-snug">
                      {f.northStar}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium">⭐ {f.starCount}</p>
                    <p className="text-[11px] text-neutral-400">
                      {constellations} done
                    </p>
                  </div>
                </div>

                {f.productBlurb && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    {f.productBlurb}
                  </p>
                )}
                {f.productUrl && (
                  <a
                    href={f.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline text-indigo-600 dark:text-indigo-400 self-start break-all"
                  >
                    {f.productUrl} ↗
                  </a>
                )}
                {f.problem && (
                  <div className="rounded-lg bg-black/[0.03] dark:bg-white/[0.04] p-3">
                    <p className="text-[11px] uppercase tracking-wide text-neutral-400 mb-1">
                      Problem they&apos;re facing
                    </p>
                    <p className="text-sm">{f.problem}</p>
                  </div>
                )}

                {/* Support received */}
                {f.donations && f.donations.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[11px] uppercase tracking-wide text-neutral-400">
                      Support received
                    </p>
                    {f.donations.slice(0, 3).map((d, i) => (
                      <p key={i} className="text-sm">
                        <span className="font-medium text-emerald-600">
                          {d.amount} USDC
                        </span>{" "}
                        from {d.anonymous ? "anonymous" : d.from}
                        {d.message && (
                          <span className="text-neutral-500">
                            {" "}
                            — &ldquo;{d.message}&rdquo;
                          </span>
                        )}
                      </p>
                    ))}
                  </div>
                )}

                {/* Donate (not to yourself) */}
                {!isMe && (
                  <Donate
                    founderName={`${f.address.slice(0, 6)}…`}
                    founderAddress={f.address as `0x${string}`}
                    onDonated={async ({ amount, txHash, message }) => {
                      await fetch("/api/donate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          to: f.address,
                          from: `${myAddress.slice(0, 6)}…`,
                          amount,
                          message,
                          txHash,
                          anonymous: false,
                        }),
                      });
                      load(); // refresh to show the new support
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
