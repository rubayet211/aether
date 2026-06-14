import { z } from "zod";
import { tutorModeSchema } from "@/lib/ai/schemas";

export const assessmentRequestSchema = z.object({
  userId: z.string().optional(),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      selectedOptionId: z.string().min(1),
      reasoning: z.string().default(""),
    }),
  ),
});

export const createSessionRequestSchema = z.object({
  userId: z.string().optional(),
  topicId: z.string().optional(),
  mode: tutorModeSchema.default("guided_reasoning"),
});

export const tutorRequestSchema = z.object({
  sessionId: z.string().min(1),
  userMessage: z.string().min(1),
  topicId: z.string().optional(),
  mode: tutorModeSchema,
  action: z.enum(["message", "hint", "explain", "practice"]).default("message"),
});

export const problemsRequestSchema = z.object({
  userId: z.string().min(1),
  topicId: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  weakAreas: z.array(z.string()).default([]),
  masteryScore: z.number().min(0).max(100).optional(),
});

export const endSessionRequestSchema = z.object({
  end: z.literal(true),
});
