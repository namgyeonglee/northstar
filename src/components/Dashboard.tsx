"use client";

import { useEffect, useState, useCallback } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import {
  loadUser,
  saveUser,
  emptyUser,
  type UserData,
  type Reflection,
} from "@/lib/store";
import SealPromise from "@/components/SealPromise";

function todayISO(): string {
  // YYYY-MM-DD in local time, no Date.now() needed for display.
  return new Date().toISOString().slice(0, 10);
}

export default function Dashboard() {
  const { primaryWallet, handleLogOut } = useDynamicContext();
  const address = primaryWallet?.address ?? "";

  const [data, setData] = useState<UserData>(emptyUser());
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState("");

  // Daily question state
  const [question, setQuestion] = useState("");
  const [questionLoading, setQuestionLoading] = useState(false);
  const [answer, setAnswer] = useState("");

  // Trajectory state
  const [trajectory, setTrajectory] = useState("");
  const [trajectoryLoading, setTrajectoryLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    const u = loadUser(address);
    setData(u);
    setDraft(u.northStar);
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
  useEffect(() => {
    if (loaded && data.northStar && !question && !questionLoading) {
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
      setTrajectory("Couldn't read your trajectory just now — try again.");
    } finally {
      setTrajectoryLoading(false);
    }
  }, []);

  function saveNorthStar() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const next = { ...data, northStar: trimmed };
    setData(next);
    saveUser(address, next);
  }

  function submitAnswer() {
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
    setQuestion("");
    // Next question will be fetched by the effect (question is now empty).
    fetchQuestion(next);
  }

  if (!loaded) {
    return <p className="text-sm text-neutral-500">Loading your journey…</p>;
  }

  // --- No north star yet → ask for it. ---
  if (!data.northStar) {
    return (
      <div className="w-full flex flex-col gap-4 text-left">
        <h2 className="text-xl font-medium text-center">
          What&apos;s your north star?
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
          The one big goal you&apos;re moving toward. Be specific — this is what
          every daily question will pull you back to.
        </p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="e.g. Launch my SaaS and reach $10k MRR within a year"
          className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent p-3 text-base outline-none focus:border-black/30 dark:focus:border-white/30"
        />
        <button
          onClick={saveNorthStar}
          disabled={!draft.trim()}
          className="self-center rounded-full bg-foreground text-background px-6 py-2.5 text-sm font-medium disabled:opacity-40 transition-opacity"
        >
          Set my north star →
        </button>
      </div>
    );
  }

  // --- North star set → daily reflection loop. ---
  return (
    <div className="w-full flex flex-col gap-6 text-left">
      <div className="rounded-xl border border-black/10 dark:border-white/15 p-5">
        <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
          Your north star
        </p>
        <p className="text-lg font-medium">{data.northStar}</p>
      </div>

      {/* Today's question */}
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

      {/* Trajectory: where am I on the path? */}
      {data.reflections.length > 0 && (
        <div className="rounded-xl border border-black/10 dark:border-white/15 p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Your trajectory
            </p>
            <span className="text-xs text-neutral-400">
              🌱 {data.reflections.length} reflection
              {data.reflections.length === 1 ? "" : "s"}
            </span>
          </div>

          {trajectoryLoading ? (
            <p className="text-base text-neutral-400 animate-pulse">
              Reading where you are on the path…
            </p>
          ) : trajectory ? (
            <p className="text-base leading-relaxed">{trajectory}</p>
          ) : (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              See how far you&apos;ve come and where to focus next.
            </p>
          )}

          <button
            onClick={() => fetchTrajectory(data)}
            disabled={trajectoryLoading}
            className="self-start rounded-full border border-black/15 dark:border-white/20 px-4 py-1.5 text-sm font-medium disabled:opacity-40 transition-opacity"
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
    </div>
  );
}
