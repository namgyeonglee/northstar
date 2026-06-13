"use client";

import { useState } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { parseUnits } from "viem";
import {
  arcTestnet,
  ARC_CHAIN_ID,
  ARC_DECIMALS,
  MIN_DONATION_USDC,
  arcTxUrl,
} from "@/lib/arc";

type Props = {
  // The founder being backed.
  founderName: string;
  founderAddress: `0x${string}`;
  // Called after a confirmed donation so the parent can record it on the feed.
  onDonated?: (info: { amount: number; txHash: string; message: string }) => void;
};

type Status =
  | { phase: "idle" }
  | { phase: "sending" }
  | { phase: "done"; txHash: string }
  | { phase: "error"; message: string };

export default function Donate({ founderName, founderAddress, onDonated }: Props) {
  const { primaryWallet } = useDynamicContext();
  const [amount, setAmount] = useState(MIN_DONATION_USDC);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>({ phase: "idle" });

  async function donate() {
    if (!primaryWallet) return;
    if (amount < MIN_DONATION_USDC) {
      setStatus({
        phase: "error",
        message: `Minimum donation is ${MIN_DONATION_USDC} USDC.`,
      });
      return;
    }

    try {
      if (!isEthereumWallet(primaryWallet)) {
        throw new Error("This wallet can't sign transactions.");
      }
      setStatus({ phase: "sending" });

      // Switch the wallet to Arc first — getWalletClient alone doesn't move
      // the wallet's active network, so the tx would otherwise be rejected
      // for a chain mismatch.
      await primaryWallet.switchNetwork(ARC_CHAIN_ID);

      // Make sure the donor's wallet has Arc USDC (covers both the gift and
      // gas, since USDC is the native token). Server tops it up and waits.
      await fetch("/api/drip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: primaryWallet.address, chain: "arc" }),
      });

      // Arc: USDC is the native token, so a donation is a native value
      // transfer. Arc's native USDC uses 18 decimals (ARC_DECIMALS).
      const walletClient = await primaryWallet.getWalletClient(
        ARC_CHAIN_ID.toString(),
      );
      const txHash = await walletClient.sendTransaction({
        to: founderAddress,
        value: parseUnits(String(amount), ARC_DECIMALS),
        chain: arcTestnet,
        account: walletClient.account,
      });

      setStatus({ phase: "done", txHash });
      onDonated?.({ amount, txHash, message: message.trim() });
    } catch (err) {
      const m = err instanceof Error ? err.message : "Donation failed.";
      setStatus({ phase: "error", message: m });
    }
  }

  if (status.phase === "done") {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex flex-col gap-2 text-left">
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
          You backed {founderName} with {amount} USDC ⭐
        </p>
        <a
          href={arcTxUrl(status.txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm underline text-emerald-700 dark:text-emerald-400"
        >
          View on ArcScan ↗
        </a>
      </div>
    );
  }

  const sending = status.phase === "sending";

  return (
    <div className="rounded-xl border border-black/10 dark:border-white/15 p-4 flex flex-col gap-3 text-left">
      <p className="text-xs uppercase tracking-wide text-neutral-500">
        Back {founderName}&apos;s journey
      </p>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={MIN_DONATION_USDC}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          disabled={sending}
          className="w-24 rounded-lg border border-black/10 dark:border-white/15 bg-transparent p-2 text-base outline-none focus:border-black/30 dark:focus:border-white/30 disabled:opacity-50"
        />
        <span className="text-sm text-neutral-500">USDC (min {MIN_DONATION_USDC}) on Arc</span>
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Add an encouragement or offer to help (optional)"
        disabled={sending}
        className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent p-2 text-sm outline-none focus:border-black/30 dark:focus:border-white/30 disabled:opacity-50"
      />
      <button
        onClick={donate}
        disabled={sending || amount < MIN_DONATION_USDC}
        className="self-start rounded-full bg-foreground text-background px-5 py-2 text-sm font-medium disabled:opacity-40 transition-opacity"
      >
        {sending ? "Sending on Arc…" : `Donate ${amount} USDC`}
      </button>
      {status.phase === "error" && (
        <p className="text-sm text-red-500 break-words">{status.message}</p>
      )}
    </div>
  );
}
