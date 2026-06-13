import { getRedis } from "@/lib/redis";
import type { FounderProfile } from "@/lib/profile";

// GET /api/feed -> all founder profiles, most recently active first.
// Powers the public community feed.

const KEY = (addr: string) => `northstar:profile:${addr.toLowerCase()}`;
const FEED_SET = "northstar:founders";

export async function GET() {
  const redis = getRedis();
  if (!redis) return Response.json({ founders: [], configured: false });

  const addresses = await redis.smembers(FEED_SET);
  if (!addresses.length) return Response.json({ founders: [], configured: true });

  const profiles = await Promise.all(
    addresses.map((a) => redis.get<FounderProfile>(KEY(a))),
  );
  const founders = profiles
    .filter((p): p is FounderProfile => !!p && !!p.northStar)
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));

  return Response.json({ founders, configured: true });
}
