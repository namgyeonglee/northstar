// Northstar — minimal client-side store (localStorage).
// For a 1-day hackathon build we skip a backend DB; everything the user
// types lives in the browser, keyed by wallet address. On-chain sealing
// (block 5) is what makes the *promise* permanent — daily reflections are
// intentionally local + private.

export type Reflection = {
  question: string;
  answer: string;
  date: string; // ISO date string
};

export type UserData = {
  northStar: string;
  reflections: Reflection[];
  productUrl?: string;
  productBlurb?: string;
  problem?: string;
  sealedPromise?: {
    text: string;
    unlockTime: number; // unix seconds
    txHash?: string;
    ipfsUri?: string;
  };
};

const KEY_PREFIX = "northstar:";

function keyFor(address: string) {
  return `${KEY_PREFIX}${address.toLowerCase()}`;
}

export function loadUser(address: string): UserData {
  if (typeof window === "undefined") return emptyUser();
  const raw = window.localStorage.getItem(keyFor(address));
  if (!raw) return emptyUser();
  try {
    return JSON.parse(raw) as UserData;
  } catch {
    return emptyUser();
  }
}

export function saveUser(address: string, data: UserData): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(keyFor(address), JSON.stringify(data));
}

export function emptyUser(): UserData {
  return { northStar: "", reflections: [] };
}

// A north star typed on the landing page before login is parked here, then
// claimed by the dashboard once a wallet exists. sessionStorage = cleared
// when the tab closes, which is the right lifetime for a pre-login draft.
const PENDING_KEY = "northstar:pending";

export function setPendingNorthStar(value: string): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PENDING_KEY, value);
}

export function takePendingNorthStar(): string {
  if (typeof window === "undefined") return "";
  const v = window.sessionStorage.getItem(PENDING_KEY) ?? "";
  window.sessionStorage.removeItem(PENDING_KEY);
  return v;
}

// Mirror the founder's public profile to the server (Upstash) so it appears
// on the shared community feed. Fire-and-forget; localStorage stays the fast
// local source of truth for the owner's own session.
export function syncProfile(
  address: string,
  profile: {
    northStar: string;
    starCount: number;
    productUrl?: string;
    productBlurb?: string;
    problem?: string;
  },
): void {
  if (typeof window === "undefined" || !address) return;
  fetch("/api/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, ...profile }),
  }).catch(() => {
    /* non-fatal: feed sync is best-effort */
  });
}
