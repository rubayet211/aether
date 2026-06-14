"use client";

import type { TutorMode } from "@/lib/ai/schemas";
import { cn } from "@/lib/utils";

const modes: { value: TutorMode; label: string }[] = [
  { value: "guided_reasoning", label: "Guided Reasoning" },
  { value: "practice", label: "Practice Problem" },
  { value: "explain", label: "Explain Concept" },
];

export function ModeSelector({ mode, onModeChange }: { mode: TutorMode; onModeChange: (mode: TutorMode) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tutor mode">
      {modes.map((item) => (
        <button
          key={item.value}
          type="button"
          role="radio"
          aria-checked={mode === item.value}
          onClick={() => onModeChange(item.value)}
          className={cn(
            "rounded-lg border px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
            mode === item.value
              ? "border-indigo-950 bg-indigo-950 text-white"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
