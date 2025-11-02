import { prisma } from "@/lib/server/prisma";
import { demoData } from "@/lib/server/seeds";

export type ProjectWithStats = {
  id: string;
  name: string;
  bidDueAt: Date;
  createdAt: Date;
  tradesCount: number;
  progress: number;
  highlightTradeScopeId: string | null;
};

export async function getProjects(): Promise<ProjectWithStats[]> {
  try {
    const projects = await prisma.project.findMany({
      include: {
        tradeScopes: {
          include: {
            levelingSheet: true,
            invitations: true,
            bidDocuments: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    if (!projects.length) {
      return demoData.projects;
    }

    return projects.map((project) => {
      const scopes = project.tradeScopes;
      const totalInvitations = scopes.reduce(
        (acc, scope) => acc + scope.invitations.length,
        0
      );
      const responded = scopes.reduce(
        (acc, scope) => acc + scope.invitations.filter((inv) => inv.status === "submitted").length,
        0
      );
      return {
        id: project.id,
        name: project.name,
        bidDueAt: project.bidDueAt,
        createdAt: project.createdAt,
        tradesCount: scopes.length,
        progress: totalInvitations ? responded / totalInvitations : 0,
        highlightTradeScopeId: scopes[0]?.id ?? null
      } satisfies ProjectWithStats;
    });
  } catch (error) {
    console.warn("Falling back to demo project data", error);
    return demoData.projects;
  }
}
