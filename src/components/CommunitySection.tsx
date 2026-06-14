"use client";

import { useEffect, useState } from "react";
import { readUsdcBalance } from "@/lib/arc";
import type { UserData } from "@/lib/store";
import Withdraw from "@/components/Withdraw";

// One section below the constellation: your Arc USDC balance, your public
// founder profile (product + problem), and the entry into the community feed.
// Kept below the daily question on purpose — answering is the heart.
type Props = {
  address: string;
  data: UserData;
  onProfileChange: (patch: Partial<UserData>) => void;
  onOpenFeed: () => void;
};

export default function CommunitySection({
  address,
  data,
  onProfileChange,
  onOpenFeed,
}: Props) {
  const [usdc, setUsdc] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    readUsdcBalance(address).then(setUsdc);
  }, [address]);

  const usdcDisplay =
    usdc === null ? "…" : `${Number(usdc).toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC`;

  return (
    <div className="rounded-xl border border-black/10 dark:border-white/15 p-5 flex flex-col gap-4">
      {/* balance + community entry */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-[11px] uppercase tracking-wide text-neutral-400">
            Your USDC balance (Arc)
          </p>
          <p className="text-lg font-medium">{usdcDisplay}</p>
          {usdc !== null && Number(usdc) > 0 && (
            <Withdraw
              balance={usdc}
              onDone={() => readUsdcBalance(address).then(setUsdc)}
            />
          )}
        </div>
        <button
          onClick={onOpenFeed}
          className="rounded-full border border-black/15 dark:border-white/20 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
        >
          See the community →
        </button>
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400 -mt-1">
        We gifted you a little USDC to get started, try backing a founder you
        believe in over in the community.
      </p>

      {/* founder profile editor */}
      <details className="border-t border-black/10 dark:border-white/10 pt-3">
        <summary className="text-sm font-medium cursor-pointer select-none">
          Your founder profile
        </summary>
        <div className="flex flex-col gap-3 pt-3">
          <input
            type="text"
            defaultValue={data.productUrl ?? ""}
            placeholder="Product URL (https://…)"
            onBlur={(e) => onProfileChange({ productUrl: e.target.value.trim() })}
            className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent p-2.5 text-sm outline-none focus:border-black/30 dark:focus:border-white/30"
          />
          <textarea
            defaultValue={data.productBlurb ?? ""}
            rows={2}
            placeholder="What are you building?"
            onBlur={(e) => onProfileChange({ productBlurb: e.target.value.trim() })}
            className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent p-2.5 text-sm outline-none focus:border-black/30 dark:focus:border-white/30"
          />
          <textarea
            defaultValue={data.problem ?? ""}
            rows={2}
            placeholder="What problem are you facing right now?"
            onBlur={(e) => onProfileChange({ problem: e.target.value.trim() })}
            className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent p-2.5 text-sm outline-none focus:border-black/30 dark:focus:border-white/30"
          />
          <p className="text-[11px] text-neutral-400">
            Saved automatically. Shown on the community feed so others can back you.
          </p>
        </div>
      </details>
    </div>
  );
}
