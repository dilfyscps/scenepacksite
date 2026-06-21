import { STATS_API_BASE } from "./downloadStats";

const SESSION_KEY = "dilfyscps_profile_session";
const LEGACY_SESSIONS_KEY = "dilfyscps_profile_sessions";
const DEVICE_KEY = "dilfyscps_profile_device";

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function migrateLegacySession() {
  try {
    const raw = localStorage.getItem(LEGACY_SESSIONS_KEY);
    if (!raw) return null;

    const sessions = JSON.parse(raw);
    const usernames = Object.keys(sessions);
    if (!usernames.length) return null;

    const username = usernames[0];
    const session = { username, editToken: sessions[username] };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.removeItem(LEGACY_SESSIONS_KEY);
    return session;
  } catch {
    return null;
  }
}

export function getProfileDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

export function getProfileSession() {
  return readSession() || migrateLegacySession();
}

export function hasProfileSession() {
  return Boolean(getProfileSession());
}

export function saveProfileSession(username, editToken) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ username, editToken }));
  localStorage.removeItem(LEGACY_SESSIONS_KEY);
}

export function removeProfileSession() {
  localStorage.removeItem(SESSION_KEY);
}

export async function fetchProfiles() {
  const res = await fetch(`${STATS_API_BASE}/api/profiles`);
  if (!res.ok) throw new Error("Failed to load profiles");
  return res.json();
}

export async function fetchProfile(username) {
  const res = await fetch(`${STATS_API_BASE}/api/profiles/${encodeURIComponent(username)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Profile not found");
  return data;
}

export async function createProfile(payload) {
  const res = await fetch(`${STATS_API_BASE}/api/profiles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Profile-Device": getProfileDeviceId(),
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.error || "Failed to create profile";
    const err = new Error(message);
    if (data.existingUsername) {
      err.existingUsername = data.existingUsername;
    }
    throw err;
  }
  return data;
}

export async function updateProfile(username, payload, editToken) {
  const res = await fetch(`${STATS_API_BASE}/api/profiles/${encodeURIComponent(username)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Profile-Token": editToken,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to update profile");
  return data;
}

export async function uploadProfileAvatar(username, file, editToken) {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await fetch(`${STATS_API_BASE}/api/profiles/${encodeURIComponent(username)}/avatar`, {
    method: "POST",
    headers: {
      "X-Profile-Token": editToken,
    },
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to upload photo");
  return data;
}
