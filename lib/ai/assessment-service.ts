import { calculateAssessmentResult, type DiagnosticAnswer } from "@/lib/assessment/diagnostic";

export function evaluateDiagnostic(answers: DiagnosticAnswer[]) {
  return calculateAssessmentResult(answers);
}
