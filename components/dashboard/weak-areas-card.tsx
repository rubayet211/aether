import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MasteryItem } from "@/components/dashboard/mastery-map";

export function WeakAreasCard({ weakAreas }: { weakAreas: MasteryItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weak areas</CardTitle>
      </CardHeader>
      <CardContent>
        {weakAreas.length ? (
          <div className="flex flex-wrap gap-2">
            {weakAreas.map((area) => (
              <Badge key={area.topicId} variant="amber">
                {area.name} · {Math.round(area.mastery)}%
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600">No major weak areas yet. Keep practicing to sharpen the profile.</p>
        )}
      </CardContent>
    </Card>
  );
}
