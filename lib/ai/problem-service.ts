import { prisma } from "@/lib/db";
import { demoProblems } from "@/lib/ai/demo-responses";
import { generateWithOllama } from "@/lib/ai/ollama-client";
import { parseProblemsJson } from "@/lib/ai/response-parser";
import type { GeneratedProblem } from "@/lib/ai/schemas";
import { problemGeneratorPrompt } from "@/lib/ai/prompts/problem-generator-prompt";

export async function generateProblems(input: {
  topicId?: string;
  difficulty?: "easy" | "medium" | "hard";
  weakAreas: string[];
  masteryScore?: number;
}): Promise<GeneratedProblem[]> {
  const topic = input.topicId
    ? await prisma.topic.findUnique({ where: { id: input.topicId } })
    : await prisma.topic.findFirst({ orderBy: { order: "asc" } });
  const topicName = topic?.name ?? input.weakAreas[0] ?? "Newton's Laws";
  const difficulty = input.difficulty ?? ((input.masteryScore ?? 30) > 70 ? "medium" : "easy");

  if (process.env.AETHER_DEMO_MODE === "true") {
    return demoProblems(topicName, difficulty);
  }

  const system = problemGeneratorPrompt({
    topicName,
    difficulty,
    weakAreas: input.weakAreas,
    masteryScore: input.masteryScore ?? 30,
  });
  const result = await generateWithOllama({
    system,
    prompt: "Return only the JSON array.",
    temperature: 0.5,
  });

  if (result.ok) {
    const parsed = parseProblemsJson(result.text);
    if (parsed.success) return parsed.data;

    const retry = await generateWithOllama({
      system,
      prompt: "Your previous response was invalid. Return only a valid JSON array with 2 or 3 complete problems.",
      temperature: 0.2,
    });
    if (retry.ok) {
      const retryParsed = parseProblemsJson(retry.text);
      if (retryParsed.success) return retryParsed.data;
    }
  }

  return demoProblems(topicName, difficulty);
}
