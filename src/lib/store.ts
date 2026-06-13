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
