// Slug Generator API - Techtenstein
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

const DIACRITICS = {
  'à':'a','á':'a','â':'a','ã':'a','ä':'a','å':'a','æ':'ae','ç':'c','è':'e','é':'e','ê':'e','ë':'e',
  'ì':'i','í':'i','î':'i','ï':'i','ð':'d','ñ':'n','ò':'o','ó':'o','ô':'o','õ':'o','ö':'o','ø':'o',
  'œ':'oe','ß':'ss','ù':'u','ú':'u','û':'u','ü':'u','ý':'y','ÿ':'y','ł':'l','ń':'n','ś':'s','ź':'z','ż':'z',
  'À':'A','Á':'A','Â':'A','Ã':'A','Ä':'A','Å':'A','Æ':'AE','Ç':'C','È':'E','É':'E','Ê':'E','Ë':'E',
  'Ì':'I','Í':'I','Î':'I','Ï':'I','Ð':'D','Ñ':'N','Ò':'O','Ó':'O','Ô':'O','Õ':'O','Ö':'O','Ø':'O',
  'Œ':'OE','Ù':'U','Ú':'U','Û':'U','Ü':'U','Ý':'Y','Ÿ':'Y',
};

const STOP_WORDS_EN = new Set(['a','an','the','and','or','but','of','to','in','on','at','for','with','by','from','is','are','was','were','be','been']);

function slugify(text, opts = {}) {
  const sep = opts.separator || '-';
  const lower = opts.lowercase !== false;
  const stripStop = opts.strip_stop_words === true;
  const maxLength = opts.max_length ? parseInt(opts.max_length) : 0;
  let s = String(text);
  // replace diacritics
  s = s.split('').map(ch => DIACRITICS[ch] || ch).join('');
  // remove any remaining combining marks
  s = s.normalize('NFKD').replace(/[̀-ͯ]/g, '');
  if (lower) s = s.toLowerCase();
  // split into tokens (alphanumeric)
  let tokens = s.match(/[A-Za-z0-9]+/g) || [];
  if (stripStop) tokens = tokens.filter(t => !STOP_WORDS_EN.has(t.toLowerCase()));
  let slug = tokens.join(sep);
  if (maxLength > 0 && slug.length > maxLength) {
    // truncate to nearest separator
    slug = slug.slice(0, maxLength);
    const lastSep = slug.lastIndexOf(sep);
    if (lastSep > maxLength * 0.5) slug = slug.slice(0, lastSep);
  }
  return slug;
}

const OPENAPI = {
  openapi: '3.1.0',
  info: {
    title: 'Slug Generator API',
    version: '1.0.0',
    description: 'Convert any string into a clean URL-safe slug. Handles diacritics, unicode, casing, custom separator, stop-word removal, max-length truncation. No auth. Free.',
    contact: { name: 'Techtenstein', url: 'https://techtenstein.com', email: 'sathvickollu@gmail.com' },
    license: { name: 'MIT', url: 'https://opensource.org/licenses/MIT' },
  },
  servers: [{ url: 'https://slug.techtenstein.com', description: 'Production' }],
  paths: {
    '/api/slug': {
      get: {
        summary: 'Convert text to a URL-safe slug',
        parameters: [
          { name: 'text', in: 'query', required: true, schema: { type: 'string', example: 'Héllo, World! 2026' } },
          { name: 'separator', in: 'query', schema: { type: 'string', default: '-' } },
          { name: 'lowercase', in: 'query', schema: { type: 'boolean', default: true } },
          { name: 'strip_stop_words', in: 'query', schema: { type: 'boolean', default: false } },
          { name: 'max_length', in: 'query', schema: { type: 'integer', default: 0 } },
        ],
        responses: {
          '200': { description: 'Slug generated' },
          '400': { description: 'Missing text' },
        },
      },
    },
    '/health': { get: { summary: 'Health check', responses: { '200': { description: 'OK' } } } },
    '/openapi.json': { get: { summary: 'OpenAPI 3.1 spec', responses: { '200': { description: 'OpenAPI spec' } } } },
  },
};

function landing() {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Slug Generator API</title><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:780px;margin:2rem auto;padding:0 1rem;color:#1a1a1a;line-height:1.6}
h1{margin-bottom:.2rem}code,pre{background:#f4f4f4;padding:.15rem .35rem;border-radius:4px;font-size:.9em}
pre{padding:1rem;overflow:auto}.badge{display:inline-block;padding:.2rem .6rem;border-radius:12px;background:#dcfce7;color:#166534;font-size:.8rem}
a{color:#166534}.hero{padding:1rem;background:linear-gradient(90deg,#059669,#065f46);color:white;border-radius:8px;margin-bottom:1rem}
</style></head><body>
<div class="hero"><h1 style="color:white">🔗 Slug Generator API</h1><p>Text → URL-safe slug. Unicode-aware. Configurable.</p></div>
<p><span class="badge">Free</span> <span class="badge">No auth</span> <span class="badge">OpenAPI 3.1</span></p>
<h2>Quick start</h2>
<pre>curl "https://slug.techtenstein.com/api/slug?text=Héllo%20World%202026"
# → {"slug":"hello-world-2026", ...}</pre>
<h2>Endpoints</h2>
<ul>
<li><code>GET /api/slug?text={text}&separator=-&lowercase=true&strip_stop_words=false&max_length=0</code></li>
<li><code>GET /health</code></li>
<li><code>GET /openapi.json</code></li>
</ul>
<h2>Options</h2>
<ul>
<li><code>separator</code> — string between words, default <code>-</code></li>
<li><code>lowercase</code> — lowercase output, default <code>true</code></li>
<li><code>strip_stop_words</code> — remove EN stop words (a, the, and, ...), default <code>false</code></li>
<li><code>max_length</code> — truncate to N chars at word boundary, default <code>0</code> (no limit)</li>
</ul>
<p>Built by <a href="https://techtenstein.com">Techtenstein</a>. MIT licensed. Source: <a href="https://github.com/techtenstein-labs/slug-api">GitHub</a>.</p>
</body></html>`;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (url.pathname === '/health') {
      return json({ status: 'ok', service: 'slug', ts: Date.now() });
    }
    if (url.pathname === '/openapi.json') {
      return json(OPENAPI, 200, { 'cache-control': 'public, max-age=3600' });
    }
    if (url.pathname === '/api/slug') {
      const text = url.searchParams.get('text');
      if (!text) return json({ error: 'missing text parameter' }, 400);
      const separator = url.searchParams.get('separator') ?? '-';
      const lowercase = url.searchParams.get('lowercase') !== 'false';
      const strip_stop_words = url.searchParams.get('strip_stop_words') === 'true';
      const max_length = parseInt(url.searchParams.get('max_length') || '0', 10);
      const slug = slugify(text, { separator, lowercase, strip_stop_words, max_length });
      return json({ slug, input: text, options: { separator, lowercase, strip_stop_words, max_length }, length: slug.length },
        200, { 'cache-control': 'public, max-age=86400' });
    }
    if (url.pathname === '/' || url.pathname === '') {
      return new Response(landing(), {
        headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300', ...CORS },
      });
    }
    return json({ error: 'not found' }, 404);
  },
};

function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...CORS, ...extra },
  });
}
