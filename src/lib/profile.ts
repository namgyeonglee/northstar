// Northstar — founder profile types shared by client + server.
//
// A founder's public presence: their North Star, how diligently they reflect
// (streak/star count), what they're building, the problem they face, and the
// support they've received. Stored server-side (Upstash) keyed by wallet.

export type Donation = {
  from: string; // donor label (short address or "anonymous")
  amount: number; // USDC
  message: string;
  txHash?: string;
  anonymous: boolean;
  at: string; // ISO timestamp
};

export type FounderProfile = {
  address: string; // wallet address (lowercased key)
  northStar: string;
  starCount: number; // total reflections (drives the constellation)
  productUrl?: string;
  productBlurb?: string; // "what I'm building"
  problem?: string; // "the problem I'm facing right now"
  donations: Donation[];
  joinedAt: string; // ISO — used for the 🌱 sprout badge window
  updatedAt: string; // ISO
};

export function emptyProfile(address: string, joinedAt: string): FounderProfile {
  return {
    address: address.toLowerCase(),
    northStar: "",
    starCount: 0,
    donations: [],
    joinedAt,
    updatedAt: joinedAt,
  };
}

// A founder counts as a "sprout" (new) for this many days after joining.
export const SPROUT_DAYS = 7;

export function isSprout(joinedAt: string, nowMs: number): boolean {
  const joined = Date.parse(joinedAt);
  if (Number.isNaN(joined)) return false;
  return nowMs - joined < SPROUT_DAYS * 24 * 60 * 60 * 1000;
}
