import Anthropic from "@anthropic-ai/sdk";

// POST /api/question
// Body: { northStar: string, recentAnswers: string[] }
// Returns: { question: string, source: "ai" | "dummy" }
//
// If ANTHROPIC_API_KEY is set, generates a tailored question with Claude.
// Otherwise falls back to a smart canned question so the whole loop works
// end-to-end without a key (drop the key in .env.local later to go live).

type Body = {
  northStar?: string;
  recentAnswers?: string[];
};

const DUMMY_QUESTIONS = [
  "What is the single most important thing you can do today to move toward your north star?",
  "Looking at yesterday, what got in the way — and how will you handle it differently today?",
  "If you could only make one decision today that your future self would thank you for, what would it be?",
  "What's one small, concrete step you've been avoiding that would bring your goal closer?",
  "Who could you reach out to today that would accelerate your progress?",
];

function dummyQuestion(recentAnswers: string[]): string {
  // Rotate by how many reflections exist so it doesn't repeat day to day.
  const idx = recentAnswers.length % DUMMY_QUESTIONS.length;
  return DUMMY_QUESTIONS[idx];
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const northStar = (body.northStar ?? "").trim();
  const recentAnswers = body.recentAnswers ?? [];

  if (!northStar) {
    return Response.json({ error: "northStar is required" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({
      question: dummyQuestion(recentAnswers),
      source: "dummy",
    });
  }

  try {
    const client = new Anthropic({ apiKey });
    const history =
      recentAnswers.length > 0
        ? `Their recent reflections (most recent last):\n${recentAnswers
            .map((a, i) => `${i + 1}. ${a}`)
            .join("\n")}`
        : "They have not reflected yet — this is their first day.";

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 256,
      thinking: { type: "adaptive" },
      system:
        "You are Northstar, a warm but sharp daily companion for a founder pursuing a big goal (their 'north star'). " +
        "Each day you ask ONE short, pointed question that pulls them toward that goal. " +
        "The question must be specific to their north star and informed by their recent reflections — never generic. " +
        "Return ONLY the question itself: one sentence, no preamble, no quotes, no explanation.",
      messages: [
        {
          role: "user",
          content: `My north star: ${northStar}\n\n${history}\n\nAsk me today's question.`,
        },
      ],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    return Response.json({
      question: text || dummyQuestion(recentAnswers),
      source: text ? "ai" : "dummy",
    });
  } catch (err) {
    // Never break the daily loop on an API hiccup — fall back gracefully.
    console.error("question generation failed:", err);
    return Response.json({
      question: dummyQuestion(recentAnswers),
      source: "dummy",
    });
  }
}
