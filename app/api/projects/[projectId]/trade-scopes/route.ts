import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/server/prisma";

const createTradeScopeSchema = z.object({
  name: z.string().min(2),
  csiDivision: z.string().optional()
});

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const body = await request.json();
  const parsed = createTradeScopeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const tradeScope = await prisma.tradeScope.create({
      data: {
        name: parsed.data.name,
        csiDivision: parsed.data.csiDivision,
        projectId: params.projectId
      }
    });

    return NextResponse.json(tradeScope, { status: 201 });
  } catch (error) {
    console.error("Failed to create trade scope", error);
    return NextResponse.json(
      { error: "Unable to create trade scope right now." },
      { status: 500 }
    );
  }
}
