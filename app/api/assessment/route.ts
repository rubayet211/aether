import { prisma } from "@/lib/db";
import { assessmentRequestSchema } from "@/lib/api/validators";
import { jsonError, jsonOk } from "@/lib/api/response";
import { evaluateDiagnostic } from "@/lib/ai/assessment-service";

export async function POST(request: Request) {
  try {
    const input = assessmentRequestSchema.parse(await request.json());
    const user = input.userId
      ? await prisma.user.upsert({
          where: { id: input.userId },
          update: {},
          create: { id: input.userId, name: "Guest Student" },
        })
      : await prisma.user.create({ data: { name: "Guest Student" } });

    const result = evaluateDiagnostic(input.answers);

    await prisma.user.update({
      where: { id: user.id },
      data: { currentLevel: result.level },
    });

    await prisma.assessment.create({
      data: {
        userId: user.id,
        score: result.score,
        level: result.level,
        weakAreas: result.weakAreas,
        answers: input.answers,
      },
    });

    const topics = await prisma.topic.findMany();
    await Promise.all(
      topics.map((topic) =>
        prisma.progress.upsert({
          where: { userId_topicId: { userId: user.id, topicId: topic.id } },
          update: { mastery: result.masteryByTopic[topic.slug] ?? 30 },
          create: {
            userId: user.id,
            topicId: topic.id,
            mastery: result.masteryByTopic[topic.slug] ?? 30,
          },
        }),
      ),
    );

    return jsonOk({ userId: user.id, ...result });
  } catch (error) {
    return jsonError(error);
  }
}
