"use client";

import { useIsLoggedIn, DynamicWidget } from "@dynamic-labs/sdk-react-core";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const isLoggedIn = useIsLoggedIn();

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl flex flex-col items-center text-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <span className="text-5xl" aria-hidden>
            🌟
          </span>
          <h1 className="text-4xl font-semibold tracking-tight">Northstar</h1>
          <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-md">
            Your daily companion toward the one goal that matters. Answer a
            question a day. Watch your trajectory. Seal a promise to your future
            self — on-chain.
          </p>
        </div>

        {!isLoggedIn ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Sign in with your email to begin — no seed phrase, no friction.
            </p>
            <DynamicWidget />
          </div>
        ) : (
          <Dashboard />
        )}
      </div>
    </main>
  );
}
