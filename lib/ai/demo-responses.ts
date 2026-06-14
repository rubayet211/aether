import type { GeneratedProblem, SessionSummary, TutorResponse } from "@/lib/ai/schemas";

export const aiUnavailableMessage =
  "Aether cannot reach Ollama Cloud. Check OLLAMA_API_KEY, OLLAMA_BASE_URL, and OLLAMA_MODEL.";

export function demoTutorResponse(userMessage: string): TutorResponse {
  const lower = userMessage.toLowerCase();
  const misconception = lower.includes("moving means force") ||
    lower.includes("force keeps") ||
    lower.includes("force keeping") ||
    lower.includes("must be a force")
    ? ["Motion does not require a continuing net force; acceleration does."]
    : [];

  return {
    message:
      misconception.length > 0
        ? "That is a common thought. Let's test it: if an object moves at constant velocity, is its velocity changing?"
        : "Good start. Before we calculate anything, what forces would you include on the free body diagram?",
    detectedMisconceptions: misconception,
    suggestedNextAction: misconception.length > 0 ? "try_hint" : "answer_next_question",
    reasoningQuality: lower.includes("because") || lower.includes("net force") ? "strong" : "partial",
    misconceptionPersisted: false,
  };
}

export function demoProblems(topic: string, difficulty: "easy" | "medium" | "hard"): GeneratedProblem[] {
  return [
    {
      topic,
      difficulty,
      question: "A 3 kg box is pushed with a 12 N net force on a frictionless surface. What is its acceleration?",
      given: ["mass = 3 kg", "net force = 12 N"],
      goal: "Find acceleration",
      hints: ["Start with F = ma.", "Solve for acceleration: a = F / m."],
      expectedReasoningPath: ["Identify net force", "Identify mass", "Rearrange F = ma", "Divide 12 by 3"],
      finalAnswer: "4 m/s^2",
      commonMisconceptions: ["Using mass as force", "Forgetting that net force is already the total force"],
    },
    {
      topic,
      difficulty,
      question: "A book rests on a table. Explain why it does not accelerate.",
      given: ["book is at rest", "gravity acts downward", "table pushes upward"],
      goal: "Explain balanced forces",
      hints: ["What is the net force if acceleration is zero?", "Compare gravity and the normal force."],
      expectedReasoningPath: ["List forces", "Recognize no acceleration", "Conclude forces balance"],
      finalAnswer: "The upward normal force balances the downward weight, so net force is zero.",
      commonMisconceptions: ["Thinking no motion means no forces", "Forgetting the normal force"],
    },
  ];
}

export function demoSessionSummary(topicName: string, mastery: number): SessionSummary {
  return {
    summary: `You practiced reasoning through ${topicName} by naming forces before using equations.`,
    keyTakeaways: ["Start with a free body diagram.", "Net force explains acceleration, not motion itself."],
    misconceptions: ["Watch for the idea that moving objects always need a forward net force."],
    recommendedNextStep: "Try two more guided Newton's Second Law problems.",
    updatedMasteryEstimate: Math.min(100, mastery + 5),
  };
}
