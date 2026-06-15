import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/response";
import { endSessionRequestSchema } from "@/lib/api/validators";
import { summarizeSession } from "@/lib/ai/summary-service";

export async function GET(_request: Request, context: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await context.params;
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { topic: true, messages: { orderBy: { createdAt: "asc" } }, user: true },
    });

    if (!session) return jsonError(new Error("Session not found."), 404);
    return jsonOk({ session });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ sessionId: string }> }) {
  try {
    endSessionRequestSchema.parse(await request.json());
    const { sessionId } = await context.params;

    const existing = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { topic: true, messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!existing) return jsonError(new Error("Session not found."), 404);

    // Idempotency: ending an already-ended session must not regenerate the
    // summary or re-apply the mastery update. Return the saved state instead.
    if (existing.endedAt) {
      return jsonOk({
        session: existing,
        summary: {
          summary: existing.summary ?? "",
          keyTakeaways: (existing.keyTakeaways as string[] | null) ?? [],
          misconceptions: (existing.misconceptions as string[] | null) ?? [],
          recommendedNextStep: "Review your dashboard to choose the next topic.",
          updatedMasteryEstimate: existing.topicId
            ? (
                await prisma.progress.findUnique({
                  where: { userId_topicId: { userId: existing.userId, topicId: existing.topicId } },
                })
              )?.mastery ?? 0
            : 0,
        },
        alreadyEnded: true,
      });
    }

    const summary = await summarizeSession(sessionId);

    const session = await prisma.$transaction(async (tx) => {
      const updated = await tx.session.update({
        where: { id: sessionId },
        data: {
          endedAt: new Date(),
          summary: summary.summary,
          keyTakeaways: summary.keyTakeaways,
          misconceptions: summary.misconceptions,
        },
        include: { topic: true, messages: { orderBy: { createdAt: "asc" } } },
      });

      if (updated.topicId) {
        await tx.progress.upsert({
          where: { userId_topicId: { userId: updated.userId, topicId: updated.topicId } },
          update: {
            mastery: summary.updatedMasteryEstimate,
            lastPracticed: new Date(),
          },
          create: {
            userId: updated.userId,
            topicId: updated.topicId,
            mastery: summary.updatedMasteryEstimate,
            lastPracticed: new Date(),
          },
        });
      }

      return updated;
    });

    return jsonOk({ session, summary });
  } catch (error) {
    return jsonError(error);
  }
}
