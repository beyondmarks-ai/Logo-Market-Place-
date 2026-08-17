"use client";

import { useState } from "react";
import { ArrowLeft, BookOpen, Check, Code2, Copy, Gauge, KeyRound, ShieldCheck } from "lucide-react";

const examples = {
  search: `curl "https://logo-marketplace-api.wonderfulplant-f827f144.southindia.azurecontainerapps.io/api/v1/brands?query=microsoft&limit=10" \\
  -H "Authorization: Bearer lmp_live_YOUR_API_KEY"`,
  detail: `curl "https://logo-marketplace-api.wonderfulplant-f827f144.southindia.azurecontainerapps.io/api/v1/brands/microsoft" \\
  -H "Authorization: Bearer lmp_live_YOUR_API_KEY"`,
  customize: `curl -G "https://logo-marketplace-api.wonderfulplant-f827f144.southindia.azurecontainerapps.io/api/v1/brands/github/download" \\
  -H "Authorization: Bearer lmp_live_YOUR_API_KEY" \\
  --data-urlencode "variant=mono" \\
  --data-urlencode "gradientStart=#050405" \\
  --data-urlencode "gradientEnd=#FF3F4C" \\
  --output github-gradient.svg`,
};

type CodeExampleProps = { id: keyof typeof examples; label: string };

function CodeExample({ id, label }: CodeExampleProps) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(examples[id]);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="api-code-block">
      <div className="api-code-toolbar">
        <span>{label}</span>
        <button type="button" onClick={copy} aria-label={`Copy ${label} example`}>
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre><code>{examples[id]}</code></pre>
    </div>
  );
}

export function ApiDocs() {
  return (
    <div className="api-docs-wrap">
      <a className="api-skip-link" href="#quickstart">Skip to documentation</a>
      <header className="api-docs-header">
        <a href="/" aria-label="Return to Logo Market Place"><ArrowLeft aria-hidden="true" /> Marketplace</a>
        <strong>Logo Market Place <span>API</span></strong>
        <a href="/api/v1/openapi" target="_blank" rel="noreferrer"><BookOpen aria-hidden="true" /> OpenAPI</a>
      </header>

      <section className="api-docs-hero" aria-labelledby="api-title">
        <div>
          <p className="api-eyebrow">DEVELOPER PLATFORM · V1</p>
          <h1 id="api-title">Brand assets through one reliable API.</h1>
          <p>Search the catalog, inspect available variants, and download production-ready SVGs—including custom mono colors and gradients.</p>
          <div className="api-hero-actions">
            <a href="#quickstart">Start integrating</a>
            <a href="/api/v1/health" target="_blank" rel="noreferrer">Check API status</a>
          </div>
        </div>
        <aside aria-label="API overview">
          <div><ShieldCheck aria-hidden="true" /><span><strong>Bearer authentication</strong>SHA-256 hashed keys</span></div>
          <div><Gauge aria-hidden="true" /><span><strong>Prepaid usage</strong>One credit per valid request</span></div>
          <div><Code2 aria-hidden="true" /><span><strong>Stable contract</strong>Versioned JSON endpoints</span></div>
        </aside>
      </section>

      <div className="api-docs-grid">
        <nav className="api-docs-nav" aria-label="Documentation sections">
          <span>ON THIS PAGE</span>
          <a href="#quickstart">Quickstart</a>
          <a href="#authentication">Authentication</a>
          <a href="#endpoints">Endpoints</a>
          <a href="#customization">Customization</a>
          <a href="#limits">Limits and errors</a>
        </nav>

        <article className="api-docs-content">
          <section id="quickstart">
            <p className="api-section-kicker">01 · QUICKSTART</p>
            <h2>Find a brand in seconds</h2>
            <p>Send your API key from a trusted server environment. Search accepts brand names, aliases, categories, and keywords.</p>
            <CodeExample id="search" label="Search brands" />
          </section>

          <section id="authentication">
            <p className="api-section-kicker">02 · AUTHENTICATION</p>
            <h2>Use a Bearer API key</h2>
            <div className="api-notice"><KeyRound aria-hidden="true" /><p><strong>Keep keys server-side.</strong> Never embed a live key in browser JavaScript, mobile bundles, or public repositories.</p></div>
            <p>Include the key on every protected request:</p>
            <div className="api-inline-code"><code>Authorization: Bearer lmp_live_YOUR_API_KEY</code></div>
          </section>

          <section id="endpoints">
            <p className="api-section-kicker">03 · ENDPOINTS</p>
            <h2>A compact, versioned surface</h2>
            <div className="api-endpoint-list">
              <div><span className="api-method">GET</span><code>/api/v1/brands</code><p>Search and paginate the catalog.</p></div>
              <div><span className="api-method">GET</span><code>/api/v1/brands/{`{slug}`}</code><p>Read metadata and available variants.</p></div>
              <div><span className="api-method">GET</span><code>/api/v1/brands/{`{slug}`}/download</code><p>Download an original or customized SVG.</p></div>
              <div><span className="api-method api-method--public">GET</span><code>/api/v1/health</code><p>Public service health check.</p></div>
            </div>
            <CodeExample id="detail" label="Get brand details" />
          </section>

          <section id="customization">
            <p className="api-section-kicker">04 · CUSTOMIZATION</p>
            <h2>Create mono colors and gradients</h2>
            <p>Choose <code>variant=mono</code>, then supply either one six-digit <code>color</code> or both <code>gradientStart</code> and <code>gradientEnd</code>. Hex values should be URL encoded.</p>
            <CodeExample id="customize" label="Download a gradient SVG" />
          </section>

          <section id="limits">
            <p className="api-section-kicker">05 · LIMITS AND ERRORS</p>
            <h2>Observable by default</h2>
            <p>Every authenticated response includes request, rate-limit, and remaining-credit headers. Use the request ID when reporting an integration problem.</p>
            <div className="api-header-grid">
              <code>X-Request-Id</code><span>Trace identifier</span>
              <code>RateLimit-Remaining</code><span>Requests left this minute</span>
              <code>RateLimit-Reset</code><span>UTC reset timestamp</span>
              <code>X-Monthly-Remaining</code><span>Requests left this month</span>
            </div>
            <div className="api-error-example"><pre><code>{`{
  "error": {
    "code": "invalid_api_key",
    "message": "The API key is invalid, expired, or revoked.",
    "requestId": "75b0..."
  }
}`}</code></pre></div>
          </section>
        </article>
      </div>

      <footer className="api-docs-footer">
        <span>Logo Market Place API v1</span>
        <p>Brand names and trademarks belong to their respective owners. API access does not grant trademark usage rights.</p>
      </footer>
    </div>
  );
}
