import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AssessmentResults({
  score,
  level,
  recommendedTopic,
  weakAreas,
}: {
  score: number;
  level: string;
  recommendedTopic: string;
  weakAreas: string[];
}) {
  return (
    <Card>
      <CardHeader>
        <Badge variant="teal" className="w-fit">
          Diagnostic complete
        </Badge>
        <CardTitle className="text-2xl">Your Physics profile is ready.</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Score</p>
            <p className="text-2xl font-semibold text-slate-950">{score}%</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Level</p>
            <p className="text-2xl font-semibold capitalize text-slate-950">{level}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Start with</p>
            <p className="text-base font-semibold text-slate-950">{recommendedTopic}</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700">Weak areas</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {weakAreas.length ? weakAreas.map((area) => <Badge key={area} variant="amber">{area}</Badge>) : <Badge variant="green">No major gaps detected</Badge>}
          </div>
        </div>
        <Button asChild>
          <Link href="/dashboard">Open dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
