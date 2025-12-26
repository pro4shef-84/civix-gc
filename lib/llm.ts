import OpenAI from 'openai';
import { z } from 'zod';
import { sleep } from './utils';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const ParsedBidSchema = z.object({
  bidderName: z.string(),
  tradePackageName: z.string(),
  pricing: z.object({
    baseBid: z.number().optional(),
    unit: z.string().optional(),
    alternates: z.array(z.object({ name: z.string(), amount: z.number() })).optional(),
    allowances: z.array(z.object({ name: z.string(), amount: z.number() })).optional(),
    exclusions: z.array(z.string()).optional(),
    assumptions: z.array(z.string()).optional(),
    clarifications: z.array(z.string()).optional(),
  }),
  scopeCoverage: z.array(
    z.object({
      scopeKey: z.string(),
      label: z.string(),
      included: z.boolean(),
      notes: z.string().optional(),
      amount: z.number().optional(),
    }),
  ),
  schedule: z
    .object({
      durationDays: z.number().optional(),
      startConstraints: z.string().optional(),
      leadTimes: z.string().optional(),
    })
    .optional(),
  risksMentioned: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  citations: z.array(z.object({ quote: z.string(), page: z.number().optional(), section: z.string().optional() })),
});

export type ParsedBid = z.infer<typeof ParsedBidSchema>;

export async function callParseBidLLM(text: string): Promise<ParsedBid> {
  const prompt = `You are parsing a subcontractor bid letter. Extract structured data and output JSON only that matches the provided schema. Output JSON only. No markdown.`;
  const schema = ParsedBidSchema;
  const maxRetries = 3;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: prompt },
          {
            role: 'user',
            content: `Schema: ${schema.toString()}\n---\nBid Text:\n${text}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0,
      });
      const raw = completion.choices[0].message?.content || '{}';
      const parsed = JSON.parse(raw);
      return schema.parse(parsed);
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await sleep(500 * (i + 1));
    }
  }
  throw new Error('Failed to parse bid');
}
