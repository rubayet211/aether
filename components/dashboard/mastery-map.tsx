import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type MasteryItem = {
  topicId: string;
  slug: string;
  name: string;
  description: string | null;
  mastery: number;
  attempts: number;
};

function masteryVariant(mastery: number) {
  if (mastery < 45) return "amber" as const;
  if (mastery < 75) return "blue" as const;
  return "green" as const;
}

export function MasteryMap({ items }: { items: MasteryItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Physics mastery map</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.topicId} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-500">{item.description}</p>
              </div>
              <Badge variant={masteryVariant(item.mastery)}>{Math.round(item.mastery)}%</Badge>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-teal-600" style={{ width: `${Math.max(4, item.mastery)}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
