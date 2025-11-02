import { NextResponse } from "next/server";

import { prisma } from "@/lib/server/prisma";
import { demoMatrix } from "@/lib/server/mocks/leveling";

export async function POST(
  _request: Request,
  { params }: { params: { bidId: string } }
) {
  try {
    await prisma.bidDocument.update({
      where: { id: params.bidId },
      data: { parsedStatus: "processing" }
    });
  } catch (error) {
    console.warn("Parse worker placeholder", error);
  }

  return NextResponse.json({
    status: "queued",
    message: "Parsing has been queued. This endpoint should be connected to the worker service.",
    preview: demoMatrix.rows
  });
}
