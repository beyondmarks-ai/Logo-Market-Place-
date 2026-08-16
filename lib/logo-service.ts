export type LogoRecord = {
  slug: string;
  title: string;
  aliases?: string[];
  categories?: string[];
  collection?: string;
  variants: Record<string, string>;
};

const AZURE_BASE = (process.env.NEXT_PUBLIC_LOGO_STORAGE_BASE_URL || "https://logomarketplace617db5.blob.core.windows.net/logos").replace(/\/$/, "");
const SOURCE_BASE = "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons";
const SOURCE_CATALOG = "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/src/data/icons.json";

let catalogPromise: Promise<LogoRecord[]> | null = null;

async function fetchJson(url: string) {
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    return response.ok ? response : null;
  } catch {
    return null;
  }
}

export async function getLogoCatalog() {
  if (!catalogPromise) {
    catalogPromise = (async () => {
      const response = await fetchJson(`${AZURE_BASE}/catalog.json`) ?? await fetchJson(SOURCE_CATALOG);
      if (!response) throw new Error("Logo catalog is unavailable.");
      const value: unknown = await response.json();
      if (!Array.isArray(value)) throw new Error("Logo catalog is invalid.");
      return value as LogoRecord[];
    })().catch((error) => {
      catalogPromise = null;
      throw error;
    });
  }
  return catalogPromise;
}

export function findLogo(logos: LogoRecord[], slug: string) {
  const normalized = slug.trim().toLowerCase();
  return logos.find((logo) => logo.slug.toLowerCase() === normalized);
}

export function searchLogos(logos: LogoRecord[], query: string, category: string) {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedCategory = category.trim().toLowerCase();
  return logos.filter((logo) => {
    const categories = logo.categories?.map((value) => value.toLowerCase()) || [];
    if (normalizedCategory && !categories.some((value) => value === normalizedCategory || value.includes(normalizedCategory))) return false;
    if (!normalizedQuery) return true;
    return logo.slug.toLowerCase().includes(normalizedQuery)
      || logo.title.toLowerCase().includes(normalizedQuery)
      || Boolean(logo.aliases?.some((value) => value.toLowerCase().includes(normalizedQuery)))
      || categories.some((value) => value.includes(normalizedQuery));
  });
}

export function normalizeAssetPath(path: string) {
  return path.replace(/^\/icons\//, "");
}

export function logoVariantPath(logo: LogoRecord, variant: string) {
  const requested = variant.toLowerCase();
  const key = Object.keys(logo.variants).find((name) => name.toLowerCase() === requested);
  return key ? normalizeAssetPath(logo.variants[key]) : null;
}

export async function fetchLogoAsset(path: string) {
  for (const base of [AZURE_BASE, SOURCE_BASE]) {
    try {
      const response = await fetch(`${base}/${path}`, { cache: "force-cache" });
      if (response.ok) return response;
    } catch {
      // Try the next source.
    }
  }
  return null;
}
