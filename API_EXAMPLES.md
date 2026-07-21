# 📡 API Examples & Usage

## Base URL

```
https://seo-blog-generator.YOUR_ACCOUNT.workers.dev
```

## 1. Generate Blog Post

### Request

```bash
curl -X POST https://your-worker.workers.dev/api/generate-blog \
  -H "Content-Type: application/json" \
  -d '{
    "niche": "Artificial Intelligence",
    "keywords": ["AI tools", "machine learning", "chatbots"],
    "length": "medium",
    "tone": "informative",
    "contentMode": "evergreen",
    "eventName": "",
    "adUrl": "https://example.com/affiliate"
  }'
```

### Parameters

| Field | Type | Required | Options | Description |
|-------|------|----------|---------|-------------|
| `niche` | string | ✅ | See niches list | Blog topic category |
| `keywords` | array | ✅ | Any strings | SEO keywords to include |
| `length` | string | ✅ | `short`, `medium`, `long` | Blog word count |
| `tone` | string | ✅ | `informative`, `conversational`, `authoritative`, `persuasive`, `news` | Writing style |
| `contentMode` | string | ✅ | `evergreen`, `breaking`, `trending`, `event-based` | Content angle |
| `eventName` | string | ❌ | Any string | Event (for event-based mode) |
| `adUrl` | string | ❌ | Valid URL | CTA link for blog |

### Response (Success)

```json
{
  "success": true,
  "blog": {
    "title": "The Ultimate 2026 Guide to AI Tools: Boost Your Productivity",
    "metaDescription": "Discover the best AI tools for productivity, automation, and chatbots. Learn how to leverage machine learning for business success.",
    "slug": "ultimate-guide-ai-tools-2026",
    "content": "<h1>The Ultimate...</h1><p>...</p>",
    "wordCount": 1847,
    "keywordsUsed": ["AI tools", "machine learning", "chatbots"],
    "seoScore": 87,
    "freshnessScore": 19,
    "newsRelevance": 8,
    "trendMatch": 9,
    "readabilityScore": 9,
    "liveEventsCount": 2,
    "trendAngle": "Latest developments in AI democratization",
    "currentEventHook": "With OpenAI's latest announcements in July 2026..."
  }
}
```

### Response (Error)

```json
{
  "success": false,
  "error": "Missing required fields"
}
```

---

## 2. Get Trending Keywords

### Request

```bash
curl -X POST https://your-worker.workers.dev/api/trending-keywords \
  -H "Content-Type: application/json" \
  -d '{"niche": "Cryptocurrency"}'
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `niche` | string | ✅ | Topic niche |

### Response

```json
{
  "success": true,
  "trending": [
    "Bitcoin halving predictions 2026",
    "Ethereum layer 2 solutions",
    "DeFi yield farming strategies",
    "NFT market recovery 2026",
    "Crypto tax reporting guide",
    "Web3 security best practices"
  ]
}
```

---

## 3. Generate Image

### Request

```bash
curl -X POST https://your-worker.workers.dev/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{"prompt": "professional blockchain concept art, modern, 4k"}'
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `prompt` | string | ✅ | Image generation prompt |

### Response

```json
{
  "success": true,
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."
}
```

### Usage in HTML

```html
<img src="data:image/jpeg;base64,/9j/4AAQSkZJRg..." alt="Generated image">
```

---

## 4. Health Check

### Request

```bash
curl https://your-worker.workers.dev/health
```

### Response

```json
{
  "status": "ok",
  "timestamp": "2026-07-21T15:30:45.123Z"
}
```

---

## Supported Niches

```
- Artificial Intelligence
- Cryptocurrency
- Personal Finance
- Health & Wellness
- Technology
- Digital Marketing
- E-commerce
- Real Estate
- Fitness & Nutrition
- Travel
- Education & Courses
- SaaS & Software
- Gaming
- Fashion & Beauty
- Food & Recipes
- Sustainability
- Parenting
- Career & Productivity
- Mental Health
- Sports
- Astrology & Spirituality
- Pets
- Home & DIY
- Legal & Finance
- Automotive
```

---

## Code Examples

### JavaScript/Node.js

```javascript
const BASE_URL = 'https://seo-blog-generator.account.workers.dev';

async function generateBlog(niche, keywords) {
  const res = await fetch(`${BASE_URL}/api/generate-blog`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      niche,
      keywords,
      length: 'medium',
      tone: 'informative',
      contentMode: 'evergreen'
    })
  });
  
  const data = await res.json();
  return data.blog;
}

// Usage
const blog = await generateBlog('AI', ['machine learning', 'chatbots']);
console.log(blog.title);
```

### Python

```python
import requests

BASE_URL = 'https://seo-blog-generator.account.workers.dev'

def generate_blog(niche, keywords):
    res = requests.post(f'{BASE_URL}/api/generate-blog', json={
        'niche': niche,
        'keywords': keywords,
        'length': 'medium',
        'tone': 'informative',
        'contentMode': 'evergreen'
    })
    return res.json()['blog']

# Usage
blog = generate_blog('AI', ['machine learning', 'chatbots'])
print(blog['title'])
```

### cURL

```bash
#!/bin/bash

NICHE="Cryptocurrency"
KEYWORDS='["Bitcoin", "Ethereum", "DeFi"]'
WORKER_URL="https://seo-blog-generator.account.workers.dev"

curl -X POST "$WORKER_URL/api/generate-blog" \
  -H "Content-Type: application/json" \
  -d "{
    \"niche\": \"$NICHE\",
    \"keywords\": $KEYWORDS,
    \"length\": \"medium\",
    \"tone\": \"informative\",
    \"contentMode\": \"evergreen\"
  }" | jq '.blog.title'
```

---

## Error Codes

| Code | Status | Message | Solution |
|------|--------|---------|----------|
| 200 | OK | Success | Blog generated |
| 400 | Bad Request | Missing required fields | Check payload |
| 404 | Not Found | Endpoint not found | Check URL |
| 500 | Server Error | Internal error | Retry or contact support |
| 429 | Too Many Requests | Rate limited | Wait and retry |

---

## Rate Limiting

Default limits (per account):
- **Free tier**: 100,000 requests/day
- **Pro tier**: Unlimited

Per-IP rate limiting can be added. See `DEPLOYMENT_GUIDE.md`.

---

## Performance Tips

1. **Cache results** locally when possible
2. **Batch requests** to reduce overhead
3. **Use shorter content modes** for faster generation
4. **Reuse trending keywords** (cached for 1 hour)

---

## Support

For issues or questions:
1. Check `DEPLOYMENT_GUIDE.md` troubleshooting
2. Review Cloudflare Workers documentation
3. Check worker logs: `npx wrangler tail`
