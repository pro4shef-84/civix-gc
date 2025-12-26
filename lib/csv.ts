import { NormalizedScopeItem, NormalizedBidItem, Bidder, RiskAssessment } from '@prisma/client';

export function buildCsv(
  items: (NormalizedScopeItem & { bids: NormalizedBidItem[] })[],
  bidders: Bidder[],
  risks: RiskAssessment[],
) {
  const headers = ['Scope Item', ...bidders.map((b) => b.companyName)];
  const rows = items.map((item) => {
    const values = bidders.map((b) => {
      const bid = item.bids.find((i) => i.bidderId === b.id);
      return bid ? `${bid.value} (c${bid.confidence.toFixed(2)})` : 'N/A';
    });
    return [item.scopeLabel, ...values];
  });
  const riskRow = ['Risk Score', ...bidders.map((b) => {
    const r = risks.find((x) => x.bidderId === b.id);
    return r ? r.riskScore.toString() : 'N/A';
  })];
  const lines = [headers, ...rows, riskRow];
  return lines.map((r) => r.join(',')).join('\n');
}
