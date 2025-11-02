"use client";

import { useMemo } from "react";
import Link from "next/link";
import clsx from "classnames";
import { format, isBefore } from "date-fns";

import type { ProjectWithStats } from "@/lib/server/projects";

function dueStatus(dueAt: Date) {
  const now = new Date();
  if (isBefore(dueAt, now)) {
    return { label: "Past Due", tone: "text-red-600 bg-red-50" };
  }

  const diffHours = (dueAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (diffHours < 24) {
    return { label: "Due Soon", tone: "text-amber-600 bg-amber-50" };
  }

  return { label: "On Track", tone: "text-emerald-600 bg-emerald-50" };
}

type ProjectsTableProps = {
  projects: ProjectWithStats[];
};

export function ProjectsTable({ projects }: ProjectsTableProps) {
  const rows = useMemo(() => projects ?? [], [projects]);

  if (!rows.length) {
    return (
      <div className="card text-center text-sm text-slate-600">
        No projects yet. Create one to start inviting subcontractors and uploading bids.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left font-medium text-slate-500">
          <tr>
            <th className="px-6 py-3">Project</th>
            <th className="px-6 py-3">Due Date</th>
            <th className="px-6 py-3">Trades</th>
            <th className="px-6 py-3">Progress</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map((project) => {
            const status = dueStatus(project.bidDueAt);
            return (
              <tr key={project.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{project.name}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    Created {format(project.createdAt, "MMM d, yyyy")}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={clsx("inline-flex rounded-full px-2 py-1 text-xs font-medium", status.tone)}>
                    {status.label}
                  </span>
                  <div className="mt-1 text-xs text-slate-500">
                    {format(project.bidDueAt, "MMM d, yyyy h:mmaaa")}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{project.tradesCount}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-primary-500"
                        style={{ width: `${Math.round(project.progress * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-600">
                      {Math.round(project.progress * 100)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/trade-scopes/${project.highlightTradeScopeId ?? "new"}`}
                    className="text-primary-600 hover:text-primary-500"
                  >
                    View Trade Scopes
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
