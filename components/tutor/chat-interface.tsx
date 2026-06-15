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
  masteryScore = 35,
}: {
  sessionId: string;
  initialMessages: ChatMessageItem[];
  topicName: string;
  topicId?: string;
  masteryScore?: number;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [misconceptions, setMisconceptions] = useState<string[]>([]);
  const [summary, setSummary] = useState<SummaryView | null>(null);
  const [problems, setProblems] = useState<GeneratedProblem[]>([]);
  const [ended, setEnded] = useState(false);
  // Live mastery for this topic, seeded from the server and advanced by each
  // tutor reply so practice generation always uses the real score.
  const [currentMastery, setCurrentMastery] = useState(masteryScore);
  const { mode, setMode } = useTutorStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  // Single source of truth for "a request is in flight". A ref guard is
  // synchronous, so it blocks duplicate submits (Enter + click, rapid taps,
  // action buttons) before React re-renders the disabled state.
  const busyRef = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(action: "message" | "hint" | "explain" | "practice", override?: string) {
    const content = override ?? input.trim();
    if (!content || busyRef.current || ended) return;

    busyRef.current = true;
    setError(null);
    setLoading(true);
    setInput("");
    const studentMessageId = crypto.randomUUID();
    setMessages((current) => [...current, { id: studentMessageId, role: "student", content }]);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, userMessage: content, topicId, mode, action }),
      });
      const payload = (await response.json()) as ApiResponse<{
        aiMessage: string;
        detectedMisconceptions: string[];
        updatedProgress: { mastery: number; delta: number } | null;
        aiUnavailable: boolean;
      }>;

      if (!payload.ok) {
        // Roll back the optimistic message and restore the draft so the
        // student can retry without losing what they typed.
        setMessages((current) => current.filter((message) => message.id !== studentMessageId));
        if (!override) setInput(content);
        setError(payload.error);
        return;
      }

      setMisconceptions(payload.data.detectedMisconceptions);
      if (payload.data.updatedProgress) setCurrentMastery(payload.data.updatedProgress.mastery);
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "assistant", content: payload.data.aiMessage },
      ]);
    } catch {
      setMessages((current) => current.filter((message) => message.id !== studentMessageId));
      if (!override) setInput(content);
      setError("Could not reach the tutor. Check your connection and try again.");
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  }

  async function generatePractice() {
    if (busyRef.current) return;
    const userId = localStorage.getItem("aetherUserId");
    if (!userId) {
      setError("Complete the diagnostic first so Aether can personalize practice.");
      return;
    }
    busyRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, topicId, weakAreas: [], masteryScore: currentMastery }),
      });
      const payload = (await response.json()) as ApiResponse<{ problems: GeneratedProblem[] }>;
      if (!payload.ok) {
        setError(payload.error);
        return;
      }
      setProblems(payload.data.problems);
    } catch {
      setError("Could not generate practice. Check your connection and try again.");
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  }

  async function endSession() {
    if (busyRef.current || ended) return;
    busyRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ end: true }),
      });
      const payload = (await response.json()) as ApiResponse<{ summary: SummaryView }>;
      if (!payload.ok) {
        setError(payload.error);
        return;
      }
      setEnded(true);
      setSummary(payload.data.summary);
    } catch {
      setError("Could not end the session. Check your connection and try again.");
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
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
          <TutorInput value={input} disabled={loading || ended} onChange={setInput} onSubmit={() => sendMessage("message")} />
        </Card>

        <aside className="space-y-4">
          {error ? <ErrorState message={error} /> : null}
          <MisconceptionCallout items={misconceptions} />
          <Card className="p-4">
            <h2 className="font-semibold text-slate-950">Tutor actions</h2>
            <div className="mt-4 grid gap-2">
              <Button variant="secondary" type="button" onClick={() => sendMessage("hint", "I need a hint.")} disabled={loading || ended}>
                <Lightbulb className="h-4 w-4" aria-hidden="true" />
                Get Hint
              </Button>
              <Button variant="secondary" type="button" onClick={() => sendMessage("explain", "Please explain this concept more.")} disabled={loading || ended}>
                <HelpCircle className="h-4 w-4" aria-hidden="true" />
                Explain More
              </Button>
              <Button variant="teal" type="button" onClick={generatePractice} disabled={loading}>
                <NotebookPen className="h-4 w-4" aria-hidden="true" />
                Generate Practice
              </Button>
              <Button variant="danger" type="button" onClick={endSession} disabled={loading || ended}>
                <SquareCheckBig className="h-4 w-4" aria-hidden="true" />
                {ended ? "Session ended" : "End Session"}
              </Button>
            </div>
          </Card>
          {problems.map((problem, index) => (
            <ProblemCard key={`${problem.question}-${index}`} problem={problem} />
          ))}
        </aside>
      </div>
      <SessionSummaryModal summary={summary} onClose={() => setSummary(null)} />
    </>
  );
}
