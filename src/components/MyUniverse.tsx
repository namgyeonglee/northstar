"use client";

import Constellation, {
  STARS_PER_CONSTELLATION,
} from "@/components/Constellation";

type Props = {
  totalReflections: number;
  northStar: string;
  onClose: () => void;
};

// Deterministic scattered background stars (no Math.random — stable across
// renders and SSR-safe). A simple hash of the index spreads them around.
function bgStars(n: number) {
  const stars: { x: number; y: number; r: number; delay: number }[] = [];
  for (let i = 0; i < n; i++) {
    const x = (i * 73 + 17) % 100;
    const y = (i * 41 + 29) % 100;
    const r = 0.4 + ((i * 13) % 10) / 10;
    const delay = ((i * 7) % 30) / 10;
    stars.push({ x, y, r, delay });
  }
  return stars;
}

export default function MyUniverse({
  totalReflections,
  northStar,
  onClose,
}: Props) {
  const completed = Math.floor(totalReflections / STARS_PER_CONSTELLATION);
  const inProgress = totalReflections % STARS_PER_CONSTELLATION;

  // One tile per completed constellation, plus the in-progress one if any.
  const tiles: { lit: number; complete: boolean }[] = [];
  for (let i = 0; i < completed; i++)
    tiles.push({ lit: STARS_PER_CONSTELLATION, complete: true });
  if (inProgress > 0) tiles.push({ lit: inProgress, complete: false });

  const scatter = bgStars(60);

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 text-neutral-100 overflow-y-auto">
      {/* scattered background stars */}
      <svg
        className="pointer-events-none absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
        aria-hidden
      >
        {scatter.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r * 0.15} fill="white" fillOpacity={0.5}>
            <animate
              attributeName="fill-opacity"
              values="0.2;0.7;0.2"
              dur="4s"
              begin={`${s.delay}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>

      <div className="relative max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">
        {/* header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-400">
              My Universe
            </p>
            <h1 className="text-2xl font-semibold">Toward: {northStar}</h1>
            <p className="text-sm">
              <span className="text-amber-400 font-medium">
                {totalReflections} star{totalReflections === 1 ? "" : "s"} lit
              </span>
              {completed > 0 && (
                <span className="text-neutral-400">
                  {" · "}
                  {completed} constellation{completed === 1 ? "" : "s"} complete
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full border border-white/25 px-4 py-1.5 text-sm hover:bg-white/5 transition-colors"
          >
            Close ✕
          </button>
        </div>

        {/* constellations */}
        {tiles.length === 0 ? (
          <p className="text-neutral-400 text-center py-20">
            Your universe is empty for now. Answer your first question to light a
            star. ⭐
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-6">
            {tiles.map((t, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4 w-[160px]"
              >
                <Constellation
                  lit={t.lit}
                  showNorthStar={t.complete}
                  className="w-full max-w-[150px] text-white"
                />
                <p
                  className={`text-xs ${
                    t.complete ? "text-amber-400" : "text-neutral-400"
                  }`}
                >
                  {t.complete
                    ? `✦ Constellation ${i + 1}`
                    : `In progress · ${t.lit}/${STARS_PER_CONSTELLATION}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
