"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { AssessmentProgress } from "@/components/assessment/assessment-progress";
import { AssessmentQuestionCard } from "@/components/assessment/assessment-question-card";
import { AssessmentResults } from "@/components/assessment/assessment-results";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { diagnosticQuestions, type DiagnosticAnswer } from "@/lib/assessment/diagnostic";

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };
type AssessmentApiResult = {
  userId: string;
  score: number;
  level: string;
  weakAreas: string[];
  recommendedTopic: { name: string; slug: string };
};

export default function AssessmentPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, DiagnosticAnswer>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AssessmentApiResult | null>(null);
  const question = diagnosticQuestions[index];
  const currentAnswer = question ? answers[question.id] : undefined;
  const canContinue = Boolean(currentAnswer?.selectedOptionId);
  const answerList = useMemo(() => Object.values(answers), [answers]);
  const submittingRef = useRef(false);

  function updateAnswer(update: Partial<DiagnosticAnswer>) {
    if (!question) return;
    setAnswers((current) => ({
      ...current,
      [question.id]: {
        questionId: question.id,
        selectedOptionId: current[question.id]?.selectedOptionId ?? "",
        reasoning: current[question.id]?.reasoning ?? "",
        ...update,
      },
    }));
  }

  async function submit() {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: localStorage.getItem("aetherUserId") ?? undefined, answers: answerList }),
      });
      const payload = (await response.json()) as ApiResponse<AssessmentApiResult>;
      if (!payload.ok) {
        setError(payload.error);
        return;
      }
      localStorage.setItem("aetherUserId", payload.data.userId);
      setResult(payload.data);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  if (result) {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <AssessmentResults
            score={result.score}
            level={result.level}
            weakAreas={result.weakAreas}
            recommendedTopic={result.recommendedTopic.name}
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold text-teal-700">Diagnostic assessment</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Find your best starting point.</h1>
          <p className="mt-2 text-slate-600">Answer quickly, then explain your thinking in one or two sentences.</p>
        </div>
        {error ? <div className="mb-4"><ErrorState message={error} /></div> : null}
        <AssessmentProgress current={index + 1} total={diagnosticQuestions.length} />
        {question ? (
          <div className="mt-6">
            <AssessmentQuestionCard
              question={question}
              selectedOptionId={currentAnswer?.selectedOptionId}
              reasoning={currentAnswer?.reasoning ?? ""}
              onSelect={(selectedOptionId) => updateAnswer({ selectedOptionId })}
              onReasoningChange={(reasoning) => updateAnswer({ reasoning })}
            />
          </div>
        ) : null}
        <div className="mt-6 flex justify-between">
          <Button type="button" variant="secondary" disabled={index === 0 || loading} onClick={() => setIndex((value) => value - 1)}>
            Previous
          </Button>
          {index < diagnosticQuestions.length - 1 ? (
            <Button type="button" disabled={!canContinue || loading} onClick={() => setIndex((value) => value + 1)}>
              Next
            </Button>
          ) : (
            <Button type="button" disabled={!canContinue || loading} onClick={submit}>
              {loading ? "Analyzing..." : "Submit Assessment"}
            </Button>
          )}
        </div>
        <button type="button" onClick={() => router.push("/dashboard")} className="mt-5 text-sm font-medium text-slate-500 hover:text-slate-900">
          I already have a profile
        </button>
      </div>
    </AppShell>
  );
}
