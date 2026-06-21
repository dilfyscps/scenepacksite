import { STATS_API_BASE } from "./downloadStats";

export async function fetchPacks() {
  const res = await fetch(`${STATS_API_BASE}/api/packs`);
  if (!res.ok) {
    throw new Error("Failed to load packs");
  }
  return res.json();
}
