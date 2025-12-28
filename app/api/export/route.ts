import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { buildCsv } from '../../../lib/csv';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tradePackageId = searchParams.get('tradePackageId');
  if (!tradePackageId) return new NextResponse('tradePackageId required', { status: 400 });
  const pkg = await prisma.tradePackage.findUnique({
    where: { id: tradePackageId },
    include: { bidders: true, normalizedItems: { include: { bids: true } }, riskAssessments: true },
  });
  if (!pkg) return new NextResponse('Not found', { status: 404 });
  const csv = buildCsv(pkg.normalizedItems, pkg.bidders, pkg.riskAssessments);
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${pkg.name}-leveling.csv"`,
    },
  });
}
