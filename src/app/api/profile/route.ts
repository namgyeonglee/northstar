import { getRedis } from "@/lib/redis";
import { emptyProfile, type FounderProfile } from "@/lib/profile";

// GET  /api/profile?address=0x...   -> the founder's profile (or empty)
// POST /api/profile  { address, northStar, starCount, productUrl, ... }
//      -> upsert the founder's profile, and register them in the feed index.

const KEY = (addr: string) => `northstar:profile:${addr.toLowerCase()}`;
const FEED_SET = "northstar:founders";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const address = (url.searchParams.get("address") ?? "").toLowerCase();
  if (!address) return Response.json({ error: "address required" }, { status: 400 });

  const redis = getRedis();
  if (!redis) return Response.json({ profile: null, configured: false });

  const profile = await redis.get<FounderProfile>(KEY(address));
  return Response.json({ profile: profile ?? null, configured: true });
}

export async function POST(request: Request) {
  let body: Partial<FounderProfile> & { address?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }
  const address = (body.address ?? "").toLowerCase();
  if (!address) return Response.json({ error: "address required" }, { status: 400 });

  const redis = getRedis();
  if (!redis) return Response.json({ ok: false, configured: false });

  const now = new Date().toISOString();
  const existing = (await redis.get<FounderProfile>(KEY(address))) ?? null;
  const base = existing ?? emptyProfile(address, now);

  const next: FounderProfile = {
    ...base,
    northStar: body.northStar ?? base.northStar,
    starCount: body.starCount ?? base.starCount,
    productUrl: body.productUrl ?? base.productUrl,
    productBlurb: body.productBlurb ?? base.productBlurb,
    problem: body.problem ?? base.problem,
    updatedAt: now,
  };

  await redis.set(KEY(address), next);
  await redis.sadd(FEED_SET, address);
  return Response.json({ ok: true, profile: next });
}
