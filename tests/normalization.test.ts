import { describe, it, expect } from 'vitest';
import { heuristicGroup } from '../lib/normalization';
import { ParsedBid } from '../lib/llm';
import { ScopeCategory } from '@prisma/client';

describe('heuristicGroup', () => {
  it('groups similar labels', () => {
    const bids: ParsedBid[] = [
      {
        bidderName: 'A',
        tradePackageName: 'Drywall',
        pricing: {},
        scopeCoverage: [
          { scopeKey: 'studs', label: 'Metal Studs', included: true },
          { scopeKey: 'paint', label: 'Final Paint', included: false },
        ],
        schedule: {},
        risksMentioned: [],
        confidence: 0.9,
        citations: [],
      } as any,
      {
        bidderName: 'B',
        tradePackageName: 'Drywall',
        pricing: {},
        scopeCoverage: [{ scopeKey: 'studs2', label: 'metal studs', included: true }],
        schedule: {},
        risksMentioned: [],
        confidence: 0.8,
        citations: [],
      } as any,
    ];
    const grouped = heuristicGroup(bids);
    expect(grouped.find((g) => g.key.includes('metal studs'))?.category).toBe(ScopeCategory.MATERIAL);
    expect(grouped.length).toBe(2);
  });
});
