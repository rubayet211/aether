"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type SummaryView = {
  summary: string;
  keyTakeaways: string[];
  misconceptions: string[];
  recommendedNextStep: string;
  updatedMasteryEstimate: number;
};

export function SessionSummaryModal({
  summary,
  onClose,
}: {
  summary: SummaryView | null;
  onClose: () => void;
}) {
  if (!summary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge variant="teal">Session ended</Badge>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">Reasoning summary</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close summary"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-700">{summary.summary}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <section>
            <h3 className="font-semibold text-slate-950">Key takeaways</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {summary.keyTakeaways.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="font-semibold text-slate-950">Misconceptions</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {summary.misconceptions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
        <div className="mt-5 rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700">Next step</p>
          <p className="mt-1 text-sm text-slate-600">{summary.recommendedNextStep}</p>
          <p className="mt-3 text-sm font-semibold text-slate-950">Mastery estimate: {summary.updatedMasteryEstimate}%</p>
        </div>
        <Button className="mt-5" type="button" onClick={onClose}>
          Continue
        </Button>
      </div>
    </div>
  );
}
