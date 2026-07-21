/**
 * SEO Blog Generator — Cloudflare Workers AI Backend
 * Powers live AI-grounded blog post generation with real-time data integration
 */

import { Env, BlogGenerationPayload, BlogData, ApiResponse } from './types/env';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // ── CORS Headers ──────────────────────────────────────────────────────────
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // ── Health Check ──────────────────────────────────────────────────────────
    if (url.pathname === '/health' && request.method === 'GET') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── API: Generate Blog ────────────────────────────────────────────────────
    if (url.pathname === '/api/generate-blog' && request.method === 'POST') {
      return handleGenerateBlog(request, env, corsHeaders);
    }

    // ── API: Fetch Trending Keywords ──────────────────────────────────────────
    if (url.pathname === '/api/trending-keywords' && request.method === 'POST') {
      return handleTrendingKeywords(request, env, corsHeaders);
    }

    // ── API: Generate Image ───────────────────────────────────────────────────
    if (url.pathname === '/api/generate-image' && request.method === 'POST') {
      return handleGenerateImage(request, env, corsHeaders);
    }

    // ── Serve Frontend ────────────────────────────────────────────────────────
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(getHtmlPage(), {
        headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
};

// ── Handler: Generate Blog ────────────────────────────────────────────────────
async function handleGenerateBlog(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const body = (await request.json()) as BlogGenerationPayload;
    const { niche, keywords, length, tone, contentMode, eventName, adUrl } = body;

    // ── Validate Input ────────────────────────────────────────────────────────
    if (!niche || !keywords || keywords.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const dateLabel = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    // ── Build Prompt ──────────────────────────────────────────────────────────
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

    // ── Call AI Model ─────────────────────────────────────────────────────────
    const response = await env.AI.run('@cf/google/gemma-4-26b-a4b-it', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 4096,
      temperature: 0.8,
    });

    // ── Parse Response ────────────────────────────────────────────────────────
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

    // ── Cache Result (optional) ───────────────────────────────────────────────
    const cacheKey = `blog:${niche}:${keywords.join(',')}`;
    await env.CACHE.put(cacheKey, JSON.stringify(blogData), {
      expirationTtl: 86400, // 24 hours
    });

    return new Response(JSON.stringify({ success: true, blog: blogData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Blog generation error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// ── Handler: Trending Keywords ────────────────────────────────────────────────
async function handleTrendingKeywords(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const { niche } = (await request.json()) as { niche: string };

    // ── Check Cache First ─────────────────────────────────────────────────────
    const cacheKey = `trends:${niche}`;
    const cached = await env.CACHE.get(cacheKey);
    if (cached) {
      return new Response(JSON.stringify({ success: true, trending: JSON.parse(cached) }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Call AI Model ─────────────────────────────────────────────────────────
    const response = await env.AI.run('@cf/zai-org/glm-5.2', {
      messages: [
        {
          role: 'system',
          content: 'You are a search trend analyst. Return ONLY raw JSON, no markdown fences.',
        },
        {
          role: 'user',
          content: `Return the top 6 trending search queries for the "${niche}" niche right now in July 2026.
These should be things people are actively searching for TODAY.
Return ONLY this JSON:
{"trending": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6"]}`,
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    // ── Parse Response ────────────────────────────────────────────────────────
    let raw: string = (response.response || '').replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      data = match ? JSON.parse(match[0]) : { trending: [] };
    }

    // ── Cache Result ──────────────────────────────────────────────────────────
    const trending = data.trending || [];
    await env.CACHE.put(cacheKey, JSON.stringify(trending), {
      expirationTtl: 3600, // 1 hour
    });

    return new Response(JSON.stringify({ success: true, trending }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Trending keywords error:', err);
    return new Response(JSON.stringify({ success: false, trending: [], error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// ── Handler: Generate Image ──────────────────────────────────────────────────
async function handleGenerateImage(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const { prompt } = (await request.json()) as { prompt: string };

    if (!prompt) {
      return new Response(JSON.stringify({ success: false, error: 'Prompt required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Call Image Model ──────────────────────────────────────────────────────
    const imageResponse = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
      prompt,
      num_steps: 4,
    });

    // ── Convert to Base64 ─────────────────────────────────────────────────────
    const base64 = btoa(String.fromCharCode(...new Uint8Array(imageResponse as any)));

    return new Response(JSON.stringify({ success: true, image: `data:image/jpeg;base64,${base64}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Image generation error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// ── Frontend HTML Page ────────────────────────────────────────────────────────
function getHtmlPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>🚀 SEO Blog Generator — Live Intelligence</title>
<style>
:root{--bg:#0a0e1a;--accent:#22c55e;--text:#e2e8f0;--muted:#64748b;--danger:#ef4444}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--text);font-family:system-ui,sans-serif;min-height:100vh;overflow-x:hidden}
.container{max-width:1200px;margin:0 auto;padding:40px 20px}
header{text-align:center;margin-bottom:40px}
h1{font-size:2.5rem;margin-bottom:10px;background:linear-gradient(90deg,var(--accent),#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.gen-btn{padding:14px 32px;background:linear-gradient(135deg,var(--accent),#16a34a);border:none;border-radius:10px;color:#fff;font-size:1rem;font-weight:700;cursor:pointer;transition:.2s}
.gen-btn:hover{opacity:.9;transform:translateY(-2px)}
.gen-btn:disabled{opacity:.5;cursor:not-allowed}
.toast{position:fixed;bottom:24px;right:24px;background:var(--accent);color:#fff;padding:12px 20px;border-radius:8px;transform:translateY(60px);opacity:0;transition:.3s;z-index:9999}
.toast.show{transform:translateY(0);opacity:1}
.content{background:#111827;border:1px solid #1e2d45;border-radius:12px;padding:20px;margin-top:20px;line-height:1.75}
.progress-wrap{display:none;margin-top:20px}
.progress-bar-bg{background:#1e2d45;border-radius:4px;height:6px;overflow:hidden}
.progress-bar{background:linear-gradient(90deg,var(--accent),#3b82f6);height:100%;border-radius:4px;transition:width .4s ease}
</style>
</head>
<body>
<div class="container">
  <header>
    <h1>🚀 SEO Blog Generator</h1>
    <p style="color:var(--muted);margin-bottom:20px">Powered by Cloudflare Workers AI</p>
  </header>
  
  <button class="gen-btn" id="gen-btn" onclick="generateBlog()">✨ Generate Blog Post</button>
  <div class="progress-wrap" id="progress-wrap"><div class="progress-bar-bg"><div class="progress-bar" id="progress-bar"></div></div></div>
  <div id="blog-preview" class="content"></div>
</div>

<div class="toast" id="toast"></div>

<script>
async function generateBlog() {
  const btn = document.getElementById('gen-btn');
  btn.disabled = true;
  btn.textContent = '⏳ Generating...';
  
  const progressWrap = document.getElementById('progress-wrap');
  progressWrap.style.display = 'block';
  
  try {
    const res = await fetch('/api/generate-blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        niche: 'Artificial Intelligence',
        keywords: ['AI tools', 'machine learning', 'automation'],
        length: 'medium',
        tone: 'informative',
        contentMode: 'evergreen'
      })
    });
    
    const data = await res.json();
    if (data.success) {
      document.getElementById('blog-preview').innerHTML = 
        '<h2>' + data.blog.title + '</h2>' + 
        '<p style="color:var(--muted);font-size:0.85rem">' + data.blog.metaDescription + '</p>' +
        data.blog.content;
      showToast('✅ Blog generated successfully!');
    } else {
      showToast('❌ Generation failed: ' + (data.error || 'Unknown error'), true);
    }
  } catch (e) {
    showToast('❌ Error: ' + e.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = '✨ Generate Blog Post';
    progressWrap.style.display = 'none';
  }
}

function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show';
  setTimeout(() => t.className = 'toast', 3000);
}
</script>
</body>
</html>`;
}
