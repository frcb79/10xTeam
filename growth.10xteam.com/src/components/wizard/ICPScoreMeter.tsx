export function ICPScoreMeter({ total }: { total: number | null }) {
  if (total === null) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-stone-400">
        Completa dolor, promesa y diferenciador para calcular el score.
      </div>
    );
  }

  const tone = total >= 70 ? "text-emerald-300" : total >= 40 ? "text-amber-300" : "text-rose-300";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-100">ICP Quality Score</p>
        <span className={`text-xl font-semibold ${tone}`}>{total}/100</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${total >= 70 ? "bg-emerald-400" : total >= 40 ? "bg-amber-300" : "bg-rose-400"}`} style={{ width: `${Math.min(total, 100)}%` }} />
      </div>
    </div>
  );
}
