export function normalizeTikTok(value) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "";

  if (/^https?:\/\//.test(raw)) {
    try {
      const url = new URL(raw);
      if (!url.hostname.includes("tiktok.com")) {
        return null;
      }
      return url.toString();
    } catch {
      return null;
    }
  }

  const handle = raw.replace(/^@/, "").replace(/[^\w.]/g, "");
  if (!handle || handle.length > 24) {
    return null;
  }

  return `https://www.tiktok.com/@${handle}`;
}

export function getTikTokLabel(url) {
  if (!url) return "";
  try {
    const path = new URL(url).pathname.replace(/^\//, "");
    return path.startsWith("@") ? path : `@${path}`;
  } catch {
    return "TikTok";
  }
}
