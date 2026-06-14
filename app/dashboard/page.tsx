"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LevelCard } from "@/components/dashboard/level-card";
import { MasteryMap, type MasteryItem } from "@/components/dashboard/mastery-map";
import { WeakAreasCard } from "@/components/dashboard/weak-areas-card";
import { RecentSessions, type RecentSession } from "@/components/dashboard/recent-sessions";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };
type DashboardData = {
  user: { id: string; name: string | null; currentLevel: string };
  masteryMap: MasteryItem[];
  weakAreas: MasteryItem[];
  recommendedTopic?: MasteryItem;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [sessions, setSessions] = useState<RecentSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const userId = localStorage.getItem("aetherUserId");
      if (!userId) {
        setError("No learning profile found. Complete the diagnostic to create one.");
        setLoading(false);
        return;
      }

      const [progressResponse, sessionsResponse] = await Promise.all([
        fetch(`/api/progress?userId=${userId}`),
        fetch(`/api/sessions?userId=${userId}`),
      ]);
      const progressPayload = (await progressResponse.json()) as ApiResponse<DashboardData>;
      const sessionsPayload = (await sessionsResponse.json()) as ApiResponse<{ sessions: RecentSession[] }>;

      if (!progressPayload.ok) {
        setError(progressPayload.error);
      } else {
        setData(progressPayload.data);
      }
      if (sessionsPayload.ok) setSessions(sessionsPayload.data.sessions);
      setLoading(false);
    }

    void load();
  }, []);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-teal-700">Personalized dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">Welcome back to Aether.</h1>
            <p className="mt-2 text-slate-600">Focus on the next reasoning step, not memorized formulas.</p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/tutor">Continue learning</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/tutor">Generate practice</Link>
            </Button>
          </div>
        </div>

        {loading ? <LoadingState label="Loading dashboard" /> : null}
        {error ? (
          <div className="space-y-4">
            <ErrorState message={error} />
            <Button asChild>
              <Link href="/assessment">Take diagnostic</Link>
            </Button>
          </div>
        ) : null}

        {data ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            <div className="space-y-4">
              <LevelCard level={data.user.currentLevel} />
              <Card>
                <CardContent className="pt-5">
                  <p className="text-sm text-slate-500">Recommended next topic</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">{data.recommendedTopic?.name ?? "Newton's First Law"}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{data.recommendedTopic?.description}</p>
                  <Button asChild className="mt-4" variant="teal">
                    <Link href="/tutor">Start this lesson</Link>
                  </Button>
                </CardContent>
              </Card>
              <WeakAreasCard weakAreas={data.weakAreas} />
              <RecentSessions sessions={sessions} />
            </div>
            <MasteryMap items={data.masteryMap} />
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
