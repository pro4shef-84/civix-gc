import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/server/prisma";

const invitationSchema = z.object({
  subcontractorId: z.string(),
  status: z
    .enum(["invited", "interested", "no-bid", "submitted", "needs-clarification"])
    .default("invited"),
  dueAt: z.coerce.date().optional()
});

export async function POST(
  request: Request,
  { params }: { params: { tradeScopeId: string } }
) {
  const body = await request.json();
  const parsed = z.array(invitationSchema).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const invitations = await prisma.$transaction(
      parsed.data.map((input) =>
        prisma.invitation.create({
          data: {
            tradeScopeId: params.tradeScopeId,
            subcontractorId: input.subcontractorId,
            status: input.status.replace(/-/g, "_") as any,
            dueAt: input.dueAt
          }
        })
      )
    );

    return NextResponse.json(invitations, { status: 201 });
  } catch (error) {
    console.error("Failed to create invitations", error);
    return NextResponse.json(
      { error: "Unable to create invitations. Ensure subcontractors exist and database is reachable." },
      { status: 500 }
    );
  }
}
