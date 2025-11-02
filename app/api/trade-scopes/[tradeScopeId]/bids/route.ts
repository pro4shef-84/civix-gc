import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/server/prisma";

const bidSchema = z.object({
  subcontractorId: z.string(),
  invitationId: z.string().optional(),
  storageUri: z.string(),
  srcType: z.enum(["pdf", "email", "csv"]),
  uploadedBy: z.string()
});

export async function POST(
  request: Request,
  { params }: { params: { tradeScopeId: string } }
) {
  const formData = await request.formData();
  const jsonPayload = formData.get("metadata");
  if (!jsonPayload) {
    return NextResponse.json({ error: "Missing metadata payload" }, { status: 400 });
  }

  const parsed = bidSchema.safeParse(JSON.parse(String(jsonPayload)));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const bidDocument = await prisma.bidDocument.create({
      data: {
        tradeScopeId: params.tradeScopeId,
        subcontractorId: parsed.data.subcontractorId,
        invitationId: parsed.data.invitationId,
        storageUri: parsed.data.storageUri,
        srcType: parsed.data.srcType,
        uploadedBy: parsed.data.uploadedBy
      }
    });

    return NextResponse.json(bidDocument, { status: 201 });
  } catch (error) {
    console.error("Failed to record bid upload", error);
    return NextResponse.json(
      { error: "Unable to store bid document. Ensure storage service is configured." },
      { status: 500 }
    );
  }
}
