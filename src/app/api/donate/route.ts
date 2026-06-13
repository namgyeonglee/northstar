import { getRedis } from "@/lib/redis";
import type { FounderProfile, Donation } from "@/lib/profile";

// POST /api/donate
// { to, from, amount, message, txHash, anonymous }
// Records a donation on the recipient founder's profile so it shows on their
// feed. The transfer itself happens on-chain (Arc) from the client; this just
// logs the supportive record + message.

const KEY = (addr: string) => `northstar:profile:${addr.toLowerCase()}`;

export async function POST(request: Request) {
  let body: {
    to?: string;
    from?: string;
    amount?: number;
    message?: string;
    txHash?: string;
    anonymous?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  const to = (body.to ?? "").toLowerCase();
  const amount = Number(body.amount);
  if (!to || !Number.isFinite(amount) || amount <= 0) {
    return Response.json({ error: "to + positive amount required" }, { status: 400 });
  }

  const redis = getRedis();
  if (!redis) return Response.json({ ok: false, configured: false });

  const profile = await redis.get<FounderProfile>(KEY(to));
  if (!profile) return Response.json({ error: "founder not found" }, { status: 404 });

  const donation: Donation = {
    from: body.anonymous ? "anonymous" : (body.from ?? "someone"),
    amount,
    message: (body.message ?? "").slice(0, 500),
    txHash: body.txHash,
    anonymous: !!body.anonymous,
    at: new Date().toISOString(),
  };

  profile.donations = [donation, ...(profile.donations ?? [])].slice(0, 100);
  await redis.set(KEY(to), profile);

  return Response.json({ ok: true, donation });
}
