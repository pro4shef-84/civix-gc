import { formatDistanceToNow } from "date-fns";

import type { TradeScopeSnapshot } from "@/lib/server/trade-scopes";

const statusCopy: Record<TradeScopeSnapshot["levelingStatus"], string> = {
  "not-started": "Not started",
  draft: "Draft",
  "in-progress": "In progress",
  ready: "Ready to share"
};

export function TradeScopeHeader({ tradeScope }: { tradeScope: TradeScopeSnapshot }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{tradeScope.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            CSI Division {tradeScope.csiDivision ?? "—"} · Bid due {tradeScope.bidDueAt.toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Updated {formatDistanceToNow(tradeScope.lastUpdatedAt, { addSuffix: true })}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 sm:grid-cols-4">
          <div className="rounded-lg bg-slate-50 px-4 py-3 text-center">
            <div className="text-xs uppercase tracking-wide text-slate-500">Leveling</div>
            <div className="mt-1 font-semibold text-slate-900">{statusCopy[tradeScope.levelingStatus]}</div>
          </div>
          <div className="rounded-lg bg-slate-50 px-4 py-3 text-center">
            <div className="text-xs uppercase tracking-wide text-slate-500">Auto-parse</div>
            <div className="mt-1 font-semibold text-slate-900">
              {Math.round(tradeScope.parsedLineCoverage * 100)}%
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 px-4 py-3 text-center">
            <div className="text-xs uppercase tracking-wide text-slate-500">Gaps</div>
            <div className="mt-1 font-semibold text-amber-600">{tradeScope.gapCount}</div>
          </div>
          <div className="rounded-lg bg-slate-50 px-4 py-3 text-center">
            <div className="text-xs uppercase tracking-wide text-slate-500">Overlaps</div>
            <div className="mt-1 font-semibold text-rose-600">{tradeScope.overlapCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
