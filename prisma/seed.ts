import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@gc.com' },
    update: {},
    create: { email: 'demo@gc.com', passwordHash },
  });

  const project = await prisma.project.upsert({
    where: { id: 'demo-project' },
    update: {},
    create: {
      id: 'demo-project',
      name: 'Sample High School',
      ownerId: user.id,
    },
  });

  const pkg = await prisma.tradePackage.upsert({
    where: { id: 'demo-package' },
    update: {},
    create: {
      id: 'demo-package',
      name: 'Drywall',
      projectId: project.id,
      csiDivision: '09 29 00',
    },
  });

  const bidders = await Promise.all([
    prisma.bidder.upsert({
      where: { id: 'demo-b1' },
      update: {},
      create: { id: 'demo-b1', tradePackageId: pkg.id, companyName: 'Acme Walls' },
    }),
    prisma.bidder.upsert({
      where: { id: 'demo-b2' },
      update: {},
      create: { id: 'demo-b2', tradePackageId: pkg.id, companyName: 'BuildRight Interiors' },
    }),
  ]);

  await Promise.all(
    bidders.map((bidder, idx) =>
      prisma.bidDocument.create({
        data: {
          bidderId: bidder.id,
          filename: `sample-bid-${idx + 1}.txt`,
          mimeType: 'text/plain',
          filePath: `fixtures/sample-bid-${idx + 1}.txt`,
        },
      }),
    ),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
