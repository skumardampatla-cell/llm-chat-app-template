# 📦 Migration Guide — From Chat App to Blog Generator

This guide helps you transition from the LLM Chat Application to the SEO Blog Generator.

## What's Changing?

### Before (Chat Application)
```
src/
├── index.ts (chat handler)
└── types.ts (chat types)
public/
├── index.html (chat UI)
└── chat.js (chat frontend)
```

### After (Blog Generator)
```
src/
├── index.ts (blog generator + embedded HTML)
├── types/
│   └── env.ts (Cloudflare bindings)
└── handlers/
    ├── blog.ts
    ├── trends.ts
    └── images.ts
```

## Migration Steps

### 1. Update Dependencies

No new npm dependencies needed! Same packages work.

```bash
npm install
```

### 2. Update wrangler.toml

**Replace entire file with:**

```toml
name = "seo-blog-generator"
type = "service"
account_id = "YOUR_ACCOUNT_ID"

[[ai]]
binding = "AI"

[[kv_namespaces]]
binding = "CACHE"
id = "YOUR_KV_ID"
preview_id = "YOUR_PREVIEW_KV_ID"

compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]
```

### 3. Create KV Namespaces

```bash
npx wrangler kv:namespace create "seo-blog-cache"
npx wrangler kv:namespace create "seo-blog-cache" --preview
```

Copy the IDs to `wrangler.toml`.

### 4. Replace src/index.ts

✅ Already done! New version includes:
- Blog generation endpoint
- Trending keywords endpoint
- Image generation endpoint
- Embedded HTML frontend

### 5. Create src/types/env.ts

✅ Already done! Includes:
- `Env` interface with AI & KV bindings
- `BlogGenerationPayload` type
- `BlogData` type
- `ApiResponse` type

### 6. Remove public/ Directory (Optional)

The old chat frontend is no longer needed:

```bash
rm -rf public/
```

The new frontend is embedded in `src/index.ts`.

### 7. Enable AI Models

1. Go to https://dash.cloudflare.com/
2. Workers → Workers AI → Models
3. Enable:
   - ✅ `@cf/google/gemma-4-26b-a4b-it` (Gemma 4)
   - ✅ `@cf/zai-org/glm-5.2` (GLM)
   - ✅ `@cf/black-forest-labs/flux-1-schnell` (Flux)

### 8. Test Locally

```bash
npm run dev
```

Visit: `http://localhost:8787`

You should see the blog generator UI (not chat).

### 9. Deploy

```bash
npm run check    # Dry run
npm run deploy   # Live deployment
```

## Data Migration

If you have chat history to preserve:

1. Export from old chat API
2. Store in KV or D1 database
3. Reference in blog generator if needed

## URL Changes

### Old Chat App
```
POST /api/chat
```

### New Blog Generator
```
POST /api/generate-blog
POST /api/trending-keywords
POST /api/generate-image
```

## Breaking Changes

✋ These no longer work:
- `POST /api/chat` → Use `POST /api/generate-blog` instead
- `GET /` (served chat UI) → Now serves blog generator UI

## Rollback

If you need to revert:

```bash
git log --oneline | head
git checkout <old-commit-hash>
npm run deploy
```

## Verification Checklist

- [ ] `wrangler.toml` updated with account_id & KV IDs
- [ ] AI models enabled in dashboard
- [ ] `npm run dev` shows blog generator
- [ ] `npm run check` passes
- [ ] `npm run deploy` successful
- [ ] `/health` endpoint returns OK
- [ ] `/api/generate-blog` works
- [ ] `/api/trending-keywords` works
- [ ] Frontend loads at `/`

## Troubleshooting

### Still seeing chat app

You might have old `public/` directory:
```bash
rm -rf public/
npm run deploy
```

### AI models not working

Check dashboard:
1. https://dash.cloudflare.com/
2. Workers AI → Models
3. Enable all 3 required models

### KV errors

```bash
# Verify KV exists
npx wrangler kv:namespace list

# Create if missing
npx wrangler kv:namespace create "seo-blog-cache"
```

## Need Help?

See `DEPLOYMENT_GUIDE.md` for detailed setup instructions.
