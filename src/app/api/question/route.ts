import Anthropic from "@anthropic-ai/sdk";

// POST /api/question
// Body: { northStar: string, reflections: { question, answer, date }[] }
// Returns: { question: string, source: "ai" | "dummy" }
//
// Generates the next daily question from the founder's FULL reflection
// history (every past question + answer), so it builds on the whole journey
// rather than the last few answers. Claude when ANTHROPIC_API_KEY is set;
// a rotating canned question otherwise.

type Reflection = { question: string; answer: string; date?: string };
type Body = {
  northStar?: string;
  reflections?: Reflection[];
  // legacy field, still accepted
  recentAnswers?: string[];
};

const DUMMY_QUESTIONS = [
  "What is the single most important thing you can do today to move toward your north star?",
  "Looking at yesterday, what got in the way, and how will you handle it differently today?",
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
  // Prefer full reflection history; fall back to legacy recentAnswers.
  const reflections: Reflection[] =
    body.reflections ??
    (body.recentAnswers ?? []).map((a) => ({ question: "", answer: a }));

  if (!northStar) {
    return Response.json({ error: "northStar is required" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({
      question: dummyQuestion(reflections.map((r) => r.answer)),
      source: "dummy",
    });
  }

  try {
    const client = new Anthropic({ apiKey });
    // Give the model the ENTIRE journey: every past question + answer.
    const history =
      reflections.length > 0
        ? `Their full reflection history so far (oldest first):\n${reflections
            .map(
              (r, i) =>
                `${i + 1}.${r.date ? ` [${r.date}]` : ""} Q: ${r.question || "(daily prompt)"}\n   A: ${r.answer}`,
            )
            .join("\n")}`
        : "They have not reflected yet — this is their first day.";

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 256,
      thinking: { type: "adaptive" },
      system:
        "You are Northstar, a warm but sharp daily companion for a founder pursuing a big goal (their 'north star'). " +
        "Each day you ask ONE short, pointed question that pulls them toward that goal. " +
        "The question must be specific to their north star and build on the ARC of their whole reflection history (notice patterns, follow up on what they said before, push them forward) — never generic, never a repeat. " +
        "Return ONLY the question itself: one sentence, no preamble, no quotes, no explanation. " +
        "Never use an em dash (—); use a comma, period, or colon instead.",
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
      question: text || dummyQuestion(reflections.map((r) => r.answer)),
      source: text ? "ai" : "dummy",
    });
  } catch (err) {
    // Never break the daily loop on an API hiccup — fall back gracefully.
    console.error("question generation failed:", err);
    return Response.json({
      question: dummyQuestion(reflections.map((r) => r.answer)),
      source: "dummy",
    });
  }
}
