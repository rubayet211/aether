import { prisma } from "@/lib/db";
import { topicNameFromSlug } from "@/lib/topics";
import type { StudentLevel } from "@/lib/assessment/diagnostic";

export async function buildTutorContext(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      user: true,
      topic: true,
      messages: { orderBy: { createdAt: "desc" }, take: 8 },
    },
  });

  if (!session) throw new Error("Session not found.");

  const progress = session.topicId
    ? await prisma.progress.findUnique({
        where: { userId_topicId: { userId: session.userId, topicId: session.topicId } },
      })
    : null;

  const weakProgress = await prisma.progress.findMany({
    where: { userId: session.userId, mastery: { lt: 55 } },
    include: { topic: true },
    orderBy: { mastery: "asc" },
    take: 4,
  });

  return {
    session,
    studentLevel: session.user.currentLevel as StudentLevel,
    topicName: session.topic?.name ?? topicNameFromSlug("newtons-first-law"),
    masteryScore: progress?.mastery ?? 30,
    weakTopics: weakProgress.map((item) => item.topic.name),
    recentMistakes: session.messages
      .flatMap((message) => {
        const metadata = message.metadata;
        if (
          metadata &&
          typeof metadata === "object" &&
          "detectedMisconceptions" in metadata &&
          Array.isArray(metadata.detectedMisconceptions)
        ) {
          return metadata.detectedMisconceptions.filter((item): item is string => typeof item === "string");
        }
        return [];
      })
      .slice(0, 4),
  };
}
