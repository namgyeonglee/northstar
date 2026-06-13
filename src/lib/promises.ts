// Northstar — on-chain promise sealing helpers.
//
// IPFS upload goes through thirdweb storage (authed by client id).
// The on-chain write/read uses the viem WalletClient/PublicClient that
// Dynamic's embedded wallet exposes — no thirdweb transaction layer needed,
// so the two SDKs never fight over signing.

import { createThirdwebClient } from "thirdweb";
import { upload } from "thirdweb/storage";
import { baseSepolia } from "viem/chains";
import type { Abi } from "viem";

export const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_PROMISES_CONTRACT as `0x${string}`;

const CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID ?? "";

export const thirdwebClient = createThirdwebClient({ clientId: CLIENT_ID });

export const BASE_SEPOLIA = baseSepolia;

// Minimal ABI — only what the app calls.
export const PROMISES_ABI = [
  {
    type: "function",
    name: "sealPromise",
    stateMutability: "nonpayable",
    inputs: [
      { name: "uri", type: "string" },
      { name: "unlockTime", type: "uint256" },
    ],
    outputs: [{ name: "index", type: "uint256" }],
  },
  {
    type: "function",
    name: "promiseCount",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getPromises",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "uri", type: "string" },
          { name: "unlockTime", type: "uint256" },
          { name: "sealedAt", type: "uint256" },
        ],
      },
    ],
  },
] as const satisfies Abi;

export type PromiseContent = {
  northStar: string;
  promise: string;
  reflectionCount: number;
  sealedDate: string;
};

export type OnChainPromise = {
  uri: string;
  unlockTime: bigint;
  sealedAt: bigint;
};

/** Upload the promise JSON to IPFS, return the ipfs:// URI. */
export async function uploadPromise(content: PromiseContent): Promise<string> {
  const uri = await upload({
    client: thirdwebClient,
    files: [
      new File([JSON.stringify(content, null, 2)], "promise.json", {
        type: "application/json",
      }),
    ],
  });
  // thirdweb returns an ipfs:// URI (or array for multiple files)
  return Array.isArray(uri) ? uri[0] : uri;
}

/** Turn an ipfs:// URI into a public gateway URL for display. */
export function ipfsToHttp(uri: string): string {
  if (uri.startsWith("ipfs://")) {
    return `https://${CLIENT_ID}.ipfscdn.io/ipfs/${uri.slice("ipfs://".length)}`;
  }
  return uri;
}

export function explorerTxUrl(txHash: string): string {
  return `https://sepolia.basescan.org/tx/${txHash}`;
}

export function explorerAddressUrl(address: string): string {
  return `https://sepolia.basescan.org/address/${address}`;
}
