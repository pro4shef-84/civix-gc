"use client";

import { useState } from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

import type { LevelingMatrix } from "@/lib/server/leveling";
import type { TradeScopeSnapshot } from "@/lib/server/trade-scopes";

function downloadBlob(content: string, filename: string, contentType = "text/csv") {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function matrixToCsv(matrix: LevelingMatrix) {
  const headers = ["Scope Item", "CSI", ...matrix.columns.map((column) => column.name)];
  const rows = matrix.rows.map((row) => [
    row.description || row.normalizedKey,
    row.csiCode ?? "",
    ...matrix.columns.map((column) => {
      const value = row.values.find((cell) => cell.subcontractorId === column.id);
      return value?.price?.toString() ?? "";
    })
  ]);
  return [headers, ...rows].map((line) => line.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
}

export function ExportPanel({ tradeScope, matrix }: { tradeScope: TradeScopeSnapshot; matrix: LevelingMatrix }) {
  const [downloading, setDownloading] = useState(false);

  function handleExport(format: "csv" | "xlsx") {
    setDownloading(true);
    setTimeout(() => {
      if (format === "csv") {
        const csv = matrixToCsv(matrix);
        downloadBlob(csv, `${tradeScope.name}-leveling.csv`);
      } else {
        const csv = matrixToCsv(matrix);
        downloadBlob(csv, `${tradeScope.name}-leveling.xlsx`, "application/vnd.ms-excel");
      }
      setDownloading(false);
    }, 300);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Generate a leveled comparison sheet stamped with the project name and date. Exports include totals, gap markers,
        and confidence indicators for review meetings.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handleExport("csv")}
          disabled={downloading}
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-primary-300 hover:text-primary-600 disabled:cursor-wait disabled:opacity-60"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          Download CSV
        </button>
        <button
          type="button"
          onClick={() => handleExport("xlsx")}
          disabled={downloading}
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-primary-300 hover:text-primary-600 disabled:cursor-wait disabled:opacity-60"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          Download XLSX
        </button>
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        <p className="font-semibold text-slate-700">Access controls</p>
        <p className="mt-2">
          Exports respect role-based permissions. Viewers receive read-only copies while estimators can regenerate
          latest sheets. Every export action is logged to the project audit trail.
        </p>
      </div>
    </div>
  );
}
