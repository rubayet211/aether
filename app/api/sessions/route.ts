import { prisma } from "@/lib/db";
import { createSessionRequestSchema } from "@/lib/api/validators";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function GET(request: Request) {
  try {
    const userId = new URL(request.url).searchParams.get("userId");
    if (!userId) return jsonError(new Error("Missing userId."), 400);

    const sessions = await prisma.session.findMany({
      where: { userId },
      include: { topic: true, messages: { orderBy: { createdAt: "asc" } } },
      orderBy: { startedAt: "desc" },
      take: 20,
    });

    return jsonOk({ sessions });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = createSessionRequestSchema.parse(await request.json());
    const user = input.userId
      ? await prisma.user.findUnique({ where: { id: input.userId } })
      : await prisma.user.create({ data: { name: "Guest Student" } });

    if (!user) return jsonError(new Error("User not found. Complete the diagnostic first."), 404);

    const topic =
      input.topicId !== undefined
        ? await prisma.topic.findUnique({ where: { id: input.topicId } })
        : await prisma.topic.findFirst({ orderBy: { order: "asc" } });

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        topicId: topic?.id,
        mode: input.mode,
        title: topic ? `${topic.name} tutoring` : "Physics tutoring",
        messages: {
          create: {
            role: "assistant",
            content: topic
              ? `Let's reason through ${topic.name}. To start, what do you already know about this situation?`
              : "Let's reason through a Physics problem. What topic should we start with?",
          },
        },
      },
      include: { topic: true, messages: { orderBy: { createdAt: "asc" } } },
    });

    return jsonOk({ userId: user.id, session });
  } catch (error) {
    return jsonError(error);
  }
}
