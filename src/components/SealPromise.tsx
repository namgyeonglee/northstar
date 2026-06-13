"use client";

import { useState } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import {
  CONTRACT_ADDRESS,
  PROMISES_ABI,
  BASE_SEPOLIA,
  uploadPromise,
  explorerTxUrl,
  ipfsToHttp,
  type PromiseContent,
} from "@/lib/promises";

type Props = {
  northStar: string;
  reflectionCount: number;
};

type Status =
  | { phase: "idle" }
  | { phase: "uploading" }
  | { phase: "signing" }
  | { phase: "done"; txHash: string; ipfsUri: string }
  | { phase: "error"; message: string };

function oneYearFromNowUnix(): bigint {
  const now = new Date();
  const next = new Date(now);
  next.setFullYear(now.getFullYear() + 1);
  return BigInt(Math.floor(next.getTime() / 1000));
}

export default function SealPromise({ northStar, reflectionCount }: Props) {
  const { primaryWallet } = useDynamicContext();
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>({ phase: "idle" });

  async function seal() {
    const promise = text.trim();
    if (!promise || !primaryWallet) return;

    try {
      // 1. Upload the promise content to IPFS.
      setStatus({ phase: "uploading" });
      const content: PromiseContent = {
        northStar,
        promise,
        reflectionCount,
        sealedDate: new Date().toISOString().slice(0, 10),
      };
      const uri = await uploadPromise(content);

      // 2. Seal on-chain via Dynamic's embedded wallet (viem WalletClient).
      if (!isEthereumWallet(primaryWallet)) {
        throw new Error("This wallet can't sign Ethereum transactions.");
      }
      setStatus({ phase: "signing" });
      const walletClient = await primaryWallet.getWalletClient(
        BASE_SEPOLIA.id.toString(),
      );

      const txHash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: PROMISES_ABI,
        functionName: "sealPromise",
        args: [uri, oneYearFromNowUnix()],
        chain: BASE_SEPOLIA,
        account: walletClient.account,
      });

      setStatus({ phase: "done", txHash, ipfsUri: uri });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong sealing your promise.";
      setStatus({ phase: "error", message });
    }
  }

  if (status.phase === "done") {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 flex flex-col gap-3 text-left">
        <p className="text-xs uppercase tracking-wide text-emerald-600">
          Promise sealed — forever yours
        </p>
        <p className="text-base leading-relaxed">
          Your promise to your future self is now sealed on Base, tamper-proof
          and owned by you. Even if Northstar disappears, it lives in your
          wallet.
        </p>
        <div className="flex flex-col gap-1">
          <a
            href={explorerTxUrl(status.txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start text-sm underline text-emerald-700 dark:text-emerald-400"
          >
            View the on-chain transaction (BaseScan) ↗
          </a>
          <a
            href={ipfsToHttp(status.ipfsUri)}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start text-sm underline text-emerald-700 dark:text-emerald-400"
          >
            Read your promise on IPFS ↗
          </a>
        </div>
      </div>
    );
  }

  const busy = status.phase === "uploading" || status.phase === "signing";

  return (
    <div className="rounded-xl border border-black/10 dark:border-white/15 p-5 flex flex-col gap-3 text-left">
      <p className="text-xs uppercase tracking-wide text-neutral-500">
        Seal a promise to your future self
      </p>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Write a promise to who you want to be a year from now. It&apos;s sealed
        on-chain — tamper-proof, timestamped, and owned by you.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="A year from now, I will have…"
        disabled={busy}
        className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent p-3 text-base outline-none focus:border-black/30 dark:focus:border-white/30 disabled:opacity-50"
      />
      <button
        onClick={seal}
        disabled={!text.trim() || busy}
        className="self-start rounded-full bg-foreground text-background px-5 py-2 text-sm font-medium disabled:opacity-40 transition-opacity"
      >
        {status.phase === "uploading"
          ? "Uploading to IPFS…"
          : status.phase === "signing"
            ? "Confirm in your wallet…"
            : "Seal on-chain"}
      </button>
      {status.phase === "error" && (
        <p className="text-sm text-red-500 break-words">{status.message}</p>
      )}
    </div>
  );
}
