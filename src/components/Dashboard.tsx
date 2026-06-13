"use client";

import { useEffect, useState, useCallback } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import {
  loadUser,
  saveUser,
  emptyUser,
  takePendingNorthStar,
  type UserData,
  type Reflection,
} from "@/lib/store";
import SealPromise from "@/components/SealPromise";
import NorthStarInput from "@/components/NorthStarInput";
import Constellation from "@/components/Constellation";
import Footer from "@/components/Footer";

function todayISO(): string {
  // YYYY-MM-DD in local time, no Date.now() needed for display.
  return new Date().toISOString().slice(0, 10);
}

export default function Dashboard() {
  const { primaryWallet, handleLogOut } = useDynamicContext();
  const address = primaryWallet?.address ?? "";

  const [data, setData] = useState<UserData>(emptyUser());
  const [loaded, setLoaded] = useState(false);

  // Daily question state
  const [question, setQuestion] = useState("");
  const [questionLoading, setQuestionLoading] = useState(false);
  const [answer, setAnswer] = useState("");

  // Encouragement shown right after answering (the "well done" moment)
  const [cheer, setCheer] = useState("");

  // Trajectory state
  const [trajectory, setTrajectory] = useState("");
  const [trajectoryLoading, setTrajectoryLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    const u = loadUser(address);
    // Claim a north star typed on the landing page before login.
    if (!u.northStar) {
      const pending = takePendingNorthStar();
      if (pending) {
        u.northStar = pending;
        saveUser(address, u);
      }
    }
    setData(u);
    setLoaded(true);
  }, [address]);

  const fetchQuestion = useCallback(async (u: UserData) => {
    setQuestionLoading(true);
    try {
      const res = await fetch("/api/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          northStar: u.northStar,
          recentAnswers: u.reflections.slice(-5).map((r) => r.answer),
        }),
      });
      const json = await res.json();
      setQuestion(json.question ?? "What will you do today toward your goal?");
    } catch {
      setQuestion("What will you do today toward your goal?");
    } finally {
      setQuestionLoading(false);
    }
  }, []);

  // Once we have a north star and no pending question, fetch today's question.
  // (Skip while a cheer is showing, so we don't pre-load behind it.)
  useEffect(() => {
    if (loaded && data.northStar && !question && !questionLoading && !cheer) {
      fetchQuestion(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, data.northStar]);

  const fetchTrajectory = useCallback(async (u: UserData) => {
    setTrajectoryLoading(true);
    setTrajectory("");
    try {
      const res = await fetch("/api/trajectory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          northStar: u.northStar,
          reflections: u.reflections,
        }),
      });
      const json = await res.json();
      setTrajectory(json.summary ?? "");
    } catch {
      setTrajectory("Couldn't read your trajectory just now. Try again.");
    } finally {
      setTrajectoryLoading(false);
    }
  }, []);

  async function submitAnswer() {
    const trimmed = answer.trim();
    if (!trimmed) return;
    const reflection: Reflection = {
      question,
      answer: trimmed,
      date: todayISO(),
    };
    const next: UserData = {
      ...data,
      reflections: [...data.reflections, reflection],
    };
    setData(next);
    saveUser(address, next);
    setAnswer("");

    // Reward the moment: fetch a short cheer and show it before the next Q.
    setCheer("…");
    try {
      const res = await fetch("/api/encourage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          northStar: next.northStar,
          question: reflection.question,
          answer: reflection.answer,
        }),
      });
      const json = await res.json();
      setCheer(json.message ?? "One more star on the path. Keep going. ⭐");
    } catch {
      setCheer("One more star on the path. Keep going. ⭐");
    }
  }

  function nextQuestion() {
    setCheer("");
    setQuestion("");
    // Empty question triggers the fetch effect.
    fetchQuestion(data);
  }

  if (!loaded) {
    return <p className="text-sm text-neutral-500">Loading your journey…</p>;
  }

  // --- Logged in but no North Star yet (e.g. returning on a fresh device) ---
  // Same landing UI as logged-out, but saves directly since we already have
  // a wallet. In the normal flow this rarely shows — login implies a pending
  // North Star that's claimed above.
  if (!data.northStar) {
    return (
      <NorthStarInput
        onCommit={(northStar) => {
          const next = { ...data, northStar };
          setData(next);
          saveUser(address, next);
        }}
      />
    );
  }

  // --- North star set → daily reflection loop. ---
  return (
    <div className="w-full flex flex-col gap-6 text-left">
      {/* North Star — the page header, always in view */}
      <header className="flex flex-col items-center gap-2 text-center pt-2 pb-4 border-b border-black/10 dark:border-white/10">
        <span className="text-2xl" aria-hidden>
          🌟
        </span>
        <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-400">
          Your North Star
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-snug max-w-2xl">
          {data.northStar}
        </h1>
      </header>

      {/* Today's question — or the encouragement moment after answering */}
      {cheer ? (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-5 flex flex-col gap-4 items-center text-center">
          {cheer === "…" ? (
            <p className="text-base text-neutral-400 animate-pulse">
              Reflecting on your answer…
            </p>
          ) : (
            <p className="text-lg font-medium leading-relaxed">{cheer}</p>
          )}
          {cheer !== "…" && (
            <button
              onClick={nextQuestion}
              className="rounded-full bg-foreground text-background px-5 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            >
              Next question →
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-black/10 dark:border-white/15 p-5 flex flex-col gap-3">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Today&apos;s question
          </p>
          {questionLoading ? (
            <p className="text-base text-neutral-400 animate-pulse">
              Thinking of the right question…
            </p>
          ) : (
            <p className="text-lg font-medium">{question}</p>
          )}
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={2}
            placeholder="Answer in a sentence or two…"
            disabled={questionLoading}
            className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent p-3 text-base outline-none focus:border-black/30 dark:focus:border-white/30 disabled:opacity-50"
          />
          <button
            onClick={submitAnswer}
            disabled={!answer.trim() || questionLoading}
            className="self-end rounded-full bg-foreground text-background px-5 py-2 text-sm font-medium disabled:opacity-40 transition-opacity"
          >
            Save reflection
          </button>
        </div>
      )}

      {/* Trajectory: a night sky that grows with every reflection */}
      {data.reflections.length > 0 && (
        <div className="rounded-xl bg-neutral-950 text-neutral-100 p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Your constellation
            </p>
            <span className="text-xs text-neutral-400">
              {data.reflections.length} star
              {data.reflections.length === 1 ? "" : "s"} lit
            </span>
          </div>

          {/* The constellation grows with every reflection */}
          <Constellation count={data.reflections.length} />

          {trajectoryLoading ? (
            <p className="text-base text-neutral-400 animate-pulse text-center">
              Reading where you are on the path…
            </p>
          ) : trajectory ? (
            <p className="text-base leading-relaxed text-center text-neutral-200">
              {trajectory}
            </p>
          ) : (
            <p className="text-sm text-neutral-400 text-center">
              See how far you&apos;ve come and where to focus next.
            </p>
          )}

          <button
            onClick={() => fetchTrajectory(data)}
            disabled={trajectoryLoading}
            className="self-center rounded-full border border-white/25 text-neutral-100 px-5 py-1.5 text-sm font-medium disabled:opacity-40 transition-opacity hover:bg-white/5"
          >
            {trajectory ? "Refresh trajectory" : "Where am I?"}
          </button>
        </div>
      )}

      {/* Seal a promise to your future self — on-chain */}
      <SealPromise
        northStar={data.northStar}
        reflectionCount={data.reflections.length}
        sealed={data.sealedPromise}
        onSealed={(sealed) => {
          const next = { ...data, sealedPromise: sealed };
          setData(next);
          saveUser(address, next);
        }}
      />

      <div className="flex items-center justify-center gap-4 text-xs text-neutral-400">
        <span className="font-mono">
          {address.slice(0, 6)}…{address.slice(-4)}
        </span>
        <button
          onClick={handleLogOut}
          className="underline hover:text-neutral-600"
        >
          Log out
        </button>
      </div>

      <Footer />
    </div>
  );
}
