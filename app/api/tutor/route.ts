import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/response";
import { tutorRequestSchema } from "@/lib/api/validators";
import { getTutorReply } from "@/lib/ai/tutor-service";
import { estimateMasteryUpdate, inferReasoningQuality } from "@/lib/progress/mastery";

export async function POST(request: Request) {
  try {
    const input = tutorRequestSchema.parse(await request.json());
    const session = await prisma.session.findUnique({
      where: { id: input.sessionId },
      include: { topic: true },
    });
    if (!session) return jsonError(new Error("Session not found."), 404);
    if (session.endedAt) return jsonError(new Error("This session has already ended."), 409);

    // Save the student message first so the tutor context (built inside
    // getTutorReply) includes the latest turn. The AI call can take many
    // seconds, so it must run outside of any database transaction.
    await prisma.message.create({
      data: {
        sessionId: input.sessionId,
        role: "student",
        content: input.userMessage,
        metadata: { action: input.action },
      },
    });

    const aiMessage = await getTutorReply(input);
    const reasoningQuality = aiMessage.reasoningQuality ?? inferReasoningQuality(input.userMessage);

    // Persist the assistant reply and the progress update atomically so we
    // never advance mastery without a saved reply (or vice versa).
    const updatedProgress = await prisma.$transaction(async (tx) => {
      await tx.message.create({
        data: {
          sessionId: input.sessionId,
          role: "assistant",
          content: aiMessage.message,
          metadata: {
            detectedMisconceptions: aiMessage.detectedMisconceptions,
            suggestedNextAction: aiMessage.suggestedNextAction,
            aiUnavailable: aiMessage.aiUnavailable ?? false,
          },
        },
      });

      if (!session.topicId) return null;

      const existing = await tx.progress.findUnique({
        where: { userId_topicId: { userId: session.userId, topicId: session.topicId } },
      });
      const result = estimateMasteryUpdate({
        currentMastery: existing?.mastery ?? 30,
        reasoningQuality,
        hintCount: input.action === "hint" ? 1 : 0,
        misconceptionPersisted: aiMessage.misconceptionPersisted,
      });

      await tx.progress.upsert({
        where: { userId_topicId: { userId: session.userId, topicId: session.topicId } },
        update: {
          mastery: result.mastery,
          attempts: { increment: 1 },
          correctAttempts: reasoningQuality === "strong" ? { increment: 1 } : undefined,
          lastPracticed: new Date(),
        },
        create: {
          userId: session.userId,
          topicId: session.topicId,
          mastery: result.mastery,
          attempts: 1,
          correctAttempts: reasoningQuality === "strong" ? 1 : 0,
          lastPracticed: new Date(),
        },
      });

      return result;
    });

    return jsonOk({
      aiMessage: aiMessage.message,
      detectedMisconceptions: aiMessage.detectedMisconceptions,
      suggestedNextAction: aiMessage.suggestedNextAction,
      updatedProgress,
      aiUnavailable: aiMessage.aiUnavailable ?? false,
    });
  } catch (error) {
    return jsonError(error);
  }
}
