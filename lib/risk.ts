import { ParsedBid } from './llm';

export type RiskReason = { type: string; severity: number; message: string; scopeKey?: string; evidence?: string };

export function computeRisk(bid: ParsedBid, medianPrice?: number): { score: number; reasons: RiskReason[] } {
  let score = 50;
  const reasons: RiskReason[] = [];
  const exclusions = bid.pricing.exclusions?.length || 0;
  if (exclusions > 2) {
    score += 10;
    reasons.push({ type: 'exclusions', severity: 3, message: 'Many exclusions listed' });
  }
  const missing = bid.scopeCoverage.filter((s) => !s.included).length;
  if (missing > 2) {
    score += 15;
    reasons.push({ type: 'missing-scope', severity: 4, message: 'Key scope items not included' });
  }
  if (bid.confidence < 0.5) {
    score += 10;
    reasons.push({ type: 'parse-confidence', severity: 3, message: 'Low parse confidence' });
  }
  if (medianPrice && bid.pricing.baseBid) {
    const delta = bid.pricing.baseBid - medianPrice;
    if (delta < -0.15 * medianPrice) {
      score += 5;
      reasons.push({ type: 'price', severity: 2, message: 'Price significantly below median' });
    }
  }
  if (bid.schedule?.durationDays && bid.schedule.durationDays > 60) {
    score += 5;
    reasons.push({ type: 'schedule', severity: 2, message: 'Long schedule duration' });
  }
  return { score: Math.min(100, Math.max(0, score)), reasons };
}
