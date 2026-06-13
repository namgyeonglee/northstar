import {
  createWalletClient,
  createPublicClient,
  http,
  parseEther,
  parseUnits,
  isAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { arcTestnet, SIGNUP_FUND_USDC } from "@/lib/arc";

// POST /api/drip  { address: "0x...", chain?: "base" | "arc" }
//
// Onboarding helper. New Dynamic embedded wallets start empty:
//  - "base" (default): drip Base Sepolia ETH so the first sealPromise() write
//    has gas.
//  - "arc": drip Arc USDC (native token) so the user can try donating to a
//    founder. On Arc, USDC is gas + value, so one drip covers both.
// Waits for confirmation so the user's own tx won't race a zero balance.
//
// Server-only secret: FAUCET_PRIVATE_KEY. The same faucet key must hold funds
// on BOTH chains (Base Sepolia ETH and Arc USDC).

const BASE_RPC = process.env.BASE_SEPOLIA_RPC ?? "https://sepolia.base.org";

const BASE_DRIP = parseEther("0.001");
const BASE_ALREADY = parseEther("0.0005");
const ARC_DRIP = parseUnits(String(SIGNUP_FUND_USDC), 6); // Arc USDC = 6 decimals
const ARC_ALREADY = parseUnits("1", 6); // skip if they already have >= 1 USDC

export async function POST(request: Request) {
  let address: string;
  let chain: "base" | "arc" = "base";
  try {
    const body = await request.json();
    address = body.address;
    if (body.chain === "arc") chain = "arc";
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  if (!isAddress(address)) {
    return Response.json({ error: "invalid address" }, { status: 400 });
  }

  const pk = process.env.FAUCET_PRIVATE_KEY;
  if (!pk) {
    return Response.json({ ok: false, reason: "faucet not configured" });
  }

  const viemChain = chain === "arc" ? arcTestnet : baseSepolia;
  const transport =
    chain === "arc" ? http() : http(BASE_RPC);
  const dripAmount = chain === "arc" ? ARC_DRIP : BASE_DRIP;
  const alreadyFunded = chain === "arc" ? ARC_ALREADY : BASE_ALREADY;

  const publicClient = createPublicClient({ chain: viemChain, transport });

  try {
    // Idempotency: skip if they already have enough.
    const balance = await publicClient.getBalance({
      address: address as `0x${string}`,
    });
    if (balance >= alreadyFunded) {
      return Response.json({ ok: true, skipped: true });
    }

    const account = privateKeyToAccount(pk as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: viemChain,
      transport,
    });

    const hash = await walletClient.sendTransaction({
      to: address as `0x${string}`,
      value: dripAmount,
    });
    await publicClient.waitForTransactionReceipt({ hash });

    return Response.json({ ok: true, hash });
  } catch (err) {
    console.error("drip failed:", err);
    const message = err instanceof Error ? err.message : "drip failed";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
