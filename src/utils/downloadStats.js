/**
 * Base URL for the stats Worker (no trailing slash).
 * Local dev: leave empty — Vite proxies /api to wrangler on :8787.
 * Production: set to your Worker URL, e.g. https://scenepacks-stats.your-name.workers.dev
 */
export const STATS_API_BASE = import.meta.env.VITE_STATS_API_URL ?? "";

export async function fetchDownloadStats() {
  try {
    const res = await fetch(`${STATS_API_BASE}/api/downloads`);
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

export async function isStatsApiOnline() {
  try {
    const res = await fetch(`${STATS_API_BASE}/api/downloads`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function trackDownload(slug) {
  if (!slug) return null;

  try {
    const res = await fetch(`${STATS_API_BASE}/api/downloads/${encodeURIComponent(slug)}`, {
      method: "POST",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.count ?? null;
  } catch {
    return null;
  }
}
