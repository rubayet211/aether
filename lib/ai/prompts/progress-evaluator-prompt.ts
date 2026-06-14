export type ProgressEvaluatorPromptContext = {
  studentMessage: string;
  tutorMessage: string;
  topicName: string;
};

export function progressEvaluatorPrompt(context: ProgressEvaluatorPromptContext): string {
  return `Evaluate the student's Physics reasoning quality for ${context.topicName}.
Return JSON only with reasoningQuality ("weak" | "partial" | "strong") and misconceptionPersisted boolean.
Student: ${context.studentMessage}
Tutor: ${context.tutorMessage}`;
}
