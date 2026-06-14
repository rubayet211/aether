"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function HintStack({ hints }: { hints: string[] }) {
  const [visibleCount, setVisibleCount] = useState(1);
  return (
    <div className="space-y-2">
      {hints.slice(0, visibleCount).map((hint, index) => (
        <div key={hint} className="rounded-lg bg-teal-50 p-3 text-sm text-teal-900">
          Hint {index + 1}: {hint}
        </div>
      ))}
      {visibleCount < hints.length ? (
        <Button type="button" variant="secondary" size="sm" onClick={() => setVisibleCount((count) => count + 1)}>
          Reveal next hint
        </Button>
      ) : null}
    </div>
  );
}
