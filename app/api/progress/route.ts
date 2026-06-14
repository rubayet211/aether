import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function GET(request: Request) {
  try {
    const userId = new URL(request.url).searchParams.get("userId");
    if (!userId) return jsonError(new Error("Missing userId."), 400);

    const [user, progress, topics] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.progress.findMany({
        where: { userId },
        include: { topic: true },
        orderBy: { topic: { order: "asc" } },
      }),
      prisma.topic.findMany({ orderBy: { order: "asc" } }),
    ]);

    if (!user) return jsonError(new Error("User not found."), 404);

    const progressByTopic = new Map(progress.map((item) => [item.topicId, item]));
    const masteryMap = topics.map((topic) => {
      const item = progressByTopic.get(topic.id);
      return {
        topicId: topic.id,
        slug: topic.slug,
        name: topic.name,
        description: topic.description,
        mastery: item?.mastery ?? 0,
        attempts: item?.attempts ?? 0,
        lastPracticed: item?.lastPracticed,
      };
    });
    const weakAreas = masteryMap.filter((item) => item.mastery < 55).slice(0, 4);
    const recommendedTopic = weakAreas[0] ?? masteryMap[0];

    return jsonOk({
      user: { id: user.id, name: user.name, currentLevel: user.currentLevel },
      masteryMap,
      weakAreas,
      recommendedTopic,
    });
  } catch (error) {
    return jsonError(error);
  }
}
