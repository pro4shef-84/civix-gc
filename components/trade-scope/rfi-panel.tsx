"use client";

import { useState } from "react";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

type DraftQuestion = {
  toSubcontractor: string;
  question: string;
};

const sampleThreads = [
  {
    id: "thread-1",
    question: "Confirm inclusion of vapor barrier below slab.",
    scopeLine: "Slab Formwork",
    to: ["Acme Concrete"],
    status: "Open",
    responses: [
      {
        from: "Acme Concrete",
        message: "Included per detail 3/S2."
      }
    ]
  }
];

export function RfiPanel({ tradeScopeId }: { tradeScopeId: string }) {
  const [draft, setDraft] = useState<DraftQuestion>({ toSubcontractor: "", question: "" });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.question) return;
    alert(`Logged RFI for ${draft.toSubcontractor || "selected subs"}`);
    setDraft({ toSubcontractor: "", question: "" });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Ask a clarification</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
            To (optional)
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700"
              placeholder="Subcontractor name"
              value={draft.toSubcontractor}
              onChange={(event) => setDraft((prev) => ({ ...prev, toSubcontractor: event.target.value }))}
            />
          </label>
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
            Question
            <textarea
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700"
              rows={4}
              placeholder="Summarize the scope question"
              value={draft.question}
              onChange={(event) => setDraft((prev) => ({ ...prev, question: event.target.value }))}
            />
          </label>
          <button type="submit" className="btn-primary">
            Send RFI
          </button>
          <p className="text-xs text-slate-400">
            We’ll email the selected subs and track their responses here with timestamps.
          </p>
        </form>
      </div>
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Threads</h3>
        <ul className="space-y-3">
          {sampleThreads.map((thread) => (
            <li key={thread.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <ChatBubbleLeftRightIcon className="mt-1 h-5 w-5 text-primary-500" />
                <div>
                  <div className="text-sm font-semibold text-slate-800">{thread.scopeLine}</div>
                  <p className="mt-1 text-sm text-slate-600">{thread.question}</p>
                  <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">
                    To: {thread.to.join(", ")} · Status: {thread.status}
                  </p>
                  <div className="mt-3 space-y-2">
                    {thread.responses.map((response, index) => (
                      <div key={index} className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">{response.from}:</span> {response.message}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
