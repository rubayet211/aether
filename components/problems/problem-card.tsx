import type { GeneratedProblem } from "@/lib/ai/schemas";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HintStack } from "@/components/problems/hint-stack";

export function ProblemCard({ problem }: { problem: GeneratedProblem }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{problem.topic}</CardTitle>
          <Badge variant="blue">{problem.difficulty}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-slate-800">{problem.question}</p>
        <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          <p className="font-semibold text-slate-950">Goal: {problem.goal}</p>
          <ul className="mt-2 list-disc pl-5">
            {problem.given.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <HintStack hints={problem.hints} />
      </CardContent>
    </Card>
  );
}
