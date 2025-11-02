"use client";

import { useMemo } from "react";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import clsx from "classnames";

import type { InvitationSummary } from "@/lib/server/rfq";

const statusOrder: InvitationSummary["status"][] = [
  "invited",
  "interested",
  "needs-clarification",
  "submitted",
  "no-bid"
];

const statusCopy: Record<InvitationSummary["status"], { label: string; tone: string }> = {
  invited: { label: "Invited", tone: "bg-slate-100 text-slate-600" },
  interested: { label: "Interested", tone: "bg-blue-100 text-blue-600" },
  "needs-clarification": { label: "Needs clarification", tone: "bg-amber-100 text-amber-700" },
  submitted: { label: "Submitted", tone: "bg-emerald-100 text-emerald-700" },
  "no-bid": { label: "No bid", tone: "bg-rose-100 text-rose-600" }
};

type RfqTrackerProps = {
  tradeScopeId: string;
  invitations: InvitationSummary[];
};

export function RfqTracker({ tradeScopeId, invitations }: RfqTrackerProps) {
  const grouped = useMemo(() => {
    return statusOrder.map((status) => ({
      status,
      items: invitations.filter((invitation) => invitation.status === status)
    }));
  }, [invitations]);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {grouped.map((column) => (
        <div key={column.status} className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div className="text-sm font-semibold text-slate-700">
              {statusCopy[column.status].label}
            </div>
            <span
              className={clsx(
                "inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-2 text-xs font-medium",
                statusCopy[column.status].tone
              )}
            >
              {column.items.length}
            </span>
          </div>
          <ul className="divide-y divide-slate-200">
            {column.items.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-slate-400">None yet</li>
            ) : (
              column.items.map((invitation) => (
                <li key={invitation.id} className="px-4 py-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-800">{invitation.subcontractorName}</p>
                      <p className="text-xs text-slate-500">{invitation.email}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        Due {invitation.dueAt.toLocaleDateString()} · Last touch {" "}
                        {invitation.lastContactedAt?.toLocaleDateString() ?? "—"}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 shadow-sm transition hover:border-primary-300 hover:text-primary-600"
                      onClick={() => {
                        // In a full system this would queue a nudge email via server action.
                        alert(`Queued nudge email for ${invitation.subcontractorName}`);
                      }}
                    >
                      <EnvelopeIcon className="h-4 w-4" />
                      Nudge
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}
