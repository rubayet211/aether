import { describe, expect, it } from "vitest";
import { estimateMasteryUpdate } from "@/lib/progress/mastery";

describe("estimateMasteryUpdate", () => {
  it("raises mastery most when reasoning is correct without hints", () => {
    const result = estimateMasteryUpdate({
      currentMastery: 42,
      reasoningQuality: "strong",
      hintCount: 0,
      misconceptionPersisted: false,
    });

    expect(result.mastery).toBe(50);
    expect(result.delta).toBe(8);
  });

  it("keeps mastery stable when misconception persists", () => {
    const result = estimateMasteryUpdate({
      currentMastery: 42,
      reasoningQuality: "weak",
      hintCount: 2,
      misconceptionPersisted: true,
    });

    expect(result.mastery).toBe(42);
    expect(result.delta).toBe(0);
  });
});
