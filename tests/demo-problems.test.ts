import { describe, expect, it } from "vitest";
import { demoProblems } from "@/lib/ai/demo-responses";

describe("demoProblems", () => {
  it("adapts the problem content to the requested topic", () => {
    const momentum = demoProblems("Momentum", "easy");
    expect(momentum.length).toBeGreaterThan(0);
    expect(momentum.every((problem) => problem.topic === "Momentum")).toBe(true);
    const combinedText = momentum.map((problem) => problem.question.toLowerCase()).join(" ");
    expect(combinedText).toContain("momentum");
  });

  it("returns different content for different topics", () => {
    const friction = demoProblems("Friction", "easy").map((problem) => problem.question);
    const gravity = demoProblems("Gravity and Weight", "easy").map((problem) => problem.question);
    expect(friction).not.toEqual(gravity);
  });

  it("falls back to valid problems for an unknown topic", () => {
    const problems = demoProblems("Quantum Tunneling", "medium");
    expect(problems.length).toBeGreaterThan(0);
    expect(problems.every((problem) => problem.topic === "Quantum Tunneling")).toBe(true);
    expect(problems.every((problem) => problem.difficulty === "medium")).toBe(true);
  });

  it("produces problems that satisfy the generated-problem schema shape", () => {
    const problems = demoProblems("Newton's Second Law", "easy");
    for (const problem of problems) {
      expect(problem.given.length).toBeGreaterThan(0);
      expect(problem.hints.length).toBeGreaterThan(0);
      expect(problem.expectedReasoningPath.length).toBeGreaterThan(0);
      expect(problem.finalAnswer.length).toBeGreaterThan(0);
    }
  });
});
