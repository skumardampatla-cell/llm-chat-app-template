/**
 * Trending keywords handler
 */

import { Env } from '../types/env';

export async function fetchTrendingKeywords(niche: string, env: Env): Promise<string[]> {
  const cacheKey = `trends:${niche}`;
  const cached = await env.CACHE.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }

  const response = await env.AI.run('@cf/zai-org/glm-5.2', {
    messages: [
      {
        role: 'system',
        content: 'You are a search trend analyst. Return ONLY raw JSON, no markdown fences.',
      },
      {
        role: 'user',
        content: `Return the top 6 trending search queries for the "${niche}" niche right now.
These should be things people are actively searching for TODAY.
Return ONLY this JSON:
{"trending": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6"]}`,
      },
    ],
    max_tokens: 300,
    temperature: 0.7,
  });

  let raw: string = (response.response || '').replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  let data: any;
  
  try {
    data = JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    data = match ? JSON.parse(match[0]) : { trending: [] };
  }

  const trending = data.trending || [];
  await env.CACHE.put(cacheKey, JSON.stringify(trending), {
    expirationTtl: 3600,
  });

  return trending;
}
