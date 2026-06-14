"use client";

import { useState } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { parseUnits, erc20Abi, isAddress } from "viem";
import {
  arcTestnet,
  ARC_CHAIN_ID,
  USDC_ERC20_ADDRESS,
  USDC_DECIMALS,
  arcTxUrl,
} from "@/lib/arc";

// Withdraw: the embedded wallet is self-custodial, so the user can send their
// USDC anywhere (their MetaMask, an exchange deposit address). Proves the
// funds are really theirs and movable, not locked in our app.
type Props = { balance: string; onDone: () => void };

type Status =
  | { phase: "idle" }
  | { phase: "sending" }
  | { phase: "done"; txHash: string }
  | { phase: "error"; message: string };

export default function Withdraw({ balance, onDone }: Props) {
  const { primaryWallet } = useDynamicContext();
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<Status>({ phase: "idle" });

  async function withdraw() {
    if (!primaryWallet) return;
    const amt = Number(amount);
    if (!isAddress(to)) {
      setStatus({ phase: "error", message: "Enter a valid destination address." });
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0 || amt > Number(balance)) {
      setStatus({ phase: "error", message: "Enter an amount within your balance." });
      return;
    }
    try {
      if (!isEthereumWallet(primaryWallet)) {
        throw new Error("This wallet can't sign transactions.");
      }
      setStatus({ phase: "sending" });
      await primaryWallet.switchNetwork(ARC_CHAIN_ID);
      const walletClient = await primaryWallet.getWalletClient(
        ARC_CHAIN_ID.toString(),
      );
      const txHash = await walletClient.writeContract({
        address: USDC_ERC20_ADDRESS,
        abi: erc20Abi,
        functionName: "transfer",
        args: [to as `0x${string}`, parseUnits(String(amt), USDC_DECIMALS)],
        chain: arcTestnet,
        account: walletClient.account,
      });
      setStatus({ phase: "done", txHash });
      onDone();
    } catch (err) {
      const m = err instanceof Error ? err.message : "Withdrawal failed.";
      setStatus({ phase: "error", message: m });
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs underline text-neutral-500 hover:text-foreground self-start"
      >
        Withdraw
      </button>
    );
  }

  if (status.phase === "done") {
    return (
      <p className="text-xs text-emerald-600">
        Sent.{" "}
        <a
          href={arcTxUrl(status.txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          View on ArcScan ↗
        </a>
      </p>
    );
  }

  const sending = status.phase === "sending";

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-black/10 dark:border-white/15 p-3">
      <p className="text-[11px] uppercase tracking-wide text-neutral-400">
        Withdraw USDC (it&apos;s yours, send anywhere)
      </p>
      <input
        value={to}
        onChange={(e) => setTo(e.target.value)}
        placeholder="Destination address (0x…)"
        disabled={sending}
        className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent p-2 text-sm outline-none focus:border-black/30 dark:focus:border-white/30"
      />
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Amount (max ${balance})`}
          disabled={sending}
          className="flex-1 rounded-lg border border-black/10 dark:border-white/15 bg-transparent p-2 text-sm outline-none focus:border-black/30 dark:focus:border-white/30"
        />
        <button
          onClick={() => setAmount(balance)}
          className="text-xs underline text-neutral-500"
        >
          Max
        </button>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={withdraw}
          disabled={sending}
          className="rounded-full bg-foreground text-background px-4 py-1.5 text-sm font-medium disabled:opacity-40"
        >
          {sending ? "Sending…" : "Send"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-neutral-500"
        >
          Cancel
        </button>
      </div>
      {status.phase === "error" && (
        <p className="text-xs text-red-500 break-words">{status.message}</p>
      )}
    </div>
  );
}
