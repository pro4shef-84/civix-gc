"use client";

import { useMemo, useState } from "react";
import clsx from "classnames";

import type { LevelingMatrix } from "@/lib/server/leveling";

const filters = [
  { id: "all", label: "All" },
  { id: "gaps", label: "Only gaps" },
  { id: "overlaps", label: "Only overlaps" },
  { id: "low-confidence", label: "Low confidence" }
] as const;

type FilterId = (typeof filters)[number]["id"];

export function LevelingMatrixView({ matrix }: { matrix: LevelingMatrix }) {
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");

  const rows = useMemo(() => {
    switch (activeFilter) {
      case "gaps":
        return matrix.rows.filter((row) => row.gap);
      case "overlaps":
        return matrix.rows.filter((row) => row.overlap);
      case "low-confidence":
        return matrix.rows.filter((row) => row.lowConfidence);
      default:
        return matrix.rows;
    }
  }, [matrix.rows, activeFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={clsx(
                "rounded-full border px-3 py-1 text-xs font-medium transition",
                activeFilter === filter.id
                  ? "border-primary-500 bg-primary-50 text-primary-600"
                  : "border-slate-200 text-slate-500 hover:border-primary-200 hover:text-primary-500"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="text-sm text-slate-500">
          Baseline {matrix.totals.baseline.toLocaleString("en-US", { style: "currency", currency: "USD" })} · Highest
          {" "}
          {matrix.totals.high.toLocaleString("en-US", { style: "currency", currency: "USD" })} · Lowest {" "}
          {matrix.totals.low.toLocaleString("en-US", { style: "currency", currency: "USD" })}
        </div>
      </div>
      <div className="overflow-auto rounded-lg border border-slate-200">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 shadow-inner">Scope Item</th>
              <th className="sticky left-48 z-10 bg-slate-50 px-4 py-3 shadow-inner">CSI</th>
              {matrix.columns.map((column) => (
                <th key={column.id} className="px-4 py-3">
                  <div className="text-slate-700">{column.name}</div>
                  <div className="text-[10px] uppercase text-slate-400">{column.status}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-200">
                <td
                  className={clsx(
                    "sticky left-0 z-[1] w-48 bg-white px-4 py-3 text-sm font-medium text-slate-800",
                    row.gap && "bg-amber-50",
                    row.overlap && "bg-rose-50"
                  )}
                >
                  <div>{row.description || row.normalizedKey}</div>
                  {row.lowConfidence ? (
                    <div className="mt-1 text-[10px] uppercase tracking-wide text-amber-600">Low confidence</div>
                  ) : null}
                </td>
                <td className="sticky left-48 z-[1] bg-white px-4 py-3 text-xs text-slate-500">{row.csiCode ?? "—"}</td>
                {matrix.columns.map((column) => {
                  const value = row.values.find((v) => v.subcontractorId === column.id);
                  const isGap = !value || value.price === null;
                  return (
                    <td
                      key={column.id}
                      className={clsx(
                        "px-4 py-3 text-right text-sm",
                        isGap ? "bg-amber-50 text-amber-700" : "text-slate-700"
                      )}
                    >
                      {value?.price != null
                        ? value.price.toLocaleString("en-US", { style: "currency", currency: "USD" })
                        : "—"}
                      {value?.notes ? (
                        <div className="mt-1 text-left text-[10px] text-slate-500">{value.notes}</div>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
