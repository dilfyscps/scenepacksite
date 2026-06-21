import { STATS_API_BASE } from "./downloadStats";

export function resolveProfileImageUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//.test(url)) return url;
  if (url.startsWith("/api/")) return `${STATS_API_BASE}${url}`;
  return url;
}
