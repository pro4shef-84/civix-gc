import { prisma } from "@/lib/server/prisma";
import { demoData } from "@/lib/server/seeds";

export type InvitationStatus =
  | "invited"
  | "interested"
  | "no-bid"
  | "submitted"
  | "needs-clarification";

export type InvitationSummary = {
  id: string;
  tradeScopeId: string;
  subcontractorId: string;
  subcontractorName: string;
  email: string;
  status: InvitationStatus;
  dueAt: Date;
  lastContactedAt: Date | null;
};

function normalizeStatus(status: string): InvitationStatus {
  return status.replace(/_/g, "-") as InvitationStatus;
}

export async function listInvitations(tradeScopeId: string): Promise<InvitationSummary[]> {
  try {
    const invitations = await prisma.invitation.findMany({
      where: { tradeScopeId },
      include: { subcontractor: true, tradeScope: { include: { project: true } } },
      orderBy: { createdAt: "desc" }
    });

    if (!invitations.length) {
      return demoData.invitations.filter((inv) => inv.tradeScopeId === tradeScopeId);
    }

    return invitations.map((invitation) => ({
      id: invitation.id,
      tradeScopeId: invitation.tradeScopeId,
      subcontractorId: invitation.subcontractorId,
      subcontractorName: invitation.subcontractor.name,
      email: invitation.subcontractor.email ?? "",
      status: normalizeStatus(invitation.status),
      dueAt: invitation.tradeScope.project.bidDueAt,
      lastContactedAt: invitation.lastContactedAt
    }));
  } catch (error) {
    console.warn("Falling back to demo invitation data", error);
    return demoData.invitations.filter((inv) => inv.tradeScopeId === tradeScopeId);
  }
}

export function buildNudgeEmail(invitation: InvitationSummary) {
  const duePhrase = invitation.dueAt
    ? `Bid due ${invitation.dueAt.toLocaleString()}`
    : "Bid due soon";
  return {
    subject: `${invitation.tradeScopeId.toUpperCase()} – Bid Reminder`,
    body: `Hi ${invitation.subcontractorName},\n\nWe're following up on the ${invitation.tradeScopeId} trade scope for the Civix project. ${duePhrase}.\n\nLet us know if you plan to submit or have any questions.\n\nThanks,\nCivix Estimating`
  };
}
