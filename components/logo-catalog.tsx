"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Palette, Search } from "lucide-react";
import { MonoSvgCustomizer } from "./mono-svg-customizer";

type LogoRecord = {
  slug: string;
  title: string;
  aliases?: string[];
  categories?: string[];
  collection?: string;
  variants: Record<string, string>;
};

type LogoCatalogProps = {
  activeFilter: string;
};

const AZURE_BASE = (process.env.NEXT_PUBLIC_LOGO_STORAGE_BASE_URL || "https://logomarketplace617db5.blob.core.windows.net/logos").replace(/\/$/, "");
const PAGE_SIZE = 72;

function matchesFilter(logo: LogoRecord, filter: string) {
  const variantKeys = Object.keys(logo.variants).map((key) => key.toLowerCase());
  const collection = logo.collection?.toLowerCase() || "";
  const categories = logo.categories?.map((category) => category.toLowerCase()) || [];

  switch (filter) {
    case "Color SVG":
      return Boolean(logo.variants.color);
    case "Mono SVG":
      return Boolean(logo.variants.mono);
    case "Light SVG":
      return Boolean(logo.variants.light);
    case "Dark SVG":
      return Boolean(logo.variants.dark);
    case "Wordmarks":
      return variantKeys.some((key) => key.startsWith("wordmark"));
    case "Brand Logos":
      return collection === "brands";
    case "Cloud Icons":
      return ["aws", "azure", "gcp", "cloud"].some(
        (term) => collection.includes(term) || categories.some((category) => category.includes(term)),
      );
    default:
      return true;
  }
}

function assetPath(logo: LogoRecord, filter: string) {
  const keyByFilter: Record<string, string> = {
    "Color SVG": "color",
    "Mono SVG": "mono",
    "Light SVG": "light",
    "Dark SVG": "dark",
  };
  const selectedKey = filter === "Wordmarks"
    ? Object.keys(logo.variants).find((key) => key.toLowerCase() === "wordmark")
      || Object.keys(logo.variants).find((key) => key.toLowerCase().startsWith("wordmark"))
    : keyByFilter[filter];
  const source = (selectedKey && logo.variants[selectedKey])
    || logo.variants.default
    || Object.values(logo.variants)[0]
    || "";
  return source.replace(/^\/icons\//, "");
}

export function LogoCatalog({ activeFilter }: LogoCatalogProps) {
  const [logos, setLogos] = useState<LogoRecord[]>([]);
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMono, setSelectedMono] = useState<{ logo: LogoRecord; path: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/logos/catalog", { cache: "no-store" });
        if (!response.ok) throw new Error("Logo catalog is unavailable.");
        const result = (await response.json()) as LogoRecord[];
        if (!cancelled) setLogos(result);
      } catch (catalogError) {
        if (!cancelled) setError(catalogError instanceof Error ? catalogError.message : "Logo catalog is unavailable.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadCatalog();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setSelectedMono(null);
  }, [activeFilter]);

  const filteredLogos = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return logos.filter((logo) => {
      if (!matchesFilter(logo, activeFilter)) return false;
      if (!normalized) return true;
      return logo.title.toLowerCase().includes(normalized)
        || logo.slug.includes(normalized)
        || logo.aliases?.some((alias) => alias.toLowerCase().includes(normalized))
        || logo.categories?.some((category) => category.toLowerCase().includes(normalized));
    });
  }, [activeFilter, logos, query]);

  const visibleLogos = filteredLogos.slice(0, visibleCount);

  const updateQuery = (value: string) => {
    setQuery(value);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <section className="logo-catalog" aria-labelledby="catalog-title">
      <div className="catalog-intro">
        <div>
          <p>{activeFilter.toUpperCase()}</p>
          <h2 id="catalog-title">Find the right logo</h2>
          <span>Preview and download production-ready brand assets.</span>
        </div>
        <div className="catalog-count" aria-label={`${filteredLogos.length} logos available`}>
          <strong>{filteredLogos.length.toLocaleString()}</strong>
          <span>logos</span>
        </div>
      </div>

      <label className="catalog-search">
        <Search aria-hidden="true" />
        <span className="sr-only">Search logos</span>
        <input
          type="search"
          value={query}
          onChange={(event) => updateQuery(event.target.value)}
          placeholder="Search by brand, category, or keyword..."
        />
      </label>

      {loading && <div className="catalog-status">Loading the logo collection...</div>}
      {error && <div className="catalog-status catalog-status--error">{error}</div>}
      {!loading && !error && visibleLogos.length === 0 && <div className="catalog-status">No logos match &quot;{query}&quot;.</div>}

      <div className="logo-grid" aria-live="polite">
        {visibleLogos.map((logo) => {
          const path = assetPath(logo, activeFilter);
          const azureUrl = `${AZURE_BASE}/${path}`;
          const sourceUrl = `https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/${path}`;
          return (
            <article className="logo-card" key={logo.slug}>
              {activeFilter === "Mono SVG" ? (
                <button
                  className="logo-preview logo-preview--interactive"
                  type="button"
                  onClick={() => setSelectedMono({ logo, path })}
                  aria-label={`Customize ${logo.title} mono SVG`}
                >
                  <img
                    src={azureUrl}
                    alt={`${logo.title} logo`}
                    loading="lazy"
                    decoding="async"
                    onError={(event) => {
                      if (event.currentTarget.src !== sourceUrl) event.currentTarget.src = sourceUrl;
                    }}
                  />
                  <span>Customize colors</span>
                </button>
              ) : (
                <div className="logo-preview">
                  <img
                    src={azureUrl}
                    alt={`${logo.title} logo`}
                    loading="lazy"
                    decoding="async"
                    onError={(event) => {
                      if (event.currentTarget.src !== sourceUrl) event.currentTarget.src = sourceUrl;
                    }}
                  />
                </div>
              )}
              <div className="logo-card-footer">
                <div>
                  <h3>{logo.title}</h3>
                  <span>{activeFilter === "All Logos" ? logo.categories?.[0] || "Brand" : activeFilter}</span>
                </div>
                {activeFilter === "Mono SVG" ? (
                  <button
                    className="logo-customize-button"
                    type="button"
                    onClick={() => setSelectedMono({ logo, path })}
                    aria-label={`Customize ${logo.title} mono SVG`}
                    title={`Customize ${logo.title}`}
                  >
                    <Palette aria-hidden="true" />
                  </button>
                ) : (
                  <a
                    href={`/api/logos/download?path=${encodeURIComponent(path)}&name=${encodeURIComponent(logo.slug)}`}
                    aria-label={`Download ${logo.title} as SVG`}
                    title={`Download ${logo.title}`}
                  >
                    <Download aria-hidden="true" />
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {visibleCount < filteredLogos.length && (
        <button className="load-more-button" type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
          Load more logos
        </button>
      )}

      <p className="catalog-legal">Brand names and trademarks belong to their respective owners. Assets are provided for design and development use subject to each brand&apos;s guidelines.</p>
      {selectedMono && (
        <MonoSvgCustomizer
          title={selectedMono.logo.title}
          slug={selectedMono.logo.slug}
          path={selectedMono.path}
          onClose={() => setSelectedMono(null)}
        />
      )}
    </section>
  );
}