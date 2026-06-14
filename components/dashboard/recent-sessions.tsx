import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

export type RecentSession = {
  id: string;
  title: string | null;
  summary: string | null;
  startedAt: string | Date;
  topic?: { name: string } | null;
};

export function RecentSessions({ sessions }: { sessions: RecentSession[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent sessions</CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <EmptyState title="No sessions yet" description="Start tutoring to build your learning history." />
        ) : (
          <div className="space-y-3">
            {sessions.slice(0, 5).map((session) => (
              <Link
                key={session.id}
                href={`/tutor/${session.id}`}
                className="block rounded-lg border border-slate-200 p-3 transition hover:border-teal-300 hover:bg-teal-50"
              >
                <p className="font-medium text-slate-950">{session.title ?? session.topic?.name ?? "Physics session"}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                  {session.summary ?? "Session in progress. Reopen it to continue reasoning."}
                </p>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
