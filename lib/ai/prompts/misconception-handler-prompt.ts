export type MisconceptionPromptContext = {
  misconception: string;
  topicName: string;
};

export function misconceptionHandlerPrompt(context: MisconceptionPromptContext): string {
  return `The student shows this misconception in ${context.topicName}: ${context.misconception}
Respond gently. Do not say "wrong". Use: "That's a common thought. Let's test it."
Ask one question that helps the student uncover the issue.`;
}
