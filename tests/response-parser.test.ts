import { describe, expect, it } from "vitest";
import { parseProblemsJson } from "@/lib/ai/response-parser";

describe("parseProblemsJson", () => {
  it("extracts and validates generated problem JSON from model text", () => {
    const parsed = parseProblemsJson(`
      Here are problems:
      [
        {
          "topic": "Newton's Second Law",
          "difficulty": "easy",
          "question": "A 2 kg cart accelerates at 3 m/s^2. What net force acts on it?",
          "given": ["mass = 2 kg", "acceleration = 3 m/s^2"],
          "goal": "Find net force",
          "hints": ["Start with F = ma", "Substitute the values"],
          "expectedReasoningPath": ["Identify mass", "Identify acceleration", "Multiply"],
          "finalAnswer": "6 N",
          "commonMisconceptions": ["Confusing mass with weight"]
        }
      ]
    `);

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data[0]?.finalAnswer).toBe("6 N");
    }
  });
});
