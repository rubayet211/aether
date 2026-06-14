"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };
type HistorySession = {
  id: string;
  title: string | null;
  summary: string | null;
  keyTakeaways: string[] | null;
  misconceptions: string[] | null;
  startedAt: string;
  topic: { name: string } | null;
};

export default function HistoryPage() {
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const userId = localStorage.getItem("aetherUserId");
      if (!userId) {
        setError("No learning history found. Complete the diagnostic first.");
        setLoading(false);
        return;
      }
      const response = await fetch(`/api/sessions?userId=${userId}`);
      const payload = (await response.json()) as ApiResponse<{ sessions: HistorySession[] }>;
      if (payload.ok) setSessions(payload.data.sessions);
      else setError(payload.error);
      setLoading(false);
    }
    void load();
  }, []);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold text-teal-700">Session history</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Review how your reasoning improved.</h1>
        </div>
        {loading ? <p className="text-sm text-slate-500">Loading sessions...</p> : null}
        {error ? <ErrorState message={error} /> : null}
        {!loading && !error && sessions.length === 0 ? (
          <EmptyState title="No sessions yet" description="Start a tutor session, then end it to generate a summary." />
        ) : null}
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardContent className="pt-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <Badge variant={session.summary ? "green" : "slate"}>{session.summary ? "Completed" : "In progress"}</Badge>
                    <h2 className="mt-3 text-xl font-semibold text-slate-950">{session.title ?? session.topic?.name ?? "Physics session"}</h2>
                    <p className="mt-1 text-sm text-slate-500">{new Date(session.startedAt).toLocaleString()}</p>
                  </div>
                  <Button asChild variant="secondary">
                    <Link href={`/tutor/${session.id}`}>View details</Link>
                  </Button>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-700">{session.summary ?? "No summary yet. Reopen and end the session to generate one."}</p>
                {session.keyTakeaways?.length ? (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-slate-950">Key takeaways</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {session.keyTakeaways.map((item) => (
                        <Badge key={item} variant="teal">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
                {session.misconceptions?.length ? (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-slate-950">Misconceptions identified</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {session.misconceptions.map((item) => (
                        <Badge key={item} variant="amber">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
