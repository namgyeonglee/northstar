// Northstar — Arc Testnet (Circle's stablecoin L1) for USDC donations.
//
// On Arc, USDC IS the native gas/value token (6 decimals), so a donation is a
// plain native transfer — no ERC-20 approve, no separate gas token. The min
// donation is 5 USDC. Donations are a way to back a founder's journey; the
// daily reflection is the core, this is the supportive layer on top.

import { defineChain } from "viem";

export const ARC_CHAIN_ID = 5042002;

// Arc's native USDC uses 6 decimals (confirmed by the wallet's own tx
// preview: network fee renders correctly at 6, and an 18-decimal value
// displayed as 1,000,000,000,000). Use ARC_DECIMALS everywhere for value math.
export const ARC_DECIMALS = 6;

// viem has no built-in Arc chain, so define it.
export const arcTestnet = defineChain({
  id: ARC_CHAIN_ID,
  name: "Arc Testnet",
  nativeCurrency: { name: "USD Coin", symbol: "USDC", decimals: ARC_DECIMALS },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
  },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
  testnet: true,
});

// Demo minimum (kept small so a freshly funded wallet can back several
// founders). The product intent is a 5 USDC floor; lowered for testnet demos.
export const MIN_DONATION_USDC = 1;

// Amount auto-funded to a new user's wallet so they can try donating (Arc USDC).
export const SIGNUP_FUND_USDC = 3;

/** ArcScan transaction URL for a given hash. */
export function arcTxUrl(hash: string): string {
  return `https://testnet.arcscan.app/tx/${hash}`;
}

/** ArcScan address URL. */
export function arcAddressUrl(address: string): string {
  return `https://testnet.arcscan.app/address/${address}`;
}
