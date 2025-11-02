import { NextResponse } from "next/server";
import { z } from "zod";

import { listInvitations, buildNudgeEmail } from "@/lib/server/rfq";

const payloadSchema = z.object({
  invitationIds: z.array(z.string()).min(1)
});

export async function POST(
  request: Request,
  { params }: { params: { tradeScopeId: string } }
) {
  const body = await request.json();
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const invitations = await listInvitations(params.tradeScopeId);
  const targeted = invitations.filter((inv) => parsed.data.invitationIds.includes(inv.id));

  return NextResponse.json({
    status: "queued",
    emails: targeted.map((inv) => ({
      invitationId: inv.id,
      ...buildNudgeEmail(inv)
    }))
  });
}
