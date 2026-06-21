import {
  findDuplicatePack,
  readPacks,
  validatePackInput,
  writePacks,
} from "./packStore.js";
import { filterPublishedPacks } from "./packMeta.js";
import { searchMedia } from "./mediaLookup.js";
import {
  readRequests,
  validateRequestInput,
  validateRequestStatusUpdate,
  writeRequests,
} from "./requestStore.js";
import { getProfileAvatar } from "./profileAvatar.js";
import {
  createProfile,
  readProfiles,
  updateProfile,
  uploadProfileAvatar,
  verifyProfileToken,
} from "./profileStore.js";
import {
  readAnnouncement,
  readAnalytics,
  recordPageView,
  writeAnnouncement,
} from "./siteStore.js";

const COUNTS_KEY = "counts";
const SESSION_PREFIX = "session:";
const SESSION_TTL = 60 * 60 * 24 * 30; // 30 days

function corsHeaders(origin, allowedOrigin) {
  const allowOrigin =
    allowedOrigin === "*" || !allowedOrigin
      ? "*"
      : origin === allowedOrigin
        ? origin
        : allowedOrigin;

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Profile-Token, X-Profile-Device",
  };
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

async function readCounts(kv) {
  const raw = await kv.get(COUNTS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeCounts(kv, counts) {
  await kv.put(COUNTS_KEY, JSON.stringify(counts));
}

async function isAuthorized(request, env) {
  const header = request.headers.get("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return false;

  const session = await env.DOWNLOADS.get(`${SESSION_PREFIX}${token}`);
  return Boolean(session);
}

function adminSummary(counts) {
  const entries = Object.entries(counts);
  const totalDownloads = entries.reduce((sum, [, count]) => sum + count, 0);

  return {
    totalDownloads,
    packCount: entries.length,
    counts,
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin, env.ALLOWED_ORIGIN || "*");

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    // Public pack catalog (published only)
    if (url.pathname === "/api/packs" && request.method === "GET") {
      const packs = await readPacks(env.DOWNLOADS, { seedIfEmpty: true });
      return json(filterPublishedPacks(packs ?? []), 200, cors);
    }

    if (url.pathname === "/api/announcement" && request.method === "GET") {
      const announcement = await readAnnouncement(env.DOWNLOADS);
      return json(announcement, 200, cors);
    }

    if (url.pathname === "/api/requests" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid request" }, 400, cors);
      }

      const { error, request: packRequest } = validateRequestInput(body);
      if (error) return json({ error }, 400, cors);

      const requests = await readRequests(env.DOWNLOADS);
      requests.unshift(packRequest);
      await writeRequests(env.DOWNLOADS, requests.slice(0, 200));
      return json({ ok: true, id: packRequest.id }, 201, cors);
    }

    if (url.pathname === "/api/analytics/hit" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ ok: true }, 200, cors);
      }
      await recordPageView(env.DOWNLOADS, body.path);
      return json({ ok: true }, 200, cors);
    }

    if (url.pathname === "/api/profiles" && request.method === "GET") {
      const profiles = await readProfiles(env.DOWNLOADS);
      return json(profiles, 200, cors);
    }

    const avatarMatch = url.pathname.match(/^\/api\/profiles\/([a-z0-9_]{3,20})\/avatar$/);
    if (avatarMatch && request.method === "GET") {
      const username = avatarMatch[1];
      const { value, metadata } = await getProfileAvatar(env.DOWNLOADS, username);
      if (!value) {
        return new Response("Not found", { status: 404, headers: cors });
      }

      return new Response(value, {
        status: 200,
        headers: {
          ...cors,
          "Content-Type": metadata?.contentType || "image/jpeg",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    if (avatarMatch && request.method === "POST") {
      const username = avatarMatch[1];
      const editToken = request.headers.get("X-Profile-Token") || "";
      const contentType = request.headers.get("Content-Type") || "";

      if (!contentType.startsWith("multipart/form-data")) {
        return json({ error: "Expected multipart form upload" }, 400, cors);
      }

      let formData;
      try {
        formData = await request.formData();
      } catch {
        return json({ error: "Invalid upload" }, 400, cors);
      }

      const file = formData.get("avatar");
      if (!(file instanceof File) || file.size === 0) {
        return json({ error: "Choose an image to upload" }, 400, cors);
      }

      const bytes = await file.arrayBuffer();
      const result = await uploadProfileAvatar(
        env.DOWNLOADS,
        username,
        bytes,
        file.type || "",
        editToken,
        url.origin,
        file.name || "",
      );

      if (result.error) {
        return json({ error: result.error }, result.status || 400, cors);
      }

      return json(result.profile, 200, cors);
    }

    const profileMatch = url.pathname.match(/^\/api\/profiles\/([a-z0-9_]{3,20})$/);
    if (profileMatch && request.method === "GET") {
      const username = profileMatch[1];
      const profiles = await readProfiles(env.DOWNLOADS);
      const profile = profiles.find((entry) => entry.username === username);
      if (!profile) {
        return json({ error: "Profile not found" }, 404, cors);
      }
      const { editToken: _t, ...publicProfile } = profile;
      return json(publicProfile, 200, cors);
    }

    if (url.pathname === "/api/profiles" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid request" }, 400, cors);
      }

      const deviceId = request.headers.get("X-Profile-Device") || "";
      const result = await createProfile(env.DOWNLOADS, body, deviceId);
      if (result.error) {
        return json(
          {
            error: result.error,
            existingUsername: result.existingUsername || undefined,
          },
          result.status || 400,
          cors,
        );
      }
      return json(result, 201, cors);
    }

    if (profileMatch && request.method === "PUT") {
      const username = profileMatch[1];
      const editToken = request.headers.get("X-Profile-Token") || "";
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid request" }, 400, cors);
      }

      const result = await updateProfile(env.DOWNLOADS, username, body, editToken);
      if (result.error) {
        return json({ error: result.error }, result.status || 400, cors);
      }
      return json(result.profile, 200, cors);
    }

    if (url.pathname === "/api/profiles/verify" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid request" }, 400, cors);
      }
      const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
      const editToken = typeof body.editToken === "string" ? body.editToken : "";
      const valid = await verifyProfileToken(env.DOWNLOADS, username, editToken);
      return json({ valid }, 200, cors);
    }

    // Public stats
    if (url.pathname === "/api/downloads" && request.method === "GET") {
      const counts = await readCounts(env.DOWNLOADS);
      return json(counts, 200, cors);
    }

    const downloadMatch = url.pathname.match(/^\/api\/downloads\/([a-z0-9-]+)$/);
    if (downloadMatch && request.method === "POST") {
      const slug = downloadMatch[1];
      const counts = await readCounts(env.DOWNLOADS);
      counts[slug] = (counts[slug] || 0) + 1;
      await writeCounts(env.DOWNLOADS, counts);
      return json({ slug, count: counts[slug] }, 200, cors);
    }

    // Admin login
    if (url.pathname === "/api/admin/login" && request.method === "POST") {
      if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD) {
        return json({ error: "Admin not configured" }, 503, cors);
      }

      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid request" }, 400, cors);
      }

      const username = typeof body.username === "string" ? body.username.trim() : "";
      const password = typeof body.password === "string" ? body.password : "";

      if (username !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD) {
        return json({ error: "Invalid username or password" }, 401, cors);
      }

      const token = crypto.randomUUID();
      await env.DOWNLOADS.put(
        `${SESSION_PREFIX}${token}`,
        JSON.stringify({ created: Date.now() }),
        { expirationTtl: SESSION_TTL }
      );

      return json({ token, expiresIn: SESSION_TTL }, 200, cors);
    }

    const packAdminMatch = url.pathname.match(/^\/api\/admin\/packs(?:\/([a-z0-9-]+))?$/);
    const statsResetMatch = url.pathname.match(/^\/api\/admin\/stats\/([a-z0-9-]+)$/);
    const adminStatsPaths = ["/api/admin/stats", "/api/admin/stats/reset"];
    const isAdminMediaSearch =
      url.pathname === "/api/admin/media/search" && request.method === "GET";
    const requestAdminMatch = url.pathname.match(/^\/api\/admin\/requests(?:\/([a-f0-9-]+))?$/);
    const isAdminSiteRoute =
      url.pathname === "/api/admin/announcement" ||
      url.pathname === "/api/admin/analytics" ||
      (requestAdminMatch &&
        ["GET", "PUT", "DELETE"].includes(request.method));
    const isAdminStatsRoute =
      adminStatsPaths.includes(url.pathname) ||
      (statsResetMatch && request.method === "DELETE");
    const isAdminPackRoute =
      url.pathname === "/api/admin/packs" ||
      (packAdminMatch && ["GET", "POST", "PUT", "DELETE"].includes(request.method));

    if (isAdminMediaSearch) {
      if (!(await isAuthorized(request, env))) {
        return json({ error: "Unauthorized" }, 401, cors);
      }

      if (!env.TMDB_API_KEY) {
        return json({ error: "TMDB API key not configured on the Worker" }, 503, cors);
      }

      const query = url.searchParams.get("q")?.trim() || "";
      if (query.length < 2) {
        return json({ results: [] }, 200, cors);
      }

      try {
        const results = await searchMedia(env.TMDB_API_KEY, query);
        return json({ results }, 200, cors);
      } catch {
        return json({ error: "Media search failed" }, 502, cors);
      }
    }

    if (isAdminSiteRoute) {
      if (!(await isAuthorized(request, env))) {
        return json({ error: "Unauthorized" }, 401, cors);
      }

      if (url.pathname === "/api/admin/announcement" && request.method === "GET") {
        return json(await readAnnouncement(env.DOWNLOADS), 200, cors);
      }

      if (url.pathname === "/api/admin/announcement" && request.method === "PUT") {
        let body;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid request" }, 400, cors);
        }
        const announcement = await writeAnnouncement(env.DOWNLOADS, body);
        return json(announcement, 200, cors);
      }

      if (url.pathname === "/api/admin/analytics" && request.method === "GET") {
        const analytics = await readAnalytics(env.DOWNLOADS);
        return json(analytics, 200, cors);
      }

      if (url.pathname === "/api/admin/requests" && request.method === "GET") {
        const requests = (await readRequests(env.DOWNLOADS)).map((entry) => ({
          ...entry,
          status: entry.status || "open",
        }));
        return json(requests, 200, cors);
      }

      if (requestAdminMatch?.[1] && request.method === "PUT") {
        const id = requestAdminMatch[1];
        let body;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid request" }, 400, cors);
        }

        const { error, status } = validateRequestStatusUpdate(body);
        if (error) return json({ error }, 400, cors);

        const requests = await readRequests(env.DOWNLOADS);
        const index = requests.findIndex((entry) => entry.id === id);
        if (index === -1) {
          return json({ error: "Request not found" }, 404, cors);
        }

        requests[index] = { ...requests[index], status };
        await writeRequests(env.DOWNLOADS, requests);
        return json(requests[index], 200, cors);
      }

      if (requestAdminMatch?.[1] && request.method === "DELETE") {
        const id = requestAdminMatch[1];
        const requests = await readRequests(env.DOWNLOADS);
        const next = requests.filter((entry) => entry.id !== id);
        if (next.length === requests.length) {
          return json({ error: "Request not found" }, 404, cors);
        }
        await writeRequests(env.DOWNLOADS, next);
        return json({ ok: true, id }, 200, cors);
      }
    }

    if (isAdminStatsRoute || isAdminPackRoute) {
      if (!(await isAuthorized(request, env))) {
        return json({ error: "Unauthorized" }, 401, cors);
      }

      if (url.pathname === "/api/admin/stats" && request.method === "GET") {
        const counts = await readCounts(env.DOWNLOADS);
        const analytics = await readAnalytics(env.DOWNLOADS);
        return json({ ...adminSummary(counts), analytics }, 200, cors);
      }

      if (url.pathname === "/api/admin/stats/reset" && request.method === "DELETE") {
        await writeCounts(env.DOWNLOADS, {});
        return json({ ok: true, counts: {} }, 200, cors);
      }

      if (statsResetMatch && request.method === "DELETE") {
        const slug = statsResetMatch[1];
        const counts = await readCounts(env.DOWNLOADS);
        delete counts[slug];
        await writeCounts(env.DOWNLOADS, counts);
        return json({ ok: true, slug, counts }, 200, cors);
      }

      if (url.pathname === "/api/admin/packs" && request.method === "GET") {
        const packs = await readPacks(env.DOWNLOADS, { seedIfEmpty: true });
        return json(packs ?? [], 200, cors);
      }

      if (url.pathname === "/api/admin/packs" && request.method === "POST") {
        let body;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid request" }, 400, cors);
        }

        const { errors, pack } = validatePackInput(body);
        if (errors) {
          return json({ error: errors.join(", ") }, 400, cors);
        }

        const packs = (await readPacks(env.DOWNLOADS, { seedIfEmpty: true })) ?? [];
        const duplicate = findDuplicatePack(packs, { title: pack.title, slug: pack.slug });
        if (duplicate) {
          return json({ error: `Duplicate pack: "${duplicate.title}"` }, 409, cors);
        }

        packs.push(pack);
        await writePacks(env.DOWNLOADS, packs);
        return json(pack, 201, cors);
      }

      if (packAdminMatch?.[1] && request.method === "PUT") {
        const slug = packAdminMatch[1];
        let body;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid request" }, 400, cors);
        }

        const packs = (await readPacks(env.DOWNLOADS, { seedIfEmpty: true })) ?? [];
        const index = packs.findIndex((entry) => entry.slug === slug);
        if (index === -1) {
          return json({ error: "Pack not found" }, 404, cors);
        }

        const { errors, pack: updated } = validatePackInput(body, { existing: packs[index] });
        if (errors) {
          return json({ error: errors.join(", ") }, 400, cors);
        }

        const duplicate = findDuplicatePack(packs, {
          title: updated.title,
          slug: updated.slug,
          excludeSlug: slug,
        });
        if (duplicate) {
          return json({ error: `Duplicate pack: "${duplicate.title}"` }, 409, cors);
        }

        const oldSlug = packs[index].slug;
        packs[index] = updated;
        await writePacks(env.DOWNLOADS, packs);

        if (oldSlug !== updated.slug) {
          const counts = await readCounts(env.DOWNLOADS);
          if (counts[oldSlug]) {
            counts[updated.slug] = (counts[updated.slug] || 0) + counts[oldSlug];
            delete counts[oldSlug];
            await writeCounts(env.DOWNLOADS, counts);
          }
        }

        return json(updated, 200, cors);
      }

      if (packAdminMatch?.[1] && request.method === "DELETE") {
        const slug = packAdminMatch[1];
        const packs = (await readPacks(env.DOWNLOADS, { seedIfEmpty: true })) ?? [];
        const next = packs.filter((entry) => entry.slug !== slug);

        if (next.length === packs.length) {
          return json({ error: "Pack not found" }, 404, cors);
        }

        await writePacks(env.DOWNLOADS, next);

        const counts = await readCounts(env.DOWNLOADS);
        if (counts[slug]) {
          delete counts[slug];
          await writeCounts(env.DOWNLOADS, counts);
        }

        return json({ ok: true, slug }, 200, cors);
      }
    }

    // Admin logout
    if (url.pathname === "/api/admin/logout" && request.method === "POST") {
      const header = request.headers.get("Authorization") || "";
      const token = header.startsWith("Bearer ") ? header.slice(7) : "";
      if (token) {
        await env.DOWNLOADS.delete(`${SESSION_PREFIX}${token}`);
      }
      return json({ ok: true }, 200, cors);
    }

    return json({ error: "Not found" }, 404, cors);
  },
};
