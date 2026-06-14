"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState } from "@/components/shared/error-state";

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };

export default function TutorStartPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function startSession() {
    const userId = localStorage.getItem("aetherUserId");
    if (!userId) {
      setError("Complete the diagnostic first so Aether can personalize tutoring.");
      return;
    }
    setLoading(true);
    setError(null);
    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, mode: "guided_reasoning" }),
    });
    const payload = (await response.json()) as ApiResponse<{ session: { id: string } }>;
    setLoading(false);
    if (!payload.ok) {
      setError(payload.error);
      return;
    }
    router.push(`/tutor/${payload.data.session.id}`);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="space-y-5 pt-6">
            <h1 className="text-3xl font-semibold text-slate-950">Start a tutoring session</h1>
            <p className="text-slate-600">Aether will use your diagnostic profile to choose a focused Mechanics topic.</p>
            {error ? <ErrorState message={error} /> : null}
            <div className="flex gap-3">
              <Button type="button" onClick={startSession} disabled={loading}>
                {loading ? "Starting..." : "Start session"}
              </Button>
              <Button asChild variant="secondary">
                <Link href="/assessment">Take diagnostic</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
