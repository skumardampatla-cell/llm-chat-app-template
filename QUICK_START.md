# ⚡ Quick Start — 5 Minutes to Deployment

## Prerequisites

- Cloudflare account (free tier OK)
- Node.js 18+
- Git

## Installation

```bash
# 1. Clone
git clone <your-repo>
cd llm-chat-app-template

# 2. Install dependencies
npm install

# 3. Login to Cloudflare
npx wrangler login

# 4. Get account ID
npx wrangler whoami
```

## Configuration

```bash
# 5. Create KV namespaces
npx wrangler kv:namespace create "seo-blog-cache"
npx wrangler kv:namespace create "seo-blog-cache" --preview
```

Copy the output IDs to `wrangler.toml`:

```toml
account_id = "YOUR_ACCOUNT_ID"

[[kv_namespaces]]
binding = "CACHE"
id = "YOUR_KV_ID"
preview_id = "YOUR_PREVIEW_KV_ID"
```

## Enable AI Models

1. Visit https://dash.cloudflare.com/
2. Go to Workers → Workers AI
3. Click Models and enable:
   - `@cf/google/gemma-4-26b-a4b-it`
   - `@cf/zai-org/glm-5.2`
   - `@cf/black-forest-labs/flux-1-schnell`

## Deploy

```bash
# 6. Test locally
npm run dev
# Visit http://localhost:8787

# 7. Deploy
npm run deploy
```

**Done! 🎉** Your worker is live at:
```
https://seo-blog-generator.YOUR_ACCOUNT.workers.dev
```

## Test It

```bash
# Generate a blog
curl -X POST https://seo-blog-generator.YOUR_ACCOUNT.workers.dev/api/generate-blog \
  -H "Content-Type: application/json" \
  -d '{
    "niche": "Technology",
    "keywords": ["AI", "automation"],
    "length": "medium",
    "tone": "informative",
    "contentMode": "evergreen"
  }'
```

## Troubleshooting

### "AI binding not found"
→ Check `wrangler.toml` has `[[ai]]` section

### "KV namespace error"
→ Create KV and add IDs to `wrangler.toml`

### "Models not available"
→ Enable models in Cloudflare Dashboard

## Next

Read [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) for advanced config.
