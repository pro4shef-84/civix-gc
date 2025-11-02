import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/server/prisma";

const createProjectSchema = z.object({
  name: z.string().min(2),
  bidDueAt: z.coerce.date(),
  orgId: z.string(),
  createdById: z.string().optional()
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const project = await prisma.project.create({
      data: {
        name: parsed.data.name,
        bidDueAt: parsed.data.bidDueAt,
        orgId: parsed.data.orgId,
        createdById: parsed.data.createdById
      }
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Failed to create project", error);
    return NextResponse.json(
      {
        error: "Unable to create project right now. Ensure database connectivity is configured."
      },
      { status: 500 }
    );
  }
}
