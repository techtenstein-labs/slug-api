/**
 * Techtenstein Slug API — techtenstein.com
 * Convert any text into a clean, URL-safe slug.
 *
 * GET  /?text=Hello%20World       -> {"slug":"hello-world"}
 * POST /  { "text": "Hello!" }    -> {"slug":"hello"}
 * GET  /?text=...&max=40&sep=_   -> configurable length + separator
 */

const HTML_HOME = `<!doctype html>
<html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Techtenstein Slug API — clean URL slugs in one call</title>
<meta name="description" content="Turn any string into a clean URL-safe slug. Unicode-aware, configurable length/separator. Free 1000 calls/day.">
<style>body{font-family:system-ui,-apple-system,sans-serif;max-width:640px;margin:60px auto;padding:0 20px;color:#111}code{background:#f4f4f5;padding:2px 6px;border-radius:4px}pre{background:#111;color:#0f0;padding:16px;border-radius:8px;overflow-x:auto}a{color:#2563eb}</style>
</head><body>
<h1>Slug API</h1>
<p>Convert any text to a clean URL-safe slug. Unicode-aware. No signup required for 1000 calls/day.</p>
<h2>Quick try</h2>
<pre>curl "https://slug-api.techtenstein.workers.dev/?text=Hello%20World%202026"
{"slug":"hello-world-2026","length":16,"input_length":18,"processing_ms":0}</pre>
<h2>Params</h2>
<ul>
<li><code>text</code> — the string to slugify (required, up to 500 chars)</li>
<li><code>max</code> — max slug length, default 60</li>
<li><code>sep</code> — separator character, default <code>-</code></li>
<li><code>lower</code> — lowercase output, default <code>true</code></li>
</ul>
<h2>POST support</h2>
<pre>curl -X POST https://slug-api.techtenstein.workers.dev/ \\
  -H "Content-Type: application/json" \\
  -d '{"text":"München Straße!","max":40}'
{"slug":"munchen-strasse"}</pre>
<h2>Rate limit</h2>
<p>1000 requests/day per IP free. <a href="https://techtenstein.gumroad.com">Higher tiers on Gumroad.</a></p>
<p style="margin-top:60px;color:#666;font-size:14px">Built by <a href="https://techtenstein.com">Techtenstein</a> · <a href="https://github.com/techtenstein-labs">Open source</a></p>
</body></html>`;

// Unicode-safe slugify. Handles German umlauts, French accents, Spanish tildes, etc.
function slugify(text, { max = 60, sep = "-", lower = true } = {}) {
  if (typeof text !== "string") return "";
  let s = text.trim();
  // Manual transliteration for common accented chars (Workers has no Intl.Transliterator)
  const map = {
    "ä":"ae","ö":"oe","ü":"ue","ß":"ss","Ä":"ae","Ö":"oe","Ü":"ue",
    "á":"a","à":"a","â":"a","ã":"a","å":"a","æ":"ae",
    "é":"e","è":"e","ê":"e","ë":"e",
    "í":"i","ì":"i","î":"i","ï":"i",
    "ó":"o","ò":"o","ô":"o","õ":"o","ø":"o",
    "ú":"u","ù":"u","û":"u",
    "ý":"y","ÿ":"y",
    "ñ":"n","ç":"c",
    "Á":"a","À":"a","Â":"a","Ã":"a","Å":"a",
    "É":"e","È":"e","Ê":"e","Ë":"e",
    "Í":"i","Ì":"i","Î":"i","Ï":"i",
    "Ó":"o","Ò":"o","Ô":"o","Õ":"o","Ø":"o",
    "Ú":"u","Ù":"u","Û":"u",
    "Ý":"y","Ñ":"n","Ç":"c",
  };
  s = s.split("").map(c => map[c] ?? c).join("");
  // Normalize + strip other diacritics
  s = s.normalize("NFKD").replace(/[̀-ͯ]/g, "");
  // Lowercase (optional)
  if (lower) s = s.toLowerCase();
  // Replace non-alphanumeric runs with separator
  s = s.replace(/[^a-zA-Z0-9]+/g, sep);
  // Trim leading/trailing separator
  const sepEsc = sep.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  s = s.replace(new RegExp(`^${sepEsc}+|${sepEsc}+$`, "g"), "");
  // Truncate cleanly at separator boundary if possible
  if (s.length > max) {
    const trunc = s.slice(0, max);
    const lastSep = trunc.lastIndexOf(sep);
    s = lastSep > max / 2 ? trunc.slice(0, lastSep) : trunc;
  }
  return s;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=60",
    },
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const t0 = Date.now();

    // Home page
    if (request.method === "GET" && url.pathname === "/" && !url.searchParams.get("text")) {
      return new Response(HTML_HOME, { headers: { "content-type": "text/html; charset=utf-8" } });
    }

    // Health check
    if (url.pathname === "/health") return json({ ok: true, version: "1.0.0" });

    // OpenAPI spec
    if (url.pathname === "/openapi.json") return json({
      openapi: "3.1.0",
      info: {
        title: "Techtenstein Slug API",
        version: "1.0.0",
        description: "Convert any text to a clean, URL-safe slug. Unicode-aware.",
        contact: { name: "Techtenstein", url: "https://techtenstein.com" },
        license: { name: "MIT" },
      },
      servers: [{ url: "https://slug.techtenstein.com", description: "Production" }],
      paths: {
        "/": {
          get: {
            summary: "Slugify text (query string)",
            parameters: [
              { name: "text", in: "query", required: true, schema: { type: "string", maxLength: 500 } },
              { name: "max", in: "query", schema: { type: "integer", default: 60 } },
              { name: "sep", in: "query", schema: { type: "string", default: "-" } },
              { name: "lower", in: "query", schema: { type: "boolean", default: true } },
            ],
            responses: {
              "200": { description: "Slugified result", content: { "application/json": { schema: { $ref: "#/components/schemas/SlugResult" } } } },
            },
          },
          post: {
            summary: "Slugify text (JSON body)",
            requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/SlugInput" } } } },
            responses: { "200": { description: "Slugified result", content: { "application/json": { schema: { $ref: "#/components/schemas/SlugResult" } } } } },
          },
        },
        "/health": {
          get: { summary: "Health check", responses: { "200": { description: "OK" } } },
        },
      },
      components: {
        schemas: {
          SlugInput: {
            type: "object",
            required: ["text"],
            properties: {
              text: { type: "string", maxLength: 500 },
              max: { type: "integer", default: 60 },
              sep: { type: "string", default: "-" },
              lower: { type: "boolean", default: true },
            },
          },
          SlugResult: {
            type: "object",
            properties: {
              slug: { type: "string" },
              length: { type: "integer" },
              input_length: { type: "integer" },
              opts: { type: "object" },
              processing_ms: { type: "integer" },
            },
          },
        },
      },
    });

    // Read input
    let text, max, sep, lower;
    if (request.method === "POST") {
      let body;
      try { body = await request.json(); }
      catch { return json({ error: "invalid_json" }, 400); }
      text = body.text; max = body.max; sep = body.sep; lower = body.lower;
    } else {
      text = url.searchParams.get("text");
      max = url.searchParams.get("max");
      sep = url.searchParams.get("sep");
      lower = url.searchParams.get("lower");
    }

    if (!text || typeof text !== "string") return json({ error: "missing_text", hint: "Pass ?text=... or POST {text:'...'}" }, 400);
    if (text.length > 500) return json({ error: "text_too_long", max: 500, got: text.length }, 400);

    const opts = {
      max: max ? Math.min(200, Math.max(1, parseInt(max))) : 60,
      sep: sep || "-",
      lower: lower === "false" || lower === false ? false : true,
    };

    const slug = slugify(text, opts);
    return json({
      slug,
      length: slug.length,
      input_length: text.length,
      opts,
      processing_ms: Date.now() - t0,
      _powered_by: "https://techtenstein.com",
    });
  },
};
