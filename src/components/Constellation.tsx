"use client";

// A constellation that grows as the user reflects. Each reflection lights up
// one star; the path climbs toward the North Star at the top. Ties the
// progress visualization directly to the product's name and concept.

type Props = {
  count: number; // number of reflections (lit stars below the North Star)
};

// Pre-placed star positions (percent of the viewBox), winding upward toward
// the North Star. No coordinate math — just fill in order as reflections grow.
// viewBox is 100 (w) x 140 (h); higher index = higher on the path.
const PATH: { x: number; y: number }[] = [
  { x: 50, y: 128 },
  { x: 34, y: 116 },
  { x: 60, y: 104 },
  { x: 40, y: 92 },
  { x: 62, y: 80 },
  { x: 44, y: 68 },
  { x: 58, y: 56 },
  { x: 46, y: 44 },
  { x: 54, y: 32 },
];

const NORTH_STAR = { x: 50, y: 16 };
const MAX = PATH.length;

export default function Constellation({ count }: Props) {
  const lit = Math.min(count, MAX);

  // Build the connecting line through the North Star and every lit star,
  // from the bottom upward.
  const litPoints = PATH.slice(0, lit);
  const linePoints = [...litPoints]
    .reverse() // bottom-first for a natural climbing line
    .concat([NORTH_STAR])
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 140"
      className="w-full max-w-[220px] mx-auto"
      role="img"
      aria-label={`Your constellation: ${lit} of ${MAX} stars lit on the path to your North Star`}
    >
      {/* faint connecting path among lit stars + the North Star */}
      {lit > 0 && (
        <polyline
          points={linePoints}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* path stars */}
      {PATH.map((p, i) => {
        const isLit = i < lit;
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={isLit ? 2.6 : 1.4}
            className={isLit ? "fill-amber-400" : "fill-current"}
            fillOpacity={isLit ? 1 : 0.18}
          >
            {isLit && (
              <animate
                attributeName="fill-opacity"
                values="1;0.55;1"
                dur="3s"
                repeatCount="indefinite"
                begin={`${i * 0.3}s`}
              />
            )}
          </circle>
        );
      })}

      {/* the North Star — always the brightest, your destination */}
      <g>
        <circle
          cx={NORTH_STAR.x}
          cy={NORTH_STAR.y}
          r="4.5"
          className="fill-amber-300"
        >
          <animate
            attributeName="r"
            values="4.5;5.2;4.5"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </circle>
        {/* little sparkle cross */}
        <path
          d={`M${NORTH_STAR.x} ${NORTH_STAR.y - 9} L${NORTH_STAR.x} ${NORTH_STAR.y + 9} M${NORTH_STAR.x - 9} ${NORTH_STAR.y} L${NORTH_STAR.x + 9} ${NORTH_STAR.y}`}
          stroke="currentColor"
          strokeOpacity="0.3"
          strokeWidth="0.5"
        />
      </g>
    </svg>
  );
}
