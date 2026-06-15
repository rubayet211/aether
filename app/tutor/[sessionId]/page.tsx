import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ChatInterface } from "@/components/tutor/chat-interface";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TutorSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { topic: true, messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!session) notFound();

  const progress = session.topicId
    ? await prisma.progress.findUnique({
        where: { userId_topicId: { userId: session.userId, topicId: session.topicId } },
      })
    : null;

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <ChatInterface
          sessionId={session.id}
          topicId={session.topicId ?? undefined}
          topicName={session.topic?.name ?? "Physics Reasoning"}
          masteryScore={progress?.mastery ?? 35}
          initialMessages={session.messages.map((message) => ({
            id: message.id,
            role: message.role,
            content: message.content,
          }))}
        />
      </div>
    </AppShell>
  );
}
