import { SEED_PACKS } from "./seedPacks.js";
import { enrichPack, findDuplicatePack, normalizeTitle } from "./packMeta.js";

const PACKS_KEY = "packs";

export function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function withSlug(pack) {
  return enrichPack({
    ...pack,
    slug: pack.slug || slugify(pack.title),
  });
}

function normalizePackList(packs) {
  return packs.map(withSlug);
}

export async function readPacks(kv, { seedIfEmpty = false } = {}) {
  const raw = await kv.get(PACKS_KEY);
  if (!raw) {
    if (seedIfEmpty) {
      const seeded = normalizePackList(SEED_PACKS);
      await kv.put(PACKS_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? normalizePackList(parsed) : null;
  } catch {
    return null;
  }
}

export async function writePacks(kv, packs) {
  await kv.put(PACKS_KEY, JSON.stringify(normalizePackList(packs)));
}

const ALLOWED_CATEGORIES = new Set(["TV Shows", "Movies"]);
const ALLOWED_CREATORS = new Set(["DILFYSCPS"]);

function parsePreviewImages(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((url) => typeof url === "string" && /^https?:\/\//.test(url.trim()))
    .map((url) => url.trim())
    .slice(0, 6);
}

export function validatePackInput(body, { partial = false, existing = null } = {}) {
  const errors = [];
  const pack = {};

  const fields = {
    title: (v) => typeof v === "string" && v.trim().length > 0,
    img: (v) => typeof v === "string" && v.trim().length > 0,
    category: (v) => ALLOWED_CATEGORIES.has(v),
    date: (v) => Number.isFinite(Number(v)) && Number(v) >= 1900 && Number(v) <= 2100,
    description: (v) => typeof v === "string" && v.trim().length > 0,
    download: (v, body) => {
      if (body.published === false && (!v || (typeof v === "string" && !v.trim()))) return true;
      return typeof v === "string" && /^https?:\/\//.test(v.trim());
    },
    creator: (v) => ALLOWED_CREATORS.has(v),
  };

  for (const [key, validate] of Object.entries(fields)) {
    if (body[key] === undefined) {
      if (!partial) errors.push(`${key} is required`);
      continue;
    }
    if (!validate(body[key], body)) {
      errors.push(`Invalid ${key}`);
      continue;
    }
    if (key === "title") pack.title = body.title.trim();
    else if (key === "img") pack.img = body.img.trim();
    else if (key === "description") pack.description = body.description.trim();
    else if (key === "download") pack.download = typeof body.download === "string" ? body.download.trim() : "";
    else if (key === "date") pack.date = Number(body.date);
    else pack[key] = body[key];
  }

  if (body.published !== undefined) {
    pack.published = Boolean(body.published);
  } else if (!existing) {
    pack.published = true;
  }

  if (body.fileSize !== undefined) {
    pack.fileSize = typeof body.fileSize === "string" ? body.fileSize.trim().slice(0, 40) : "";
  }

  if (body.clipCount !== undefined && body.clipCount !== "" && body.clipCount !== null) {
    const count = Number(body.clipCount);
    pack.clipCount = Number.isFinite(count) && count >= 0 ? Math.round(count) : null;
  }

  if (body.previewImages !== undefined) {
    pack.previewImages = parsePreviewImages(body.previewImages);
  }

  if (errors.length) return { errors };

  pack.slug = slugify(pack.title);

  if (!existing) {
    pack.createdAt = new Date().toISOString();
  } else {
    pack.createdAt = existing.createdAt;
    if (body.published === undefined) pack.published = existing.published !== false;
    if (body.fileSize === undefined) pack.fileSize = existing.fileSize || "";
    if (body.clipCount === undefined) pack.clipCount = existing.clipCount ?? null;
    if (body.previewImages === undefined) pack.previewImages = existing.previewImages || [];
  }

  return { pack: enrichPack(pack) };
}

export { findDuplicatePack, normalizeTitle, PACKS_KEY };
