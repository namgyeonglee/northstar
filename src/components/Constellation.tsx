"use client";

// A constellation that grows as the user reflects. Each reflection lights one
// sparkle star; the path climbs toward the North Star at the top. Styled after
// classic zodiac-poster constellations: white/silver sparkles on a dark sky,
// thin connecting lines.

type Props = {
  count: number; // number of reflections (lit stars below the North Star)
};

// Pre-placed star positions (percent of the viewBox), winding upward toward
// the North Star. viewBox 100 x 140; higher index = higher on the path.
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

// A four-point sparkle star centered at (cx, cy) with the given radius.
function sparklePath(cx: number, cy: number, r: number): string {
  const w = r * 0.28; // waist of the sparkle
  return [
    `M${cx} ${cy - r}`,
    `Q${cx + w} ${cy - w} ${cx + r} ${cy}`,
    `Q${cx + w} ${cy + w} ${cx} ${cy + r}`,
    `Q${cx - w} ${cy + w} ${cx - r} ${cy}`,
    `Q${cx - w} ${cy - w} ${cx} ${cy - r}`,
    "Z",
  ].join(" ");
}

export default function Constellation({ count }: Props) {
  const lit = Math.min(count, MAX);

  const litPoints = PATH.slice(0, lit);
  const linePoints = [...litPoints]
    .reverse()
    .concat([NORTH_STAR])
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 140"
      className="w-full max-w-[240px] mx-auto text-white"
      role="img"
      aria-label={`Your constellation: ${lit} of ${MAX} stars lit on the path to your North Star`}
    >
      {/* connecting path among lit stars + the North Star */}
      {lit > 0 && (
        <polyline
          points={linePoints}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.35"
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* path stars */}
      {PATH.map((p, i) => {
        const isLit = i < lit;
        if (isLit) {
          return (
            <path
              key={i}
              d={sparklePath(p.x, p.y, 4)}
              fill="currentColor"
            >
              <animate
                attributeName="fill-opacity"
                values="1;0.6;1"
                dur="3s"
                repeatCount="indefinite"
                begin={`${i * 0.3}s`}
              />
            </path>
          );
        }
        // unlit: faint small dot, a star waiting to be earned
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={1}
            fill="currentColor"
            fillOpacity={0.2}
          />
        );
      })}

      {/* the North Star — always the brightest, your destination */}
      <path d={sparklePath(NORTH_STAR.x, NORTH_STAR.y, 7)} fill="currentColor">
        <animate
          attributeName="fill-opacity"
          values="0.85;1;0.85"
          dur="2.5s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}
