export const MAX_PROFILE_LINKS = 5;

export function parseLinkLines(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  }
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function uniqueLinks(values) {
  const seen = new Set();
  const results = [];
  for (const value of values) {
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(value);
  }
  return results;
}

export function linksToTextarea(values) {
  return Array.isArray(values) ? values.join("\n") : "";
}

export function countProfileLinks(profile) {
  if (!profile) return 0;
  return (
    (profile.tiktoks?.length || 0) +
    (profile.websites?.length || 0) +
    (profile.discords?.length || 0)
  );
}

export function normalizeProfileLinks(profile) {
  if (!profile) return profile;

  const tiktoks =
    profile.tiktoks?.length > 0
      ? profile.tiktoks
      : profile.tiktok
        ? [profile.tiktok]
        : [];
  const websites =
    profile.websites?.length > 0
      ? profile.websites
      : profile.website
        ? [profile.website]
        : [];
  const discords =
    profile.discords?.length > 0
      ? profile.discords
      : profile.discordUsername
        ? [profile.discordUsername]
        : [];

  const { tiktok, website, discordUsername, ...rest } = profile;
  return { ...rest, tiktoks, websites, discords };
}
