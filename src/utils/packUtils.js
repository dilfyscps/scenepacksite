import dilfyscps from "../data/dilfyscps";
import dilfymoviescps from "../data/dilfymoviescps";

export const CREATOR_OPTIONS = ["All", "DILFYSCPS"];
export const CATEGORY_OPTIONS = ["All", "Movies", "TV Shows"];
export const SORT_OPTIONS = ["All", "Latest", "Old"];
export const PACK_CATEGORIES = ["TV Shows", "Movies"];
export const PACK_CREATORS = ["DILFYSCPS"];
export const NEW_PACK_DAYS = 14;

export function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function normalizeTitle(title) {
  return title.toLowerCase().trim().replace(/\s+/g, " ");
}

export function enrichPack(pack) {
  const createdAt =
    pack.createdAt ||
    (pack.lastUpdated ? parseLegacyDate(pack.lastUpdated) : null) ||
    `${pack.date || new Date().getFullYear()}-01-01T00:00:00.000Z`;

  return {
    ...pack,
    published: pack.published !== false,
    createdAt,
    fileSize: pack.fileSize || "",
    clipCount: pack.clipCount ?? null,
    previewImages: Array.isArray(pack.previewImages) ? pack.previewImages : [],
  };
}

function parseLegacyDate(dateStr) {
  const [month, day, year] = dateStr.split("/").map(Number);
  if (!month || !day || !year) return null;
  return new Date(year, month - 1, day).toISOString();
}

export function normalizePacks(rawPacks) {
  return rawPacks.map((pack) =>
    enrichPack({
      ...pack,
      slug: pack.slug || slugify(pack.title),
    })
  );
}

export const STATIC_PACKS = normalizePacks([...dilfyscps, ...dilfymoviescps]);

/** @deprecated Use usePacks() instead */
export const allPacks = STATIC_PACKS;

export function formatToday() {
  const today = new Date();
  return `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
}

export function getEmptyPackForm() {
  return {
    title: "",
    img: "",
    category: "TV Shows",
    date: new Date().getFullYear(),
    description: "",
    download: "",
    creator: "DILFYSCPS",
    published: true,
    fileSize: "",
    clipCount: "",
    previewImages: "",
  };
}

export function isNewPack(pack, days = NEW_PACK_DAYS) {
  if (!pack?.createdAt) return false;
  const created = new Date(pack.createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created <= days * 24 * 60 * 60 * 1000;
}

export function formatPackSize(pack) {
  const parts = [];
  if (pack.clipCount) parts.push(`${pack.clipCount} clips`);
  if (pack.fileSize) parts.push(pack.fileSize);
  return parts.join(" · ");
}

export function findDuplicateInCatalog(packs, { title, slug, excludeSlug }) {
  const normalized = normalizeTitle(title);
  return packs.find((pack) => {
    if (excludeSlug && pack.slug === excludeSlug) return false;
    if (pack.slug === slug) return true;
    return normalizeTitle(pack.title) === normalized;
  });
}

export function getPackBySlug(packs, slug) {
  return packs.find((pack) => pack.slug === slug);
}

function parseCreatedAt(pack) {
  return new Date(pack.createdAt || 0).getTime() || pack.date || 0;
}

export function filterPacks(packs, { search, sortBy, creatorFilter, categoryFilter }) {
  let result = [...packs];

  if (creatorFilter !== "All") {
    result = result.filter((p) => p.creator === creatorFilter);
  }
  if (categoryFilter !== "All") {
    result = result.filter((p) => p.category === categoryFilter);
  }

  const query = search?.trim().toLowerCase();
  if (query) {
    result = result.filter((p) => {
      const title = p.title?.toLowerCase() || "";
      const description = p.description?.toLowerCase() || "";
      const category = p.category?.toLowerCase() || "";
      const creator = p.creator?.toLowerCase() || "";
      const slug = p.slug || "";

      return (
        title.includes(query) ||
        description.includes(query) ||
        category.includes(query) ||
        creator.includes(query) ||
        slug.includes(query)
      );
    });
  }

  if (sortBy === "Latest") {
    result.sort((a, b) => parseCreatedAt(b) - parseCreatedAt(a));
  } else if (sortBy === "Old") {
    result.sort((a, b) => parseCreatedAt(a) - parseCreatedAt(b));
  }

  return result;
}

export function getRelatedPacks(packs, pack, limit = 4) {
  return packs
    .filter((p) => p.slug !== pack.slug && p.category === pack.category)
    .sort((a, b) => parseCreatedAt(b) - parseCreatedAt(a))
    .slice(0, limit);
}

export function getPacksByCategory(packs, category) {
  return packs.filter((p) => p.category === category);
}

export function formatDownloads(count) {
  if (!count) return null;
  if (count >= 1000) {
    const k = count / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return String(count);
}

export function getMostDownloadedPacks(packs, stats = {}, limit = 3) {
  return packs
    .map((pack) => ({ ...pack, downloads: stats[pack.slug] || 0 }))
    .filter((pack) => pack.downloads > 0)
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, limit);
}

export function getPackStats(packs) {
  return {
    total: packs.length,
    categories: new Set(packs.map((p) => p.category)).size,
    creators: new Set(packs.map((p) => p.creator)).size,
  };
}

export function getRandomPack(packs, excludeSlug) {
  const pool = excludeSlug
    ? packs.filter((pack) => pack.slug !== excludeSlug)
    : packs;

  if (!pool.length) return packs[0] ?? null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function parsePreviewImagesInput(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^https?:\/\//.test(line))
    .slice(0, 6);
}

export function previewImagesToInput(images) {
  return Array.isArray(images) ? images.join("\n") : "";
}
