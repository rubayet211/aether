import { z } from "zod";

export const tutorModeSchema = z.enum(["guided_reasoning", "practice", "explain"]);
export type TutorMode = z.infer<typeof tutorModeSchema>;

export const generatedProblemSchema = z.object({
  topic: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),
  question: z.string().min(1),
  given: z.array(z.string()).min(1),
  goal: z.string().min(1),
  hints: z.array(z.string()).min(1),
  expectedReasoningPath: z.array(z.string()).min(1),
  finalAnswer: z.string().min(1),
  commonMisconceptions: z.array(z.string()),
});

export const generatedProblemsSchema = z.array(generatedProblemSchema).min(1).max(3);
export type GeneratedProblem = z.infer<typeof generatedProblemSchema>;

export const tutorResponseSchema = z.object({
  message: z.string().min(1),
  detectedMisconceptions: z.array(z.string()).default([]),
  suggestedNextAction: z.enum(["answer_next_question", "try_hint", "generate_practice", "review_summary"]),
  reasoningQuality: z.enum(["weak", "partial", "strong"]).default("partial"),
  misconceptionPersisted: z.boolean().default(false),
});

export type TutorResponse = z.infer<typeof tutorResponseSchema>;

export const sessionSummarySchema = z.object({
  summary: z.string().min(1),
  keyTakeaways: z.array(z.string()),
  misconceptions: z.array(z.string()),
  recommendedNextStep: z.string().min(1),
  updatedMasteryEstimate: z.number().min(0).max(100),
});

export type SessionSummary = z.infer<typeof sessionSummarySchema>;
