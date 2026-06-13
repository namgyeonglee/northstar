import {
  createWalletClient,
  createPublicClient,
  http,
  parseEther,
  isAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

// POST /api/drip  { address: "0x..." }
//
// Onboarding helper: a new Dynamic embedded wallet has zero gas, so its first
// sealPromise() write would revert. This server route tops it up with a tiny
// amount of Base Sepolia ETH from a funded faucet wallet, then waits for the
// transfer to confirm so the user's own transaction won't race a zero balance.
//
// Server-only secret: FAUCET_PRIVATE_KEY (NOT NEXT_PUBLIC_). Runs server-side.

const RPC = process.env.BASE_SEPOLIA_RPC ?? "https://sepolia.base.org";
const DRIP_AMOUNT = parseEther("0.001"); // enough for several seal txns
const ALREADY_FUNDED = parseEther("0.0005"); // skip if they already have this

export async function POST(request: Request) {
  let address: string;
  try {
    ({ address } = await request.json());
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  if (!isAddress(address)) {
    return Response.json({ error: "invalid address" }, { status: 400 });
  }

  const pk = process.env.FAUCET_PRIVATE_KEY;
  if (!pk) {
    // No faucet configured: not fatal. The user can still seal if they have
    // gas; just report that no drip happened.
    return Response.json({ ok: false, reason: "faucet not configured" });
  }

  const transport = http(RPC);
  const publicClient = createPublicClient({ chain: baseSepolia, transport });

  try {
    // Idempotency: don't drip if they already have enough gas.
    const balance = await publicClient.getBalance({
      address: address as `0x${string}`,
    });
    if (balance >= ALREADY_FUNDED) {
      return Response.json({ ok: true, skipped: true });
    }

    const account = privateKeyToAccount(pk as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport,
    });

    const hash = await walletClient.sendTransaction({
      to: address as `0x${string}`,
      value: DRIP_AMOUNT,
    });

    // Wait for confirmation so the user's seal tx won't hit a zero balance.
    await publicClient.waitForTransactionReceipt({ hash });

    return Response.json({ ok: true, hash });
  } catch (err) {
    console.error("drip failed:", err);
    const message = err instanceof Error ? err.message : "drip failed";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
