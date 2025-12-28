import { ParsedBid } from './llm';
import { ScopeCategory } from '@prisma/client';

export type CanonicalScope = { key: string; label: string; category: ScopeCategory };

const STOP_WORDS = ['the', 'and', 'of', 'for'];

function normalizeLabel(label: string): string {
  return label
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => !STOP_WORDS.includes(w))
    .join(' ');
}

export function heuristicGroup(bids: ParsedBid[]): CanonicalScope[] {
  const map = new Map<string, CanonicalScope>();
  for (const bid of bids) {
    for (const item of bid.scopeCoverage) {
      const key = normalizeLabel(item.label);
      if (!map.has(key)) {
        map.set(key, {
          key,
          label: item.label,
          category: item.included ? ScopeCategory.MATERIAL : ScopeCategory.EXCLUSION,
        });
      }
    }
  }
  return Array.from(map.values());
}
