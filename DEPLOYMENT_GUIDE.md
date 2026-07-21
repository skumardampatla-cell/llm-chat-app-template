# 🚀 SEO Blog Generator — Complete Deployment Guide

## Overview

This is a **full-stack AI-powered blog generator** built on Cloudflare Workers AI. It transforms your repo from a chat application template into a production-ready SEO blog generation platform.

## What Changed?

✅ **Backend**: `src/index.ts` → Complete SEO Blog Generator worker
✅ **Types**: `src/types/env.ts` → Cloudflare Workers AI bindings & types
✅ **Config**: `wrangler.toml` → Workers AI & KV namespace bindings
✅ **Handlers**: Separated business logic (blog, trends, images)
✅ **Frontend**: Embedded in worker (no separate public/ needed)

## Step-by-Step Deployment

### Step 1: Get Your Cloudflare Account Info

```bash
# Login to Cloudflare
npx wrangler login

# Get your account ID
npx wrangler whoami
# Output: Account ID: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 2: Update `wrangler.toml`

Replace these placeholders:

```toml
account_id = "PASTE_YOUR_ACCOUNT_ID_HERE"

# For KV namespace - create it first or use existing IDs
[[kv_namespaces]]
binding = "CACHE"
id = "PASTE_YOUR_KV_ID_HERE"
preview_id = "PASTE_YOUR_PREVIEW_KV_ID_HERE"
```

### Step 3: Create KV Namespaces

If you don't have KV namespaces yet:

```bash
# Create production KV
npx wrangler kv:namespace create "seo-blog-cache"

# Create preview KV
npx wrangler kv:namespace create "seo-blog-cache" --preview
```

This will output IDs to add to `wrangler.toml`.

### Step 4: Enable AI Models

1. Go to https://dash.cloudflare.com/
2. Navigate to **Workers AI**
3. Click **Models**
4. Enable these models:
   - ✅ `@cf/google/gemma-4-26b-a4b-it` (Blog generation)
   - ✅ `@cf/zai-org/glm-5.2` (Trend analysis)
   - ✅ `@cf/black-forest-labs/flux-1-schnell` (Image generation)

### Step 5: Type Generation

```bash
npm run cf-typegen
```

### Step 6: Test Locally

```bash
npm run dev
```

Visit: `http://localhost:8787`

You should see:
- 🚀 SEO Blog Generator header
- "✨ Generate Blog Post" button
- Simple form to generate blogs

### Step 7: Deploy

```bash
# Dry run (preview without deploying)
npm run check

# Deploy to Cloudflare Workers
npm run deploy
```

Your worker URL: `https://seo-blog-generator.<account>.workers.dev`

### Step 8: Verify Deployment

```bash
# Check health endpoint
curl https://seo-blog-generator.<account>.workers.dev/health

# Should return:
# {"status":"ok","timestamp":"2026-07-21T..."}
```

## API Reference

### 1. Generate Blog

```bash
curl -X POST https://your-worker.workers.dev/api/generate-blog \
  -H "Content-Type: application/json" \
  -d '{
    "niche": "Artificial Intelligence",
    "keywords": ["AI tools", "machine learning", "automation"],
    "length": "medium",
    "tone": "informative",
    "contentMode": "evergreen",
    "adUrl": "https://example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "blog": {
    "title": "The Ultimate Guide to AI Tools...",
    "metaDescription": "Discover top AI tools for productivity...",
    "content": "<h1>...</h1><p>...</p>",
    "wordCount": 1850,
    "seoScore": 87,
    "freshnessScore": 18
  }
}
```

### 2. Get Trending Keywords

```bash
curl -X POST https://your-worker.workers.dev/api/trending-keywords \
  -H "Content-Type: application/json" \
  -d '{"niche": "Cryptocurrency"}'
```

**Response:**
```json
{
  "success": true,
  "trending": ["Bitcoin mining 2026", "Ethereum layer 2", ...]
}
```

### 3. Generate Image

```bash
curl -X POST https://your-worker.workers.dev/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{"prompt": "professional AI concept illustration"}'
```

**Response:**
```json
{
  "success": true,
  "image": "data:image/jpeg;base64,..."
}
```

## Configuration Options

### Content Modes

- `evergreen` - Timeless content (no events)
- `breaking` - Latest news angle
- `trending` - Follows viral topics
- `event-based` - Tied to specific event

### Blog Lengths

- `short` - 800–1200 words
- `medium` - 1500–2000 words (recommended)
- `long` - 2500–3500 words

### Tones

- `informative` - Educational, factual
- `conversational` - Friendly, approachable
- `authoritative` - Expert, professional
- `persuasive` - Sales-focused
- `news` - Journalistic style

## Troubleshooting

### Error: "AI binding not found"

**Solution**: Check `wrangler.toml` has `[[ai]]` binding:
```toml
[[ai]]
binding = "AI"
```

### Error: "KV namespace not found"

**Solution**: Create and add to `wrangler.toml`:
```bash
npx wrangler kv:namespace create "seo-blog-cache"
```

### Models not working

**Solution**: 
1. Go to Cloudflare Dashboard → Workers AI
2. Enable all 3 models
3. Verify account has Workers AI access

### CORS errors on frontend

**Solution**: Update `corsHeaders` in `src/index.ts`:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://yourdomain.com', // Your domain
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
```

### High latency or timeouts

**Solution**: 
- Reduce `max_tokens` in prompts
- Use KV caching (already implemented)
- Check Cloudflare Dashboard → Workers → Analytics

## Performance Tips

### 1. Caching Strategy

Blogs are cached for 24 hours:
```typescript
await env.CACHE.put(cacheKey, JSON.stringify(blogData), {
  expirationTtl: 86400, // 24 hours
});
```

Trends are cached for 1 hour:
```typescript
await env.CACHE.put(cacheKey, JSON.stringify(trending), {
  expirationTtl: 3600, // 1 hour
});
```

### 2. Clear Cache Manually

```bash
# List keys
npx wrangler kv:key list --namespace-id=<your-id>

# Delete specific key
npx wrangler kv:key delete "blog:AI:machine learning" --namespace-id=<your-id>

# Clear all (use with caution)
npx wrangler kv:key list --namespace-id=<your-id> | \
  jq -r '.[] | .name' | \
  xargs -I {} npx wrangler kv:key delete {} --namespace-id=<your-id>
```

### 3. Monitor Performance

```bash
# View real-time logs
npx wrangler tail

# Filter by status
npx wrangler tail --status ok
```

## Custom Domain Setup

1. Update `wrangler.toml`:
   ```toml
   routes = [
     { pattern = "blog.yourdomain.com/*", zone_name = "yourdomain.com" }
   ]
   ```

2. Ensure domain is on Cloudflare

3. Deploy:
   ```bash
   npm run deploy
   ```

## Environment-Specific Deployment

### Production

```bash
npm run deploy -- --env production
```

### Development

```bash
npm run dev
```

## Integration Examples

### Python

```python
import requests
import json

url = "https://seo-blog-generator.account.workers.dev/api/generate-blog"
payload = {
    "niche": "Personal Finance",
    "keywords": ["budgeting", "investing", "savings"],
    "length": "medium",
    "tone": "conversational",
    "contentMode": "evergreen"
}

response = requests.post(url, json=payload)
blog = response.json()["blog"]
print(blog["title"])
```

### Node.js

```javascript
const generateBlog = async () => {
  const res = await fetch('https://your-worker.workers.dev/api/generate-blog', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      niche: 'Health & Wellness',
      keywords: ['sleep', 'meditation', 'stress'],
      length: 'medium',
      tone: 'informative',
      contentMode: 'evergreen'
    })
  });
  const data = await res.json();
  return data.blog;
};
```

## Cost Estimation

With Cloudflare's free tier:

- **Requests**: 100,000/day free
- **AI**: Pay-per-use (~$0.001-0.01 per request)
- **KV**: 100,000 writes/day, unlimited reads
- **Workers**: Free tier covers most needs

Example costs:
- 100 blogs/day = ~$3-30/month
- 1,000 blogs/day = ~$30-300/month

## Security

### Rate Limiting

Add to `src/index.ts`:

```typescript
const ip = request.headers.get('cf-connecting-ip') || 'unknown';
const rateLimitKey = `limit:${ip}`;
const limited = await env.CACHE.get(rateLimitKey);

if (limited) {
  return new Response('Rate limited', { status: 429 });
}

await env.CACHE.put(rateLimitKey, '1', { expirationTtl: 60 });
```

### API Key Protection

Add auth header check:

```typescript
const apiKey = request.headers.get('x-api-key');
if (apiKey !== env.API_KEY) {
  return new Response('Unauthorized', { status: 401 });
}
```

## Next Steps

1. ✅ Deploy the worker
2. 🔧 Configure AI models
3. 🎯 Test all endpoints
4. 🚀 Integrate into your app
5. 📊 Monitor performance
6. 🔐 Add authentication
7. 🌐 Set custom domain

## Support & Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Workers AI Guide](https://developers.cloudflare.com/workers-ai/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/cli-wrangler/)
- [Models Reference](https://developers.cloudflare.com/workers-ai/models/)

---

**Happy blog generating! 🎉**
