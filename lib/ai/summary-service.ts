import { generateWithOllama } from "@/lib/ai/ollama-client";
import { parseSessionSummary } from "@/lib/ai/response-parser";
import type { SessionSummary } from "@/lib/ai/schemas";
import { demoSessionSummary } from "@/lib/ai/demo-responses";
import { sessionSummaryPrompt } from "@/lib/ai/prompts/session-summary-prompt";
import { buildTutorContext } from "@/lib/ai/context-builder";

export async function summarizeSession(sessionId: string): Promise<SessionSummary> {
  const context = await buildTutorContext(sessionId);
  const messages = [...context.session.messages]
    .reverse()
    .map((message) => ({ role: message.role, content: message.content }));
  const system = sessionSummaryPrompt({
    topicName: context.topicName,
    messages,
    currentMastery: context.masteryScore,
  });

  if (process.env.AETHER_DEMO_MODE === "true") {
    return demoSessionSummary(context.topicName, context.masteryScore);
  }

  const result = await generateWithOllama({ system, prompt: "Return only JSON.", temperature: 0.3 });
  if (result.ok) {
    const parsed = parseSessionSummary(result.text);
    if (parsed.success) return parsed.data;
  }

  return demoSessionSummary(context.topicName, context.masteryScore);
}
