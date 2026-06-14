export type ProblemGeneratorPromptContext = {
  topicName: string;
  difficulty: "easy" | "medium" | "hard";
  weakAreas: string[];
  masteryScore: number;
};

export function problemGeneratorPrompt(context: ProblemGeneratorPromptContext): string {
  return `Generate 2 to 3 high-school Physics practice problems.
Focus on reasoning, not trick wording. Use Mechanics/Newton's laws when relevant.
Return valid JSON array only. Each item must include:
topic, difficulty, question, given, goal, hints, expectedReasoningPath, finalAnswer, commonMisconceptions.

Topic: ${context.topicName}
Difficulty: ${context.difficulty}
Weak areas: ${context.weakAreas.join(", ") || "none known"}
Mastery: ${context.masteryScore}/100`;
}
