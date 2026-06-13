// Northstar — Arc Testnet (Circle's stablecoin L1) for USDC donations.
//
// On Arc, USDC IS the native gas/value token (6 decimals), so a donation is a
// plain native transfer — no ERC-20 approve, no separate gas token. The min
// donation is 5 USDC. Donations are a way to back a founder's journey; the
// daily reflection is the core, this is the supportive layer on top.

import { defineChain } from "viem";

export const ARC_CHAIN_ID = 5042002;

// viem has no built-in Arc chain, so define it.
export const arcTestnet = defineChain({
  id: ARC_CHAIN_ID,
  name: "Arc Testnet",
  nativeCurrency: { name: "USD Coin", symbol: "USDC", decimals: 6 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
  },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
  testnet: true,
});

export const MIN_DONATION_USDC = 5;

/** ArcScan transaction URL for a given hash. */
export function arcTxUrl(hash: string): string {
  return `https://testnet.arcscan.app/tx/${hash}`;
}

/** ArcScan address URL. */
export function arcAddressUrl(address: string): string {
  return `https://testnet.arcscan.app/address/${address}`;
}
