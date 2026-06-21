import {
  avatarPublicUrl,
  deleteProfileAvatar,
  normalizeAvatarUpload,
  saveProfileAvatar,
} from "./profileAvatar.js";

const PROFILES_KEY = "profiles";
const PROFILE_TOKEN_PREFIX = "profile_token:";
const DEVICE_PROFILE_PREFIX = "profile_device:";
const TOKEN_TTL = 60 * 60 * 24 * 365; // 1 year
const MAX_LINKS = 5;

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

function normalizeTikTok(value) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "";

  if (/^https?:\/\//.test(raw)) {
    try {
      const url = new URL(raw);
      if (!url.hostname.includes("tiktok.com")) return null;
      return url.toString();
    } catch {
      return null;
    }
  }

  const handle = raw.replace(/^@/, "").replace(/[^\w.]/g, "");
  if (!handle || handle.length > 24) return null;

  return `https://www.tiktok.com/@${handle}`;
}

function parseLinkList(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
}

function uniqueValues(values) {
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

export function normalizeUsername(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function migrateProfileLinks(profile) {
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

export async function readProfiles(kv) {
  const raw = await kv.get(PROFILES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(migrateProfileLinks);
  } catch {
    return [];
  }
}

export async function writeProfiles(kv, profiles) {
  await kv.put(PROFILES_KEY, JSON.stringify(profiles.map(migrateProfileLinks)));
}

function publicProfile(profile) {
  const { editToken: _editToken, tiktok, website, discordUsername, ...rest } = migrateProfileLinks(profile);
  return rest;
}

function validateTikTokList(rawValue, label = "TikTok") {
  const parsed = uniqueValues(parseLinkList(rawValue));
  if (parsed.length > MAX_LINKS) {
    return { error: `Maximum ${MAX_LINKS} ${label} accounts allowed` };
  }

  const tiktoks = [];
  for (const entry of parsed) {
    const normalized = normalizeTikTok(entry);
    if (normalized === null) {
      return { error: `${label} entry must be @username or a tiktok.com link` };
    }
    if (!tiktoks.includes(normalized)) tiktoks.push(normalized);
  }

  return { tiktoks };
}

function validateWebsiteList(rawValue) {
  const parsed = uniqueValues(parseLinkList(rawValue));
  if (parsed.length > MAX_LINKS) {
    return { error: `Maximum ${MAX_LINKS} websites allowed` };
  }

  const websites = [];
  for (const entry of parsed) {
    if (!/^https?:\/\//.test(entry)) {
      return { error: "Each website must be a valid URL starting with http:// or https://" };
    }
    if (!websites.includes(entry)) websites.push(entry);
  }

  return { websites };
}

function validateDiscordList(rawValue) {
  const parsed = uniqueValues(parseLinkList(rawValue));
  if (parsed.length > MAX_LINKS) {
    return { error: `Maximum ${MAX_LINKS} Discord usernames allowed` };
  }

  const discords = [];
  for (const entry of parsed) {
    const username = entry.slice(0, 32);
    if (!username) continue;
    if (!discords.includes(username)) discords.push(username);
  }

  return { discords };
}

export function validateProfileInput(body, { partial = false, existing = null } = {}) {
  const errors = [];
  const profile = {};
  const existingLinks = existing ? migrateProfileLinks(existing) : null;

  if (!partial || body.username !== undefined) {
    const username = normalizeUsername(body.username);
    if (!USERNAME_RE.test(username)) {
      errors.push("Username must be 3–20 characters (letters, numbers, underscore)");
    } else {
      profile.username = username;
    }
  }

  if (!partial || body.displayName !== undefined) {
    const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";
    if (displayName.length < 2 || displayName.length > 40) {
      errors.push("Display name must be 2–40 characters");
    } else {
      profile.displayName = displayName;
    }
  }

  if (body.bio !== undefined) {
    profile.bio = typeof body.bio === "string" ? body.bio.trim().slice(0, 280) : "";
  } else if (!existing) {
    profile.bio = "";
  }

  if (body.avatar !== undefined) {
    const avatar = typeof body.avatar === "string" ? body.avatar.trim() : "";
    if (avatar && !/^https?:\/\//.test(avatar) && !avatar.startsWith("/api/profiles/")) {
      errors.push("Avatar must be a valid URL or uploaded photo");
    } else {
      profile.avatar = avatar;
    }
  } else if (!existing) {
    profile.avatar = "";
  }

  if (body.tiktoks !== undefined || body.tiktok !== undefined) {
    const raw = body.tiktoks !== undefined ? body.tiktoks : body.tiktok;
    const result = validateTikTokList(raw);
    if (result.error) errors.push(result.error);
    else profile.tiktoks = result.tiktoks;
  } else if (!existing) {
    profile.tiktoks = [];
  }

  if (body.websites !== undefined || body.website !== undefined) {
    const raw = body.websites !== undefined ? body.websites : body.website;
    const result = validateWebsiteList(raw);
    if (result.error) errors.push(result.error);
    else profile.websites = result.websites;
  } else if (!existing) {
    profile.websites = [];
  }

  if (body.discords !== undefined || body.discordUsername !== undefined) {
    const raw = body.discords !== undefined ? body.discords : body.discordUsername;
    const result = validateDiscordList(raw);
    if (result.error) errors.push(result.error);
    else profile.discords = result.discords;
  } else if (!existing) {
    profile.discords = [];
  }

  if (errors.length) return { errors };

  if (existing) {
    return {
      profile: migrateProfileLinks({
        ...existingLinks,
        ...profile,
        updatedAt: new Date().toISOString(),
      }),
    };
  }

  return {
    profile: migrateProfileLinks({
      ...profile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  };
}

export async function createProfile(kv, body, deviceId = "") {
  const normalizedDeviceId = typeof deviceId === "string" ? deviceId.trim() : "";
  if (!normalizedDeviceId) {
    return { error: "Device verification required to create a profile" };
  }

  const existingUsername = await kv.get(`${DEVICE_PROFILE_PREFIX}${normalizedDeviceId}`);
  if (existingUsername) {
    return {
      error: "You already have a profile on this device. Edit it to add more social accounts.",
      existingUsername,
      status: 409,
    };
  }

  const { errors, profile } = validateProfileInput(body);
  if (errors) return { error: errors.join(", ") };

  const profiles = await readProfiles(kv);
  if (profiles.some((entry) => entry.username === profile.username)) {
    return { error: "Username is already taken" };
  }

  const editToken = crypto.randomUUID();
  profiles.push(profile);
  await writeProfiles(kv, profiles);
  await kv.put(`${PROFILE_TOKEN_PREFIX}${editToken}`, profile.username, {
    expirationTtl: TOKEN_TTL,
  });
  await kv.put(`${DEVICE_PROFILE_PREFIX}${normalizedDeviceId}`, profile.username);

  return { profile: publicProfile(profile), editToken };
}

export async function updateProfile(kv, username, body, editToken) {
  const storedUser = await kv.get(`${PROFILE_TOKEN_PREFIX}${editToken}`);
  if (!storedUser || storedUser !== username) {
    return { error: "Invalid edit token", status: 401 };
  }

  const profiles = await readProfiles(kv);
  const index = profiles.findIndex((entry) => entry.username === username);
  if (index === -1) {
    return { error: "Profile not found", status: 404 };
  }

  const { errors, profile: updated } = validateProfileInput(body, {
    partial: true,
    existing: profiles[index],
  });
  if (errors) return { error: errors.join(", ") };

  if (body.avatar !== undefined && !updated.avatar && profiles[index].avatar) {
    await deleteProfileAvatar(kv, username);
  }

  profiles[index] = updated;
  await writeProfiles(kv, profiles);

  return { profile: publicProfile(updated) };
}

export async function uploadProfileAvatar(
  kv,
  username,
  fileBytes,
  contentType,
  editToken,
  origin,
  filename = "",
) {
  const storedUser = await kv.get(`${PROFILE_TOKEN_PREFIX}${editToken}`);
  if (!storedUser || storedUser !== username) {
    return { error: "Invalid edit token", status: 401 };
  }

  const normalized = normalizeAvatarUpload(fileBytes, filename, contentType);
  if (normalized.error) return { error: normalized.error };

  const profiles = await readProfiles(kv);
  const index = profiles.findIndex((entry) => entry.username === username);
  if (index === -1) {
    return { error: "Profile not found", status: 404 };
  }

  await saveProfileAvatar(kv, username, fileBytes, normalized.contentType);

  const updatedAt = new Date().toISOString();
  const updated = migrateProfileLinks({
    ...profiles[index],
    avatar: avatarPublicUrl(origin, username, updatedAt),
    updatedAt,
  });
  profiles[index] = updated;
  await writeProfiles(kv, profiles);

  return { profile: publicProfile(updated) };
}

export async function verifyProfileToken(kv, username, editToken) {
  const storedUser = await kv.get(`${PROFILE_TOKEN_PREFIX}${editToken}`);
  return storedUser === username;
}

export { PROFILES_KEY, publicProfile };
