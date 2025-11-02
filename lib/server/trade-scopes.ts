import { prisma } from "@/lib/server/prisma";
import { demoData } from "@/lib/server/seeds";
import type { InvitationStatus } from "@/lib/server/rfq";

export type TradeScopeSummary = {
  id: string;
  name: string;
  csiDivision: string | null;
  bidDueAt: Date;
  lastUpdatedAt: Date;
  levelingStatus: "not-started" | "draft" | "in-progress" | "ready";
  gapCount: number;
  overlapCount: number;
  parsedLineCoverage: number;
};

export type TradeScopeSnapshot = TradeScopeSummary & {
  subcontractors: Array<{
    id: string;
    name: string;
    status: InvitationStatus;
    lastTouchedAt: Date | null;
  }>;
};

function normalizeStatus(status: string): InvitationStatus {
  return status.replace(/_/g, "-") as InvitationStatus;
}

function normalizeLevelingStatus(status: string | null | undefined): TradeScopeSummary["levelingStatus"] {
  if (!status) return "draft";
  switch (status) {
    case "in_progress":
      return "in-progress";
    case "ready":
      return "ready";
    case "draft":
      return "draft";
    default:
      return "draft";
  }
}

export async function getTradeScope(tradeScopeId: string): Promise<TradeScopeSnapshot | null> {
  try {
    const scope = await prisma.tradeScope.findUnique({
      where: { id: tradeScopeId },
      include: {
        project: true,
        invitations: {
          include: {
            subcontractor: true
          }
        },
        levelingSheet: true
      }
    });

    if (!scope) {
      return demoData.tradeScopes.find((demo) => demo.id === tradeScopeId) ?? null;
    }

    return {
      id: scope.id,
      name: scope.name,
      csiDivision: scope.csiDivision,
      bidDueAt: scope.project.bidDueAt,
      lastUpdatedAt: scope.updatedAt ?? scope.createdAt,
      levelingStatus: normalizeLevelingStatus(scope.levelingSheet?.status ?? null),
      gapCount: scope.levelingSheet?.gaps ?? 0,
      overlapCount: scope.levelingSheet?.overlaps ?? 0,
      parsedLineCoverage: scope.levelingSheet?.parsedCoverage ?? 0,
      subcontractors: scope.invitations.map((invitation) => ({
        id: invitation.subcontractorId,
        name: invitation.subcontractor.name,
        status: normalizeStatus(invitation.status),
        lastTouchedAt: invitation.lastContactedAt
      }))
    } satisfies TradeScopeSnapshot;
  } catch (error) {
    console.warn("Falling back to demo trade scope data", error);
    return demoData.tradeScopes.find((demo) => demo.id === tradeScopeId) ?? null;
  }
}
