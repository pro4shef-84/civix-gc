import { describe, it, expect } from 'vitest';
import { computeRisk } from '../lib/risk';
import { ParsedBid } from '../lib/llm';

describe('computeRisk', () => {
  it('adds risk for exclusions and low price', () => {
    const bid = {
      bidderName: 'A',
      tradePackageName: 'Drywall',
      pricing: { baseBid: 100, exclusions: ['paint', 'firestopping', 'cleanup'] },
      scopeCoverage: [
        { scopeKey: 'studs', label: 'Studs', included: true },
        { scopeKey: 'paint', label: 'Paint', included: false },
      ],
      schedule: { durationDays: 70 },
      risksMentioned: [],
      confidence: 0.4,
      citations: [],
    } as ParsedBid;
    const res = computeRisk(bid, 150);
    expect(res.score).toBeGreaterThan(50);
    expect(res.reasons.length).toBeGreaterThan(0);
  });
});
