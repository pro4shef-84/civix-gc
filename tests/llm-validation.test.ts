import { describe, it, expect } from 'vitest';
import { ParsedBidSchema } from '../lib/llm';

describe('ParsedBidSchema', () => {
  it('validates minimal object', () => {
    const data = {
      bidderName: 'A',
      tradePackageName: 'Drywall',
      pricing: {},
      scopeCoverage: [],
      schedule: {},
      risksMentioned: [],
      confidence: 0.8,
      citations: [],
    };
    const parsed = ParsedBidSchema.safeParse(data);
    expect(parsed.success).toBe(true);
  });
});
