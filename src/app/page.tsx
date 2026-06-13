"use client";

import { useIsLoggedIn, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import Dashboard from "@/components/Dashboard";
import NorthStarInput from "@/components/NorthStarInput";
import { setPendingNorthStar } from "@/lib/store";

export default function Home() {
  const isLoggedIn = useIsLoggedIn();
  const { setShowAuthFlow, sdkHasLoaded } = useDynamicContext();

  // Wait for the SDK to settle before deciding which screen to show, so the
  // landing doesn't flash before the dashboard for an already-logged-in user.
  if (!sdkHasLoaded) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <span className="text-4xl animate-pulse" aria-hidden>
          🌟
        </span>
      </main>
    );
  }

  // Logged in → the dashboard decides (its own North Star input if none yet).
  if (isLoggedIn) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl flex flex-col items-center text-center gap-8">
          <Dashboard />
        </div>
      </main>
    );
  }

  // Logged out → landing: name your North Star, then log in to save it.
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <NorthStarInput
        onCommit={(northStar) => {
          setPendingNorthStar(northStar); // claimed by Dashboard after login
          setShowAuthFlow(true); // open Dynamic login (email, no seed phrase)
        }}
        onLogin={() => setShowAuthFlow(true)}
        footnote="We'll ask for your email to save it. No seed phrase, no wallet to install."
      />
    </main>
  );
}
