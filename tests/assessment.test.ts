import { describe, expect, it } from "vitest";
import {
  calculateAssessmentResult,
  diagnosticQuestions,
} from "@/lib/assessment/diagnostic";

describe("calculateAssessmentResult", () => {
  it("marks weak foundational topics and recommends the first low-mastery mechanics topic", () => {
    const answers = diagnosticQuestions.map((question, index) => ({
      questionId: question.id,
      selectedOptionId: index === 2 ? question.correctOptionId : "incorrect",
      reasoning: index === 2 ? "Force divided by mass gives acceleration." : "I guessed.",
    }));

    const result = calculateAssessmentResult(answers);

    expect(result.level).toBe("beginner");
    expect(result.weakAreas).toContain("Newton's First Law");
    expect(result.recommendedTopic.slug).toBe("newtons-first-law");
    expect(result.masteryByTopic["newtons-second-law"]).toBeGreaterThan(
      result.masteryByTopic["newtons-first-law"],
    );
  });

  it("places strong diagnostic performance into advanced level", () => {
    const answers = diagnosticQuestions.map((question) => ({
      questionId: question.id,
      selectedOptionId: question.correctOptionId,
      reasoning:
        "I identified the forces, connected the law to the motion, and checked the equation step by step.",
    }));

    const result = calculateAssessmentResult(answers);

    expect(result.score).toBe(100);
    expect(result.level).toBe("advanced");
    expect(result.weakAreas).toHaveLength(0);
  });
});
