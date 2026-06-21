export const AVATAR_KV_PREFIX = "profile_avatar:";
export const MAX_AVATAR_SIZE = 512 * 1024;
export const MAX_GIF_SIZE = 2 * 1024 * 1024;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export function avatarPublicUrl(_origin, username, updatedAt) {
  const version = updatedAt ? new Date(updatedAt).getTime() : Date.now();
  return `/api/profiles/${username}/avatar?v=${version}`;
}

function detectImageType(bytes, filename, contentType) {
  if (contentType && ALLOWED_TYPES.has(contentType)) {
    return contentType;
  }

  const name = typeof filename === "string" ? filename.toLowerCase() : "";
  if (name.endsWith(".gif")) return "image/gif";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";

  const header = new Uint8Array(bytes.slice(0, 12));
  if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46) return "image/gif";
  if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47) {
    return "image/png";
  }
  if (header[0] === 0xff && header[1] === 0xd8) return "image/jpeg";
  if (
    header[0] === 0x52 &&
    header[1] === 0x49 &&
    header[2] === 0x46 &&
    header[3] === 0x46 &&
    header[8] === 0x57 &&
    header[9] === 0x45 &&
    header[10] === 0x42 &&
    header[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}

export function normalizeAvatarUpload(bytes, filename, contentType) {
  const type = detectImageType(bytes, filename, contentType);
  if (!type) {
    return { error: "Image must be JPEG, PNG, WebP, or GIF" };
  }

  const maxSize = type === "image/gif" ? MAX_GIF_SIZE : MAX_AVATAR_SIZE;
  if (bytes.byteLength > maxSize) {
    return {
      error: type === "image/gif" ? "GIF must be under 2 MB" : "Image must be under 512 KB",
    };
  }

  return { contentType: type };
}

export function validateAvatarUpload(contentType, size) {
  if (!ALLOWED_TYPES.has(contentType)) {
    return "Image must be JPEG, PNG, WebP, or GIF";
  }
  const maxSize = contentType === "image/gif" ? MAX_GIF_SIZE : MAX_AVATAR_SIZE;
  if (size > maxSize) {
    return contentType === "image/gif" ? "GIF must be under 2 MB" : "Image must be under 512 KB";
  }
  return null;
}

export async function saveProfileAvatar(kv, username, bytes, contentType) {
  await kv.put(`${AVATAR_KV_PREFIX}${username}`, bytes, {
    metadata: { contentType },
  });
}

export async function getProfileAvatar(kv, username) {
  return kv.getWithMetadata(`${AVATAR_KV_PREFIX}${username}`, { type: "arrayBuffer" });
}

export async function deleteProfileAvatar(kv, username) {
  await kv.delete(`${AVATAR_KV_PREFIX}${username}`);
}
