import { addHours } from "date-fns";

import type { ProjectWithStats } from "@/lib/server/projects";
import type { TradeScopeSnapshot } from "@/lib/server/trade-scopes";
import type { InvitationSummary } from "@/lib/server/rfq";

const now = new Date();

const projectId = "demo-project";
const tradeScopes: TradeScopeSnapshot[] = [
  {
    id: "ts1",
    name: "Concrete",
    csiDivision: "03 30 00",
    bidDueAt: addHours(now, 36),
    lastUpdatedAt: addHours(now, -4),
    levelingStatus: "draft",
    subcontractors: [
      { id: "sub1", name: "Acme Concrete", status: "submitted", lastTouchedAt: addHours(now, -6) },
      { id: "sub2", name: "BlueRock Foundations", status: "invited", lastTouchedAt: addHours(now, -30) },
      { id: "sub3", name: "Crown Civil", status: "needs-clarification", lastTouchedAt: addHours(now, -12) }
    ],
    gapCount: 3,
    overlapCount: 2,
    parsedLineCoverage: 0.82
  },
  {
    id: "ts2",
    name: "Structural Steel",
    csiDivision: "05 10 00",
    bidDueAt: addHours(now, 60),
    lastUpdatedAt: addHours(now, -8),
    levelingStatus: "in-progress",
    subcontractors: [
      { id: "sub4", name: "Pioneer Steel", status: "interested", lastTouchedAt: addHours(now, -20) },
      { id: "sub5", name: "Skyline Metals", status: "invited", lastTouchedAt: addHours(now, -5) }
    ],
    gapCount: 5,
    overlapCount: 1,
    parsedLineCoverage: 0.71
  }
];

const invitations: InvitationSummary[] = tradeScopes.flatMap((scope) =>
  scope.subcontractors.map((sub) => ({
    id: `${scope.id}-${sub.id}`,
    tradeScopeId: scope.id,
    subcontractorId: sub.id,
    subcontractorName: sub.name,
    status: sub.status,
    dueAt: scope.bidDueAt,
    lastContactedAt: sub.lastTouchedAt,
    email: `${sub.name.toLowerCase().replace(/\s+/g, ".")}@example.com`
  }))
);

export const demoData = {
  projects: [
    {
      id: projectId,
      name: "Riverfront Mixed-Use",
      bidDueAt: addHours(now, 48),
      createdAt: addHours(now, -72),
      tradesCount: tradeScopes.length,
      progress: 0.45,
      highlightTradeScopeId: tradeScopes[0].id
    }
  ] satisfies ProjectWithStats[],
  tradeScopes,
  invitations
};
