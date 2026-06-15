import { describe, expect, it } from "vitest";
import { parseProblemsJson, parseTutorResponse } from "@/lib/ai/response-parser";

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

  it("fails cleanly when no JSON is present", () => {
    const parsed = parseProblemsJson("Sorry, I cannot help with that.");
    expect(parsed.success).toBe(false);
  });
});

describe("parseTutorResponse", () => {
  it("extracts tutor JSON from a fenced markdown block", () => {
    const parsed = parseTutorResponse(
      "Here is my reply:\n```json\n" +
        JSON.stringify({
          message: "What forces act on the box?",
          detectedMisconceptions: [],
          suggestedNextAction: "answer_next_question",
          reasoningQuality: "partial",
          misconceptionPersisted: false,
        }) +
        "\n```",
    );
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.message).toContain("forces");
      expect(parsed.data.suggestedNextAction).toBe("answer_next_question");
    }
  });
});
