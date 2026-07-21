/**
 * Blog generation handler
 * Separated for better code organization
 */

import { Env, BlogGenerationPayload, BlogData } from '../types/env';

export async function generateBlog(
  payload: BlogGenerationPayload,
  env: Env
): Promise<BlogData> {
  const { niche, keywords, length, tone, contentMode, eventName, adUrl } = payload;

  const today = new Date().toISOString().split('T')[0];
  const dateLabel = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const wordTarget = length === 'short' ? '800–1200' : length === 'medium' ? '1500–2000' : '2500–3500';
  const keywordStr = keywords.join(', ');

  const systemPrompt = `You are an elite SEO content strategist and blogger.
Generate a complete, publish-ready blog post as a single valid JSON object.
Do NOT include markdown fences. Return ONLY raw JSON.
The "content" field must contain clean HTML (no \`\`\` fences, no escaped backticks).`;

  const userPrompt = `Generate a ${wordTarget}-word blog post.

CONFIGURATION:
- Niche: ${niche}
- Keywords: ${keywordStr}
- Tone: ${tone}
- Content Mode: ${contentMode}
${contentMode === 'event-based' && eventName ? `- Focus Event: ${eventName}` : ''}
- Today's Date: ${dateLabel}
- Ad URL (for CTAs): ${adUrl || ''}

REQUIREMENTS:
- H1 title with power word and primary keyword
- Meta description (155 chars)
- SEO slug
- Introduction with a hook referencing something relevant happening NOW in ${niche}
- Include a "Latest Developments" section styled as a news callout (use class="news-callout")
- Minimum 4 H2 sections with substantive content
- FAQ section (5 questions)
- Strong conclusion with CTA ${adUrl ? `linking to: ${adUrl}` : ''}
- Weave all keywords naturally: ${keywordStr}
- Include a freshness stamp with today's date: ${today}
- Schema-ready article structure

OUTPUT — return ONLY this JSON (no markdown, no fences):
{
  "title": "...",
  "metaDescription": "...",
  "slug": "...",
  "content": "...full HTML...",
  "wordCount": 0,
  "keywordsUsed": [],
  "seoScore": 0,
  "freshnessScore": 0,
  "newsRelevance": 0,
  "trendMatch": 0,
  "readabilityScore": 0,
  "liveEventsCount": 0,
  "trendAngle": "...",
  "currentEventHook": "..."
}`;

  const response = await env.AI.run('@cf/google/gemma-4-26b-a4b-it', {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 4096,
    temperature: 0.8,
  });

  let raw: string = response.response || '';
  raw = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

  let blogData: BlogData;
  try {
    blogData = JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      blogData = JSON.parse(match[0]);
    } else {
      throw new Error('Failed to parse blog JSON from model response');
    }
  }

  return blogData;
}
