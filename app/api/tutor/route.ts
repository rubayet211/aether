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

    await prisma.message.create({
      data: {
        sessionId: input.sessionId,
        role: "student",
        content: input.userMessage,
        metadata: { action: input.action },
      },
    });

    const aiMessage = await getTutorReply(input);

    await prisma.message.create({
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

    let updatedProgress: { mastery: number; delta: number } | null = null;
    if (session.topicId) {
      const existing = await prisma.progress.findUnique({
        where: { userId_topicId: { userId: session.userId, topicId: session.topicId } },
      });
      const reasoningQuality = aiMessage.reasoningQuality ?? inferReasoningQuality(input.userMessage);
      updatedProgress = estimateMasteryUpdate({
        currentMastery: existing?.mastery ?? 30,
        reasoningQuality,
        hintCount: input.action === "hint" ? 1 : 0,
        misconceptionPersisted: aiMessage.misconceptionPersisted,
      });

      await prisma.progress.upsert({
        where: { userId_topicId: { userId: session.userId, topicId: session.topicId } },
        update: {
          mastery: updatedProgress.mastery,
          attempts: { increment: 1 },
          correctAttempts: reasoningQuality === "strong" ? { increment: 1 } : undefined,
          lastPracticed: new Date(),
        },
        create: {
          userId: session.userId,
          topicId: session.topicId,
          mastery: updatedProgress.mastery,
          attempts: 1,
          correctAttempts: reasoningQuality === "strong" ? 1 : 0,
          lastPracticed: new Date(),
        },
      });
    }

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
