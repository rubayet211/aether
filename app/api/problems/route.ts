import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/response";
import { problemsRequestSchema } from "@/lib/api/validators";
import { generateProblems } from "@/lib/ai/problem-service";

export async function POST(request: Request) {
  try {
    const input = problemsRequestSchema.parse(await request.json());

    const user = await prisma.user.findUnique({ where: { id: input.userId } });
    if (!user) return jsonError(new Error("User not found. Complete the diagnostic first."), 404);

    const problems = await generateProblems(input);
    const topic =
      input.topicId !== undefined
        ? await prisma.topic.findUnique({ where: { id: input.topicId } })
        : await prisma.topic.findFirst({ orderBy: { order: "asc" } });

    if (topic) {
      await Promise.all(
        problems.map((problem) =>
          prisma.problem.create({
            data: {
              topicId: topic.id,
              difficulty: problem.difficulty,
              question: problem.question,
              solution: problem.finalAnswer,
              hints: problem.hints,
            },
          }),
        ),
      );
    }

    return jsonOk({ problems });
  } catch (error) {
    return jsonError(error);
  }
}
