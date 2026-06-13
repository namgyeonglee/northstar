// Northstar — ENS integration.
//
// Northstar's "future self" has an ENS identity. We read a live text record
// (`northstar.promise`) off an ENS name on Sepolia and show it in the app, so
// the promise literally lives inside an ENS name. ENS resolution runs against
// a dedicated Sepolia client (the app's own transactions stay on Base Sepolia;
// ENS does not exist there). Values are fetched live — nothing hard-coded.

import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { normalize } from "viem/ens";

// The ENS name that carries Northstar's identity + promise text record.
// Set NEXT_PUBLIC_ENS_NAME in .env.local to the name you registered on
// sepolia.app.ens.domains (e.g. "mynorthstar.eth").
export const ENS_NAME = process.env.NEXT_PUBLIC_ENS_NAME ?? "";

// viem's `sepolia` chain ships with the ENS Universal Resolver built in, so
// getEnsText / getEnsAddress resolve out of the box on Sepolia.
const ensClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

export type EnsIdentity = {
  name: string;
  address: `0x${string}` | null;
  promise: string | null;
  avatar: string | null;
};

/** Read Northstar's ENS identity live from Sepolia. Returns null on failure. */
export async function readEnsIdentity(): Promise<EnsIdentity | null> {
  if (!ENS_NAME) return null;
  try {
    const name = normalize(ENS_NAME);
    // Prefer a custom `northstar.promise` key; fall back to the standard
    // `description` record (the ENS app's "Bio" field), which is the easiest
    // place to set a value in the ENS manager UI.
    const [address, custom, description, avatar] = await Promise.all([
      ensClient.getEnsAddress({ name }).catch(() => null),
      ensClient.getEnsText({ name, key: "northstar.promise" }).catch(() => null),
      ensClient.getEnsText({ name, key: "description" }).catch(() => null),
      ensClient.getEnsAvatar({ name }).catch(() => null),
    ]);
    return { name: ENS_NAME, address, promise: custom || description, avatar };
  } catch {
    return null;
  }
}
