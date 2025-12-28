import { prisma } from '../../../lib/prisma';
import { notFound } from 'next/navigation';
import { createBidder, uploadBidDocument, processTradePackage } from '../../actions';
import { buildCsv } from '../../../lib/csv';

interface Props { params: { id: string } }

export default async function TradePackagePage({ params }: Props) {
  const pkg = await prisma.tradePackage.findUnique({
    where: { id: params.id },
    include: {
      project: true,
      bidders: { include: { documents: true, riskAssessments: true, normalizedBidItems: true } },
      normalizedItems: { include: { bids: true } },
      riskAssessments: true,
    },
  });
  if (!pkg) return notFound();
  const csv = buildCsv(pkg.normalizedItems, pkg.bidders, pkg.riskAssessments);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">Project: {pkg.project.name}</div>
          <h1 className="text-2xl font-semibold">Trade Package: {pkg.name}</h1>
        </div>
        <form action={async () => processTradePackage(pkg.id)}>
          <button type="submit">Process Package</button>
        </form>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded shadow col-span-2">
          <h3 className="font-semibold mb-2">Bidders</h3>
          <ul className="space-y-3">
            {pkg.bidders.map((b) => (
              <li key={b.id} className="border p-3 rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{b.companyName}</div>
                    <div className="text-sm text-gray-600">{b.documents.length} documents</div>
                  </div>
                  <div className="text-sm">Risk: {pkg.riskAssessments.find((r) => r.bidderId === b.id)?.riskScore ?? '—'}</div>
                </div>
                <form action={uploadBidDocument} className="mt-2 space-y-2" encType="multipart/form-data">
                  <input type="hidden" name="bidderId" value={b.id} />
                  <input type="file" name="file" accept="application/pdf,text/plain" />
                  <button type="submit">Upload</button>
                </form>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Add Bidder</h3>
          <form action={createBidder} className="space-y-3">
            <input type="hidden" name="tradePackageId" value={pkg.id} />
            <div>
              <label className="text-sm">Company</label>
              <input name="companyName" required />
            </div>
            <div>
              <label className="text-sm">Email</label>
              <input name="contactEmail" type="email" />
            </div>
            <button type="submit">Add</button>
          </form>
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Download CSV</h4>
            <textarea className="w-full text-xs" rows={6} readOnly value={csv}></textarea>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Bid Leveling Board</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">Scope Item</th>
                {pkg.bidders.map((b) => (
                  <th key={b.id} className="text-left p-2">{b.companyName}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pkg.normalizedItems.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-2 font-medium">{item.scopeLabel}</td>
                  {pkg.bidders.map((b) => {
                    const bid = item.bids.find((i) => i.bidderId === b.id);
                    return (
                      <td key={b.id} className="p-2">
                        {bid ? (
                          <div>
                            <div>{bid.value}</div>
                            <div className="text-xs text-gray-600">c{bid.confidence.toFixed(2)}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
