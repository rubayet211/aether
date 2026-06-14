export type DiagnosticPromptContext = {
  answers: { prompt: string; selectedAnswer: string; reasoning: string; correctAnswer: string }[];
};

export function diagnosticPrompt(context: DiagnosticPromptContext): string {
  return `You are Aether, a high-school Physics diagnostic tutor.
Evaluate the student's conceptual reasoning without being harsh.
Return concise JSON only with level, weakAreas, recommendedTopic, and masteryNotes.

Answers:
${context.answers
  .map(
    (answer, index) =>
      `${index + 1}. Prompt: ${answer.prompt}\nSelected: ${answer.selectedAnswer}\nCorrect: ${answer.correctAnswer}\nReasoning: ${answer.reasoning}`,
  )
  .join("\n\n")}`;
}
