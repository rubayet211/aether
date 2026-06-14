import { GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function LevelCard({ level }: { level: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-950 text-white">
          <GraduationCap className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm text-slate-500">Current level</p>
          <p className="text-2xl font-semibold capitalize text-slate-950">{level}</p>
        </div>
      </CardContent>
    </Card>
  );
}
