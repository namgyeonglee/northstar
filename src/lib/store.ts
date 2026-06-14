// Northstar — user data store. SERVER-ONLY (Upstash via /api/userdata).
// No localStorage: the same email/wallet must see the same data on any
// device or browser, so the server is the single source of truth.

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

export function emptyUser(): UserData {
  return { northStar: "", reflections: [] };
}

/** Load the user's data from the server (single source of truth). */
export async function loadUserRemote(address: string): Promise<UserData> {
  if (!address) return emptyUser();
  try {
    const res = await fetch(
      `/api/userdata?address=${encodeURIComponent(address)}`,
    );
    const json = await res.json();
    const remote = json?.data as UserData | null;
    if (remote && typeof remote === "object") return remote;
  } catch {
    /* network/offline → empty */
  }
  return emptyUser();
}

/** Persist the user's data to the server. */
export function saveUser(address: string, data: UserData): void {
  if (!address) return;
  fetch("/api/userdata", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, data }),
  }).catch(() => {
    /* best-effort; UI already updated optimistically */
  });
}

// A north star typed on the landing page before login is parked here (tab
// session only, no wallet yet), then claimed by the dashboard after login.
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

// Mirror the founder's public profile to the server so it appears on the
// shared community feed.
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
