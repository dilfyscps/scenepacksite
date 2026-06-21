export const NEW_PACK_DAYS = 14;

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
    fileSize: typeof pack.fileSize === "string" ? pack.fileSize.trim() : "",
    clipCount: Number.isFinite(Number(pack.clipCount)) ? Number(pack.clipCount) : null,
    previewImages: Array.isArray(pack.previewImages)
      ? pack.previewImages.filter((url) => typeof url === "string" && url.trim()).slice(0, 6)
      : [],
  };
}

function parseLegacyDate(dateStr) {
  const [month, day, year] = dateStr.split("/").map(Number);
  if (!month || !day || !year) return null;
  return new Date(year, month - 1, day).toISOString();
}

export function filterPublishedPacks(packs) {
  return packs.filter((pack) => pack.published !== false);
}

export function findDuplicatePack(packs, { title, slug, excludeSlug }) {
  const normalized = normalizeTitle(title);
  return packs.find((pack) => {
    if (excludeSlug && pack.slug === excludeSlug) return false;
    if (pack.slug === slug) return true;
    return normalizeTitle(pack.title) === normalized;
  });
}
