# Slug Generator API

Convert any string into a clean URL-safe slug. Handles diacritics, unicode, casing, custom separator, stop-word removal, max-length truncation.

## Live

- 🌐 API base: **https://slug.techtenstein.com**
- 📖 Docs: https://slug.techtenstein.com
- 📋 OpenAPI 3.1: https://slug.techtenstein.com/openapi.json
- ❤️ Health: https://slug.techtenstein.com/health

## Quick start

```bash
curl "https://slug.techtenstein.com/api/slug?text=Hello%20World%202026"
```

## Endpoints

- `GET /api/slug` — main endpoint
- `GET /health` — health check
- `GET /openapi.json` — OpenAPI 3.1 spec
- `GET /` — HTML docs

## Auth

None. Free.

## License

MIT © [Techtenstein](https://techtenstein.com)
