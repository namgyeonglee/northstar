// Northstar — shared Upstash Redis client (server-only).
//
// Used to persist founder profiles + donations so the public feed works
// across devices/sessions (localStorage can't be shared). Returns null when
// env isn't configured, so callers can degrade gracefully.

import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (_redis) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  _redis = new Redis({ url, token });
  return _redis;
}
