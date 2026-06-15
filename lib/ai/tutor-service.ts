import { generateWithOllama } from "@/lib/ai/ollama-client";
import { parseTutorResponse } from "@/lib/ai/response-parser";
import type { TutorMode, TutorResponse } from "@/lib/ai/schemas";
import { demoTutorResponse, aiUnavailableMessage } from "@/lib/ai/demo-responses";
import { socraticTutorPrompt } from "@/lib/ai/prompts/socratic-tutor-prompt";
import { buildTutorContext } from "@/lib/ai/context-builder";

export async function getTutorReply(input: {
  sessionId: string;
  userMessage: string;
  mode: TutorMode;
  action: "message" | "hint" | "explain" | "practice";
}): Promise<TutorResponse & { aiUnavailable?: boolean }> {
  const context = await buildTutorContext(input.sessionId);
  const system = socraticTutorPrompt({ ...context, mode: input.mode, action: input.action });
  const prompt = `Student action: ${input.action}\nStudent message: ${input.userMessage}`;

  if (process.env.AETHER_DEMO_MODE === "true") {
    return demoTutorResponse(input.userMessage, input.action);
  }

  const explanatory = input.action === "explain" || input.mode === "explain";
  const result = await generateWithOllama({ system, prompt, temperature: explanatory ? 0.35 : 0.4 });
  if (!result.ok) {
    return {
      message: aiUnavailableMessage,
      detectedMisconceptions: [],
      suggestedNextAction: "review_summary",
      reasoningQuality: "partial",
      misconceptionPersisted: false,
      aiUnavailable: true,
    };
  }

  const parsed = parseTutorResponse(result.text);
  return parsed.success ? parsed.data : demoTutorResponse(input.userMessage, input.action);
}
