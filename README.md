# 🚀 SEO Blog Generator — Cloudflare Workers AI

A full-stack, production-ready AI-powered blog generator built with **Cloudflare Workers** and **Workers AI**. Generate SEO-optimized blog posts with real-time trending keywords, images, and live event integration.

## 🎯 Features

- ✨ **Live AI Blog Generation** — Powered by Gemma 4 26B model
- 🔥 **Real-Time Trending Keywords** — GLM-5.2 analyzes trending topics
- 🖼️ **AI Image Generation** — Flux-1 Schnell creates visuals
- 📊 **SEO Analytics** — Automatic scoring and optimization
- ⚡ **Production-Ready** — Full TypeScript support, CORS enabled
- 💾 **Caching Layer** — KV namespace for performance optimization
- 🌍 **Global Edge Deployment** — Cloudflare's edge network

## 📋 Prerequisites

- [Cloudflare Account](https://dash.cloudflare.com) with **Workers** enabled
- **Workers AI** enabled (free tier available)
- Node.js 18+ and npm
- [Wrangler CLI](https://developers.cloudflare.com/workers/cli-wrangler/) v4+

## 🚀 Quick Start

### 1. Clone & Setup

```bash
git clone <your-repo>
cd llm-chat-app-template
npm install
```

### 2. Authenticate with Cloudflare

```bash
npx wrangler login
```

### 3. Configure `wrangler.toml`

Replace placeholders in `wrangler.toml`:

```toml
account_id = "your-account-id"  # Get from: wrangler whoami

[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"
preview_id = "your-preview-kv-namespace-id"
```

### 4. Create KV Namespace (if needed)

```bash
npx wrangler kv:namespace create "seo-blog-cache"
npx wrangler kv:namespace create "seo-blog-cache" --preview
```

### 5. Deploy

```bash
npm run deploy
```

Your worker will be live at: `https://seo-blog-generator.<your-account>.workers.dev`

## 📁 Project Structure

```
├── wrangler.toml                 # Cloudflare Workers configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── src/
│   ├── index.ts                  # Main Worker entry point
│   ├── types/
│   │   └── env.ts                # TypeScript environment types
│   └── handlers/                 # Separated handlers
│       ├── blog.ts               # Blog generation logic
│       ├── trends.ts             # Trending keywords
│       └── images.ts             # Image generation
└── dist/                         # Compiled output
```

## 🔧 Configuration

### AI Models

The worker uses three AI models:

| Model | Purpose | Binding |
|-------|---------|---------|
| `@cf/google/gemma-4-26b-a4b-it` | Blog content generation | `env.AI` |
| `@cf/zai-org/glm-5.2` | Trend analysis | `env.AI` |
| `@cf/black-forest-labs/flux-1-schnell` | Image generation | `env.AI` |

**Enable models** in Cloudflare dashboard:
1. Go to **Workers AI** → **Models**
2. Enable required models (free tier includes most models)

### Environment Variables

Edit `wrangler.toml`:

```toml
[env.production]
name = "seo-blog-generator"
vars = { ENVIRONMENT = "production" }

[env.development]
vars = { ENVIRONMENT = "development" }
```

Deploy to production:
```bash
npm run deploy -- --env production
```

## 📡 API Endpoints

### Generate Blog Post

```bash
POST /api/generate-blog
Content-Type: application/json

{
  "niche": "Artificial Intelligence",
  "keywords": ["machine learning", "AI tools"],
  "length": "medium",
  "tone": "informative",
  "contentMode": "evergreen",
  "eventName": "Bitcoin Halving",
  "adUrl": "https://your-affiliate-link.com"
}
```

**Response:**
```json
{
  "success": true,
  "blog": {
    "title": "...",
    "metaDescription": "...",
    "slug": "...",
    "content": "...",
    "wordCount": 1800,
    "seoScore": 85,
    "freshnessScore": 18,
    ...
  }
}
```

### Fetch Trending Keywords

```bash
POST /api/trending-keywords
Content-Type: application/json

{
  "niche": "Cryptocurrency"
}
```

**Response:**
```json
{
  "success": true,
  "trending": ["bitcoin", "ethereum", "crypto wallets", ...]
}
```

### Generate Image

```bash
POST /api/generate-image
Content-Type: application/json

{
  "prompt": "professional AI concept illustration"
}
```

**Response:**
```json
{
  "success": true,
  "image": "data:image/jpeg;base64,..."
}
```

## 💾 Caching Strategy

The worker caches:

- **Blog posts** — 24 hours (KV)
- **Trending keywords** — 1 hour (KV)
- **Generated images** — Inline (base64, no caching)

### Clear Cache

```bash
# List all cache keys
npx wrangler kv:key list --namespace-id=<your-id>

# Delete a key
npx wrangler kv:key delete "blog:AI:machine learning" --namespace-id=<your-id>
```

## 🔐 Security & CORS

**CORS enabled** for all origins. Customize in `src/index.ts`:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://yourdomain.com', // Restrict to your domain
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
```

## 📊 Monitoring & Logging

View worker logs:

```bash
# Real-time logs
npx wrangler tail

# Tail with filters
npx wrangler tail --format json
```

Check metrics in Cloudflare Dashboard:
- **Workers → Analytics** → Performance & Errors
- **KV → Analytics** → Read/Write operations

## 🛠️ Development

### Local Development

```bash
npm run dev
# Worker runs on http://localhost:8787
```

### Type Generation

```bash
npm run cf-typegen
# Generates types from wrangler.toml
```

### Type Checking

```bash
npx tsc --noEmit
```

### Dry Run (Preview Deployment)

```bash
npm run check
```

## 🚢 Production Deployment

### Step-by-Step

1. **Test locally:**
   ```bash
   npm run dev
   ```

2. **Run type check:**
   ```bash
   npx tsc --noEmit
   ```

3. **Preview deploy:**
   ```bash
   npm run check
   ```

4. **Deploy to production:**
   ```bash
   npm run deploy
   ```

### Custom Domain

1. Add a route in `wrangler.toml`:
   ```toml
   routes = [
     { pattern = "blog.yourdomain.com/*", zone_name = "yourdomain.com" }
   ]
   ```

2. Verify domain is on Cloudflare
3. Deploy: `npm run deploy`

## 📈 Scaling & Performance

- ✅ **Global Edge Network** — Cloudflare's 300+ data centers
- ✅ **Automatic Caching** — KV reduces API calls
- ✅ **Streaming Support** — Large blog posts handled efficiently
- ✅ **Rate Limiting** — Implement per your needs

### Add Rate Limiting

```typescript
// In src/index.ts
const rateLimitKey = `limit:${request.headers.get('cf-connecting-ip')}`;
const limited = await env.CACHE.get(rateLimitKey);

if (limited) {
  return new Response('Rate limited', { status: 429 });
}

await env.CACHE.put(rateLimitKey, '1', { expirationTtl: 60 }); // 60s window
```

## 🐛 Troubleshooting

### "AI binding not found"
- Ensure `[[ai]]` binding exists in `wrangler.toml`
- Models must be enabled in Cloudflare dashboard
- Verify account has Workers AI access

### "KV namespace not found"
```bash
npx wrangler kv:namespace create "seo-blog-cache"
```

### Model not available
Check [supported models](https://developers.cloudflare.com/workers-ai/models/) and enable in dashboard.

### CORS errors
Frontend and worker must share same origin or add proper headers.

## 📚 Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Workers AI Guide](https://developers.cloudflare.com/workers-ai/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/cli-wrangler/)
- [KV Namespace API](https://developers.cloudflare.com/workers/platform/storage/kv/)

## 🤝 Contributing

Pull requests welcome! Please:
1. Test locally with `npm run dev`
2. Run type check: `npm run check`
3. Update documentation

## 📄 License

MIT

---

**Made with ❤️ for the Cloudflare Workers ecosystem**
