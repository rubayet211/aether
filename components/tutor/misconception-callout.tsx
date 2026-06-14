import { Lightbulb } from "lucide-react";

export function MisconceptionCallout({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <div className="flex items-center gap-2 font-semibold">
        <Lightbulb className="h-4 w-4" aria-hidden="true" />
        Misconception to test
      </div>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
