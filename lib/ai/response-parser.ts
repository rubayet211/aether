import { generatedProblemsSchema, sessionSummarySchema, tutorResponseSchema } from "@/lib/ai/schemas";

export type ParseResult<T> = { success: true; data: T } | { success: false; error: string };

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return JSON.parse(trimmed);

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return JSON.parse(fenced[1]);

  const arrayStart = trimmed.indexOf("[");
  const objectStart = trimmed.indexOf("{");
  const startCandidates = [arrayStart, objectStart].filter((index) => index >= 0);
  const start = Math.min(...startCandidates);
  const end = Math.max(trimmed.lastIndexOf("]"), trimmed.lastIndexOf("}"));

  if (!Number.isFinite(start) || end < start) {
    throw new Error("No JSON object or array found in model response.");
  }

  return JSON.parse(trimmed.slice(start, end + 1));
}

export function parseProblemsJson(text: string): ParseResult<ReturnType<typeof generatedProblemsSchema.parse>> {
  try {
    return { success: true, data: generatedProblemsSchema.parse(extractJson(text)) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Invalid problem JSON." };
  }
}

export function parseTutorResponse(text: string) {
  try {
    return { success: true as const, data: tutorResponseSchema.parse(extractJson(text)) };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : "Invalid tutor JSON." };
  }
}

export function parseSessionSummary(text: string) {
  try {
    return { success: true as const, data: sessionSummarySchema.parse(extractJson(text)) };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : "Invalid summary JSON." };
  }
}
