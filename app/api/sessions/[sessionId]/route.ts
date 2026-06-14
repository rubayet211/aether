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
    const summary = await summarizeSession(sessionId);

    const session = await prisma.session.update({
      where: { id: sessionId },
      data: {
        endedAt: new Date(),
        summary: summary.summary,
        keyTakeaways: summary.keyTakeaways,
        misconceptions: summary.misconceptions,
      },
      include: { topic: true, messages: { orderBy: { createdAt: "asc" } } },
    });

    if (session.topicId) {
      await prisma.progress.upsert({
        where: { userId_topicId: { userId: session.userId, topicId: session.topicId } },
        update: {
          mastery: summary.updatedMasteryEstimate,
          lastPracticed: new Date(),
        },
        create: {
          userId: session.userId,
          topicId: session.topicId,
          mastery: summary.updatedMasteryEstimate,
          lastPracticed: new Date(),
        },
      });
    }

    return jsonOk({ session, summary });
  } catch (error) {
    return jsonError(error);
  }
}
