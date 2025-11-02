import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/server/prisma";

const rfiSchema = z.object({
  question: z.string().min(5),
  toSubIds: z.array(z.string()).default([])
});

export async function POST(
  request: Request,
  { params }: { params: { tradeScopeId: string } }
) {
  const body = await request.json();
  const parsed = rfiSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const rfi = await prisma.rFI.create({
      data: {
        tradeScopeId: params.tradeScopeId,
        question: parsed.data.question,
        toSubIds: parsed.data.toSubIds
      }
    });

    return NextResponse.json(rfi, { status: 201 });
  } catch (error) {
    console.error("Failed to create RFI", error);
    return NextResponse.json(
      { error: "Unable to create RFI right now." },
      { status: 500 }
    );
  }
}
