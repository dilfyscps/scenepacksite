const REQUESTS_KEY = "pack_requests";

export async function readRequests(kv) {
  const raw = await kv.get(REQUESTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeRequests(kv, requests) {
  await kv.put(REQUESTS_KEY, JSON.stringify(requests));
}

export function validateRequestInput(body) {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const note = typeof body.note === "string" ? body.note.trim() : "";
  const category = body.category === "Movies" || body.category === "TV Shows" ? body.category : "";

  if (title.length < 2 || title.length > 120) {
    return { error: "Title must be 2–120 characters" };
  }

  if (note.length > 500) {
    return { error: "Note must be under 500 characters" };
  }

  return {
    request: {
      id: crypto.randomUUID(),
      title,
      note,
      category,
      status: "open",
      createdAt: new Date().toISOString(),
    },
  };
}

export const REQUEST_STATUSES = ["open", "planned", "done", "declined"];

export function normalizeRequestStatus(status) {
  return REQUEST_STATUSES.includes(status) ? status : "open";
}

export function validateRequestStatusUpdate(body) {
  const status = typeof body.status === "string" ? body.status.trim().toLowerCase() : "";
  if (!REQUEST_STATUSES.includes(status)) {
    return { error: "Invalid status" };
  }
  return { status };
}

export { REQUESTS_KEY };
