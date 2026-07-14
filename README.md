# techtenstein-labs/slug-api

Unicode-aware URL slug generator API on the Cloudflare edge.

- Live: https://slug.techtenstein.com
- Docs: https://docs.techtenstein.com/slug
- OpenAPI: https://slug.techtenstein.com/openapi.json
- Docker: `docker pull sathvickollu/techtenstein-slug`
- MCP server: `pip install techtenstein-slug-mcp` (coming — queued on PyPI)
- Apify Actor: https://apify.com/sathvic_kollu/techtenstein-slug (queued for public listing)
- Gumroad ($2/mo unlimited): https://techtenstein.gumroad.com/l/hiayin
- Dev.to writeup: https://dev.to/sathvic_kollu/introducing-slug-api-unicode-url-slugs-in-one-call-on-the-cloudflare-edge-pgh

## Quick try
```bash
curl 'https://slug.techtenstein.com/?text=Hello%20World'
# {"slug":"hello-world"}
```

## Unicode
```bash
curl 'https://slug.techtenstein.com/?text=M%C3%BCnchen%20Stra%C3%9Fe'
# {"slug":"muenchen-strasse"}
```

## Rate limit
1000 req/day per IP free. $2/mo unlimited on Gumroad.

## License
MIT
