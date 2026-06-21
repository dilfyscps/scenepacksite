import { STATS_API_BASE } from "./downloadStats";

const TOKEN_KEY = "dilfyscps_admin_token";
const REMEMBER_KEY = "dilfyscps_admin_remember";
const USERNAME_KEY = "dilfyscps_admin_username";
const AUTH_EVENT = "dilfyscps_admin_auth";

function notifyAuthChange() {
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function subscribeAdminAuth(callback) {
  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getTokenStorage() {
  const remember = localStorage.getItem(REMEMBER_KEY) !== "false";
  return remember ? localStorage : sessionStorage;
}

export function getRememberLogin() {
  return localStorage.getItem(REMEMBER_KEY) !== "false";
}

export function setRememberLogin(remember) {
  if (remember) {
    localStorage.setItem(REMEMBER_KEY, "true");
  } else {
    localStorage.setItem(REMEMBER_KEY, "false");
  }
}

export function getSavedAdminUsername() {
  return localStorage.getItem(USERNAME_KEY) || "";
}

export function setSavedAdminUsername(username) {
  const trimmed = username.trim();
  if (trimmed) {
    localStorage.setItem(USERNAME_KEY, trimmed);
  } else {
    localStorage.removeItem(USERNAME_KEY);
  }
}

export function getAdminToken() {
  return getTokenStorage().getItem(TOKEN_KEY);
}

export function setAdminToken(token, { remember = true } = {}) {
  setRememberLogin(remember);
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  getTokenStorage().setItem(TOKEN_KEY, token);
  notifyAuthChange();
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  notifyAuthChange();
}

export function isAdminLoggedIn() {
  return Boolean(getAdminToken());
}

async function adminFetch(path, options = {}) {
  const token = getAdminToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${STATS_API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    clearAdminToken();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export async function adminLogin(username, password, { remember = true } = {}) {
  let res;

  try {
    res = await fetch(`${STATS_API_BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    throw new Error(
      import.meta.env.DEV
        ? "Can't reach the stats API. Run npm run dev (starts site + API together)."
        : "Can't reach the server. Try again in a moment."
    );
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 503 && data.error === "Admin not configured") {
      throw new Error(
        import.meta.env.DEV
          ? "Admin credentials missing on the API. Restart npm run dev after updating worker/.dev.vars."
          : "Admin credentials are not set on the API worker. Re-run: npx wrangler secret put ADMIN_USERNAME --config worker/wrangler.toml (and ADMIN_PASSWORD)."
      );
    }
    throw new Error(data.error || "Login failed");
  }

  setAdminToken(data.token, { remember });
  setSavedAdminUsername(username);
  return data;
}

export async function adminLogout() {
  try {
    await adminFetch("/api/admin/logout", { method: "POST" });
  } catch {
    // ignore
  }
  clearAdminToken();
}

export async function fetchAdminStats() {
  return adminFetch("/api/admin/stats");
}

export async function resetPackStats(slug) {
  return adminFetch(`/api/admin/stats/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
}

export async function resetAllStats() {
  return adminFetch("/api/admin/stats/reset", { method: "DELETE" });
}

export async function fetchAdminPacks() {
  return adminFetch("/api/admin/packs");
}

export async function createPack(pack) {
  return adminFetch("/api/admin/packs", {
    method: "POST",
    body: JSON.stringify(pack),
  });
}

export async function updatePack(slug, pack) {
  return adminFetch(`/api/admin/packs/${encodeURIComponent(slug)}`, {
    method: "PUT",
    body: JSON.stringify(pack),
  });
}

export async function deletePack(slug) {
  return adminFetch(`/api/admin/packs/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
}

export async function searchMediaTitles(query) {
  return adminFetch(`/api/admin/media/search?q=${encodeURIComponent(query)}`);
}

export async function fetchAdminRequests() {
  return adminFetch("/api/admin/requests");
}

export async function deleteAdminRequest(id) {
  return adminFetch(`/api/admin/requests/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function updateAdminRequestStatus(id, status) {
  return adminFetch(`/api/admin/requests/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function fetchAdminAnnouncement() {
  return adminFetch("/api/admin/announcement");
}

export async function saveAdminAnnouncement(data) {
  return adminFetch("/api/admin/announcement", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function fetchAdminAnalytics() {
  return adminFetch("/api/admin/analytics");
}
