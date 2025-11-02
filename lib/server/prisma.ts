const message =
  "Prisma client is not configured for this demo environment. Configure a database connection before using data mutations.";

async function reject<T = never>(): Promise<T> {
  throw new Error(message);
}

export const prisma = {
  project: {
    findMany: reject,
    create: reject
  },
  tradeScope: {
    findUnique: reject,
    create: reject
  },
  levelingSheet: {
    findFirst: reject
  },
  invitation: {
    findMany: reject,
    create: reject
  },
  bidDocument: {
    create: reject,
    update: reject
  },
  parsedLine: {
    update: reject
  },
  $transaction: reject
};
