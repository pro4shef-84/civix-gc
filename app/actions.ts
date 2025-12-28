'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authOptions } from '../lib/auth';
import { extractTextFromFile } from '../lib/pdf';
import { callParseBidLLM } from '../lib/llm';
import { heuristicGroup } from '../lib/normalization';
import { computeRisk } from '../lib/risk';

const projectSchema = z.object({ name: z.string().min(2) });
const tradeSchema = z.object({ projectId: z.string(), name: z.string().min(2), csiDivision: z.string().optional() });
const bidderSchema = z.object({ tradePackageId: z.string(), companyName: z.string().min(2), contactEmail: z.string().email().optional() });

async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error('Unauthorized');
  return session.user;
}

export async function createProject(formData: FormData) {
  const user = await requireUser();
  const parsed = projectSchema.parse({ name: formData.get('name') });
  await prisma.project.create({ data: { name: parsed.name, owner: { connect: { email: user.email! } } } });
  revalidatePath('/');
}

export async function createTradePackage(formData: FormData) {
  await requireUser();
  const parsed = tradeSchema.parse({
    projectId: formData.get('projectId'),
    name: formData.get('name'),
    csiDivision: formData.get('csiDivision') || undefined,
  });
  await prisma.tradePackage.create({ data: parsed });
  revalidatePath('/');
}

export async function createBidder(formData: FormData) {
  await requireUser();
  const parsed = bidderSchema.parse({
    tradePackageId: formData.get('tradePackageId'),
    companyName: formData.get('companyName'),
    contactEmail: formData.get('contactEmail') || undefined,
  });
  await prisma.bidder.create({ data: parsed });
  revalidatePath('/');
}

export async function uploadBidDocument(formData: FormData) {
  await requireUser();
  const bidderId = formData.get('bidderId');
  const file = formData.get('file') as File | null;
  if (!file) throw new Error('File missing');
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadsDir = path.join(process.cwd(), 'uploads');
  await fs.promises.mkdir(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, `${Date.now()}-${file.name}`);
  await fs.promises.writeFile(filePath, buffer);
  await prisma.bidDocument.create({
    data: {
      bidderId: bidderId as string,
      filename: file.name,
      mimeType: file.type,
      filePath,
    },
  });
  revalidatePath('/');
}

export async function processTradePackage(tradePackageId: string) {
  await requireUser();
  const bidders = await prisma.bidder.findMany({
    where: { tradePackageId },
    include: { documents: true },
  });
  const parsedBids = [] as any[];

  for (const bidder of bidders) {
    for (const doc of bidder.documents) {
      try {
        const extracted = await extractTextFromFile(doc.filePath, doc.mimeType);
        await prisma.bidDocument.update({
          where: { id: doc.id },
          data: { status: 'EXTRACTED', extractedText: extracted.text, extractionMeta: extracted.meta },
        });
        const parsed = await callParseBidLLM(extracted.text);
        await prisma.bidParse.create({
          data: { bidDocumentId: doc.id, parsedJson: parsed as any, parseVersion: 1 },
        });
        await prisma.bidDocument.update({ where: { id: doc.id }, data: { status: 'PARSED' } });
        parsedBids.push({ bidderId: bidder.id, parsed });
      } catch (err) {
        await prisma.bidDocument.update({ where: { id: doc.id }, data: { status: 'FAILED' } });
        console.error('parse failed', err);
      }
    }
  }

  const scope = heuristicGroup(parsedBids.map((b) => b.parsed));
  await prisma.normalizedScopeItem.deleteMany({ where: { tradePackageId } });
  const scopeItems = await Promise.all(
    scope.map((s) => prisma.normalizedScopeItem.create({ data: { tradePackageId, scopeKey: s.key, scopeLabel: s.label, category: s.category } })),
  );
  await prisma.normalizedBidItem.deleteMany({ where: { bidder: { tradePackageId } } });

  for (const { bidderId, parsed } of parsedBids) {
    for (const item of parsed.scopeCoverage) {
      const match = scopeItems.find((s) => s.scopeKey === item.scopeKey || s.scopeLabel === item.label);
      if (!match) continue;
      await prisma.normalizedBidItem.create({
        data: {
          normalizedScopeItemId: match.id,
          bidderId,
          value: item.included ? 'Included' : 'Excluded',
          confidence: parsed.confidence,
          sourceRefs: parsed.citations,
        },
      });
    }
  }

  const baseBids = parsedBids
    .map((b) => b.parsed.pricing.baseBid)
    .filter((v: number | undefined) => v !== undefined) as number[];
  const median = baseBids.sort((a, b) => a - b)[Math.floor(baseBids.length / 2)];

  await prisma.riskAssessment.deleteMany({ where: { tradePackageId } });
  for (const { bidderId, parsed } of parsedBids) {
    const { score, reasons } = computeRisk(parsed, median);
    await prisma.riskAssessment.create({ data: { bidderId, tradePackageId, riskScore: score, reasons } });
  }

  revalidatePath('/');
}
