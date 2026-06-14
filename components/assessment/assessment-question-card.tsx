"use client";

import type { DiagnosticQuestion } from "@/lib/assessment/diagnostic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function AssessmentQuestionCard({
  question,
  selectedOptionId,
  reasoning,
  onSelect,
  onReasoningChange,
}: {
  question: DiagnosticQuestion;
  selectedOptionId?: string;
  reasoning: string;
  onSelect: (optionId: string) => void;
  onReasoningChange: (value: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{question.prompt}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {question.options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={cn(
                "rounded-lg border p-4 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                selectedOptionId === option.id
                  ? "border-teal-600 bg-teal-50 text-teal-950"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Briefly explain your reasoning</span>
          <Textarea
            value={reasoning}
            onChange={(event) => onReasoningChange(event.target.value)}
            placeholder="What Physics idea did you use?"
          />
        </label>
      </CardContent>
    </Card>
  );
}
