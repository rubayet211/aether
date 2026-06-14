export function AssessmentProgress({ current, total }: { current: number; total: number }) {
  const percentage = Math.round((current / total) * 100);
  return (
    <div aria-label={`Question ${current} of ${total}`} className="space-y-2">
      <div className="flex items-center justify-between text-sm font-medium text-slate-600">
        <span>
          Question {current} of {total}
        </span>
        <span>{percentage}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200">
        <div className="h-2 rounded-full bg-teal-600 transition-all" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
