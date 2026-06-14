export type ReasoningQuality = "weak" | "partial" | "strong";

export type MasteryUpdateInput = {
  currentMastery: number;
  reasoningQuality: ReasoningQuality;
  hintCount: number;
  misconceptionPersisted: boolean;
};

export type MasteryUpdate = {
  mastery: number;
  delta: number;
};

export function estimateMasteryUpdate(input: MasteryUpdateInput): MasteryUpdate {
  if (input.misconceptionPersisted) {
    return { mastery: input.currentMastery, delta: 0 };
  }

  const baseDelta =
    input.reasoningQuality === "strong" ? 8 : input.reasoningQuality === "partial" ? 4 : 2;
  const hintPenalty = Math.min(input.hintCount * 2, baseDelta);
  const delta = Math.max(0, baseDelta - hintPenalty);
  const mastery = Math.max(0, Math.min(100, input.currentMastery + delta));

  return { mastery, delta };
}

export function inferReasoningQuality(message: string): ReasoningQuality {
  const normalized = message.toLowerCase();
  const strongSignals = ["because", "net force", "free body", "f=ma", "balanced", "acceleration"];
  const partialSignals = ["force", "mass", "friction", "gravity", "energy", "work"];

  if (strongSignals.some((signal) => normalized.includes(signal))) return "strong";
  if (partialSignals.some((signal) => normalized.includes(signal))) return "partial";
  return "weak";
}
