import { getRedis } from "@/lib/redis";

// GET  /api/userdata?address=0x...  -> the user's full private app data
// POST /api/userdata  { address, data }  -> save it
//
// This stores the OWNER's full state (north star, daily reflections, sealed
// promise, profile fields) keyed by wallet address, so the same email/wallet
// sees the same data on any device or browser. The public feed (profile API)
// is a separate, read-optimized projection.

const KEY = (addr: string) => `northstar:userdata:${addr.toLowerCase()}`;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const address = (url.searchParams.get("address") ?? "").toLowerCase();
  if (!address) return Response.json({ error: "address required" }, { status: 400 });

  const redis = getRedis();
  if (!redis) return Response.json({ data: null, configured: false });

  const data = await redis.get(KEY(address));
  return Response.json({ data: data ?? null, configured: true });
}

export async function POST(request: Request) {
  let body: { address?: string; data?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }
  const address = (body.address ?? "").toLowerCase();
  if (!address || body.data == null) {
    return Response.json({ error: "address + data required" }, { status: 400 });
  }

  const redis = getRedis();
  if (!redis) return Response.json({ ok: false, configured: false });

  await redis.set(KEY(address), body.data);
  return Response.json({ ok: true });
}
