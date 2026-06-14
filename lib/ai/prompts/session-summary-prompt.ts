export type SessionSummaryPromptContext = {
  topicName: string;
  messages: { role: string; content: string }[];
  currentMastery: number;
};

export function sessionSummaryPrompt(context: SessionSummaryPromptContext): string {
  return `Summarize this high-school Physics tutoring session.
Return JSON only:
{
  "summary": "...",
  "keyTakeaways": ["..."],
  "misconceptions": ["..."],
  "recommendedNextStep": "...",
  "updatedMasteryEstimate": 0
}

Topic: ${context.topicName}
Current mastery: ${context.currentMastery}/100
Messages:
${context.messages.map((message) => `${message.role}: ${message.content}`).join("\n")}`;
}
