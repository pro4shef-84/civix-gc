import { prisma } from "@/lib/server/prisma";
import { demoMatrix } from "@/lib/server/mocks/leveling";

export type NormalizedLine = {
  id: string;
  normalizedKey: string;
  description: string;
  csiCode: string | null;
  category: string | null;
  gap: boolean;
  overlap: boolean;
  lowConfidence: boolean;
  values: Array<{
    subcontractorId: string;
    subcontractorName: string;
    price: number | null;
    notes?: string | null;
  }>;
};

export type LevelingMatrix = {
  tradeScopeId: string;
  tradeScopeName: string;
  columns: Array<{ id: string; name: string; total: number; status: string }>;
  rows: NormalizedLine[];
  totals: {
    baseline: number;
    high: number;
    low: number;
  };
};

export async function getLevelingMatrix(tradeScopeId: string): Promise<LevelingMatrix> {
  try {
    const sheet = await prisma.levelingSheet.findFirst({
      where: { tradeScopeId },
      include: {
        tradeScope: {
          include: {
            invitations: { include: { subcontractor: true } },
            parsedLines: { include: { bidDocument: { include: { subcontractor: true } } } }
          }
        }
      }
    });

    if (!sheet) {
      return demoMatrix;
    }

    const subcontractors = sheet.tradeScope.invitations.map((invitation) => ({
      id: invitation.subcontractorId,
      name: invitation.subcontractor.name,
      status: invitation.status.replace(/_/g, "-"),
      total: Number(invitation.total ?? 0)
    }));

    const rows = sheet.tradeScope.parsedLines.reduce<NormalizedLine[]>((acc, line) => {
      const existing = acc.find((row) => row.normalizedKey === line.normalizedKey);
      const price = line.price != null ? Number(line.price) : null;
      const value = {
        subcontractorId: line.bidDocument.subcontractorId,
        subcontractorName: line.bidDocument.subcontractor.name,
        price,
        notes: line.notes
      };

      if (existing) {
        existing.values.push(value);
        existing.gap = existing.gap || value.price === null;
        existing.overlap = existing.overlap || existing.values.length > 1;
        existing.lowConfidence = existing.lowConfidence || (line.confidence ?? 0) < 0.7;
        return acc;
      }

      acc.push({
        id: line.id,
        normalizedKey: line.normalizedKey ?? line.description ?? "",
        description: line.description ?? "",
        csiCode: line.csiCode,
        category: line.category ?? null,
        gap: value.price === null,
        overlap: false,
        lowConfidence: (line.confidence ?? 0) < 0.7,
        values: [value]
      });
      return acc;
    }, []);

    const totals = {
      baseline: subcontractors.reduce((sum, sub) => sum + sub.total, 0) / Math.max(subcontractors.length, 1),
      high: subcontractors.length ? Math.max(...subcontractors.map((sub) => sub.total)) : 0,
      low: subcontractors.length ? Math.min(...subcontractors.map((sub) => sub.total)) : 0
    };

    return {
      tradeScopeId: sheet.tradeScopeId,
      tradeScopeName: sheet.tradeScope.name,
      columns: subcontractors,
      rows,
      totals
    } satisfies LevelingMatrix;
  } catch (error) {
    console.warn("Falling back to demo leveling matrix", error);
    return demoMatrix;
  }
}
