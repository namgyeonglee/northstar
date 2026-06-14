import {
  createWalletClient,
  createPublicClient,
  http,
  parseEther,
  parseUnits,
  isAddress,
  erc20Abi,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import {
  arcTestnet,
  ARC_NATIVE_DECIMALS,
  USDC_ERC20_ADDRESS,
  USDC_DECIMALS,
  SIGNUP_FUND_USDC,
} from "@/lib/arc";

// POST /api/drip  { address: "0x...", chain?: "base" | "arc" }
//
// Onboarding helper. New Dynamic embedded wallets start empty:
//  - "base" (default): drip Base Sepolia ETH for the first sealPromise().
//  - "arc": give the user (a) a little NATIVE Arc USDC for gas AND (b) some
//    ERC-20 USDC to actually donate with. (Arc has two USDC interfaces.)
//
// Server-only secret: FAUCET_PRIVATE_KEY. The faucet wallet must hold Base
// Sepolia ETH, Arc native USDC (gas), and Arc ERC-20 USDC (to gift).
export const maxDuration = 60;

const BASE_RPC = process.env.BASE_SEPOLIA_RPC ?? "https://sepolia.base.org";

const BASE_DRIP = parseEther("0.001");
const BASE_ALREADY = parseEther("0.0005");

const ARC_GAS_DRIP = parseUnits("0.05", ARC_NATIVE_DECIMALS); // native gas
const ARC_GAS_ALREADY = parseUnits("0.01", ARC_NATIVE_DECIMALS);
const ARC_USDC_GIFT = parseUnits(String(SIGNUP_FUND_USDC), USDC_DECIMALS); // ERC-20
const ARC_USDC_ALREADY = parseUnits("1", USDC_DECIMALS);

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
  const account = privateKeyToAccount(pk as `0x${string}`);
  const to = address as `0x${string}`;

  // ---- Base Sepolia: native ETH for gas ----
  if (chain === "base") {
    const transport = http(BASE_RPC);
    const pub = createPublicClient({ chain: baseSepolia, transport });
    try {
      const bal = await pub.getBalance({ address: to });
      if (bal >= BASE_ALREADY) return Response.json({ ok: true, skipped: true });
      const wc = createWalletClient({ account, chain: baseSepolia, transport });
      const hash = await wc.sendTransaction({ to, value: BASE_DRIP });
      await pub.waitForTransactionReceipt({ hash });
      return Response.json({ ok: true, hash });
    } catch (err) {
      console.error("base drip failed:", err);
      return Response.json({ ok: false, error: String(err) }, { status: 500 });
    }
  }

  // ---- Arc: native USDC for gas + ERC-20 USDC to donate with ----
  const transport = http();
  const pub = createPublicClient({ chain: arcTestnet, transport });
  const wc = createWalletClient({ account, chain: arcTestnet, transport });
  try {
    // 1) gas (native), if low
    const gasBal = await pub.getBalance({ address: to });
    if (gasBal < ARC_GAS_ALREADY) {
      const gh = await wc.sendTransaction({ to, value: ARC_GAS_DRIP });
      await pub.waitForTransactionReceipt({ hash: gh });
    }
    // 2) ERC-20 USDC to spend, if low
    const usdcBal = (await pub.readContract({
      address: USDC_ERC20_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [to],
    })) as bigint;
    if (usdcBal < ARC_USDC_ALREADY) {
      const th = await wc.writeContract({
        address: USDC_ERC20_ADDRESS,
        abi: erc20Abi,
        functionName: "transfer",
        args: [to, ARC_USDC_GIFT],
      });
      await pub.waitForTransactionReceipt({ hash: th });
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error("arc drip failed:", err);
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
