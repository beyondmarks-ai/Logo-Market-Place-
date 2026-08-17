import { readLogoBlob } from "./logo-storage";

export type LogoRecord = {
  slug: string;
  title: string;
  aliases?: string[];
  categories?: string[];
  collection?: string;
  variants: Record<string, string>;
};

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
      const stored = await readLogoBlob("catalog.json").catch(() => null);
      let value: unknown;
      if (stored) value = JSON.parse(stored.buffer.toString("utf8"));
      else {
        const response = await fetchJson(SOURCE_CATALOG);
        if (!response) throw new Error("Logo catalog is unavailable.");
        value = await response.json();
      }
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
  const stored = await readLogoBlob(path).catch(() => null);
  if (stored) return new Response(new Uint8Array(stored.buffer), { headers: { "Content-Type": stored.contentType } });
  try {
    const response = await fetch(`${SOURCE_BASE}/${path}`, { cache: "force-cache" });
    return response.ok ? response : null;
  } catch {
    return null;
  }
}
