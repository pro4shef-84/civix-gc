import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/server/prisma";

const updateSchema = z.object({
  description: z.string().optional(),
  qty: z.number().optional(),
  unit: z.string().optional(),
  price: z.number().optional(),
  notes: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  csiCode: z.string().optional(),
  normalizedKey: z.string().optional()
});

export async function PATCH(
  request: Request,
  { params }: { params: { lineId: string } }
) {
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const line = await prisma.parsedLine.update({
      where: { id: params.lineId },
      data: parsed.data
    });

    return NextResponse.json(line);
  } catch (error) {
    console.error("Failed to update parsed line", error);
    return NextResponse.json(
      { error: "Unable to update parsed line. It may not exist yet." },
      { status: 500 }
    );
  }
}
