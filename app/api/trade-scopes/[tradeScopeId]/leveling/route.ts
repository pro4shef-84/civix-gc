import { NextResponse } from "next/server";

import { getLevelingMatrix } from "@/lib/server/leveling";

export async function GET(
  _request: Request,
  { params }: { params: { tradeScopeId: string } }
) {
  const matrix = await getLevelingMatrix(params.tradeScopeId);
  return NextResponse.json(matrix);
}
