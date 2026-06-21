export const AVATAR_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif";
export const MAX_AVATAR_SIZE = 512 * 1024;
export const MAX_GIF_SIZE = 2 * 1024 * 1024;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function isGifFile(file) {
  return file.type === "image/gif" || /\.gif$/i.test(file.name || "");
}

function isAllowedImage(file) {
  if (ALLOWED_TYPES.has(file.type)) return true;
  return /\.(jpe?g|png|webp|gif)$/i.test(file.name || "");
}

export function validateProfileImageFile(file) {
  if (!file) return "Choose an image to upload";
  if (!isAllowedImage(file)) {
    return "Image must be JPEG, PNG, WebP, or GIF";
  }

  const maxSize = isGifFile(file) ? MAX_GIF_SIZE : MAX_AVATAR_SIZE;
  if (file.size > maxSize) {
    return isGifFile(file) ? "GIF must be under 2 MB" : "Image must be under 512 KB";
  }

  return "";
}
