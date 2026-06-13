"use client";

// A constellation that grows as the user reflects. Each reflection lights one
// sparkle star; the path climbs toward the North Star at the top. Seven stars
// complete a constellation, then a new one begins. Styled after zodiac-poster
// constellations: white/silver sparkles on a dark sky, thin connecting lines.

export const STARS_PER_CONSTELLATION = 7;

type Props = {
  lit: number; // how many stars are lit in THIS constellation (0..7)
  showNorthStar?: boolean; // draw the bright North Star at the top (default true)
  className?: string;
};

// Pre-placed star positions (percent of the viewBox), winding upward.
// viewBox 100 x 140; higher index = higher on the path.
const PATH: { x: number; y: number }[] = [
  { x: 50, y: 126 },
  { x: 36, y: 110 },
  { x: 60, y: 96 },
  { x: 40, y: 80 },
  { x: 62, y: 64 },
  { x: 44, y: 48 },
  { x: 54, y: 34 },
];

const NORTH_STAR = { x: 50, y: 16 };

// A four-point sparkle star centered at (cx, cy) with the given radius.
function sparklePath(cx: number, cy: number, r: number): string {
  const w = r * 0.28;
  return [
    `M${cx} ${cy - r}`,
    `Q${cx + w} ${cy - w} ${cx + r} ${cy}`,
    `Q${cx + w} ${cy + w} ${cx} ${cy + r}`,
    `Q${cx - w} ${cy + w} ${cx - r} ${cy}`,
    `Q${cx - w} ${cy - w} ${cx} ${cy - r}`,
    "Z",
  ].join(" ");
}

export default function Constellation({
  lit,
  showNorthStar = true,
  className = "w-full max-w-[240px] mx-auto text-white",
}: Props) {
  const litCount = Math.min(lit, PATH.length);

  const litPoints = PATH.slice(0, litCount);
  const tail = showNorthStar ? [NORTH_STAR] : [];
  const linePoints = [...litPoints]
    .reverse()
    .concat(tail)
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 140"
      className={className}
      role="img"
      aria-label={`${litCount} of ${PATH.length} stars lit`}
    >
      {litCount > 0 && (
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

      {PATH.map((p, i) => {
        const isLit = i < litCount;
        if (isLit) {
          return (
            <path key={i} d={sparklePath(p.x, p.y, 4)} fill="currentColor">
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

      {showNorthStar && (
        <path d={sparklePath(NORTH_STAR.x, NORTH_STAR.y, 7)} fill="currentColor">
          <animate
            attributeName="fill-opacity"
            values="0.85;1;0.85"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </path>
      )}
    </svg>
  );
}
