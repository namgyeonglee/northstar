"use client";

import { useState } from "react";

export default function Footer() {
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2200);
  }

  async function copyShareLink() {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied. Share Northstar with a friend ⭐");
    } catch {
      showToast("Couldn't copy automatically. Copy from the address bar.");
    }
  }

  return (
    <>
      <footer className="w-full max-w-xl mx-auto mt-10 pt-6 border-t border-black/10 dark:border-white/10 flex items-center justify-center text-sm text-neutral-500">
        <button
          onClick={copyShareLink}
          className="hover:text-foreground transition-colors"
        >
          🔗 Share Northstar
        </button>
      </footer>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full bg-neutral-900 text-neutral-50 px-5 py-2.5 text-sm shadow-lg"
        >
          {toast}
        </div>
      )}
    </>
  );
}
