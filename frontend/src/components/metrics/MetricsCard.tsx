
function fmtMs(ms: number | null | undefined): string {
  if (ms == null) return "—";
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;
}

function fmtPct(x: number | null | undefined): string {
  if (x == null) return "—";
  return `${(x * 100).toFixed(0)}%`;
}

export function MetricsCard({
  title,
  stats,
}: {
  title: string;
  stats: { label: string; value: string }[];
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">{title}</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-base font-semibold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function formatMs(ms: number | null | undefined): string {
  return fmtMs(ms);
}

export function formatPct(x: number | null | undefined): string {
  return fmtPct(x);
}
