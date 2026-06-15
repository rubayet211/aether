import { prisma } from "@/lib/db";
import { assessmentRequestSchema } from "@/lib/api/validators";
import { jsonError, jsonOk } from "@/lib/api/response";
import { evaluateDiagnostic } from "@/lib/ai/assessment-service";

export async function POST(request: Request) {
  try {
    const input = assessmentRequestSchema.parse(await request.json());
    const result = evaluateDiagnostic(input.answers);
    const topics = await prisma.topic.findMany();

    // Assessment creation and progress initialization must succeed together:
    // a user with an assessment but only partial progress records would show a
    // broken dashboard. Run all writes in a single transaction.
    const userId = await prisma.$transaction(async (tx) => {
      const user = input.userId
        ? await tx.user.upsert({
            where: { id: input.userId },
            update: { currentLevel: result.level },
            create: { id: input.userId, name: "Guest Student", currentLevel: result.level },
          })
        : await tx.user.create({ data: { name: "Guest Student", currentLevel: result.level } });

      await tx.assessment.create({
        data: {
          userId: user.id,
          score: result.score,
          level: result.level,
          weakAreas: result.weakAreas,
          answers: input.answers,
        },
      });

      for (const topic of topics) {
        await tx.progress.upsert({
          where: { userId_topicId: { userId: user.id, topicId: topic.id } },
          update: { mastery: result.masteryByTopic[topic.slug] ?? 30 },
          create: {
            userId: user.id,
            topicId: topic.id,
            mastery: result.masteryByTopic[topic.slug] ?? 30,
          },
        });
      }

      return user.id;
    });

    return jsonOk({ userId, ...result });
  } catch (error) {
    return jsonError(error);
  }
}
