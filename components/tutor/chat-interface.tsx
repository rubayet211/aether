"use client";

import { useEffect, useRef, useState } from "react";
import { HelpCircle, Lightbulb, NotebookPen, SquareCheckBig } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChatMessage, type ChatMessageItem } from "@/components/tutor/chat-message";
import { TutorInput } from "@/components/tutor/tutor-input";
import { ModeSelector } from "@/components/tutor/mode-selector";
import { MisconceptionCallout } from "@/components/tutor/misconception-callout";
import { SessionSummaryModal, type SummaryView } from "@/components/tutor/session-summary-modal";
import { ProblemCard } from "@/components/problems/problem-card";
import { ErrorState } from "@/components/shared/error-state";
import { useTutorStore } from "@/lib/store/use-tutor-store";
import type { GeneratedProblem } from "@/lib/ai/schemas";

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };

export function ChatInterface({
  sessionId,
  initialMessages,
  topicName,
  topicId,
}: {
  sessionId: string;
  initialMessages: ChatMessageItem[];
  topicName: string;
  topicId?: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [misconceptions, setMisconceptions] = useState<string[]>([]);
  const [summary, setSummary] = useState<SummaryView | null>(null);
  const [problems, setProblems] = useState<GeneratedProblem[]>([]);
  const { mode, setMode } = useTutorStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(action: "message" | "hint" | "explain" | "practice", override?: string) {
    const content = override ?? input.trim();
    if (!content || loading) return;

    setError(null);
    setLoading(true);
    setInput("");
    const studentMessage = { id: crypto.randomUUID(), role: "student", content };
    setMessages((current) => [...current, studentMessage]);

    const response = await fetch("/api/tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, userMessage: content, topicId, mode, action }),
    });
    const payload = (await response.json()) as ApiResponse<{
      aiMessage: string;
      detectedMisconceptions: string[];
      aiUnavailable: boolean;
    }>;

    setLoading(false);
    if (!payload.ok) {
      setError(payload.error);
      return;
    }

    setMisconceptions(payload.data.detectedMisconceptions);
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "assistant", content: payload.data.aiMessage },
    ]);
  }

  async function generatePractice() {
    setLoading(true);
    setError(null);
    const userId = localStorage.getItem("aetherUserId");
    if (!userId) {
      setError("Complete the diagnostic first so Aether can personalize practice.");
      setLoading(false);
      return;
    }
    const response = await fetch("/api/problems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, topicId, weakAreas: [], masteryScore: 35 }),
    });
    const payload = (await response.json()) as ApiResponse<{ problems: GeneratedProblem[] }>;
    setLoading(false);
    if (!payload.ok) {
      setError(payload.error);
      return;
    }
    setProblems(payload.data.problems);
  }

  async function endSession() {
    setLoading(true);
    setError(null);
    const response = await fetch(`/api/sessions/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ end: true }),
    });
    const payload = (await response.json()) as ApiResponse<{ summary: SummaryView }>;
    setLoading(false);
    if (!payload.ok) {
      setError(payload.error);
      return;
    }
    setSummary(payload.data.summary);
  }

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium text-teal-700">Current topic</p>
                <h1 className="text-2xl font-semibold text-slate-950">{topicName}</h1>
              </div>
              <ModeSelector mode={mode} onModeChange={setMode} />
            </div>
          </div>
          <div className="h-[58vh] space-y-4 overflow-auto bg-slate-50 p-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {loading ? <div className="text-sm text-slate-500">Aether is thinking...</div> : null}
            <div ref={scrollRef} />
          </div>
          <TutorInput value={input} disabled={loading} onChange={setInput} onSubmit={() => sendMessage("message")} />
        </Card>

        <aside className="space-y-4">
          {error ? <ErrorState message={error} /> : null}
          <MisconceptionCallout items={misconceptions} />
          <Card className="p-4">
            <h2 className="font-semibold text-slate-950">Tutor actions</h2>
            <div className="mt-4 grid gap-2">
              <Button variant="secondary" type="button" onClick={() => sendMessage("hint", "I need a hint.")} disabled={loading}>
                <Lightbulb className="h-4 w-4" aria-hidden="true" />
                Get Hint
              </Button>
              <Button variant="secondary" type="button" onClick={() => sendMessage("explain", "Please explain this concept more.")} disabled={loading}>
                <HelpCircle className="h-4 w-4" aria-hidden="true" />
                Explain More
              </Button>
              <Button variant="teal" type="button" onClick={generatePractice} disabled={loading}>
                <NotebookPen className="h-4 w-4" aria-hidden="true" />
                Generate Practice
              </Button>
              <Button variant="danger" type="button" onClick={endSession} disabled={loading}>
                <SquareCheckBig className="h-4 w-4" aria-hidden="true" />
                End Session
              </Button>
            </div>
          </Card>
          {problems.map((problem) => (
            <ProblemCard key={problem.question} problem={problem} />
          ))}
        </aside>
      </div>
      <SessionSummaryModal summary={summary} onClose={() => setSummary(null)} />
    </>
  );
}
