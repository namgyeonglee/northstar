import Anthropic from "@anthropic-ai/sdk";

// POST /api/encourage
// Body: { northStar: string, question: string, answer: string }
// Returns: { message: string, source: "ai" | "dummy" }
//
// A short, warm one-liner shown right after the user answers, so the moment
// of reflecting feels rewarded. Claude when ANTHROPIC_API_KEY is set; a
// rotating canned cheer otherwise.

type Body = { northStar?: string; question?: string; answer?: string };

const DUMMY_CHEERS = [
  "That's a real step toward your North Star. ⭐",
  "Showing up like this is exactly how big goals get reached. ⭐",
  "Honest reflection today, momentum tomorrow. Nicely done. ⭐",
  "Your future self is grateful you took a minute for this. ⭐",
  "One more star on the path. Keep going. ⭐",
];

function dummyCheer(seed: string): string {
  // Deterministic pick from the answer length so it varies but doesn't flicker.
  return DUMMY_CHEERS[seed.length % DUMMY_CHEERS.length];
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const northStar = (body.northStar ?? "").trim();
  const question = (body.question ?? "").trim();
  const answer = (body.answer ?? "").trim();

  if (!answer) {
    return Response.json({ error: "answer is required" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ message: dummyCheer(answer), source: "dummy" });
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 120,
      system:
        "You are Northstar, a warm daily companion for a founder chasing a big goal. " +
        "The user just answered today's reflection question. Respond with ONE short, genuine, " +
        "encouraging sentence (max ~20 words) that makes them feel seen and want to come back tomorrow. " +
        "Be specific to what they wrote when you can. End with a single star emoji. " +
        "No preamble, no quotes, no advice. Never use an em dash (—); use a comma or period.",
      messages: [
        {
          role: "user",
          content: `My North Star: ${northStar}\nToday's question: ${question}\nMy answer: ${answer}`,
        },
      ],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    return Response.json({
      message: text || dummyCheer(answer),
      source: text ? "ai" : "dummy",
    });
  } catch (err) {
    console.error("encouragement failed:", err);
    return Response.json({ message: dummyCheer(answer), source: "dummy" });
  }
}
