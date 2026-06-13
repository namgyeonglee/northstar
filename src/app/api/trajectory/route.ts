import Anthropic from "@anthropic-ai/sdk";

// POST /api/trajectory
// Body: { northStar: string, reflections: { question: string, answer: string, date: string }[] }
// Returns: { summary: string, source: "ai" | "dummy" }
//
// Analyzes accumulated reflections to tell the user where they are on the path
// to their north star. Claude when ANTHROPIC_API_KEY is set; smart canned
// summary otherwise, so the trajectory view demos without a key.

type Reflection = { question: string; answer: string; date: string };
type Body = { northStar?: string; reflections?: Reflection[] };

function dummySummary(northStar: string, reflections: Reflection[]): string {
  const n = reflections.length;
  if (n === 0) {
    return `You've set your North Star, "${northStar}", but haven't reflected yet. Your journey starts with today's first answer.`;
  }
  const days = new Set(reflections.map((r) => r.date)).size;
  const momentum =
    n >= 5
      ? "You're building real momentum"
      : n >= 2
        ? "You're finding your rhythm"
        : "You've taken the first step";
  return `${momentum}: ${n} reflection${n === 1 ? "" : "s"} across ${days} day${days === 1 ? "" : "s"}, all pointed at "${northStar}". Keep showing up. Every answer moves the needle.`;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const northStar = (body.northStar ?? "").trim();
  const reflections = body.reflections ?? [];

  if (!northStar) {
    return Response.json({ error: "northStar is required" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({
      summary: dummySummary(northStar, reflections),
      source: "dummy",
    });
  }

  try {
    const client = new Anthropic({ apiKey });
    const log = reflections
      .map((r) => `[${r.date}] Q: ${r.question}\n   A: ${r.answer}`)
      .join("\n");

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 384,
      thinking: { type: "adaptive" },
      system:
        "You are Northstar, a daily companion for a founder pursuing a big goal. " +
        "Given their north star and the log of their daily reflections, tell them where they are on the path: " +
        "name the momentum and direction you see, the most encouraging signal, and the one thing to focus on next. " +
        "Be specific to what they actually wrote. Warm, honest, motivating. 2 to 4 sentences. No preamble, no lists, no headers. " +
        "Never use an em dash (—); use a comma, period, or colon instead.",
      messages: [
        {
          role: "user",
          content: `My north star: ${northStar}\n\nMy reflections so far:\n${log || "(none yet)"}\n\nWhere am I on the path?`,
        },
      ],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    return Response.json({
      summary: text || dummySummary(northStar, reflections),
      source: text ? "ai" : "dummy",
    });
  } catch (err) {
    console.error("trajectory generation failed:", err);
    return Response.json({
      summary: dummySummary(northStar, reflections),
      source: "dummy",
    });
  }
}
