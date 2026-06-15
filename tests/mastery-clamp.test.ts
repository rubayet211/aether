import { describe, expect, it } from "vitest";
import { estimateMasteryUpdate } from "@/lib/progress/mastery";
import { demoSessionSummary } from "@/lib/ai/demo-responses";

describe("mastery clamping", () => {
  it("never exceeds 100 even from a high starting point", () => {
    const result = estimateMasteryUpdate({
      currentMastery: 99,
      reasoningQuality: "strong",
      hintCount: 0,
      misconceptionPersisted: false,
    });
    expect(result.mastery).toBeLessThanOrEqual(100);
    expect(result.mastery).toBe(100);
  });

  it("never drops below 0", () => {
    const result = estimateMasteryUpdate({
      currentMastery: 0,
      reasoningQuality: "weak",
      hintCount: 5,
      misconceptionPersisted: false,
    });
    expect(result.mastery).toBeGreaterThanOrEqual(0);
  });

  it("clamps the demo summary mastery estimate at 100", () => {
    const summary = demoSessionSummary("Friction", 98);
    expect(summary.updatedMasteryEstimate).toBeLessThanOrEqual(100);
    expect(summary.updatedMasteryEstimate).toBe(100);
  });
});
